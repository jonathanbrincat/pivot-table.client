<script setup lang="js">
import { ref, onMounted } from 'vue'
import PivotTableUI from '../../../packages/@vue'
import { getData } from '../../../common/js/services/dataService'
import STATIC, { colors as palette  } from '../../../common/js/constants'

// JB: do i still need these? aggregatorName doesn't even get touched and gets overridden
// const options = {
// 	aggregatorName: STATIC.AGGREGATOR.uniqueCountOfGrandTotal,
// 	unusedOrientationCutoff: Infinity,
// }

const props = defineProps(
  {
    uid: {
      type: String,
      required: true,
    },
    taxonomy: {
      type: Object,
      default: () => ({ questions:[], key_variables: [] }),
    },
  }
)

const dataset = ref([])
const activeRenderer = ref(STATIC.RENDERER.table)

onMounted(async () => {
  try {
    const test = await getData(props?.uid)
    console.log('DATA LOADED', test)
    dataset.value = test
  } catch (error) {
    console.log('Something went wrong retrieving the data from the endpoint :: ', error)
  }
})
</script>

<template>
  <section className="pivot-table">
    <PivotTableUI
      :data="dataset"
      :cols="['Age', 'Gender']"
      :rows="['What brands of treats and toys do you usually buy for your pet']"
      :rendererName="activeRenderer"
    />
    <!-- v-bind="options" -->
  </section>
</template>

<style>
@import '../../data-explorer.react/src/app.css';
</style>
