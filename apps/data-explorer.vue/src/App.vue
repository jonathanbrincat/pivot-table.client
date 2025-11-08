<script setup lang="js">
import { ref, onMounted } from 'vue'
import PivotTableUI from '../../../packages/@vue'
import { TSVRenderer, createPlotlyRenderer, createChartjsRenderer } from '../../../packages/@vue/components/renderers'
import { getData } from '../../../common/js/services/dataService'
import STATIC, { colors as palette  } from '../../../common/js/constants'

// import { Plotly } from '@aurium/vue-plotly'
import Plotly from '@aurium/vue-plotly'

import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartjsData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [100, 200, 300, 400, 500, 600, 700],
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Dataset 2',
      data: [200, 300, 400, 500, 600, 700, 800],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

const chatjsOptions = {
  responsive: true,
  indexAxis: 'y',
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        title: () => null
      },
    },
    usePointStyle: true,
  },
}

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
      :renderers="{
        ...TSVRenderer,
        ...createPlotlyRenderer(Plotly, {}),
        ...createChartjsRenderer(Bar, { palette }),
      }"
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
