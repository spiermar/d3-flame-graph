/* global event */

import { select } from 'd3-selection'
import 'd3-transition'
import 'd3-dispatch'
import 'd3-ease'

function defaultLabel (d) {
    return d.data.name
}

export function defaultFlamegraphTooltip () {
    const rootElement = select('body')
    const chartElement = select('#chart')
    const chartBoundingClientRect = chartElement._groups[0][0].getBoundingClientRect()
    const chartRightBoundary = chartBoundingClientRect.x + chartBoundingClientRect.width
    let tooltip = null
    let html = defaultLabel

    function tip () {
        tooltip = rootElement
            .append('div')
            .style('display', 'none')
            .style('position', 'absolute')
            .style('opacity', 0)
            .style('pointer-events', 'none')
            .attr('class', 'd3-flame-graph-tip')
    }

    tip.show = function (d) {
        tooltip
            .style('display', 'block')
            .transition()
            .duration(200)
            .style('opacity', 1)
            .style('pointer-events', 'all')

        const tooltipAreaWidth = tooltip.nodes()[0].getBoundingClientRect().width
        const tooltipRightBoundary = event.pageX + 10 + tooltipAreaWidth

        let tooltipLeft = event.pageX + 10

        if (tooltipRightBoundary > chartRightBoundary) {
            tooltipLeft = tooltipLeft - tooltipAreaWidth - 12
        }

        tooltip
            .html(html(d))
            .style('left', tooltipLeft + 'px')
            .style('top', event.pageY + 5 + 'px')

        return tip
    }

    tip.hide = function () {
        tooltip
            .style('display', 'none')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .style('pointer-events', 'none')

        return tip
    }

    tip.html = function (_) {
        if (!arguments.length) return html
        html = _
        return tip
    }

    return tip
}
