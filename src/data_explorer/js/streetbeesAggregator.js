import { numberFormat } from '../../@streetbees/pivotTable/js/Utilities'

export const usFmt = numberFormat()
export const usFmtInt = numberFormat({ digitsAfterDecimal: 0 })

export function streetbeesAggregator(fn, formatter = usFmt) {
  return function ([attr]) {
    return function (data, rowKey, colKey) {
      return {
        unique: new Map(),

        push(record) {
          this.unique.set(record['submission_id'], rowKey)
        },

        value() {
          return this.unique.size
        },

        format: formatter,
      };
    }
  }
}
