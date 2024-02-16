import PropTypes from 'prop-types'
import { aggregators } from './aggregators'
import { getSort, naturalSort } from './utilities'

export default class PivotData {
  constructor(inputProps = {}) {
  // constructor(inputProps = PivotData.defaultProps) {
    this.props = Object.assign({}, PivotData.defaultProps, inputProps)

    PropTypes.checkPropTypes(
      PivotData.propTypes,
      this.props,
      'prop',
      'PivotData'
    )

    this.aggregator = this.props.aggregators[this.props.aggregatorName](
      this.props.vals
    )

    this.tree = {}
    this.rowKeys = []
    this.colKeys = []
    this.rowTotals = {}
    this.colTotals = {}
    this.allTotal = this.aggregator(this, [], [])
    
    this.sorted = false

    // iterate through input, accumulating data for cells
    const wtf = PivotData.forEachRecord(
      this.props.data,
      this.props.derivedAttributes,
      (record) => {
        // JB: if record does not need to be filtered; seems inefficient to do this with the .csv data as lots of duplication.
        // JB: than parse the record => processRecord() to pivottable flavour
        // I would of thought this would be done post massaging into another shape/schema
        if (this.filter(record)) {
          this.processRecord(record)
        }
      }
    )
    // console.log('wtf :1: ', wtf)
  }

  // JB: doesn't get used besides testing
  forEachMatchingRecord(criteria, callback) {
    return PivotData.forEachRecord(
      this.props.data,
      this.props.derivedAttributes,
      record => {
        if (!this.filter(record)) return

        for (const k in criteria) {
          const v = criteria[k]
          
          if (v !== (k in record ? record[k] : 'null')) {
            return
          }
        }

        callback(record)
      }
    )
  }

  // JB: remove record if it needs to be filtered/ommitted. Rather than looping I would have thought .includes() would be more performant
  filter(record) {
    for (const k in this.props.valueFilter) {
      if (record[k] in this.props.valueFilter[k]) {
        return false
      }
    }
    return true
  }

  arrSort(attrs) {
    let a

    const sortersArr = (() => {
      const result = []

      for (a of Array.from(attrs)) {
        result.push(getSort(this.props.sorters, a));
      }

      return result
    })()

    return function(a, b) {
      for (const i of Object.keys(sortersArr || {})) {
        const sorter = sortersArr[i]
        const comparison = sorter(a[i], b[i])
        if (comparison !== 0) {
          return comparison
        }
      }
      
      return 0
    }
  }

  sortKeys() {
    if (!this.sorted) {
      this.sorted = true
      const v = (r, c) => this.getAggregator(r, c).value()
      
      switch (this.props.rowOrder) {
        case 'value_a_to_z':
          this.rowKeys.sort((a, b) => naturalSort(v(a, []), v(b, [])))
          break
        case 'value_z_to_a':
          this.rowKeys.sort((a, b) => -naturalSort(v(a, []), v(b, [])))
          break
        default:
          this.rowKeys.sort(this.arrSort(this.props.rows))
      }

      switch (this.props.colOrder) {
        case 'value_a_to_z':
          this.colKeys.sort((a, b) => naturalSort(v([], a), v([], b)))
          break
        case 'value_z_to_a':
          this.colKeys.sort((a, b) => -naturalSort(v([], a), v([], b)))
          break
        default:
          this.colKeys.sort(this.arrSort(this.props.cols))
      }
    }
  }

  getColKeys() {
    this.sortKeys()
    return this.colKeys
  }

  getRowKeys() {
    this.sortKeys()
    return this.rowKeys
  }

  // JB: this parses to reshape the data
  processRecord(record) {
    // this code is called in a tight loop
    const colKey = []
    const rowKey = []

    for (const x of Array.from(this.props.cols)) {
      colKey.push(x in record ? record[x] : 'null')
    }

    for (const x of Array.from(this.props.rows)) {
      rowKey.push(x in record ? record[x] : 'null')
    }

    const flatRowKey = rowKey.join(String.fromCharCode(0))
    const flatColKey = colKey.join(String.fromCharCode(0))

    this.allTotal.push(record);

    if (rowKey.length !== 0) {
      if (!this.rowTotals[flatRowKey]) {
        this.rowKeys.push(rowKey);
        this.rowTotals[flatRowKey] = this.aggregator(this, rowKey, [])
      }
      this.rowTotals[flatRowKey].push(record)
    }

    if (colKey.length !== 0) {
      if (!this.colTotals[flatColKey]) {
        this.colKeys.push(colKey);
        this.colTotals[flatColKey] = this.aggregator(this, [], colKey)
      }

      this.colTotals[flatColKey].push(record)
    }

    if (colKey.length !== 0 && rowKey.length !== 0) {
      if (!this.tree[flatRowKey]) {
        this.tree[flatRowKey] = {}
      }

      if (!this.tree[flatRowKey][flatColKey]) {
        this.tree[flatRowKey][flatColKey] = this.aggregator(
          this,
          rowKey,
          colKey
        )
      }

      this.tree[flatRowKey][flatColKey].push(record)
    }
  }

  getAggregator(rowKey, colKey) {
    let agg
    const flatRowKey = rowKey.join(String.fromCharCode(0))
    const flatColKey = colKey.join(String.fromCharCode(0))

    if (rowKey.length === 0 && colKey.length === 0) {
      agg = this.allTotal;
    } else if (rowKey.length === 0) {
      agg = this.colTotals[flatColKey]
    } else if (colKey.length === 0) {
      agg = this.rowTotals[flatRowKey]
    } else {
      agg = this.tree[flatRowKey][flatColKey]
    }
    
    return (
      agg || {
        value() {
          return null
        },
        format() {
          return ''
        },
      }
    )
  }
}

// JB: doesn't appear to serve any purpose. the returns are unused and appear to return the same array collection of undefined. and only appears to get retrieved for testing
// JB: the reference to jQuery is irrelevant
// going to have to explore clean unmodified version - use example from repo
// update: tested with original repo. output is the same. returns appear unused. behavouir appears identical
// commenting out the result and result1 array push will break it, so they be getting used

// can handle arrays or jQuery selections of tables
PivotData.forEachRecord = function(input, derivedAttributes, f) {
  let addRecord, record

  if (Object.getOwnPropertyNames(derivedAttributes).length === 0) {
    // console.log('route A') // taking this route
    addRecord = f
  }
  else {
    // console.log('route B')
    addRecord = function(record) {
      for (const k in derivedAttributes) {
        const derived = derivedAttributes[k](record)

        if (derived !== null) {
          record[k] = derived
        }
      }

      return f(record)
    }
  }

  // if it's a function, have it call us back
  if (typeof input === 'function') {
    // console.log('route FUNCTION')
    return input(addRecord)
  }
  else if (Array.isArray(input)) {

    // Array of arrays
    if (Array.isArray(input[0])) {
      // console.log('route ARRAY OF ARRAYS')  // taking this route
      
      return (
        () => {
          const result = []
          for (const i of Object.keys(input || {})) {
            const compactRecord = input[i]

            if (i > 0) {
              record = {}

              for (const j of Object.keys(input[0] || {})) {
                const k = input[0][j]
                record[k] = compactRecord[j]
              }

              console.log('=> ', record)

              result.push(addRecord(record))

              // JB: this is weird; will cause a memory leak. get stuck in an infinite loop cycling through the records
              // there's some sketchy coding going on somewhere
              // JB: update. okay it's the addRecord() => callback that is orchectrating the action; the rest is just some garbage that so happens to be looping
              // its the callback passed into forEachRecord that makes the magic happen
              // const test = addRecord(record)
              // console.log(test)
              // result.push(test)

            }
          }

          // console.log('jb >> ', result)

          return result
        }
      )()
    }

    // Array of objects
    // console.log('route ARRAY OF OBJECTS')
    return (
      () => {
        const result1 = []

        for (record of Array.from(input)) {
          result1.push(addRecord(record))
        }
        return result1
      }
    )()
  }

  throw new Error('unknown input format')
}

// JB: convert to TypeScript should remove these dependencies on making proptypes declarations with defaults
PivotData.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.func])
    .isRequired,
  aggregatorName: PropTypes.string,
  cols: PropTypes.arrayOf(PropTypes.string),
  rows: PropTypes.arrayOf(PropTypes.string),
  vals: PropTypes.arrayOf(PropTypes.string),
  valueFilter: PropTypes.objectOf(PropTypes.objectOf(PropTypes.bool)),
  sorters: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.objectOf(PropTypes.func),
  ]),
  derivedAttributes: PropTypes.objectOf(PropTypes.func),
  rowOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
  colOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
}

PivotData.defaultProps = {
  aggregators: aggregators,
  cols: [],
  rows: [],
  vals: [],
  aggregatorName: 'Count',
  sorters: {},
  valueFilter: {},
  rowOrder: 'key_a_to_z',
  colOrder: 'key_a_to_z',
  derivedAttributes: {},
}
