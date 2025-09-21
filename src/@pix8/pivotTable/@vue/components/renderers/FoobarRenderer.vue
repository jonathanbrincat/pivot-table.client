<script setup lang="js">
import PivotData from '../../../@core/js/PivotData'

const props = defineProps({
  data: Array,
})

const pivotData = new PivotData({ ...PivotData.defaultProps, ...props })

const rowKeys = pivotData.getRowKeys()
const colKeys = pivotData.getColKeys()
const rowAttrs = pivotData.props.rows // unmodified data
const colAttrs = pivotData.props.cols // unmodified data

const grandTotalAggregator = pivotData.getAggregator([], [])

console.log('FoobarRenderer :pivotData: ', pivotData)
</script>

<template>
  <div class="border-blue-500 border-2 p-2">
    <h1 class="text-blue-500">Foobar Renderer</h1>

    <code class="text-xs">{{ props.data }}</code>
  </div>
</template>

<style>
@import '../../../@react/components/renderers/foobarRenderer.css';
</style>
