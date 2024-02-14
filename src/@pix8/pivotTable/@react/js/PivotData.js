import PropTypes from 'prop-types'
import { aggregators } from '../../@core/js/aggregators'
import { getSort, naturalSort } from '../../@core/js/utilities'

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
    PivotData.forEachRecord(
      this.props.data,
      this.props.derivedAttributes,
      record => {
        if (this.filter(record)) {
          this.processRecord(record);
        }
      }
    )
  }

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

  processRecord(record) {
    // this code is called in a tight loop
    const colKey = [];
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

// can handle arrays or jQuery selections of tables
PivotData.forEachRecord = function(input, derivedAttributes, f) {
  let addRecord, record

  if (Object.getOwnPropertyNames(derivedAttributes).length === 0) {
    addRecord = f;
  } else {
    addRecord = function(record) {
      for (const k in derivedAttributes) {
        const derived = derivedAttributes[k](record)
        if (derived !== null) {
          record[k] = derived
        }
      }
      return f(record);
    };
  }

  // if it's a function, have it call us back
  if (typeof input === 'function') {
    return input(addRecord)
  } else if (Array.isArray(input)) {
    if (Array.isArray(input[0])) {
      // array of arrays
      return (() => {
        const result = []
        for (const i of Object.keys(input || {})) {
          const compactRecord = input[i]
          if (i > 0) {
            record = {}
            for (const j of Object.keys(input[0] || {})) {
              const k = input[0][j]
              record[k] = compactRecord[j]
            }
            result.push(addRecord(record))
          }
        }
        return result
      })()
    }

    // array of objects
    return (() => {
      const result1 = [];
      for (record of Array.from(input)) {
        result1.push(addRecord(record))
      }
      return result1;
    })()
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
