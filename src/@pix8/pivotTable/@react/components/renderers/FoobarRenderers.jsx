import React from 'react'
import PivotData from '../../js/PivotData'
// import PivotEngine from '../../../@core/js/PivotEngine'

// JB: the proper OOP way to do it as oppose to leveraging closure, would be to extend a base class and use that to create the other modes as a superset Class. Also turning into functional component may be another option.
function makeRenderer(
  config = {}
) {
  class FoobarRenderer extends React.PureComponent {
    render() {
      const pivotData = new PivotData(this.props)
      // const pivotEngine = new PivotEngine(this.props)
  
      const rowKeys = pivotData.getRowKeys()
      const colKeys = pivotData.getColKeys()
      const rowAttrs = pivotData.props.rows // unmodified data
      const colAttrs = pivotData.props.cols // unmodified data
      
      // const grandTotalAggregator = pivotData.getAggregator([], [])
  
      console.log('FoobarRenderer :pivotData: ', pivotData)
      // console.log('FoobarRenderer :pivotEngine: ', pivotEngine)
  
      return (
        <div>
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

          <ol className="bg-indigo-400 list-decimal">
            {
              colAttrs.map((c, j) => (
                <li key={`colAttr${j}`}>{c}</li>
              ))
            }
          </ol>

          <ol className="bg-rose-400 list-decimal">
            {
              colKeys.map((colKey, i) => (
                <li key={`colKey${i}`}>{JSON.stringify(colKey)}</li>
              ))
            }
          </ol>
          
          <ol className="bg-green-400 list-decimal">
            {
              colAttrs.map((c, j) => (
                colKeys.map((colKey, i) => (
                  <li key={`colKey${i}`}>{colKey[j]}</li>
                ))
              ))
            }
          </ol>
          
          <hr />

          <ol className="bg-orange-400 list-decimal">
            {
              rowAttrs.map((r, i) => (
                <li key={`rowAttrs${i}`}>{i}</li>
              ))
            }
          </ol>

          <ol className="bg-blue-400 list-decimal">
            {
              rowKeys.map((rowKey, i) => (
                <li key={`rowKeyRow${i}`}>{JSON.stringify(rowKey)}</li>
              ))
            }
          </ol>
        </div>
      )
    }
  }
  
  FoobarRenderer.propTypes = {
    ...PivotData.propTypes,
  }
  
  FoobarRenderer.defaultProps = {
    ...PivotData.defaultProps,
  }

  return FoobarRenderer
}

export default {
  Foobar: makeRenderer(),
  Foo: makeRenderer({ mode: 'FOO'}),
  Bar: makeRenderer({ mode: 'BAR'}),
}
