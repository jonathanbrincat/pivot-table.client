import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import PivotTableUI from '../../../packages/@react'
import { TSVRenderer, createPlotlyRenderer, createChartjsRenderer}  from '../../../packages/@react/components/renderers'
// import {aggregators, aggregatorTemplates }  from '../../../packages/@core/js/aggregators'
import { getData } from '../../../common/js/services/dataService'
import {isEmptyObject}  from '../../../common/js/utility'
import STATIC, { colors as palette  } from '../../../common/js/constants'

import Plotly from 'plotly.js/dist/plotly'
import createPlotlyComponent from 'react-plotly.js/factory'
// import Plot from 'react-plotly.js'

import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController)
const PlotlyInstance = createPlotlyComponent(Plotly) // JB: create instance of Plotly

import './app.css'

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

// const options = {
// 	aggregatorName: STATIC.AGGREGATOR.uniqueCountOfGrandTotal,
// 	unusedOrientationCutoff: Infinity,
// }

export default function App({
	uid = '',
}) {
	const [dataset, setDataset] = useState([])

	const [questionFilters, setQuestionFilters] = useState([])

	const [keyVariablesFilters, setKeyVariablesFilters] = useState([])

	const [activeRenderer, setActiveRenderer] = useState(STATIC.RENDERER.table)

	useEffect(() => {
		async function load() {
			try {
        const data = await getData(uid)
				setDataset(data)
			} catch (error) {
				console.log('Something went wrong retrieving the data from the endpoint :: ', error)
			}
		}		

		load()
	}, [uid])

	return (
    <section className="pivot-table">
      <PivotTableUI
        data={dataset} // REQUIRED - everything else is optional
        renderers={{
					...TSVRenderer,
					// ...createPlotlyRenderer(Plot, {}), // JB: Using react-plotly.js
					...createPlotlyRenderer(PlotlyInstance, {}),
    			...createChartjsRenderer(Bar, { palette }),
        }}
        // aggregators={{
        // 	...aggregators,
        // }}

        cols={['Party Size']}
        rows={['Payer Gender']}
        rendererName={activeRenderer}

        // {...options}
      />
    </section>
	)
}

App.propTypes = {
	uid: PropTypes.string.isRequired,
}
