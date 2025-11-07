import React from 'react'
import PropTypes from 'prop-types'
import PivotData from '../../@core/js/PivotData'
import { TableRenderer, TSVRenderer, FoobarRenderer, TestRenderer, createPlotlyRenderer, createChartjsRenderer } from './renderers'
import createPlotlyComponent from 'react-plotly.js/factory'
import { colors as palette  } from '../../../common/js/constants'

const PlotlyComponent = createPlotlyComponent(window.Plotly) // JB: create instance of Plotly

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
  renderers: {
    ...TableRenderer,
    ...FoobarRenderer,
    ...TestRenderer,
    ...TSVRenderer,
    ...createPlotlyRenderer(PlotlyComponent),
    ...createChartjsRenderer({ palette }),
  },
}

export default PivotTable
