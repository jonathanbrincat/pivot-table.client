import React from 'react'
import PropTypes from 'prop-types'
import PivotData from '../../js/PivotData'
import { redColorScaleGenerator } from '../../../@core/js/utilities'

import './tableRenderers.css'

const STATICS = {
  heatmapMode: {
    full: 'full',
    column: 'col',
    row: 'row',
  }
}

// helper function for setting row/col-span in pivotTableRenderer
function spanSize(arr, i, j) {
  let x

  if (i !== 0) {
    let asc, end
    let noDraw = true

    for (
      x = 0, end = j, asc = end >= 0;
      asc ? x <= end : x >= end;
      asc ? x++ : x--
    ) {
      if (arr[i - 1][x] !== arr[i][x]) {
        noDraw = false
      }
    }
    if (noDraw) {
      return -1
    }
  }

  let len = 0

  while (i + len < arr.length) {
    let asc1, end1
    let stop = false

    for (
      x = 0, end1 = j, asc1 = end1 >= 0;
      asc1 ? x <= end1 : x >= end1;
      asc1 ? x++ : x--
    ) {
      if (arr[i][x] !== arr[i + len][x]) {
        stop = true
      }
    }
    if (stop) {
      break
    }
    len++
  }

  return len
}

function makeRenderer(
  config = {}
) {
  class TableRenderer extends React.PureComponent {
    render() {
      const pivotData = new PivotData(this.props)

      const rowKeys = pivotData.getRowKeys()
      const colKeys = pivotData.getColKeys()
      const rowAttrs = pivotData.props.rows
      const colAttrs = pivotData.props.cols
      
      const grandTotalAggregator = pivotData.getAggregator([], [])

      let valueCellColors = () => {}
      let rowTotalColors = () => {}
      let colTotalColors = () => {}

      if (config.heatmapMode) {
        const colorScaleGenerator = this.props.tableColorScaleGenerator

        const rowTotalValues = colKeys.map(x =>
          pivotData.getAggregator([], x).value()
        )

        rowTotalColors = colorScaleGenerator(rowTotalValues)
        
        const colTotalValues = rowKeys.map(x =>
          pivotData.getAggregator(x, []).value()
        )
        colTotalColors = colorScaleGenerator(colTotalValues)

        if (config.heatmapMode === STATICS.heatmapMode.full) {
          const allValues = []

          rowKeys.map(r =>
            colKeys.map(c =>
              allValues.push(pivotData.getAggregator(r, c).value())
            )
          )

          const colorScale = colorScaleGenerator(allValues)

          valueCellColors = (r, c, v) => colorScale(v)
        }
        else if (config.heatmapMode === STATICS.heatmapMode.row) {
          const rowColorScales = {}

          rowKeys.map(r => {
            const rowValues = colKeys.map(x =>
              pivotData.getAggregator(r, x).value()
            )
            rowColorScales[r] = colorScaleGenerator(rowValues)
          })

          valueCellColors = (r, c, v) => rowColorScales[r](v)
        }
        else if (config.heatmapMode === STATICS.heatmapMode.column) {
          const colColorScales = {}

          colKeys.map(c => {
            const colValues = rowKeys.map(x =>
              pivotData.getAggregator(x, c).value()
            )
            colColorScales[c] = colorScaleGenerator(colValues)
          })

          valueCellColors = (r, c, v) => colColorScales[c](v)
        }
      }

      const getClickHandler =
        this.props.tableOptions && this.props.tableOptions.clickCallback
          ? (value, rowValues, colValues) => {
              const filters = {}

              for (const i of Object.keys(colAttrs || {})) {
                const attr = colAttrs[i];
                if (colValues[i] !== null) {
                  filters[attr] = colValues[i]
                }
              }

              for (const i of Object.keys(rowAttrs || {})) {
                const attr = rowAttrs[i];
                if (rowValues[i] !== null) {
                  filters[attr] = rowValues[i]
                }
              }

              return e =>
                this.props.tableOptions.clickCallback(
                  e,
                  value,
                  filters,
                  pivotData
                );
            }
          : null

      return (
        <table className="pvtTable">
          <thead>
            {
              colAttrs.map(function(c, j) {
                return (
                  <tr key={`colAttr${j}`}>
                    {j === 0 && rowAttrs.length !== 0 && (
                      <th colSpan={rowAttrs.length} rowSpan={colAttrs.length} />
                    )}

                    <th className="pvtAxisLabel">{c}</th>
                    {
                      colKeys.map(function(colKey, i) {
                        const x = spanSize(colKeys, i, j)
                        if (x === -1) {
                          return null;
                        }

                        return (
                          <th
                            className="pvtColLabel"
                            key={`colKey${i}`}
                            colSpan={x}
                            rowSpan={
                              j === colAttrs.length - 1 && rowAttrs.length !== 0
                                ? 2
                                : 1
                            }
                          >
                            {colKey[j]}
                          </th>
                        )
                      })
                    }

                    {j === 0 && (
                      <th
                        className="pvtTotalLabel"
                        rowSpan={
                          colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)
                        }
                      >
                        Totals
                      </th>
                    )}
                  </tr>
                );
              })
            }

            {
              rowAttrs.length !== 0 && (
                <tr>
                  {
                    rowAttrs.map(function(r, i) {
                      return (
                        <th className="pvtAxisLabel" key={`rowAttr${i}`}>
                          {r}
                        </th>
                      );
                    })
                  }
                  
                  <th className="pvtTotalLabel">
                    {colAttrs.length === 0 ? 'Totals' : null}
                  </th>
                </tr>
              )
            }
          </thead>

          <tbody>
            {
              rowKeys.map(function(rowKey, i) {
                const totalAggregator = pivotData.getAggregator(rowKey, []);
                return (
                  <tr key={`rowKeyRow${i}`}>
                    {
                      rowKey.map(function(txt, j) {
                        const x = spanSize(rowKeys, i, j)

                        if (x === -1) {
                          return null;
                        }

                        return (
                          <th
                            key={`rowKeyLabel${i}-${j}`}
                            className="pvtRowLabel"
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
                      colKeys.map(function(colKey, j) {
                        const aggregator = pivotData.getAggregator(rowKey, colKey)

                        return (
                          <td
                            className="pvtVal"
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
                      className="pvtTotal"
                      onClick={
                        getClickHandler &&
                        getClickHandler(totalAggregator.value(), rowKey, [null])
                      }
                      style={colTotalColors(totalAggregator.value())}
                    >
                      {totalAggregator.format(totalAggregator.value())}
                    </td>
                  </tr>
                );
              })
            }

            <tr>
              <th
                className="pvtTotalLabel"
                colSpan={rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)}
              >
                Totals
              </th>

              {
                colKeys.map(function(colKey, i) {
                  const totalAggregator = pivotData.getAggregator([], colKey)

                  return (
                    <td
                      className="pvtTotal"
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
                className="pvtGrandTotal"
              >
                {grandTotalAggregator.format(grandTotalAggregator.value())}
              </td>
            </tr>
          </tbody>
        </table>
      )
    }
  }

  TableRenderer.propTypes = {
    ...PivotData.propTypes,
    tableColorScaleGenerator: PropTypes.func,
    tableOptions: PropTypes.object,
  }
  
  TableRenderer.defaultProps = {
    ...PivotData.defaultProps,
    tableColorScaleGenerator: redColorScaleGenerator,
    tableOptions: {},
  }
  
  return TableRenderer
}

export default {
  Table: makeRenderer(),
  'Table Heatmap': makeRenderer({heatmapMode: STATICS.heatmapMode.full}),
  'Table Column Heatmap': makeRenderer({heatmapMode: STATICS.heatmapMode.column}),
  'Table Row Heatmap': makeRenderer({heatmapMode: STATICS.heatmapMode.row}),
};
