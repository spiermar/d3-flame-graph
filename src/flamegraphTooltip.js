import { select, event } from 'd3-selection'

function defaultLabel (d) {
    return d.data.name
}

export default function () {
    var rootElement = select('body')
    var tooltip = null
    var html = defaultLabel

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

        tooltip
            .html(html(d))
            .style('left', event.pageX + 'px')
            .style('top', event.pageY + 'px')

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
