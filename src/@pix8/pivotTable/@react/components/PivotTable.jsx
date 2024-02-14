import React from 'react'
import PropTypes from 'prop-types'
import PivotData from '../js/PivotData'
import TableRenderers from './renderers/TableRenderers'
import TSVRenderers from './renderers/TSVRenderers'
import FoobarRenderers from './renderers/FoobarRenderers'

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

class PivotTable extends React.PureComponent {
  render() {
    const Renderer = this.props.renderers[
      this.props.rendererName in this.props.renderers
        ? this.props.rendererName
        : Object.keys(this.props.renderers)[0]
    ]

    return <Renderer {...this.props} />
  }
}

PivotTable.propTypes = {
  ...PivotData.propTypes,
  rendererName: PropTypes.string,
  renderers: PropTypes.objectOf(PropTypes.func),
}

PivotTable.defaultProps = {
  ...PivotData.defaultProps,
  rendererName: 'Table',
  // renderers: {...TableRenderers, ...TSVRenderers, ...FoobarRenderers},
  renderers: {...FoobarRenderers},
}

export default PivotTable
