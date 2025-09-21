<script setup lang="js">
import PivotData from '../../../@core/js/PivotData'
import { redColorScaleGenerator, spanSize } from '../../../@core/js/ui'

const STATICS = {
  heatmapMode: {
    full: 'full',
    column: 'col',
    row: 'row',
  }
}

const props = defineProps({
  data: Array,
})

const pivotData = new PivotData(props)

const rowKeys = pivotData.getRowKeys()
const colKeys = pivotData.getColKeys()
const rowAttrs = pivotData.props.rows
const colAttrs = pivotData.props.cols

const grandTotalAggregator = pivotData.getAggregator([], [])

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
</script>

<template>
  <div class="border-red-500 border-2 p-2">
    <h1 class="text-red-500">Table Renderer</h1>
    
    <!-- <code class="text-xs">{{ props.data }}</code> -->

    <table className="pvtTable">
      <thead>
        <tr v-for="item in colAttrs" :key="`colAttr${j}`">

          <!-- AI: auto generated/implied from React version; probably broken -->
          <th v-if="item && j === 0" :rowspan="colAttrs.length" :colspan="rowAttrs.length" class="pvtAxisLabel"></th>
          <th v-for="(colKey, i) in colKeys" :key="`colKey${i}`" :colspan="spanSize(colKeys, i, j)" v-if="colKey[j] !== (colKeys[i - 1] && colKeys[i - 1][j])" class="pvtColLabel">
            {{ colKey[j] || 'Total' }}
          </th>
          <th v-if="j === 0" rowspan="2" class="pvtTotalLabel">Total</th>
        </tr>
      </thead>

      <tbody>
        <!-- AI: auto generated/implied from React version; probably broken -->
        <tr v-for="(rowKey, i) in rowKeys" :key="`rowKey${i}`">
          <th v-for="(r, j) in rowKey" :key="`rowAttr${j}`" v-if="r !== (rowKey[j - 1] && rowKey[j - 1])" :rowspan="spanSize(rowKeys, i, j)" class="pvtRowLabel">
            {{ r || 'Total' }}
          </th>

          <td v-for="(colKey, k) in colKeys" :key="`valueCell${k}`" class="pvtVal">
            {{
              pivotData
                .getAggregator(rowKey, colKey)
                .value()
            }}
          </td>

          <td class="pvtTotal">
            {{
              pivotData
                .getAggregator(rowKey, [])
                .value()
            }}
          </td>
        </tr>

        <tr>
          <th class="pvtTotalLabel">Total</th>
          <td v-for="(colKey, k) in colKeys" :key="`colTotal${k}`" class="pvtTotal">
            {{
              pivotData
                .getAggregator([], colKey)
                .value()
            }}
          </td>
          <td class="pvtGrandTotal">
            {{ grandTotalAggregator.value() }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
@import '../../../@react/components/renderers/tableRenderer.css';
</style>
