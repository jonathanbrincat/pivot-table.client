import { defineComponent, ref } from 'vue'
import PivotData from '../../../@core/js/PivotData'

const dataPlotly = [
  {
    type: 'bar',
    name: 'Dataset 1',
    x: [100, 200, 300, 400, 500, 600, 700],
    y: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    orientation: 'h',
    marker: {
      color: 'rgb(255, 99, 132)',
      opacity: 0.5,
    },
  },
  {
    type: 'bar',
    name: 'Dataset 2',
    x: [200, 300, 400, 500, 600, 700, 800],
    y: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    orientation: 'h',
    marker: {
      color: 'rgb(53, 162, 235)',
      opacity: 0.5,
    },
  },
]

const layoutPlotly = {
  // width: 320,
  // height: 240,
  barmode: 'group',
  title: {text: 'A Fancy Plot'},
}

function makeRenderer(
  PlotlyComponent,
  traceOptions = {},
  layoutOptions = {},
  transpose = false,
) {
  return defineComponent({
    name: 'PlotlyRenderer',

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
      console.log('JB :props: ', props)
      
      const pivotData = ref(new PivotData(props))

      const rowKeys = ref(pivotData.value.getRowKeys()) // => answers
      const colKeys = ref(pivotData.value.getColKeys()) // => breakdown; insights

      const traceKeys = transpose ? colKeys.value : rowKeys.value
      if (traceKeys.length === 0) {
        traceKeys.push([])
      }

      const datumKeys = transpose ? rowKeys.value : colKeys.value
      if (datumKeys.length === 0) {
        datumKeys.push([])
      }

      let fullAggName = props.aggregatorName;
      const numInputs = props.aggregators[fullAggName]([])().numInputs || 0
      if (numInputs !== 0) {
        fullAggName += ` of ${props.vals.slice(0, numInputs).join(', ')}`
      }

      const data = traceKeys.map(traceKey => {
        const values = []
        const labels = []

        for (const datumKey of datumKeys) {
          const val = parseFloat(
            pivotData.value
              .getAggregator(
                transpose ? datumKey : traceKey,
                transpose ? traceKey : datumKey
              )
              .value()
          )

          values.push(isFinite(val) ? val : null)
          labels.push(datumKey.join('-') || ' ')
        }

        const trace = {name: traceKey.join('-') || fullAggName}
        if (traceOptions.type === 'pie') {
          trace.values = values
          trace.labels = labels.length > 1 ? labels : [fullAggName]
        }
        else {
          trace.x = transpose ? values : labels
          trace.y = transpose ? labels : values
        }

        return Object.assign(trace, traceOptions)
      })

      let titleText = fullAggName
      const hAxisTitle = transpose
        ? this.props.rows.join('-')
        : this.props.cols.join('-')
      
      const groupByTitle = transpose
        ? this.props.cols.join('-')
        : this.props.rows.join('-')
      
      if (hAxisTitle !== '') {
        titleText += ` vs ${hAxisTitle}`
      }

      if (groupByTitle !== '') {
        titleText += ` by ${groupByTitle}`
      }

      const layout = {
        title: titleText,
        hovermode: 'closest',
        /* eslint-disable no-magic-numbers */
        width: window.innerWidth / 1.5,
        height: window.innerHeight / 1.4 - 50,
        /* eslint-enable no-magic-numbers */
      }

      return { data, layout }
    },

    render() {
      return (
        <>
          <div>Plotly Renderer (to be implemented)</div>
          <PlotlyComponent
            data={data}
            layout={layoutPlotly}
          />
        </>
      )
    }
  })
}

export default function createPlotlyRenderer(PlotlyComponent, config) {
  return {
    Plotly: makeRenderer(PlotlyComponent, {type: 'bar'}, {barmode: 'group'}),
  }
}
