import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import PivotTableUI from '../@pix8/pivotTable/@react'
import {TableRenderer, TSVRenderer, createChartjsRenderer}  from '../@pix8/pivotTable/@react/components/renderers'
import { getData } from './js/services/dataService'
import {aggregators, aggregatorTemplates }  from '../@pix8/pivotTable/@core/js/aggregators'
import {isEmptyObject}  from './js/utility'
import STATIC, { colors as palette  } from './js/constants'

import './app.css'

const options = {
	aggregatorName: STATIC.AGGREGATOR.uniqueCountOfGrandTotal,
	unusedOrientationCutoff: Infinity,
}

export default function App({...props}) {
	const { uid, taxonomy: { questions, key_variables } } = props

	const [dataset, setDataset] = useState([])

	const [question, setQuestion] = useState({}) // The selected question => singular
	const [keyVariableCollection, setKeyVariableCollection] = useState([]) // The selected key variables => multiples

	const [questionFilters, setQuestionFilters] = useState([])

	const [keyVariablesFilters, setKeyVariablesFilters] = useState([])

	const [activeRenderer, setActiveRenderer] = useState(STATIC.RENDERER.table)

	/**
	 * Retrieve data from API endpoint
	 */
	useEffect(() => {
		async function load() {
			try {
        const test = await getData(uid)
        // console.log(test)
				setDataset(test)
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

        // cols={keyVariableCollection.map(({ label }) => label).sort()}
        // rows={!isEmptyObject(question) ? [question.label] : []}
        cols={['Age', 'Gender']}
        rows={['What brands of treats and toys do you usually buy for your pet']}

        rendererName={activeRenderer}
        // valueFilter={
        // 	!isEmptyObject(question) ? {
        // 		[question.label]: questionFilters.reduce(
        // 			(obj, item) => Object.assign(obj, { [item]: true })
        // 			, {}),
        // 		...keyVariablesFilters,
        // 	} : {}
        // }

        {...options}
      />
    </section>
	)
}

App.propTypes = {
	uid: PropTypes.string.isRequired,
	taxonomy: PropTypes.objectOf(PropTypes.array),
}

App.defaultProps = {
	uid: '',
	taxonomy: { questions:[], key_variables: [] },
}
