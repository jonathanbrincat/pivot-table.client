import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { ReactSortable } from 'react-sortablejs'
import Dimension from './components/Dimension'
import PivotTable from './components/PivotTable'
import PivotData from './js/PivotData'
import { sortAs, getSort } from '../@core/js/utilities'
import { sortBy } from '../@core/js/constants'

import './index.css'

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

export default function PivotTableUI(props) {
  const [dimensions, setDimensions] = useState({})

  const [axisX, setAxisX] = useState(props.cols ?? [])
  const [axisY, setAxisY] = useState(props.rows ?? [])
  const [criterion, setCriterion] = useState([])

  const [filters, setFilters] = useState(props.valueFilter ?? {})

  const [activeRenderer, setActiveRenderer] = useState(
    props.rendererName in props.renderers
      ? props.rendererName
      : Object.keys(props.renderers)[0]
  )
  const [activeAggregator, setActiveAggregator] = useState(
    props.aggregatorName in props.aggregators
      ? props.aggregatorName
      : Object.keys(props.aggregators)[0]
  )
  const [activeDimensions, setActiveDimensions] = useState([...props.vals])
  const [sortByRow, setSortByRow] = useState(sortBy.row[0].value)
  const [sortByColumn, setSortByColumn] = useState(sortBy.column[0].value)

  useMemo(() => {
    setActiveRenderer(props.rendererName)
  }, [props.rendererName])

  useMemo(() => {
    setFilters(props.valueFilter)
  }, [props.valueFilter])

  useEffect(() => {
    setDimensions({ ...parseDimensions() })
  }, [props.data])

  useEffect(() => {
    setAxisX(
      Object.keys(dimensions)
        .map((item, index) => ({ id: `dimension-${++index}`, name: item }))
        .filter(
          ({ name }) =>
            !props.hiddenAttributes.includes(name) &&
            !props.hiddenFromDragDrop.includes(name)
        )
        .filter(({name}) => props.cols.includes(name))
    )

    setAxisY(
      Object.keys(dimensions)
        .map((item, index) => ({ id: `dimension-${++index}`, name: item }))
        .filter(
          ({ name }) =>
            !props.hiddenAttributes.includes(name) &&
            !props.hiddenFromDragDrop.includes(name)
        )
        .filter(({ name }) => props.rows.includes(name))
    )
  }, [dimensions, props.rows, props.cols, props.hiddenAttributes, props.hiddenFromDragDrop])

  useEffect(() => {
    setCriterion(
      Object.keys(dimensions)
        .map((item, index) => ({ id: `dimension-${++index}`, name: item }))
        .filter(
          ({ name }) =>
            !props.hiddenAttributes.includes(name) &&
            !props.hiddenFromDragDrop.includes(name)
        )
        .filter(({ name }) => {
          return !(
            axisX.map(({ name }) => name).includes(name)
            || axisY.map(({ name }) => name).includes(name)
          )
        })
        .toSorted(sortAs([]))
    )
  }, [axisX, axisY])

  function parseDimensions() {
    const results = {}
    let recordsProcessedTally = 0

    PivotData.forEachRecord(props.data, props.derivedAttributes, (record) => {
      // examine every key of every record
      for (const attr of Object.keys(record)) {

        // if key doesn't exist yet
        if (!(attr in results)) {
          // add the key to our dictionary
          results[attr] = {}

          if (recordsProcessedTally > 0) {
            results[attr].null = recordsProcessedTally
          }
        }
      }

      // for every key that exists on results
      for (const attr in results) {
        const value = attr in record ? record[attr] : 'null'

        // if there isn't a value already assigned. zero the figure.
        if (!(value in results[attr])) {
          results[attr][value] = 0
        }

        // increment the occurance count/tally
        results[attr][value]++
      }

      recordsProcessedTally++
    })

    return results
  }

  const numValsAllowed = props.aggregators[activeAggregator]([])().numInputs || 0

  const aggregatorCellOutlet = props.aggregators[activeAggregator]([])().outlet

  function setAllValuesInFilter(attribute, values) {
    const { [attribute]: _discard_, ...rest } = filters
    const collection = values.reduce((acc, obj) => {
      if (acc[attribute]) {
        acc[attribute][obj] = true
      } else {
        acc[attribute] = { [obj]: true }
      }

      return acc
    }, rest)

    setFilters({ ...filters, ...collection })
  }

  function addValuesToFilter(attribute, values) {
    const collection = values.reduce((acc, obj) => {
      if(acc[attribute]) {
        acc[attribute][obj] = true
      } else {
        acc[attribute] = {[obj]: true}
      }

      return acc
    }, filters)

    setFilters({ ...filters, ...collection })
  }

  function removeValuesFromFilter(attribute, values) {
    const collection = values.reduce((acc, obj) => {
      if (acc[attribute]) {
        delete acc[attribute][obj]
      }

      return acc
    }, filters)

    setFilters({ ...filters, ...collection })
  }

  function createCluster(items, onSortableChangeHandler) {
    // console.log(items, ' :: ',items)
    
    const temp = (
      // BUG: if no presets are supplied then UI isn't initialise with reactsortable; empty array won't have object to check for prop
      // Object.prototype.hasOwnProperty.call(items[0], 'name') &&
      <ReactSortable
        className="dimension__list"
        tag="ul"
        list={items}
        setList={onSortableChangeHandler}
        group="pivot__dimension"
        ghostClass="sortable--ghost"
        chosenClass="sortable--chosen"
        dragClass="sortable--drag"
        filter=".dimension__dropdown"
        preventOnFilter={false}
      >
        {
          items.map(
            (item, index) => {
              return (
                <Dimension
                  name={item.name}
                  key={`${item.id}-${index}`}
                  attrValues={dimensions[item.name]}
                  valueFilter={filters[item.name] || {}}
                  sorter={getSort(props.sorters, item.name)}
                  menuLimit={props.menuLimit}
                  setAllValuesInFilter={setAllValuesInFilter}
                  addValuesToFilter={addValuesToFilter}
                  removeValuesFromFilter={removeValuesFromFilter}
                />
              )
            }
          )
        }
      </ReactSortable>
    )
    // console.log(' :: ',temp)

    return temp
  }
  
  return (
    <>
      <div className="pivot__ui">
        <header className="pivot__renderer">
          <select
            className="ui__select"
            value={activeRenderer}
            onChange={
              (event) => setActiveRenderer(event.target.value)
            }
          >
            {
              Object.keys(props.renderers).map(
                (item, index) => (
                  <option value={item} key={index}>{item}</option>
                )
              )
            }
          </select>
        </header>

        <aside className="pivot__aggregator">
          <select
            className="ui__select"
            value={activeAggregator}
            onChange={
              (event) => setActiveAggregator(event.target.value)
            }
          >
            {
              Object.keys(props.aggregators).map(
                (item, index) => (
                  <option value={item} key={`aggregator-${index}`}>{item}</option>
                )
              )
            }
          </select>

          {new Array(numValsAllowed).fill().map((n, index) => [
            <select
              className="ui__select"
              value={activeDimensions[index]}
              onChange={
                (event) => setActiveDimensions(activeDimensions.toSpliced(index, 1, event.target.value))
              }
              key={`dimension-${index}`}
            >
              {
                Object.keys(dimensions).map(
                  (item, index) => (
                    !props.hiddenAttributes.includes(item) &&
                    !props.hiddenFromAggregators.includes(item) &&
                    <option value={item} key={index}>{item}</option>
                  )
                )
              }
            </select>
          ])}

          {aggregatorCellOutlet && aggregatorCellOutlet(props.data)}
        </aside>

        <div className="pivot__criterion">
          {
            !!criterion?.length && createCluster(
              criterion,
              (collection) => setCriterion(collection),
            )
          }
        </div>

        <div className="pivot__axis pivot__axis-x">
          {
            // BUG: if no presets are supplied then UI isn't initialise with reactsortable
            // !!axisX?.length && createCluster(
            createCluster(
              axisX,
              (collection) => setAxisX(collection),
            )
          }
        </div>

        <div className="pivot__axis pivot__axis-y">
          {
            // BUG: if no presets are supplied then UI isn't initialise with reactsortable
            // !!axisY?.length && createCluster(
            createCluster(
              axisY,
              (collection) => setAxisY(collection),
            )
          }
        </div>

        <div className="pivot__sortBy">
          <h4>Sort {activeRenderer.toLowerCase().includes('table') ? 'by' : 'along'}</h4>
          <div className="sortBy__container">
            <div className="sortBy__y">
              <h4>{activeRenderer.toLowerCase().includes('table') ? 'row' : 'y-axis'}</h4>
              <div className="sortBy__control-group">
                {
                  sortBy.row.map((item, index) => (
                    <label className="sortBy__toggle" key={index}>
                      <input
                        type="radio"
                        name="sort-by-row"
                        value={item.value}
                        checked={sortByRow === item.value}
                        onChange={
                          (event) => setSortByRow(event.target.value)
                        }
                      />
                      <span>{item.label}</span>
                    </label>
                  ))
                }
              </div>
            </div>

            <hr />

            <div className="sortBy__x">
              <h4>{activeRenderer.toLowerCase().includes('table') ? 'column' : 'x-axis'}</h4>
              <div className="sortBy__control-group">
                {
                  sortBy.column.map((item, index) => (
                    <label className="sortBy__toggle" key={index}>
                      <input
                        type="radio"
                        name="sort-by-column"
                        value={item.value}
                        checked={sortByColumn === item.value}
                        onChange={
                          (event) => setSortByColumn(event.target.value)
                        }
                      />
                      <span>{item.label}</span>
                    </label>
                  ))
                }
              </div>
            </div>
          </div>
        </div>

        <article className="pivot__output">
          <PivotTable
            data={props.data}
            renderers={props.renderers}
            aggregators={props.aggregators}
            rows={axisY.map(({ name }) => name)}
            cols={axisX.map(({ name }) => name)}
            rendererName={activeRenderer}
            aggregatorName={activeAggregator}
            rowOrder={sortByRow}
            colOrder={sortByColumn}
            vals={props.vals}
            valueFilter={filters}
            plotlyOptions={props.plotlyOptions}
            plotlyConfig={props.plotlyConfig}
            tableOptions={props.tableOptions}
          />
        </article>
      </div>
    </>
  )
}

PivotTableUI.propTypes = Object.assign({}, PivotTable.propTypes, {
  hiddenAttributes: PropTypes.arrayOf(PropTypes.string),
  hiddenFromAggregators: PropTypes.arrayOf(PropTypes.string),
  hiddenFromDragDrop: PropTypes.arrayOf(PropTypes.string),
  menuLimit: PropTypes.number,
})

PivotTableUI.defaultProps = Object.assign({}, PivotTable.defaultProps, {
  hiddenAttributes: [],
  hiddenFromAggregators: [],
  hiddenFromDragDrop: [],
  menuLimit: 500,
  rows: [],
  cols: [],
})
