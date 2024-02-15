export default class PivotEngine {
  constructor(props = {}) {
    // console.log('pivot engine :: ', props)

    this.props = Object.assign({}, PivotEngine.defaultProps, props)
    this.foo = 'hello'

    PivotEngine.forEachRecord(
      this.props.data,
      this.props.derivedAttributes,
      (record) => {
        // console.log(record)
        // if (this.filter(record)) {
        //   this.processRecord(record);
        // }
      }
    )
  }

  // filter(record) {
  //   for (const k in this.props.valueFilter) {
  //     if (record[k] in this.props.valueFilter[k]) {
  //       return false
  //     }
  //   }
  //   return true
  // }
}

// JB: should make this static method the engine
// can handle arrays or jQuery selections of tables
PivotEngine.forEachRecord = function (input, derivedAttributes, func) {
  // console.log(input, derivedAttributes)
  
  let addRecord, record

  if (Object.getOwnPropertyNames(derivedAttributes).length === 0) {
    addRecord = func
  }
  else {
    addRecord = function(record) {
      for (const k in derivedAttributes) {
        const derived = derivedAttributes[k](record)
        if (derived !== null) {
          record[k] = derived
        }
      }

      return func(record)
    }
  }

  // if it's a function, have it call us back
  if (typeof input === 'function') {
    return input(addRecord)
  }
  else if (Array.isArray(input)) {
    
    // Array of arrays
    if (Array.isArray(input[0])) {
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
              result.push(addRecord(record))
            }
          }

          return result
        }
      )()
    }

    // Array of objects
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

  throw new Error('Unknown input format can not process the data collection')
}