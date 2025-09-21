<script setup lang="js">
import { computed } from 'vue'
import PivotData from '../../@core/js/PivotData'
// import { TableRenderer, TSVRenderer, FoobarRenderer, TestRenderer } from './renderers'

const props = defineProps(
  // ...PivotData.defaultProps,
  {
    data: {
      type: Array,
      default: () => [],
    },
    rendererName: {
      type: String,
      default: 'Table',
    },
    // renderers: {...TableRenderer, ...TSVRenderer, ...FoobarRenderer},
    // renderers: { ...TableRenderer, ...FoobarRenderer, ...TestRenderer },
    renderers: {
      type: Object,
      default: () => ({
        Table: TableRenderer,
        Foobar: FoobarRenderer,
        Test: TestRenderer
      })
    },
  }
)

const renderer = computed(() => {
  const rendererName = props.rendererName
  return props.renderers[rendererName] || Object.values(props.renderers)[0]
})
console.log('JB :: ', props.data)
</script>

<template>
  <Component :is="renderer" v-bind="props" />
</template>
