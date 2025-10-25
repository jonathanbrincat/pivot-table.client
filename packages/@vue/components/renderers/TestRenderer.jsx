import { defineComponent } from 'vue'

function makeRenderer(
  config = {}
) {
  const componentName = config.mode
    ? `TestRenderer-${config.mode}`
    : 'TestRenderer'
  
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
      return {
        props,
      }
    },

    render() {
      return (
        <div class="border-green-500 border-2 p-2">
          <h1 class="text-4xl">Test wtf</h1>
          {
            (config.mode === 'FOO') && (
              <h2>hello foo test</h2>
            )
          }

          {
            (config.mode === 'BAR') && (
              <h2>hello bar test</h2>
            )
          }
        </div>
      )
    },
  })
}

export default {
  // Test1: TestRenderer,
  Test2: makeRenderer(),
  Test3: makeRenderer({ mode: 'FOO' }),
  Test4: makeRenderer({ mode: 'BAR'}),
  // Test5: <TestRenderer test={'FOO'} />,
}
