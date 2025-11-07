import { defineComponent, ref } from 'vue'
import PivotData from '../../../@core/js/PivotData'

function makeRenderer(
  config = {}
) {
  return defineComponent({
    name: 'TSVRenderer',

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

      // tableColorScaleGenerator: {
      //   type: Function,
      //   default: () => redColorScaleGenerator,
      // },
      // tableOptions: {
      //   type: Object,
      //   default: () => ({}),
      // },
    },
    
    setup(props) {
      const pivotData = ref(new PivotData(props))
      const rowKeys = pivotData.value.getRowKeys()
      const colKeys = pivotData.value.getColKeys()

      if (rowKeys.length === 0) {
        rowKeys.push([])
      }
      if (colKeys.length === 0) {
        colKeys.push([])
      }

      const headerRow = pivotData.value.props.rows.map(r => r)

      if (colKeys.length === 1 && colKeys[0].length === 0) {
        headerRow.push(props.aggregatorName)
      } else {
        colKeys.map(c => headerRow.push(c.join('-')))
      }

      const result = rowKeys.map(r => {
        const row = r.map(x => x)
        colKeys.map(c => {
          const v = pivotData.value.getAggregator(r, c).value()
          row.push(v ? v : '')
        })
        return row
      })

      result.unshift(headerRow)

      return { result }
    },

    render() {
      const { result } = this
      console.log('JB :: ', {width: window.innerWidth / 2, height: window.innerHeight / 2})

      return (
        <textarea
          id="tsv-export"
          value={result.map(r => r.join('\t')).join('\n')}
          style={{
            width: window.innerWidth / 2 + 'px',
            height: window.innerHeight / 2 + 'px'
          }}
          readonly
        />
        // JB: without explicit units, inline styles do not work in Vue JSX
      )
    }
  })
}

export default {
  'Exportable TSV': makeRenderer(),
}
