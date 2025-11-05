import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import PivotTableUI from '../../../packages/@react'
// import { TableRenderer, TSVRenderer, createChartjsRenderer}  from '../../../packages/@react/components/renderers'
// import {aggregators, aggregatorTemplates }  from '../../../packages/@core/js/aggregators'
import { getData } from '../../../common/js/services/dataService'
import {isEmptyObject}  from '../../../common/js/utility'
import STATIC, { colors as palette  } from '../../../common/js/constants'

import './app.css'

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
        // renderers={{
        // 	...TableRenderer,
				// 	...TSVRenderer,
        // 	...createChartjsRenderer({ palette }),
        // }}
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
