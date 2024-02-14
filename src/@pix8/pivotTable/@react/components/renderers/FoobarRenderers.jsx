import React from 'react'
import PivotData from '../../js/PivotData'

// JB: the proper OOP way to do it as oppose to leveraging closure, would be to extend a base class and use that to create the other modes as a superset Class. Also turning into functional component may be another option.
function makeRenderer(
  config = {}
) {
  class FoobarRenderer extends React.PureComponent {
    render() {
      const pivotData = new PivotData(this.props)
  
      const rowKeys = pivotData.getRowKeys()
      const colKeys = pivotData.getColKeys()
  
      console.log(pivotData)
  
      return (
        <div>
          <h1>hello foobar</h1>
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
