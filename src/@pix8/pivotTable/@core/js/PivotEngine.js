import { aggregators } from '../../@core/js/aggregators'

export default class PivotEngine {
  constructor(props = {}) {
    // console.log('pivot engine :: ', props)

    this.props = Object.assign({}, PivotEngine.defaultProps, props)
    
    this.tree = {}
    this.rowKeys = []
    this.colKeys = []
    this.rowTotals = {}
    this.colTotals = {}
    this.allTotal = this.aggregator(this, [], [])

    PivotEngine.forEachRecord(
      this.props.data,
      this.props.derivedAttributes,
      (record) => {
        // console.log(record)
        if (this.filter(record)) {
          this.processRecord(record)
        }
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

    this.allTotal.push(record)

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
}

// JB: should make this static method the engine
// can handle arrays or jQuery selections of tables
PivotEngine.forEachRecord = function (input, derivedAttributes, callback) {
  // console.log(input, derivedAttributes)
  
  if (Array.isArray(input)) {
    
    // Array of arrays
    if (Array.isArray(input[0])) {
      return (
        () => {
          for (const i of Object.keys(input || {})) {
            const compactRecord = input[i]

            if (i > 0) {
              const record = {}
              for (const j of Object.keys(input[0] || {})) {
                const k = input[0][j]
                record[k] = compactRecord[j]
              }

              callback(record)
            }
          }
        }
      )() // JB: why the self-executing function?
    }
  }

  throw new Error('Unknown input format can not process the data collection')
}