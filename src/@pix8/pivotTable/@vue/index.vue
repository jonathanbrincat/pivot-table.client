<script setup lang="js">
import { ref, computed, watch, watchEffect } from 'vue'
import Draggable from 'vuedraggable'
import Dimension from './components/Dimension.vue'
import PivotTable from './components/PivotTable.vue'
import { TableRenderer, TSVRenderer, FoobarRenderer, TestRenderer } from './components/renderers'
import { aggregators } from '../@core/js/aggregators'
import PivotData from '../@core/js/PivotData'
import { sortAs, getSort } from '../@core/js/utilities'
import { sortBy } from '../@core/js/constants'

const props = defineProps(
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
      default: () => ({ TableRenderer, FoobarRenderer, TestRenderer }),
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

// for (const key in props.renderers) {
//   console.log(key, 'JB :vue: ', props.renderers[key])
// }

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
  if (props.data) {
    dimensions.value = { ...parseDimensions() }
  }
})

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

function setAllValuesInFilter(attribute, values) {}

function addValuesToFilter(attribute, values) {}

function removeValuesFromFilter(attribute, values) {}

function createCluster(items, onSortableChangeHandler) {}
</script>

<template>
  <div class="pivot__ui">
    <header class="pivot__renderer">
      <select
        class="ui__select"
        v-model="activeRenderer"
        @change="(event) => activeRenderer = event.target.value"
      >
        <option v-for="(item, index) in Object.keys(props.renderers)" :value="item" :key="`renderer-${index}`">{{ item }}</option>
      </select>
    </header>

    <aside class="pivot__aggregator">
      <select
        className="ui__select"
        v-model="activeAggregator"
        @change="(event) => activeAggregator = event.target.value"
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
      <!--
      {{
        !!criterion?.length && createCluster(
          criterion,
          (collection) => criterion = collection,
        )
      }}
      -->
      <!-- JB: re: setList; I think it's doing this automagically -->
      <Draggable
        class="dimension__list"
        tag="ul"
        :list="criterion"
        :setList="(collection) => criterion = collection"
        group="pivot__dimension"
        ghost-class="sortable--ghost"
        chosen-class="sortable--chosen"
        drag-class="sortable--drag"
        filter=".dimension__dropdown"
        :preventOnFilter="false"
        item-key="name"
      >
        <!-- Dimension.vue -->
        <template #item="{ element: item }">
          <Dimension :item="item" />
        </template>
      </Draggable>
    </div>


    <div class="pivot__axis pivot__axis-x">
      <!--
      {{
        createCluster(
          axisX,
          (collection) => axisX = collection,
        )
      }}
      -->

      <Draggable
        class="dimension__list"
        tag="ul"
        :list="axisX"
        :setList="(collection) => axisX = collection"
        group="pivot__dimension"
        ghost-class="sortable--ghost"
        chosen-class="sortable--chosen"
        drag-class="sortable--drag"
        filter=".dimension__dropdown"
        :preventOnFilter="false"
        item-key="name"
      >
        <template #item="{ element: item }">
          <Dimension :item="item" />
        </template>
      </Draggable>
    </div>

    <div class="pivot__axis pivot__axis-y">
      <!-- {{
        createCluster(
          axisY,
          (collection) => axisY = collection,
        )
      }} -->

      <Draggable
        class="dimension__list"
        tag="ul"
        :list="axisY"
        :setList="(collection) => axisY = collection"
        group="pivot__dimension"
        ghost-class="sortable--ghost"
        chosen-class="sortable--chosen"
        drag-class="sortable--drag"
        filter=".dimension__dropdown"
        :preventOnFilter="false"
        item-key="name"
      >
        <!-- Dimension.vue -->
        <template #item="{ element: item }">
          <Dimension :item="item" />
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

        <div className="sortBy__x">
          <h4>{{ activeRenderer.toLowerCase().includes('table') ? 'column' : 'x-axis' }}</h4>
          <div class="sortBy__control-group">
            <label class="sortBy__toggle" v-for="(item, index) in sortBy.column" :key="index">
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
</template>

<style>
@import './index.css';
</style>
