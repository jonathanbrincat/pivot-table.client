import React from 'react'
import PropTypes from 'prop-types'
import PivotData from '../../@core/js/PivotData'
import { TableRenderer, TSVRenderer, FoobarRenderer, TestRenderer } from './renderers'

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
  // renderers: {...TableRenderer, ...TSVRenderer, ...FoobarRenderer},
  renderers: { ...TableRenderer, ...FoobarRenderer, ...TestRenderer },
}

export default PivotTable
