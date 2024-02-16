import React from 'react'
import PivotData from '../../../@core/js/PivotData'
// import PivotEngine from '../../../@core/js/PivotEngine'

import './foobarRenderer.css'

// JB: the proper OOP way to do it as oppose to leveraging closure, would be to extend a base class and use that to create the other modes as a superset Class. Also turning into functional component may be another option.
function makeRenderer(
  config = {}
) {
  const FoobarRenderer = (props) => {
    const pivotData = new PivotData(props)
    // const pivotEngine = new PivotEngine(props)

    const rowKeys = pivotData.getRowKeys()
    const colKeys = pivotData.getColKeys()
    const rowAttrs = pivotData.props.rows // unmodified data
    const colAttrs = pivotData.props.cols // unmodified data
    
    const grandTotalAggregator = pivotData.getAggregator([], [])

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
              <li key={`rowAttrs${i}`}>{r}</li>
            ))
          }
        </ol>

        <hr />

        <ol className="bg-blue-400 list-decimal">
          {
            rowKeys.map((rowKey, i) => (
              <li key={`rowKeyRow${i}`}>{JSON.stringify(rowKey)}</li>
            ))
          }
        </ol>

        <ol className="bg-violet-400 list-decimal">
          {
            rowKeys.map((rowKey, i) => (
              rowKey.map((txt, j) => {
                return (
                  <li key={`rowKeyLabel${i}-${j}`}>{txt}</li>
                )
              })
            ))
          }
        </ol>

        <ol className="bg-teal-400 list-decimal">
          {
            rowKeys.map((rowKey, i) => (
              colKeys.map((colKey, j) => {
                const aggregator = pivotData.getAggregator(rowKey, colKey)

                return (
                  <li key={`pvtVal${i}-${j}`}>{aggregator.format(aggregator.value())}</li>
                )
              })
            ))
          }
        </ol>

        <hr />

        <ol className="bg-yellow-400 list-decimal">
          {
            colKeys.map((colKey, i) => {
              const totalAggregator = pivotData.getAggregator([], colKey)

              return (
                <li key={`total${i}`}>{totalAggregator.format(totalAggregator.value())}</li>
              )
            })
          }
        </ol>

        <p>{grandTotalAggregator.format(grandTotalAggregator.value())}</p>
      </div>
    )
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
