import React, { useState, useEffect } from 'react'
import PivotTableUI from '../@streetbees/pivotTable'
import TableRenderers from '../@streetbees/pivotTable/components/renderers/TableRenderers'
import createChartjsRenderers from '../@streetbees/pivotTable/components/renderers/ChartjsRenderers'
import useData from './hooks/useData'
import useTaxonomy from './hooks/useTaxonomy'
import useTreeNodes from './hooks/useTreeNodes'
import { aggregators, aggregatorTemplates } from '../@streetbees/pivotTable/js/Utilities'
import { streetbeesAggregator, usFmtInt } from './js/streetbeesAggregator'
import STATIC, { colors as palette  } from './js/constants'

import { Dialog as PrimeDialog } from 'primereact/dialog'
import { InputSwitch } from 'primereact/inputswitch'
import { Sidebar as PrimeSidebar } from 'primereact/sidebar'
import { Tooltip as PrimeTooltip } from 'primereact/tooltip'
import { Tree as PrimeTree } from 'primereact/tree'
import SvgTick from './components/svg/Tick'

import './root_styles.css'

const options = {
	aggregatorName: STATIC.AGGREGATOR.uniqueCountOfGrandTotal,
	unusedOrientationCutoff: Infinity,
}

export default function DataExplorer({...props}) {
	const [data] = useData([])
	const [taxonomy, setTaxonomy] = useTaxonomy(data)
	const [dimensionCollection, setDimensionCollection] = useState({})
	const [dataset, setDataset] = useState([])

	const [question, setQuestion] = useState('') // The selected question => singular
	const [keyVariableCollection, setKeyVariableCollection] = useState([]) // The selected key variables => multiples

	const [datasetFilters, setDatasetFilters] = useState([])
	const [isDatasetFilters, setIsDatasetFilters] = useState(false)

	const [questionFilters, setQuestionFilters] = useState([])
	const [isQuestionFilters, setIsQuestionFilters] = useState(false)
	const [isAllQuestionFilters, setIsAllQuestionFilters] = useState(false)
	const [isIndeterminate, setIsIndeterminate] = useState(false)

	const [keyVariablesFilters, setKeyVariablesFilters] = useState([])
	const [isKeyVariables, setIsKeyVariables] = useState(false)
	const [treeNodes, setTreeNodes] = useTreeNodes([])
	const [expandedTreeNodeKeys, setExpandedTreeNodeKeys] = useState({})
	const [selectedTreeNodeKeys, setSelectedTreeNodeKeys] = useState({})
	const [isExpanded, setIsExpanded] = useState(false)

	const [activeRenderer, setActiveRenderer] = useState(STATIC.RENDERER.table)

	/**
	 * Extrapolate the taxonomy from the data schema to facilitate mechanism of data consumption
	 */
	useEffect(() => {
		setTaxonomy(data)
	}, [data])

	/**
	 * Calibrated schema for composition and hydration purposes over specific applications; create the node tree structure compatible with rendering treeview(PrimeReact) UI
	 */
	useEffect(() => {
		if (taxonomy?.length) return

		setDimensionCollection(
			Object.fromEntries(taxonomy?.['dimensions'])
		)

		setDatasetFilters(
			taxonomy?.['dimensions']?.map(
				([dimension]) => [dimension, []]
			)
		)

		setTreeNodes(taxonomy?.['key_variables'])
	}, [taxonomy])

	/**
	 * Cuts the full dataset by the dimensions provided to produce a modified dataset restricted by inclusion
	 */
	useEffect(() => {
		// If there are no filters selected don't bother
		if (!datasetFilters.length) return setDataset(data)

		const [header, ...body] = data

		const results = body.filter((entry) => {

			// Return only the entries that have string matches at the corresponding positions. Implemented as an && relationship for every dimension and attribute included.
			return datasetFilters
				.filter(([key, whitelist]) => whitelist.length)
				.every(([key, whitelist]) => {
					const position = header.indexOf(key)
					if (position === -1) return false

					return whitelist.includes(entry[position])
				})
		})

		setDataset([header, ...results])
	}, [datasetFilters])

	/**
	* Control logic driving filtering of key variables and associated attributes and delivering conversion back to a format that can be consumed by the pivot table component
	*/
	useEffect(() => {
		// Identify which tree nodes have been checked
		const [selectedDimensions, selectedAttributes] = Object.keys(selectedTreeNodeKeys).reduce((collection, key) => {

			// Node = Dimension(Key variable)
			if (Object.keys(dimensionCollection).includes(key)) {
				collection[0].push(key)
			}
			// Node = Attribute(filter)
			else if (Array.isArray(JSON.parse(key))) {
				const [key_variable, attribute] = JSON.parse(key)

				const curr = collection[1][key_variable] ?? []
				collection[1][key_variable] = [...curr, attribute]
			}

			return collection
		}, [[], {}])

		const deselectedAttributes = Object.assign(
			{},
			...Object.entries(selectedAttributes).map(([dimension, collection]) => (
				{
					[dimension]: Object.fromEntries(
						dimensionCollection[dimension]
							// Invert the checked attributes to discern what needs to be filtered
							.filter((item) => !collection.includes(item))
							// Mark that attribute as enabled
							.map((item) => {
								return [item, true]
							})
					)
				}
			))
		)

		setKeyVariableCollection(selectedDimensions)
		setKeyVariablesFilters(deselectedAttributes)

	}, [selectedTreeNodeKeys])

	/**
	* Management of the checkbox indeterminate state(Question dimension attributes to filter upon)
	*/
	useEffect(() => {
		if (!question) return

		setIsIndeterminate(
			!!questionFilters.length &&
			(questionFilters.length !== dimensionCollection[question].length)
		)
	}, [questionFilters])

	/**
	* Management of the checkbox select all state(Question dimensions attributes to filter upon)
	*/
	useEffect(() => {
		if (!questionFilters.length) {
			setIsAllQuestionFilters(false)
		} else if (questionFilters.length === dimensionCollection[question]?.length) {
			setIsAllQuestionFilters(true)
		}
	}, [isIndeterminate])

	/**
	* Computed state for selecting or deselecting all filters(Question dimensions attributes to filter upon)
	*/
	useEffect(() => {
		if (!dimensionCollection[question]) return

		setQuestionFilters(
			isAllQuestionFilters
				? dimensionCollection[question]
				: []
		)
	}, [isAllQuestionFilters])

	/**
	* Computed state for expanding or contracting the treeview(Key variables dimensions and their attributes to filter upon)
	*/
	useEffect(() => {
		if (isExpanded) {
			let _expandedTreeNodeKeys = {};

			for (let node of treeNodes) {
				expandNode(node, _expandedTreeNodeKeys);
			}

			setExpandedTreeNodeKeys(_expandedTreeNodeKeys);
		} else {
			setExpandedTreeNodeKeys({});
		}
	}, [isExpanded])

	const expandNode = (node, _expandedTreeNodeKeys) => {
		if (node.children && node.children.length) {
			_expandedTreeNodeKeys[node.key] = true;

			for (let child of node.children) {
				expandNode(child, _expandedTreeNodeKeys);
			}
		}
	}

	const sidebarHeader = (header) => (
		<h3 className="sidebar-heading">{header}</h3>
	)

	return (
		<>
			{/* Dialogs & sidebars */}
			<div>
				<PrimeDialog header="Apply data restrictions" visible={isDatasetFilters} style={{ width: '75vw' }} onHide={() => setIsDatasetFilters(false)}>
					<div className="field__global-filters">
						{
							taxonomy?.['dimensions']?.map(([dimension, collection], i) => {
								const $nodes = [
									<dt className="global-filters__list-item-header" key={dimension}>
										<label className="ui__checkbox">
											<span>{dimension}</span>
										</label>
									</dt>
								]

								collection.map((item) => (
									$nodes.push(
										<dd className="global-filters__list-item" key={[dimension, item]}>
											<label className="ui__checkbox">
												<input
													type="checkbox"
													className="ui__control ui__control--checkbox"
													value={item}
													checked={datasetFilters[i]?.[1]?.includes(item) || false}
													onChange={(event) => {
														setDatasetFilters((previous) => {
															const updated = [...previous]

															if (event.target.checked) {
																// Add item to the corresponding nested array
																updated[i] = [
																	dimension,
																	[...(updated[i]?.[1] || []), item],
																]
															} else {
																// Remove item from the corresponding nested array
																updated[i] = [
																	dimension,
																	updated[i]?.[1]?.filter(
																		(remove) => remove !== item
																	),
																]
															}

															return updated.map((item) => item ?? [])
														})
													}}
												/>
												<span>{item}</span>
											</label>
										</dd>
									)
								))

								return (
									<dl className={['global-filters__list', `global-filters__list--${dimension.toLowerCase()}`].join(' ')} key={dimension}>
										{$nodes}
									</dl>
								)
							})
						}
					</div>
				</PrimeDialog>

				<PrimeSidebar className="ui__sidebar--left" header={sidebarHeader('Filter the responses')} visible={isQuestionFilters} position="left" onHide={() => setIsQuestionFilters(false)}>
					{
						dimensionCollection?.[question]?.length &&
						<aside>
							<dl className="filters__list">
								<dt className="filters__list-item--header">
									<label className="ui__checkbox">
										<input
											type="checkbox"
											ref={($input) => { if ($input) $input.indeterminate = isIndeterminate }}
											checked={!isAllQuestionFilters}
											onChange={(event) => setIsAllQuestionFilters(!event.target.checked)}
										/>
										<span className="checkbox__label">Select all</span>
									</label>
								</dt>

								{
									dimensionCollection?.[question].map((item) => (
										<dd className="filters__list-item" key={[question, item]}>
											<label className="ui__checkbox">
												<input
													type="checkbox"
													className="ui__control ui__control--checkbox"
													checked={!questionFilters.flatMap((item) => item).includes(item)}
													value={item}
													onChange={(event) => {
														setQuestionFilters(
															!event.target.checked
																? [...questionFilters, item]
																: questionFilters.filter((x) => x !== item)
														)
													}}
												/>
												<div className="checkbox__wrapper">
													<span className="checkbox__gfx">
														<SvgTick />
													</span>

													<span className="checkbox__label">{item}</span>
												</div>
											</label>
										</dd>
									))
								}
							</dl>
						</aside>
					}
				</PrimeSidebar>

				<PrimeSidebar className="ui__sidebar--right" header={sidebarHeader('Select Key Variables to apply')} visible={isKeyVariables} position="right" onHide={() => setIsKeyVariables(false)}>
					<div className="treeview__expand-all-toggle">
						<InputSwitch checked={isExpanded} onChange={(event) => setIsExpanded(event.value)} />
						<span className="toggleswitch__label">Expand all</span>
					</div>

					<PrimeTree
						className="ui__treeview"
						value={treeNodes}
						expandedKeys={expandedTreeNodeKeys}
						onToggle={(event) => setExpandedTreeNodeKeys(event.value)}
						selectionMode="checkbox"
						selectionKeys={selectedTreeNodeKeys}
						onSelectionChange={(event) => setSelectedTreeNodeKeys(event.value)}
					/>
				</PrimeSidebar>
			</div>

			<div className="fieldset__global-filters">
				{
					!!taxonomy?.['dimensions']?.length &&
					<button
						className="btn btn-primary"
						onClick={() => setIsDatasetFilters(true)}>
						<span className="txt__step">Step 1.</span> Cut the data by responses(optional)
					</button>
				}
			</div>

			<div className="fieldset__explore-data">
				{
					!!taxonomy?.['questions']?.length &&
					<div className="field__question">
						<div className="ui__field">
							<label className="txt__instruction" htmlFor="field__questions">
								<span className="txt__step">Step 2.</span> Select a question to analyse
							</label>

							<div className="input-group flex-nowrap">
								<PrimeTooltip target="#tooltip__question-filters" />

								<button
									id="tooltip__question-filters"
									className="btn btn-primary"
									icon={`pi
										${question || dimensionCollection[question]?.length
											? 'pi-filter'
											: 'pi-filter-slash'}`
									}
									disabled={!(question || dimensionCollection[question]?.length)}
									title="Apply filters"
									aria-label="Apply filters"
									onClick={() => setIsQuestionFilters(true)}
									data-pr-tooltip="Apply filters"
									data-pr-position="bottom"
								>
									<i className={`bi
										${question || dimensionCollection[question]?.length
											? 'bi-funnel'
											: 'bi-funnel-fill'}`
										}
									/>
								</button>

								<select
									id="field__questions"
									className="form-select"
									name="field__questions"
									value={question}
									onChange={(event) => setQuestion(event.target.value)}
								>
									<option value="">Make your selection&hellip;</option>
									{
										taxonomy['questions'].map(([dimension]) => (
											<option value={dimension} key={dimension}>{dimension}</option>
										))
									}
								</select>
							</div>
						</div>
					</div>
				}

				<hr className="ui__vertical-rule" />

				{
					!!taxonomy?.['key_variables']?.length &&
					<div className="field__key-variables">
						<div className="ui__field">
							<button className="btn btn-primary" onClick={() => setIsKeyVariables(true)}>
								<span className="txt__step">Step 3.</span>Choose what to compare
								<img src="/assets/images/bee_avatar.svg" role="presentation" />
							</button>
						</div>
					</div>
				}
			</div>

			{
				(question && !!keyVariableCollection?.length) &&
				<>
					<div className="pivot-table__renderer ui__toggle">
						<label className="ui__radio">
							<input
								type="radio"
								className="ui__control ui__control--toggle"
								name="field__renderer"
								value={STATIC.RENDERER.table}
								checked={activeRenderer === STATIC.RENDERER.table}
								onChange={(event) => setActiveRenderer(event.target.value)}
							/>
							<span>Table</span>
						</label>

						<label className="ui__radio">
							<input
								type="radio"
								className="ui__control ui__control--toggle"
								name="field__renderer"
								value={STATIC.RENDERER.chart}
								checked={activeRenderer === STATIC.RENDERER.chart}
								onChange={(event) => setActiveRenderer(event.target.value)}
							/>
							<span>Chart</span>
						</label>
					</div>

					<section className="pivot-table">
						{
							activeRenderer === STATIC.RENDERER.chart &&
							<header className="card__header">
								<h3 className="card__heading">{question}</h3>

								<p className="card__responses">{dataset.length} <span className="uppercase">Responses</span></p>
							</header>
						}

						<PivotTableUI
							data={dataset} // REQUIRED - everything else is optional
							renderers={{
								...TableRenderers,
								...createChartjsRenderers({ palette }),
							}}
							aggregators={{
								...aggregators,
								'SB Count Unique values': streetbeesAggregator(null, usFmtInt),
								'SB Count % of grand total': aggregatorTemplates.fractionOf(streetbeesAggregator(), 'total'),
								'SB Count % of column': aggregatorTemplates.fractionOf(streetbeesAggregator(), 'col'),
							}}

							cols={keyVariableCollection.sort()}
							rows={question ? [question] : []}

							rendererName={activeRenderer}
							valueFilter={
								question ? {
									[question]: questionFilters.reduce(
										(obj, item) => Object.assign(obj, { [item]: true })
										, {}),
									...keyVariablesFilters,
								} : {}
							}

							{...options}
						/>
					</section>
				</>
			}
		</>
	)
}
