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
  }
)

const dataset = ref([])
const activeRenderer = ref(STATIC.RENDERER.table)

onMounted(async () => {
  try {
    const data = await getData(props?.uid)
    dataset.value = data
  } catch (error) {
    console.log('Something went wrong retrieving the data from the endpoint :: ', error)
  }
})
</script>

<template>
  <section className="pivot-table">
    <PivotTableUI
      :data="dataset"
      :cols="['Party Size']"
      :rows="['Payer Gender']"
      :rendererName="activeRenderer"
    />
    <!-- v-bind="options" -->
  </section>
</template>

<style>
@import '../../data-explorer.react/src/app.css';
</style>
