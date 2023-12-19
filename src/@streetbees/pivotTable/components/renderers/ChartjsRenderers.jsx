import React from 'react'
import PropTypes from 'prop-types'
import { PivotData } from '../../js/Utilities'

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController)

const OPTIONS = {
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

function makeRenderer(
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

      let fullAggName = this.props.aggregatorName;

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
      
      return (
        <>
          <Bar data={data} options={OPTIONS} />
        </>
      )
    }
  }

  Renderer.propTypes = Object.assign({}, PivotData.propTypes, {
    onRendererUpdate: PropTypes.func,
  })

  return Renderer;
}

export default function createChartjsRenderers(config) {
  return {
    'Chartjs': makeRenderer(config, true),
  }
}
