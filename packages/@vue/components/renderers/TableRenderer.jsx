import { defineComponent, computed, ref, watchEffect } from 'vue'
import PivotData from '../../../@core/js/PivotData'
import { redColorScaleGenerator, spanSize } from '../../../@core/js/ui.ts'

import '../../../@react/components/renderers/tableRenderer.css'

const STATICS = {
  heatmapMode: {
    full: 'full',
    column: 'col',
    row: 'row',
  }
}

function makeRenderer(
  config = {}
) {
  const componentName = config.heatmapMode
    ? `TableRenderer-${config.heatmapMode}`
    : 'TableRenderer'
    
  return defineComponent({
    name: 'TableRenderer', // componentName,

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

      data: Array,

      tableColorScaleGenerator: {
        type: Function,
        // default: () => redColorScaleGenerator, // JB: I swear vue docs says you must return non-primitives with a factory function
        default: redColorScaleGenerator,
      },
      tableOptions: {
        type: Object,
        default: () => ({}),
      },
    },

    setup(props) {
      // JB: ISSUE: computed not working as expected and recognising the reactivity of props.data
      /*
      const pivotData = computed(() => new PivotData(props))

      const rowKeys = pivotData.value.getRowKeys()
      const colKeys = pivotData.value.getColKeys()
      const rowAttrs = pivotData.value.props.rows
      const colAttrs = pivotData.value.props.cols

      const grandTotalAggregator = pivotData.value.getAggregator([], [])
      */

      const pivotData = ref(new PivotData(props))

      const rowKeys = ref()
      const colKeys = ref()
      const rowAttrs = ref()
      const colAttrs = ref()

      const grandTotalAggregator = ref(() => pivotData.value.getAggregator([], []))

      let valueCellColors = ref(() => {})
      let rowTotalColors = ref(() => {}) // JB: needs to be a reactive or else the closure will not work properly and get recaptured
      let colTotalColors = ref(() => {})

      watchEffect(() => {
        pivotData.value = new PivotData(props)

        rowKeys.value = pivotData.value.getRowKeys()
        colKeys.value = pivotData.value.getColKeys()
        rowAttrs.value = pivotData.value.props.rows
        colAttrs.value = pivotData.value.props.cols

        grandTotalAggregator.value = pivotData.value.getAggregator([], [])

        if (config.heatmapMode) {
          const { tableColorScaleGenerator: colorScaleGenerator } = props
          
          const rowTotalValues = colKeys.value.map(x =>
            pivotData.value.getAggregator([], x).value()
          )
          
          rowTotalColors.value = colorScaleGenerator(rowTotalValues)
          // rowTotalColors.value = redColorScaleGenerator(rowTotalValues)
          
          const colTotalValues = rowKeys.value.map(x =>
            pivotData.value.getAggregator(x, []).value()
          )
          
          // JB:: 3 issues; 1) the function assignment via props 2) the argument being passed need to be array of numbers 3) the param passed needs to be a number
          // JB: the closure of min and max does not appear to be working; it goes stale after first assignment and doesn't get recaptured
          colTotalColors.value = colorScaleGenerator(colTotalValues) // JB: => ui.ts redColorScaleGenerator()
          // colTotalColors.value = redColorScaleGenerator(colTotalValues) // JB returns {"backgroundColor":"rgb(255,NaN,NaN)"}

          if (config.heatmapMode === STATICS.heatmapMode.full) {
            const allValues = []

            rowKeys.value.map(r =>
              colKeys.value.map(c =>
                allValues.push(pivotData.value.getAggregator(r, c).value())
              )
            )

            const colorScale = colorScaleGenerator(allValues)

            valueCellColors.value = (r, c, v) => colorScale(v)
          }
          else if (config.heatmapMode === STATICS.heatmapMode.row) {
            const rowColorScales = {}

            rowKeys.value.map(r => {
              const rowValues = colKeys.value.map(x =>
                pivotData.value.getAggregator(r, x).value()
              )
              rowColorScales[r] = colorScaleGenerator(rowValues)
            })

            valueCellColors.value = (r, c, v) => rowColorScales[r](v)
          }
          else if (config.heatmapMode === STATICS.heatmapMode.column) {
            const colColorScales = {}

            colKeys.value.map(c => {
              const colValues = rowKeys.value.map(x =>
                pivotData.value.getAggregator(x, c).value()
              )
              colColorScales[c] = colorScaleGenerator(colValues)
            })

            valueCellColors.value = (r, c, v) => colColorScales[c](v)
          }
        }
      })

      // Create a computed property that returns a fresh function each time
      /*
      const colTotalColors2 = computed(() => {
        if (!config.heatmapMode || !rowKeys.value) return () => ({})
        
        const colTotalValues = rowKeys.value.map(x =>
          pivotData.value.getAggregator(x, []).value()
        )
        
        return colorScaleGenerator(colTotalValues)
      })
      */

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
        pivotData, rowKeys, colKeys, rowAttrs, colAttrs, grandTotalAggregator, getClickHandler, valueCellColors, rowTotalColors, colTotalColors,
      }
    },

    render() {
      const { colKeys, rowKeys, colAttrs, rowAttrs, pivotData, grandTotalAggregator, getClickHandler, valueCellColors, rowTotalColors, colTotalColors, } = this

      return (
        <table class="pvtTable">
          <thead>
            {
              colAttrs.map((item, j) => {
                return (
                  <tr key={`colAttr${j}`}>
                    {j === 0 && rowAttrs.length !== 0 && (
                      <th colSpan={rowAttrs.length} rowSpan={colAttrs.length} />
                    )}

                    <th class="pvtAxisLabel">{item}</th>
                    {
                      colKeys.map((colKey, i) => {
                        const x = spanSize(colKeys, i, j)
                        if (x === -1) {
                          return null
                        }

                        return (
                          <th
                            class="pvtColLabel"
                            key={`colKey${i}`}
                            rowSpan={
                              j === colAttrs.length - 1 && rowAttrs.length !== 0
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
                          colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)
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
              rowAttrs.length !== 0 && (
                <tr>
                  {
                    rowAttrs.map((r, i) => {
                      return (
                        <th class="pvtAxisLabel" key={`rowAttr${i}`}>
                          {r}
                        </th>
                      )
                    })
                  }
                  
                  <th class="pvtTotalLabel">
                    {colAttrs.length === 0 ? 'Totals' : null}
                  </th>
                </tr>
              )
            }
          </thead>

          <tbody>
            {
              rowKeys.map((rowKey, i) => {
                const totalAggregator = pivotData.getAggregator(rowKey, [])
                return (
                  <tr key={`rowKeyRow${i}`}>
                    {
                      rowKey.map((txt, j) => {
                        const x = spanSize(rowKeys, i, j)

                        if (x === -1) {
                          return null
                        }

                        return (
                          <th
                            class="pvtRowLabel"
                            key={`rowKeyLabel${i}-${j}`}
                            rowSpan={x}
                            colSpan={
                              j === rowAttrs.length - 1 && colAttrs.length !== 0
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
                      colKeys.map((colKey, j) => {
                        const aggregator = pivotData.getAggregator(rowKey, colKey)

                        return (
                          <td
                            class="pvtVal"
                            key={`pvtVal${i}-${j}`}
                            onClick={
                              getClickHandler &&
                              getClickHandler(aggregator.value(), rowKey, colKey)
                            }
                            style={valueCellColors(
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
                        getClickHandler &&
                        getClickHandler(totalAggregator.value(), rowKey, [null])
                      }
                      style={colTotalColors(totalAggregator.value())}
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
                colSpan={rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)}
              >
                Totals
              </th>

              {
                colKeys.map((colKey, i) => {
                  const totalAggregator = pivotData.getAggregator([], colKey)

                  return (
                    <td
                      class="pvtTotal"
                      key={`total${i}`}
                      onClick={
                        getClickHandler &&
                        getClickHandler(totalAggregator.value(), [null], colKey)
                      }
                      style={rowTotalColors(totalAggregator.value())}
                    >
                      {totalAggregator.format(totalAggregator.value())}
                    </td>
                  )
                })
              }

              <td
                onClick={
                  getClickHandler &&
                  getClickHandler(grandTotalAggregator.value(), [null], [null])
                }
                class="pvtGrandTotal"
              >
                {grandTotalAggregator.format(grandTotalAggregator.value())}
              </td>
            </tr>
          </tbody>
        </table>
      )
    },
  })
}

export default {
  Table: makeRenderer(),
  'Table Heatmap': makeRenderer({heatmapMode: STATICS.heatmapMode.full}),
  'Table Column Heatmap': makeRenderer({heatmapMode: STATICS.heatmapMode.column}),
  'Table Row Heatmap': makeRenderer({heatmapMode: STATICS.heatmapMode.row}),
}