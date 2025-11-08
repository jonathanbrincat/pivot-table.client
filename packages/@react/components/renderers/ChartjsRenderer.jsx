import React from 'react'
import PropTypes from 'prop-types'
import PivotData from '../../../@core/js/PivotData'

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

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
  class Renderer extends React.PureComponent {
    render() {
      const pivotData = new PivotData(this.props)

      const rowKeys = pivotData.getRowKeys() // => answers
      const colKeys = pivotData.getColKeys() // => breakdown; insights
      
      const traceKeys = transpose ? colKeys : rowKeys
      if (traceKeys.length === 0) {
        traceKeys.push([])
      }

      const datumKeys = transpose ? rowKeys : colKeys
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

      // console.log('JB :: ', data)
      
      return (
        <>
          <p>Chart.js</p>
          <ChartjsComponent data={data} options={OPTIONS} />
          {/* <ChartjsComponent data={chartjsData} options={chartjsOptions} /> */}
        </>
      )
    }
  }

  Renderer.propTypes = Object.assign({}, PivotData.propTypes, {
    onRendererUpdate: PropTypes.func,
  })

  return Renderer
}

export default function createChartjsRenderer(ChartjsComponent, config) {
  return {
    Chartjs: makeRenderer(ChartjsComponent, config, true),
  }
}
