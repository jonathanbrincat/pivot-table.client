import { defineComponent, computed, ref, watchEffect } from 'vue'
import PivotData from '../../../@core/js/PivotData'
import { redColorScaleGenerator, spanSize } from '../../../@core/js/ui.ts'

import '../../../@react/components/renderers/foobarRenderer.css'

function makeRenderer(
  config = {}
) {
  const componentName = config.mode
    ? `FoobarRenderer-${config.mode}`
    : 'FoobarRenderer'
  
  return defineComponent({
    name: componentName,

    props: {
      // JB: there are defaults in PivotData.defaultProps that should be transferred, however also duplication.
      aggregators: Object,
      cols: Array,
      rows: Array,
      vals: Array,
      aggregatorName: String,
      sorters: Object,
      valueFilter: Object,
      rowOrder: String,
      colOrder: String,
      derivedAttributes: Object,

      tableColorScaleGenerator: {
        type: Function,
        default: () => redColorScaleGenerator,
      },
      tableOptions: {
        type: Object,
        default: () => ({}),
      },

      data: Array,
    },

    setup(props) {
      console.log('JB :props: ', props.data)
      const pivotData = ref(new PivotData(props))

      const rowKeys = ref()
      const colKeys = ref()
      const rowAttrs = ref()
      const colAttrs = ref()

      const grandTotalAggregator = ref(() => pivotData.value.getAggregator([], []))

      watchEffect(() => {
        pivotData.value = new PivotData(props)

        rowKeys.value = pivotData.value.getRowKeys()
        colKeys.value = pivotData.value.getColKeys()
        rowAttrs.value = pivotData.value.props.rows
        colAttrs.value = pivotData.value.props.cols

        grandTotalAggregator.value = pivotData.value.getAggregator([], [])
      })

      return {
        props,
        pivotData,
        rowKeys,
        colKeys,
        rowAttrs,
        colAttrs,
        grandTotalAggregator,
      }
    },

    render() {
      return (
        <div class="border-blue-500 border-2 p-2">
          <h1>hello foobar wtf</h1>
          {
            (config.mode === 'FOO') && (
              <h2>hello foo</h2>
            )
          }

          {
            (config.mode === 'BAR') && (
              <h2>hello bar</h2>
            )
          }

          <ol class="bg-indigo-400 list-decimal">
            {
              this.colAttrs.map((c, j) => (
                <li key={`colAttr${j}`}>{c}</li>
              ))
            }
          </ol>

          <ol class="bg-rose-400 list-decimal">
            {
              this.colKeys.map((colKey, i) => (
                <li key={`colKey${i}`}>{JSON.stringify(colKey)}</li>
              ))
            }
          </ol>
          
          <ol class="bg-green-400 list-decimal">
            {
              this.colAttrs.map((c, j) => (
                this.colKeys.map((colKey, i) => (
                  <li key={`colKey${i}`}>{colKey[j]}</li>
                ))
              ))
            }
          </ol>
          
          <hr />

          <ol class="bg-orange-400 list-decimal">
            {
              this.rowAttrs.map((r, i) => (
                <li key={`rowAttrs${i}`}>{r}</li>
              ))
            }
          </ol>

          <hr />

          <ol class="bg-blue-400 list-decimal">
            {
              this.rowKeys.map((rowKey, i) => (
                <li key={`rowKeyRow${i}`}>{JSON.stringify(rowKey)}</li>
              ))
            }
          </ol>

          <ol class="bg-violet-400 list-decimal">
            {
              this.rowKeys.map((rowKey, i) => (
                rowKey.map((txt, j) => {
                  return (
                    <li key={`rowKeyLabel${i}-${j}`}>{txt}</li>
                  )
                })
              ))
            }
          </ol>

          <ol class="bg-teal-400 list-decimal">
            {
              this.rowKeys.map((rowKey, i) => (
                this.colKeys.map((colKey, j) => {
                  const aggregator = this.pivotData.getAggregator(rowKey, colKey)

                  return (
                    <li key={`pvtVal${i}-${j}`}>{aggregator.format(aggregator.value())}</li>
                  )
                })
              ))
            }
          </ol>

          <hr />

          <ol class="bg-yellow-400 list-decimal">
            {
              this.colKeys.map((colKey, i) => {
                const totalAggregator = this.pivotData.getAggregator([], colKey)

                return (
                  <li key={`total${i}`}>{totalAggregator.format(totalAggregator.value())}</li>
                )
              })
            }
          </ol>

          <p>{this.grandTotalAggregator.format(this.grandTotalAggregator.value())}</p>

          <code class="text-xs">{JSON.stringify(this.props.data, null, 2)}</code>
        </div>
      )
    },
  })
}

export default {
  Foobar: makeRenderer(),
  Foo: makeRenderer({ mode: 'FOO'}),
  Bar: makeRenderer({ mode: 'BAR'}),
}
