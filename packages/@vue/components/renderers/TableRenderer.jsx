import { defineComponent, computed, ref, watchEffect } from 'vue'
import PivotData from '../../../@core/js/PivotData'
import { redColorScaleGenerator, spanSize } from '../../../@core/js/ui'

import '../../../@react/components/renderers/tableRenderer.css'

const STATICS = {
  heatmapMode: {
    full: 'full',
    column: 'col',
    row: 'row',
  }
}

export default defineComponent({
  name: 'TableRenderer',

  props: {
    // JB: there are defaults in PivotData.defaultProps that should be transferred, however also duplication.
    aggregators: Object,
    cols: Array,
    rows: Array,
    vals: Array,
    aggregatorName: String,
    sorters: Object,
    valueFilter: Object,
    rowOrder: String,
    colOrder: String,
    derivedAttributes: Object,

    tableColorScaleGenerator: {
      type: Function,
      default: () => redColorScaleGenerator,
    },
    tableOptions: {
      type: Object,
      default: () => ({}),
    },

    data: Array,
  },

  setup(props) {
    // JB: ISSUE: computed not working as expected and recognising the reactivity of props.data
    // const pivotData = computed(() => new PivotData(props))

    // const rowKeys = pivotData.value.getRowKeys()
    // const colKeys = pivotData.value.getColKeys()
    // const rowAttrs = pivotData.value.props.rows
    // const colAttrs = pivotData.value.props.cols

    // const grandTotalAggregator = pivotData.value.getAggregator([], [])

    // let valueCellColors = () => {}
    // let rowTotalColors = () => {}
    // let colTotalColors = () => {}

    const pivotData = ref(new PivotData(props))
    const rowKeys = ref()
    const colKeys = ref()
    const rowAttrs = ref()
    const colAttrs = ref()
    const grandTotalAggregator = ref(() => pivotData.value.getAggregator([], []))

    watchEffect(() => {
      console.log('JB :data ready?: ', props.data)
      pivotData.value = new PivotData(props)

      rowKeys.value = pivotData.value.getRowKeys()
      colKeys.value = pivotData.value.getColKeys()
      rowAttrs.value = pivotData.value.props.rows
      colAttrs.value = pivotData.value.props.cols

      grandTotalAggregator.value = pivotData.value.getAggregator([], [])
      console.log('JB :grandTotalAggregator: ', grandTotalAggregator)
    })
    console.log('JB :: ', pivotData.value)

    let valueCellColors = () => {}
    let rowTotalColors = () => {}
    let colTotalColors = () => {}

    // JB: can not implement this functionality with out converting to render function + jsx
    // if (config.heatmapMode) {}

    const getClickHandler =
      props.tableOptions && props.tableOptions.clickCallback
        ? (value, rowValues, colValues) => {
            const filters = {}

            for (const i of Object.keys(colAttrs || {})) {
              const attr = colAttrs[i]
              if (colValues[i] !== null) {
                filters[attr] = colValues[i]
              }
            }

            for (const i of Object.keys(rowAttrs || {})) {
              const attr = rowAttrs[i]
              if (rowValues[i] !== null) {
                filters[attr] = rowValues[i]
              }
            }

            return e =>
              props.tableOptions.clickCallback(
                e,
                value,
                filters,
                pivotData
              )
          }
        : null
    
        return  {
          pivotData, rowKeys, colKeys, rowAttrs, colAttrs, grandTotalAggregator, getClickHandler, valueCellColors, rowTotalColors, colTotalColors
        }
  },

  render() {
    return (
      <table class="pvtTable">
        <thead>
          {
            this.colAttrs.map((item, j) => {
              return (
                <tr key={`colAttr${j}`}>
                  {j === 0 && this.rowAttrs.length !== 0 && (
                    <th colSpan={this.rowAttrs.length} rowSpan={this.colAttrs.length} />
                  )}

                  <th class="pvtAxisLabel">{item}</th>
                  {
                    this.colKeys.map((colKey, i) => {
                      const x = spanSize(this.colKeys, i, j)
                      if (x === -1) {
                        return null
                      }

                      return (
                        <th
                          class="pvtColLabel"
                          key={`colKey${i}`}
                          rowSpan={
                            j === this.colAttrs.length - 1 && this.rowAttrs.length !== 0
                              ? 2
                              : 1
                          }
                          colSpan={x}
                        >
                          {colKey[j]}
                        </th>
                      )
                    })
                  }

                  {j === 0 && (
                    <th
                      class="pvtTotalLabel"
                      rowSpan={
                        this.colAttrs.length + (this.rowAttrs.length === 0 ? 0 : 1)
                      }
                    >
                      Totals
                    </th>
                  )}
                </tr>
              )
            })
          }

          {
            this.rowAttrs.length !== 0 && (
              <tr>
                {
                  this.rowAttrs.map((r, i) => {
                    return (
                      <th class="pvtAxisLabel" key={`rowAttr${i}`}>
                        {r}
                      </th>
                    )
                  })
                }
                
                <th class="pvtTotalLabel">
                  {this.colAttrs.length === 0 ? 'Totals' : null}
                </th>
              </tr>
            )
          }
        </thead>

        <tbody>
          {
            this.rowKeys.map((rowKey, i) => {
              const totalAggregator = this.pivotData.getAggregator(rowKey, [])
              return (
                <tr key={`rowKeyRow${i}`}>
                  {
                    rowKey.map((txt, j) => {
                      const x = spanSize(this.rowKeys, i, j)

                      if (x === -1) {
                        return null
                      }

                      return (
                        <th
                          class="pvtRowLabel"
                          key={`rowKeyLabel${i}-${j}`}
                          rowSpan={x}
                          colSpan={
                            j === this.rowAttrs.length - 1 && this.colAttrs.length !== 0
                              ? 2
                              : 1
                          }
                        >
                          {txt}
                        </th>
                      )
                    })
                  }

                  {
                    this.colKeys.map((colKey, j) => {
                      const aggregator = this.pivotData.getAggregator(rowKey, colKey)

                      return (
                        <td
                          class="pvtVal"
                          key={`pvtVal${i}-${j}`}
                          onClick={
                            this.getClickHandler &&
                            this.getClickHandler(aggregator.value(), rowKey, colKey)
                          }
                          style={this.valueCellColors(
                            rowKey,
                            colKey,
                            aggregator.value()
                          )}
                        >
                          {aggregator.format(aggregator.value())}
                        </td>
                      )
                    })
                  }

                  <td
                    class="pvtTotal"
                    onClick={
                      this.getClickHandler &&
                      this.getClickHandler(totalAggregator.value(), rowKey, [null])
                    }
                    style={this.colTotalColors(totalAggregator.value())}
                  >
                    {totalAggregator.format(totalAggregator.value())}
                  </td>
                </tr>
              )
            })
          }

          <tr>
            <th
              class="pvtTotalLabel"
              colSpan={this.rowAttrs.length + (this.colAttrs.length === 0 ? 0 : 1)}
            >
              Totals
            </th>

            {
              this.colKeys.map((colKey, i) => {
                const totalAggregator = this.pivotData.getAggregator([], colKey)

                return (
                  <td
                    class="pvtTotal"
                    key={`total${i}`}
                    onClick={
                      this.getClickHandler &&
                      this.getClickHandler(totalAggregator.value(), [null], colKey)
                    }
                    style={this.rowTotalColors(totalAggregator.value())}
                  >
                    {totalAggregator.format(totalAggregator.value())}
                  </td>
                )
              })
            }

            <td
              onClick={
                this.getClickHandler &&
                this.getClickHandler(this.grandTotalAggregator.value(), [null], [null])
              }
              class="pvtGrandTotal"
            >
              {this.grandTotalAggregator.format(this.grandTotalAggregator.value())}
            </td>
          </tr>
        </tbody>
      </table>
    )
  },
})
