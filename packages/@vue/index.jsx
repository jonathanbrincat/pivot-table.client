import { defineComponent, ref, computed, watch, watchEffect } from 'vue'
import Draggable from 'vuedraggable'
import Dimension from './components/Dimension'
import PivotTable from './components/PivotTable.vue'
import { TableRenderer, TSVRenderer, FoobarRenderer, TestRenderer } from './components/renderers'
import { aggregators } from '../@core/js/aggregators'
import PivotData from '../@core/js/PivotData'
import { sortAs, getSort } from '../@core/js/utilities'
import { sortBy } from '../@core/js/constants'

import './index.css'

export default defineComponent({
  name: 'PivotUI',

  props: (
    {
      data: Array,

      // PivotData.defaultProps @core/js/PivotData.js
      aggregators: {
        type: Object,
        default: () => aggregators,
      },
      cols: {
        type: Array,
        default: () => [],
      },
      rows: {
        type: Array,
        default: () => [],
      },
      vals: {
        type: Array,
        default: () => [],
      },
      aggregatorName: {
        type: String,
        default: 'Count',
      },
      sorters: {
        type: Object,
        default: () => ({}),
      },
      valueFilter: {
        type: Object,
        default: () => ({}),
      },
      rowOrder: {
        type: String,
        default: 'key_a_to_z',
      },
      colOrder: {
        type: String,
        default: 'key_a_to_z',
      },
      derivedAttributes: {
        type: Object,
        default: () => ({}),
      },

      // PivotTable.defaultProps
      rendererName: {
        type: String,
        default: 'Table',
      },
      renderers: {
        type: Object,
        default: () => ({ ...TableRenderer, ...FoobarRenderer, ...TestRenderer }),
      },

      hiddenAttributes: {
        type: Array,
        default: () => [],
      },
      hiddenFromAggregators: {
        type: Array,
        default: () => [],
      },
      hiddenFromDragDrop: {
        type: Array,
        default: () => [],
      },
      menuLimit: {
        type: Number,
        default: 500,
      },
      rows: {
        type: Array,
        default: () => [],
      },
      cols: {
        type: Array,
        default: () => [],
      },
    }
  ),

  setup(props) {
    const dimensions = ref({})

    const axisX = ref(props.cols ?? [])
    const axisY = ref(props.rows ?? [])
    const criterion = ref([])

    const filters = ref(props.valueFilter ?? {})

    const activeRenderer = ref(
      props.rendererName in props.renderers
        ? props.rendererName
        : Object.keys(props.renderers)[0]
    )
    const activeAggregator = ref(
      props.aggregatorName in props.aggregators
          ? props.aggregatorName
          : Object.keys(props.aggregators)[0]
    )

    const activeDimensions = ref([...props.vals])
    const sortByRow = ref(sortBy.row[0].value)
    const sortByColumn = ref(sortBy.column[0].value)

    watchEffect(() => {
      activeRenderer.value = props.rendererName
    })

    watchEffect(() => {
      filters.value = props.valueFilter
    })

    watchEffect(() => {
      if (props.data) {
        dimensions.value = { ...parseDimensions() }
      }
    })

    watch(
      [() => dimensions.value, () => props.rows, () => props.cols, () => props.hiddenAttributes, () => props.hiddenFromDragDrop],
      ([newDimensions]) => {
      axisX.value =
        Object.keys(newDimensions)
          .map((item, index) => ({ id: `dimension-${++index}`, name: item }))
          .filter(
            ({ name }) =>
              !props.hiddenAttributes.includes(name) &&
              !props.hiddenFromDragDrop.includes(name)
          )
          .filter(({name}) => props.cols.includes(name))

      axisY.value =
        Object.keys(newDimensions)
          .map((item, index) => ({ id: `dimension-${++index}`, name: item }))
          .filter(
            ({ name }) =>
              !props.hiddenAttributes.includes(name) &&
              !props.hiddenFromDragDrop.includes(name)
          )
          .filter(({ name }) => props.rows.includes(name))
    }, { immediate: true })

    // JB: consider using a computed
    watch([axisX, axisY, dimensions], (newValue, oldValue) => {
      // console.log('Vue :dimensions: set criterion ', dimensions.value)

      criterion.value = Object.keys(dimensions.value)
        .map((item, index) => ({ id: `dimension-${++index}`, name: item }))
        .filter(
          ({ name }) =>
            !props.hiddenAttributes.includes(name) &&
            !props.hiddenFromDragDrop.includes(name)
        )
        .filter(({ name }) => {
          return !(
            axisX.value.map(({ name }) => name).includes(name) ||
            axisY.value.map(({ name }) => name).includes(name)
          )
        })
        .sort(sortAs)
      
      // console.log('Vue :criterion: ', criterion.value)
    }, { immediate: true }) // `immediate: true` makes the watch run immediately on setup

    function parseDimensions() {
      const results = {}
      let recordsProcessedTally = 0

      PivotData.forEachRecord(
        props.data,
        props.derivedAttributes,
        (record) => {
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
        }
      )

      return results
    }

    /*
    const numValsAllowed = props.aggregators[activeAggregator]([])().numInputs || 0

    const aggregatorCellOutlet = props.aggregators[activeAggregator]([])().outlet
    */

    function setAllValuesInFilter(attribute, values) {
      const { [attribute]: _discard_, ...rest } = filters.value // JB: pretty suure destructuring reactive refs is a no no in vue
      const collection = values.reduce((acc, obj) => {
        if (acc[attribute]) {
          acc[attribute][obj] = true
        } else {
          acc[attribute] = { [obj]: true }
        }

        return acc
      }, rest)

      filters.value = { ...filters.value, ...collection }
    }

    function addValuesToFilter(attribute, values) {
      const collection = values.reduce((acc, obj) => {
        if(acc[attribute]) {
          acc[attribute][obj] = true
        } else {
          acc[attribute] = {[obj]: true}
        }

        return acc
      }, filters.value)

      filters.value = { ...filters, ...collection }
    }

    function removeValuesFromFilter(attribute, values) {
      const collection = values.reduce((acc, obj) => {
        if (acc[attribute]) {
          delete acc[attribute][obj]
        }

        return acc
      }, filters.value)

      filters.value = { ...filters, ...collection }
    }

    function createCluster(items, onSortableChangeHandler) {
      // console.log(items, ' :: ',items)
      
      const temp = (
        // BUG: if no presets are supplied then UI isn't initialise with reactsortable; empty array won't have object to check for prop
        // Object.prototype.hasOwnProperty.call(items[0], 'name') &&
        <Draggable
          class="dimension__list"
          tag="ul"
          list={items}
          setList={onSortableChangeHandler}
          group="pivot__dimension"
          ghostClass="sortable--ghost"
          chosenClass="sortable--chosen"
          dragClass="sortable--drag"
          filter=".dimension__dropdown"
          preventOnFilter={false}
          item-key="name"
        >
          {/* {
            items.map(
              (item, index) => {
                return (
                  {{
                    item: ({ element }) => (
                      <Dimension
                        item={element}
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
                  }}
                )
              }
            )
          } */}
        </Draggable>
      )
      // console.log(' :: ',temp)
  
      return temp
    }

    return () => (
      <>
        <div class="pivot__ui">
          <header class="pivot__renderer">
            <select
              class="ui__select"
              value={activeRenderer.value}
              onChange={(event) => activeRenderer.value = event.target.value}
            >
              {
                Object.keys(props.renderers).map(
                  (item, index) => (
                    <option value={item} key={`renderer-${index}`}>{item}</option>
                  )
                )
              }
            </select>
          </header>

          <aside class="pivot__aggregator">
            <select
              class="ui__select"
              value={activeAggregator.value}
              onChange={(event) => activeAggregator.value = event.target.value}
            >
              {
                Object.keys(props.aggregators).map(
                  (item, index) => (
                    <option value={item} key={`aggregator-${index}`}>{item}</option>
                  )
                )
              }
            </select>

            {/* {new Array(numValsAllowed).fill().map((n, index) => [
              <select
                class="ui__select"
                value={activeDimensions[index]}
                onChange={
                  (event) => activeDimensions = activeDimensions.toSpliced(index, 1, event.target.value)
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

            {aggregatorCellOutlet && aggregatorCellOutlet(props.data)} */}
          </aside>

          {/* JB: other than returning basic html strings(and string interpolation) with a function using v-html, anything more complex needs to be done outside of <template> with a render function */}
          <div class="pivot__criterion">
            {/*
            {
              !!criterion?.length && createCluster(
                criterion,
                (collection) => criterion.value = collection,
              )
            }
            */}
            {/* JB: re: setList; I think it's doing this automagically */}
            {/*  
              setList={(collection) => criterion.value = collection}
              onChange={(collection) => criterion.value = collection}
            */}

            <Draggable
              class="dimension__list"
              tag="ul"
              list={criterion.value}
              group="pivot__dimension"
              ghostClass="sortable--ghost"
              chosenClass="sortable--chosen"
              dragClass="sortable--drag"
              filter=".dimension__dropdown"
              preventOnFilter={false}
              item-key="name"
            >
              {{
                item: ({ element: item }) => (
                  <Dimension
                    item={item}
                    name={item.name}
                    attrValues={dimensions[item.name]}
                    valueFilter={filters[item.name] || {}}
                    sorter={getSort(props.sorters, item.name)}
                    menuLimit={props.menuLimit}
                    setAllValuesInFilter={setAllValuesInFilter}
                    addValuesToFilter={addValuesToFilter}
                    removeValuesFromFilter={removeValuesFromFilter}
                  />
                ),
              }}
            </Draggable>
          </div>


          <div class="pivot__axis pivot__axis-x">
            {/*
            {
              createCluster(
                axisX,
                (collection) => axisX = collection,
              )
            }
            */}
            {/* 
              setList={(collection) => axisX.value = collection}
              onChange={(collection) => axisX.value = collection}
            */}

            <Draggable
              class="dimension__list"
              tag="ul"
              list={axisX.value}
              
              group="pivot__dimension"
              ghostClass="sortable--ghost"
              chosenClass="sortable--chosen"
              dragClass="sortable--drag"
              filter=".dimension__dropdown"
              preventOnFilter={false}
              item-key="name"
            >
              {{
                item: ({ element: item }) => {
                  return (
                    <Dimension
                      item={item}
                      name={item.name}
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
              }}
            </Draggable>
          </div>

          <div class="pivot__axis pivot__axis-y">
            {/* {
              createCluster(
                axisY,
                (collection) => axisY = collection,
              )
            } */}
            {/* 
              setList={(collection) => axisX.value = collection}
              onChange={(collection) => axisX.value = collection}
            */}

            <Draggable
              class="dimension__list"
              tag="ul"
              list={axisY.value}
              setList={(collection) => axisY.value = collection}
              group="pivot__dimension"
              ghostClass="sortable--ghost"
              chosenClass="sortable--chosen"
              dragClass="sortable--drag"
              filter=".dimension__dropdown"
              preventOnFilter={false}
              item-key="name"
            >
              {{
                item: ({ element: item }) => (
                  <Dimension
                    item={item}
                    name={item.name}
                    attrValues={dimensions[item.name]}
                    valueFilter={filters[item.name] || {}}
                    sorter={getSort(props.sorters, item.name)}
                    menuLimit={props.menuLimit}
                    setAllValuesInFilter={setAllValuesInFilter}
                    addValuesToFilter={addValuesToFilter}
                    removeValuesFromFilter={removeValuesFromFilter}
                  />
                )
              }}
            </Draggable>
          </div>

          <div class="pivot__sortBy">
            <h4>Sort {activeRenderer.value.toLowerCase().includes('table') ? 'by' : 'along'}</h4>
            <div class="sortBy__container">
              <div class="sortBy__y">
                <h4>{activeRenderer.value.toLowerCase().includes('table') ? 'row' : 'y-axis'}</h4>
                <div class="sortBy__control-group">
                  {
                    sortBy.row.map((item, index) => (
                      <label class="sortBy__toggle" key={index}>
                        <input
                          type="radio"
                          name="sort-by-row"
                          value={item.value}
                          checked={sortByRow.value === item.value}
                          onChange={
                            (event) => sortByRow.value = event.target.value
                          }
                        />
                        <span>{item.label}</span>
                      </label>
                    ))
                  }
                </div>
              </div>
            
              <hr />

              <div class="sortBy__x">
                <h4>{activeRenderer.value.toLowerCase().includes('table') ? 'column' : 'x-axis'}</h4>
                <div class="sortBy__control-group">
                  {
                    sortBy.column.map((item, index) => (
                      <label class="sortBy__toggle" key={index}>
                        <input
                          type="radio"
                          name="sort-by-column"
                          value={item.value}
                          checked={sortByColumn.value === item.value}
                          onChange={
                            (event) => sortByColumn.value = event.target.value
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

          <article class="pivot__output">
            {/* <p>{rows = rows}</p>
            <p>{cols = cols}</p> */}

            <PivotTable
              data={props.data}
              renderers={props.renderers}
              aggregators={props.aggregators}
              rows={axisY.value.map(({ name }) => name)}
              cols={axisX.value.map(({ name }) => name)}
              rendererName={activeRenderer.value}
              aggregatorName={activeAggregator.value}
              rowOrder={sortByRow.value}
              colOrder={sortByColumn.value}
              vals={props.vals}
              valueFilter={filters.value}
            />
          </article>
        </div>
      </>
    )
  },

  // render() {
  //   const { activeRenderer, axisX, axisY, criterion, activeAggregator } = this

  //   return (

  //   )
  // },
})
