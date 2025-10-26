<script setup lang="js">
import { computed, ref, watchEffect } from 'vue'
import PivotData from '../../../@core/js/PivotData'
import { redColorScaleGenerator, spanSize } from '../../../@core/js/ui.ts'

const STATICS = {
  heatmapMode: {
    full: 'full',
    column: 'col',
    row: 'row',
  }
}

const props = defineProps({
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
})

/*
// JB: ISSUE: computed not working as expected and recognising the reactivity of props.data
const pivotData = computed(() => {
  console.log('JB :data ready?: ', props.data) // JB: data not loaded at th point and no reactivity
  return new PivotData(props)
})

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

watchEffect(() => {
  pivotData.value = new PivotData(props)

  rowKeys.value = pivotData.value.getRowKeys()
  colKeys.value = pivotData.value.getColKeys()
  rowAttrs.value = pivotData.value.props.rows
  colAttrs.value = pivotData.value.props.cols

  grandTotalAggregator.value = pivotData.value.getAggregator([], [])
})

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
    <!-- <code class="text-sm">{{ JSON.stringify(props.rows, null, 2) }} {{ JSON.stringify(props.cols, null, 2) }}</code> -->
    <!-- <code class="text-xs">{{ JSON.stringify(pivotData, null, 2) }}</code> -->

    <table class="pvtTable">
      <thead>
        <tr v-for="(item, j) in colAttrs" :key="`colAttr${j}`">
          <th
            :rowspan="colAttrs.length"
            :colspan="rowAttrs.length"
            v-if="j === 0 && rowAttrs.length !== 0"
          />

          <th class="pvtAxisLabel">{{ item }}</th>
          
          <!-- JB: the vue way would be to use a computed colKeys to filter out any v-if="spanSize(colKeys, i, j) !== -1" -->
          <template v-for="(colKey, i) in colKeys">
            <th class="pvtColLabel"
              :key="`colKey${i}`"
              :rowspan="j === colAttrs.length - 1 && rowAttrs.length !== 0 ? 2 : 1"
              :colspan="spanSize(colKeys, i, j)"
              v-if="spanSize(colKeys, i, j) !== -1"
            >
              {{ colKey[j] }}
            </th>
          </template>

          <th class="pvtTotalLabel"
            :rowspan="colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)"
            v-if="j === 0"
          >
            Totals
          </th>
        </tr>

        <tr v-if="rowAttrs.length !== 0">
          <th class="pvtAxisLabel"
            v-for="(r, i) in rowAttrs"
            :key="`rowAttr${i}`"
          >
            {{ r }}
          </th>
          
          <th class="pvtTotalLabel">
            {{ colAttrs.length === 0 ? 'Totals' : null }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(rowKey, i) in rowKeys" :key="`rowKeyRow${i}`">
          <template v-for="(txt, j) in rowKey">
            <th class="pvtRowLabel"
              :key="`rowKeyLabel${i}-${j}`"
              :rowspan="spanSize(rowKeys, i, j)"
              :colSpan="j === rowAttrs.length - 1 && colAttrs.length !== 0 ? 2 : 1"
              v-if="spanSize(rowKeys, i, j) !== -1"
            >
              {{ txt }}
            </th>
          </template>

          <td class="pvtVal"
            v-for="(colKey, j) in colKeys"
            :key="`pvtVal${i}-${j}`"
            :style="valueCellColors(rowKey, colKey, pivotData.getAggregator(rowKey, colKey).value())"
            @click="getClickHandler && getClickHandler(pivotData.getAggregator(rowKey, colKey).value(), rowKey, colKey)"
          >
            {{
              pivotData.getAggregator(rowKey, colKey).format(
                pivotData
                  .getAggregator(rowKey, colKey)
                  .value()
              )
            }}
          </td>

          <td class="pvtTotal"
            :style="colTotalColors(pivotData.getAggregator(rowKey, []).value())"
            @click="getClickHandler && getClickHandler(pivotData.getAggregator(rowKey, []).value(), rowKey, [null])"
          >
            {{
              pivotData.getAggregator(rowKey, []).format(
                pivotData
                  .getAggregator(rowKey, [])
                  .value()
              )
            }}
          </td>
        </tr>

        <tr>
          <th class="pvtTotalLabel"
            :colspan="rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)"
          >
            Totals
          </th>

          <td class="pvtTotal"
            v-for="(colKey, i) in colKeys"
            :key="`total${i}`"
            :style="rowTotalColors(pivotData.getAggregator([], colKey).value())"
            @click="getClickHandler && getClickHandler(pivotData.getAggregator([], colKey).value(), [null], colKey)"
          >
            {{
              pivotData.getAggregator([], colKey).format(
                pivotData
                  .getAggregator([], colKey)
                  .value()
              )
              
            }}
          </td>

          <td class="pvtGrandTotal"
            @click="getClickHandler && getClickHandler(grandTotalAggregator.value(), [null], [null])"
          >
            {{
              grandTotalAggregator.format(
                grandTotalAggregator.value()
              )
            }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
@import '../../../@react/components/renderers/tableRenderer.css';
</style>
