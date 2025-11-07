<script setup lang="js">
import { computed } from 'vue'
import PivotData from '../../@core/js/PivotData'
import { TableRenderer, TSVRenderer, FoobarRenderer, TestRenderer, createPlotlyRenderer, createChartjsRenderer } from './renderers'
import { aggregators } from '../../@core/js/aggregators'

const props = defineProps(
  
  {
    // PivotData.defaultProps,
    aggregators: {
      type: Object,
      default: () => aggregators,
    },
    cols: {
      type: Array,
      default: () => [],
    },
    rows: {
      type: Array,
      default: () => [],
    },
    vals: {
      type: Array,
      default: () => [],
    },
    aggregatorName: {
      type: String,
      default: 'Count',
    },
    sorters: {
      type: Object,
      default: () => ({}),
    },
    valueFilter: {
      type: Object,
      default: () => ({}),
    },
    rowOrder: {
      type: String,
      default: 'key_a_to_z',
    },
    colOrder: {
      type: String,
      default: 'key_a_to_z',
    },
    derivedAttributes: {
      type: Object,
      default: () => ({}),
    },
    
    data: { // JB: doesn't need to be a proxy object/ref
      type: Array,
      default: () => [],
    },
    rendererName: {
      type: String,
    },
    renderers: {
      type: Object,
      default: () => ({ ...TableRenderer, ...FoobarRenderer, ...TestRenderer, ...TSVRenderer, }),
    },
  }
)

const renderer = computed(() => {
  const rendererName = props.rendererName

  return props.renderers[rendererName] || Object.values(props.renderers)[0]
})
</script>

<template>
  <!-- <p>{{ JSON.stringify(props, null, 2) }}</p> -->

  <Component :is="renderer" v-bind="props" />
</template>
