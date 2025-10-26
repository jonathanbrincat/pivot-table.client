import { defineComponent } from 'vue'

function makeRenderer(
  config = {}
) {
  return defineComponent({
    name: 'TSVRenderer', // componentName,

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

      data: Array,

      tableColorScaleGenerator: {
        type: Function,
        default: () => redColorScaleGenerator,
      },
      tableOptions: {
        type: Object,
        default: () => ({}),
      },
    },
    
    setup(props) {},

    render() {
      return (
        <div>TSV Renderer (to be implemented)</div>
      )
    }
  })
}

export default {
  TSV: makeRenderer(),
}
