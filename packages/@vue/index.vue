<script setup lang="js">
import { ref, computed, watch, watchEffect } from 'vue'
import Draggable from 'vuedraggable'
import Dimension from './components/Dimension'
import PivotTable from './components/PivotTable.vue'
import { TableRenderer, TSVRenderer, FoobarRenderer, TestRenderer, createPlotlyRenderer, createChartjsRenderer } from './components/renderers'
import PivotData from '../@core/js/PivotData'
import { aggregators } from '../@core/js/aggregators'
import { sortAs, getSort } from '../@core/js/utilities'
import { sortBy } from '../@core/js/constants'

const props = defineProps(
  {
    data: Array,

    // PivotData.defaultProps @core/js/PivotData.js
    aggregators: {
      type: Object,
      default: () => aggregators,
      // default: () => ({}),
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
      default: () => ({ ...TableRenderer, ...FoobarRenderer, ...TestRenderer, ...TSVRenderer, }),
      // default: () => ({}),
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
)

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

// JB: consider using a computed for criterion
watch([axisX, axisY, dimensions], ([newValue, oldValue], [x, y]) => {
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
  // console.log('Vue :axisX: ', axisX.value)
  // console.log('Vue :axisY: ', axisY.value)

}, { immediate: true, deep: true })

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

  filters.value = { ...filters.value, ...collection }
}

function removeValuesFromFilter(attribute, values) {
  const collection = values.reduce((acc, obj) => {
    if (acc[attribute]) {
      delete acc[attribute][obj]
    }

    return acc
  }, filters.value)

  filters.value = { ...filters.value, ...collection }
}
</script>

<template>
  <div class="pivot__ui">
    <header class="pivot__renderer">
      <select
        class="ui__select"
        v-model="activeRenderer"
      >
        <option v-for="(item, index) in Object.keys(props.renderers)" :value="item" :key="`renderer-${index}`">{{ item }}</option>
      </select>
    </header>

    <aside class="pivot__aggregator">
      <select
        class="ui__select"
        v-model="activeAggregator"
      >
        <option v-for="(item, index) in Object.keys(props.aggregators)" :value="item" :key="`aggregator-${index}`">{{ item }}</option>
      </select>

      <!--
      {new Array(numValsAllowed).fill().map((n, index) => [
        <select
          class="ui__select"
          :value="activeDimensions[index]"
          @change="(event) => activeDimensions = activeDimensions.toSpliced(index, 1, event.target.value)"
          :key="`dimension-${index}`"
        >
          {
            Object.keys(dimensions).map(
              (item, index) => (
                !props.hiddenAttributes.includes(item) &&
                !props.hiddenFromAggregators.includes(item) &&
                <option :value="item" :key="index">{{ item }}</option>
              )
            )
          }
        </select>
      ])}

      {{ aggregatorCellOutlet && aggregatorCellOutlet(props.data) }}
      -->
    </aside>

    <!-- JB: other than returning basic html strings(and string interpolation) with a function using v-html, anything more complex needs to be done outside of <template> with a render function -->
    <div class="pivot__criterion">
      <!-- JB: re: setList; I think it's doing this automagically -->
      <!-- 
        :setList="(collection) => criterion = collection"
        @change="(collection) => criterion = collection"
      -->
      <Draggable
        class="dimension__list"
        tag="ul"
        :list="criterion"
        group="pivot__dimension"
        ghost-class="sortable--ghost"
        chosen-class="sortable--chosen"
        drag-class="sortable--drag"
        filter=".dimension__dropdown"
        :preventOnFilter="false"
        item-key="name"
      >
        <template #item="{ element: item }">
          <Dimension
            :item="item"
            :name="item.name"
            :attrValues="dimensions[item.name]"
            :valueFilter="filters[item.name] || {}"
            :sorter="getSort(props.sorters, item.name)"
            :menuLimit="props.menuLimit"
            :setAllValuesInFilter="setAllValuesInFilter"
            :addValuesToFilter="addValuesToFilter"
            :removeValuesFromFilter="removeValuesFromFilter"
          />
        </template>
      </Draggable>
    </div>

    <!-- 
    :setList="(collection) => axisX = collection"
    @change="(collection) => axisX = collection"
    -->
    <div class="pivot__axis pivot__axis-x">
      <Draggable
        class="dimension__list"
        tag="ul"
        :list="axisX"
        group="pivot__dimension"
        ghost-class="sortable--ghost"
        chosen-class="sortable--chosen"
        drag-class="sortable--drag"
        filter=".dimension__dropdown"
        :preventOnFilter="false"
        item-key="name"
      >
        <template #item="{ element: item }">
          <Dimension
            :item="item"
            :name="item.name"
            :attrValues="dimensions[item.name]"
            :valueFilter="filters[item.name] || {}"
            :sorter="getSort(props.sorters, item.name)"
            :menuLimit="props.menuLimit"
            :setAllValuesInFilter="setAllValuesInFilter"
            :addValuesToFilter="addValuesToFilter"
            :removeValuesFromFilter="removeValuesFromFilter"
          />
        </template>
      </Draggable>
    </div>

    <!--
    :setList="(collection) => axisY = collection"
    @change="(collection) => axisY = collection"
    -->
    <div class="pivot__axis pivot__axis-y">
      <Draggable
        class="dimension__list"
        tag="ul"
        :list="axisY"
        group="pivot__dimension"
        ghost-class="sortable--ghost"
        chosen-class="sortable--chosen"
        drag-class="sortable--drag"
        filter=".dimension__dropdown"
        :preventOnFilter="false"
        item-key="name"
      >
        <template #item="{ element: item }">
          <Dimension
            :item="item"
            :name="item.name"
            :attrValues="dimensions[item.name]"
            :valueFilter="filters[item.name] || {}"
            :sorter="getSort(props.sorters, item.name)"
            :menuLimit="props.menuLimit"
            :setAllValuesInFilter="setAllValuesInFilter"
            :addValuesToFilter="addValuesToFilter"
            :removeValuesFromFilter="removeValuesFromFilter"
          />
        </template>
      </Draggable>
    </div>

    <div class="pivot__sortBy">
      <h4>Sort {{ activeRenderer.toLowerCase().includes('table') ? 'by' : 'along' }}</h4>
      <div class="sortBy__container">
        <div class="sortBy__y">
          <h4>{{ activeRenderer.toLowerCase().includes('table') ? 'row' : 'y-axis' }}</h4>
          <div class="sortBy__control-group">
            <label class="sortBy__toggle" v-for="(item, index) in sortBy.row" :key="index">
              <!-- JB: can replace with v-model -->
              <input
                type="radio"
                name="sort-by-row"
                :value="item.value"
                :checked="sortByRow === item.value"
                @change="(event) => sortByRow.value = event.target.value"
              />
              <span>{{ item.label }}</span>
            </label>
          </div>
        </div>
      
        <hr />

        <div class="sortBy__x">
          <h4>{{ activeRenderer.toLowerCase().includes('table') ? 'column' : 'x-axis' }}</h4>
          <div class="sortBy__control-group">
            <label class="sortBy__toggle" v-for="(item, index) in sortBy.column" :key="index">
              <!-- JB: can replace with v-model -->
              <input
                type="radio"
                name="sort-by-column"
                :value="item.value"
                :checked="sortByColumn === item.value"
                @change="(event) => sortByColumn = event.target.value"
              />
              <span>{{ item.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <article class="pivot__output">
      <PivotTable
        :data="props.data"
        :renderers="props.renderers"
        :aggregators="props.aggregators"
        :rows="axisY.map(({ name }) => name)"
        :cols="axisX.map(({ name }) => name)"
        :rendererName="activeRenderer"
        :aggregatorName="activeAggregator"
        :rowOrder="sortByRow"
        :colOrder="sortByColumn"
        :vals="props.vals"
        :valueFilter="filters"
      />
    </article>
  </div>

  <!-- <div class="flex flex-row gap-4 my-8">
    <div>
      <h3>Criterion</h3>
      <pre class="text-xs" style="font-size: 9px;">{{ JSON.stringify(criterion, null, 2) }}</pre>
    </div>

    <div>
      <h3>Axis X</h3>
      <pre class="text-xs" style="font-size: 9px;">{{ JSON.stringify(axisX, null, 2) }}</pre>
    </div>

    <div>
      <h3>Axis Y</h3>
      <pre class="text-xs" style="font-size: 9px;">{{ JSON.stringify(axisY, null, 2) }}</pre>
    </div>
  </div>

  <div>
    <h3>Dimensions</h3>
    <pre class="text-xs" style="font-size: 9px;">{{ JSON.stringify(dimensions, null, 2) }}</pre>
  </div> -->
</template>

<style>
/* @import './index.css'; */
@import '../@react/index.css';
</style>
