import { defineComponent, ref } from 'vue'
import PivotData from '../../../@core/js/PivotData'

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

const chartjsOptions = {
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

const OPTIONS = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Chart.js Bar Chart',
    },
  },
} 

function makeRenderer(
  ChartjsComponent,
  config = {},
  transpose = false,
) {
  return defineComponent({
    name: 'ChartjsRenderer',

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
    },
    
    setup(props) {
      console.log('JB :props: ', JSON.stringify(props))

      const pivotData = ref(new PivotData(props))
      
      const rowKeys = ref(pivotData.value.getRowKeys()) // => answers
      const colKeys = ref(pivotData.value.getColKeys()) // => breakdown; insights

      /*
      const traceKeys = transpose ? colKeys.value : rowKeys.value
      if (traceKeys.length === 0) {
        traceKeys.push([])
      }

      const datumKeys = transpose ? rowKeys.value : colKeys.value
      if (datumKeys.length === 0) {
        datumKeys.push([])
      }

      let fullAggName = this.props.aggregatorName

      const dataset = traceKeys.map((traceKey, i) => {
        const values = []
        const labels = []

        for (const datumKey of datumKeys) {
          const val = parseFloat(
            pivotData
              .getAggregator(
                transpose ? datumKey : traceKey,
                transpose ? traceKey : datumKey
              )
              .value()
          )
          values.push(isFinite(val) ? val : null)
          labels.push(datumKey.join('-') || ' ')
        }

        const trace = {
          label: traceKey.join('-') || fullAggName,
          data: values,
          backgroundColor: config?.palette[i],
        }

        trace.labels = labels

        return trace
      })

      const data = {
        labels: dataset[0].labels,
        datasets: [...dataset],
      }

      console.log('JB :: ', data)

      return {
        data,
      }
      */
    },

    render() {
      return (
        <>
          <p>Chart.js</p>
          <ChartjsComponent data={chartjsData} options={chartjsOptions} />
        </>
      )
    }
  })
}

export default function createChartjsRenderer(ChartjsComponent, config) {
  return {
    Chartjs: makeRenderer(ChartjsComponent, config, true),
  }
}
