import { select } from 'd3-selection'
import { format } from 'd3-format'
import { ascending } from 'd3-array'
import { partition, hierarchy } from 'd3-hierarchy'
import { scaleLinear } from 'd3-scale'
import { easeCubic } from 'd3-ease'
import 'd3-transition'
import { generateColorVector } from './colorUtils'
import { calculateColor } from './colorScheme'

export default function () {
    var w = 960 // graph width
    var h = null // graph height
    var c = 18 // cell height
    var selection = null // selection
    var tooltip = null // tooltip
    var title = '' // graph title
    var transitionDuration = 750
    var transitionEase = easeCubic // tooltip offset
    var sort = false
    var inverted = false // invert the graph direction
    var clickHandler = null
    var hoverHandler = null
    var minFrameSize = 0
    var detailsElement = null
    var searchDetails = null
    var selfValue = false
    var resetHeightOnZoom = false
    var scrollOnZoom = false
    var minHeight = null
    var computeDelta = false
    var colorHue = null

    var getName = function (d) {
        return d.data.n || d.data.name
    }

    var getValue = function (d) {
        if ('v' in d) {
            return d.v
        } else {
            return d.value
        }
    }

    var getChildren = function (d) {
        return d.c || d.children
    }

    var getLibtype = function (d) {
        return d.data.l || d.data.libtype
    }

    var getDelta = function (d) {
        if ('d' in d.data) {
            return d.data.d
        } else {
            return d.data.delta
        }
    }

    var searchHandler = function (searchResults, searchSum, totalValue) {
        searchDetails = () => {
            if (detailsElement) {
                detailsElement.innerHTML = 'search: ' + searchSum + ' of ' + totalValue + ' total samples ( ' + format('.3f')(100 * (searchSum / totalValue), 3) + '%)'
            }
        }
        searchDetails()
    }
    var originalSearchHandler = searchHandler

    let searchMatch = (d, term, ignoreCase = false) => {
        if (!term) {
            return false
        }
        let label = getName(d)
        if (ignoreCase) {
            term = term.toLowerCase()
            label = label.toLowerCase()
        }
        const re = new RegExp(term)
        return typeof label !== 'undefined' && label && label.match(re)
    }
    const originalSearchMatch = searchMatch

    var detailsHandler = function (d) {
        if (detailsElement) {
            if (d) {
                detailsElement.innerHTML = d
            } else {
                if (typeof searchDetails === 'function') {
                    searchDetails()
                } else {
                    detailsElement.innerHTML = ''
                }
            }
        }
    }
    var originalDetailsHandler = detailsHandler

    var labelHandler = function (d) {
        return getName(d) + ' (' + format('.3f')(100 * (d.x1 - d.x0), 3) + '%, ' + getValue(d) + ' samples)'
    }

    var colorMapper = function (d) {
        return d.highlight ? '#E600E6' : colorHash(getName(d), getLibtype(d))
    }
    var originalColorMapper = colorMapper

    function colorHash (name, libtype) {
    // Return a color for the given name and library type. The library type
    // selects the hue, and the name is hashed to a color in that hue.

        // default when libtype is not in use
        var hue = colorHue || 'warm'

        if (!colorHue && !(typeof libtype === 'undefined' || libtype === '')) {
            // Select hue. Order is important.
            hue = 'red'
            if (typeof name !== 'undefined' && name && name.match(/::/)) {
                hue = 'yellow'
            }
            if (libtype === 'kernel') {
                hue = 'orange'
            } else if (libtype === 'jit') {
                hue = 'green'
            } else if (libtype === 'inlined') {
                hue = 'aqua'
            }
        }

        const vector = generateColorVector(name)
        return calculateColor(hue, vector)
    }

    function show (d) {
        d.data.fade = false
        d.data.hide = false
        if (d.children) {
            d.children.forEach(show)
        }
    }

    function hideSiblings (node) {
        let child = node
        let parent = child.parent
        let children, i, sibling
        while (parent) {
            children = parent.children
            i = children.length
            while (i--) {
                sibling = children[i]
                if (sibling !== child) {
                    sibling.data.hide = true
                }
            }
            child = parent
            parent = child.parent
        }
    }

    function fadeAncestors (d) {
        if (d.parent) {
            d.parent.data.fade = true
            fadeAncestors(d.parent)
        }
    }

    function zoom (d) {
        if (tooltip) tooltip.hide()
        hideSiblings(d)
        show(d)
        fadeAncestors(d)
        update()
        if (scrollOnZoom) {
            const chartOffset = select(this).select('svg')._groups[0][0].parentNode.offsetTop
            const maxFrames = (window.innerHeight - chartOffset) / c
            const frameOffset = (d.height - maxFrames + 10) * c
            window.scrollTo({
                top: chartOffset + frameOffset,
                left: 0,
                behavior: 'smooth'
            })
        }
        if (typeof clickHandler === 'function') {
            clickHandler(d)
        }
    }

    function searchTree (d, term) {
        var results = []
        var sum = 0

        function searchInner (d, foundParent) {
            var found = false

            if (searchMatch(d, term)) {
                d.highlight = true
                found = true
                if (!foundParent) {
                    sum += getValue(d)
                }
                results.push(d)
            } else {
                d.highlight = false
            }

            if (getChildren(d)) {
                getChildren(d).forEach(function (child) {
                    searchInner(child, (foundParent || found))
                })
            }
        }
        searchInner(d, false)

        return [results, sum]
    }

    function findTree (d, id) {
        if (d.id === id) {
            return d
        } else {
            var children = getChildren(d)
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    var found = findTree(children[i], id)
                    if (found) {
                        return found
                    }
                }
            }
        }
    }

    function clear (d) {
        d.highlight = false
        if (getChildren(d)) {
            getChildren(d).forEach(function (child) {
                clear(child)
            })
        }
    }

    function doSort (a, b) {
        if (typeof sort === 'function') {
            return sort(a, b)
        } else if (sort) {
            return ascending(getName(a), getName(b))
        }
    }

    var p = partition()

    function filterNodes (root) {
        var nodeList = root.descendants()
        if (minFrameSize > 0) {
            var kx = w / (root.x1 - root.x0)
            nodeList = nodeList.filter(function (el) {
                return ((el.x1 - el.x0) * kx) > minFrameSize
            })
        }
        return nodeList
    }

    function update () {
        selection.each(function (root) {
            var x = scaleLinear().range([0, w])
            var y = scaleLinear().range([0, c])

            reappraiseNode(root)

            if (sort) root.sort(doSort)

            p(root)

            var kx = w / (root.x1 - root.x0)
            function width (d) { return (d.x1 - d.x0) * kx }

            var descendants = filterNodes(root)
            var svg = select(this).select('svg')
            svg.attr('width', w)

            var g = svg.selectAll('g').data(descendants, function (d) { return d.id })

            // if height is not set: set height on first update, after nodes were filtered by minFrameSize
            if (!h || resetHeightOnZoom) {
                var maxDepth = Math.max.apply(null, descendants.map(function (n) { return n.depth }))

                h = (maxDepth + 3) * c
                if (h < minHeight) h = minHeight

                svg.attr('height', h)
            }

            g.transition()
                .duration(transitionDuration)
                .ease(transitionEase)
                .attr('transform', function (d) { return 'translate(' + x(d.x0) + ',' + (inverted ? y(d.depth) : (h - y(d.depth) - c)) + ')' })

            g.select('rect')
                .transition()
                .duration(transitionDuration)
                .ease(transitionEase)
                .attr('width', width)

            var node = g.enter()
                .append('svg:g')
                .attr('transform', function (d) { return 'translate(' + x(d.x0) + ',' + (inverted ? y(d.depth) : (h - y(d.depth) - c)) + ')' })

            node.append('svg:rect')
                .transition()
                .delay(transitionDuration / 2)
                .attr('width', width)

            if (!tooltip) { node.append('svg:title') }

            node.append('foreignObject')
                .append('xhtml:div')

            // Now we have to re-select to see the new elements (why?).
            g = svg.selectAll('g').data(descendants, function (d) { return d.id })

            g.attr('width', width)
                .attr('height', function (d) { return c })
                .attr('name', function (d) { return getName(d) })
                .attr('class', function (d) { return d.data.fade ? 'frame fade' : 'frame' })

            g.select('rect')
                .attr('height', function (d) { return c })
                .attr('fill', function (d) { return colorMapper(d) })

            if (!tooltip) {
                g.select('title')
                    .text(labelHandler)
            }

            g.select('foreignObject')
                .attr('width', width)
                .attr('height', function (d) { return c })
                .select('div')
                .attr('class', 'd3-flame-graph-label')
                .style('display', function (d) { return (width(d) < 35) ? 'none' : 'block' })
                .transition()
                .delay(transitionDuration)
                .text(getName)

            g.on('click', zoom)

            g.exit()
                .remove()

            g.on('mouseover', function (d) {
                if (tooltip) tooltip.show(d, this)
                detailsHandler(labelHandler(d))
                if (typeof hoverHandler === 'function') {
                    hoverHandler(d)
                }
            }).on('mouseout', function () {
                if (tooltip) tooltip.hide()
                detailsHandler(null)
            })
        })
    }

    function merge (data, samples) {
        samples.forEach(function (sample) {
            var node = data.find(function (element) {
                return (element.name === sample.name)
            })

            if (node) {
                node.value += sample.value
                if (sample.children) {
                    if (!node.children) {
                        node.children = []
                    }
                    merge(node.children, sample.children)
                }
            } else {
                data.push(sample)
            }
        })
    }

    function forEachNode (node, f) {
        f(node)
        let children = node.children
        if (children) {
            const stack = [children]
            let count, child, grandChildren
            while (stack.length) {
                children = stack.pop()
                count = children.length
                while (count--) {
                    child = children[count]
                    f(child)
                    grandChildren = child.children
                    if (grandChildren) {
                        stack.push(grandChildren)
                    }
                }
            }
        }
    }

    function adoptNode (node) {
        let id = 0
        forEachNode(node, function (n) {
            n.id = id++
        })
    }

    function reappraiseNode (root) {
        let node, children, grandChildren, childrenValue, i, j, child, childValue
        const stack = []
        const included = []
        const excluded = []
        const compoundValue = !selfValue
        let item = root.data
        if (item.hide) {
            root.value = 0
            children = root.children
            if (children) {
                excluded.push(children)
            }
        } else {
            root.value = item.fade ? 0 : getValue(item)
            stack.push(root)
        }
        // First DFS pass:
        // 1. Update node.value with node's self value
        // 2. Populate excluded list with children under hidden nodes
        // 3. Populate included list with children under visible nodes
        while ((node = stack.pop())) {
            children = node.children
            if (children && (i = children.length)) {
                childrenValue = 0
                while (i--) {
                    child = children[i]
                    item = child.data
                    if (item.hide) {
                        child.value = 0
                        grandChildren = child.children
                        if (grandChildren) {
                            excluded.push(grandChildren)
                        }
                        continue
                    }
                    if (item.fade) {
                        child.value = 0
                    } else {
                        childValue = getValue(item)
                        child.value = childValue
                        childrenValue += childValue
                    }
                    stack.push(child)
                }
                // Here second part of `&&` is actually checking for `node.data.fade`. However,
                // checking for node.value is faster and presents more oportunities for JS optimizer.
                if (compoundValue && node.value) {
                    node.value -= childrenValue
                }
                included.push(children)
            }
        }
        // Postorder traversal to compute compound value of each visible node.
        i = included.length
        while (i--) {
            children = included[i]
            childrenValue = 0
            j = children.length
            while (j--) {
                childrenValue += children[j].value
            }
            children[0].parent.value += childrenValue
        }
        // Continue DFS to set value of all hidden nodes to 0.
        while (excluded.length) {
            children = excluded.pop()
            j = children.length
            while (j--) {
                child = children[j]
                child.value = 0
                grandChildren = child.children
                if (grandChildren) {
                    excluded.push(grandChildren)
                }
            }
        }
    }

    function processData () {
        selection.datum((data) => {
            if (data.constructor.name !== 'Node') {
                // creating a root hierarchical structure
                const root = hierarchy(data, getChildren)

                // augumenting nodes with ids
                adoptNode(root)

                // calculate actual value
                reappraiseNode(root)

                // store value for later use
                root.originalValue = root.value

                // computing deltas for differentials
                if (computeDelta) {
                    root.eachAfter((node) => {
                        let sum = getDelta(node)
                        const children = node.children
                        let i = children && children.length
                        while (--i >= 0) sum += children[i].delta
                        node.delta = sum
                    })
                }

                // setting the bound data for the selection
                return root
            }
        })
    }

    function chart (s) {
        if (!arguments.length) { return chart }

        // saving the selection on `.call`
        selection = s

        // processing raw data to be used in the chart
        processData()

        // create chart svg
        selection.each(function (data) {
            if (select(this).select('svg').size() === 0) {
                var svg = select(this)
                    .append('svg:svg')
                    .attr('width', w)
                    .attr('class', 'partition d3-flame-graph')

                if (h) {
                    if (h < minHeight) h = minHeight
                    svg.attr('height', h)
                }

                svg.append('svg:text')
                    .attr('class', 'title')
                    .attr('text-anchor', 'middle')
                    .attr('y', '25')
                    .attr('x', w / 2)
                    .attr('fill', '#808080')
                    .text(title)

                if (tooltip) svg.call(tooltip)
            }
        })

        // first draw
        update()
    }

    chart.height = function (_) {
        if (!arguments.length) { return h }
        h = _
        return chart
    }

    chart.minHeight = function (_) {
        if (!arguments.length) { return minHeight }
        minHeight = _
        return chart
    }

    chart.width = function (_) {
        if (!arguments.length) { return w }
        w = _
        return chart
    }

    chart.cellHeight = function (_) {
        if (!arguments.length) { return c }
        c = _
        return chart
    }

    chart.tooltip = function (_) {
        if (!arguments.length) { return tooltip }
        if (typeof _ === 'function') {
            tooltip = _
        }
        return chart
    }

    chart.title = function (_) {
        if (!arguments.length) { return title }
        title = _
        return chart
    }

    chart.transitionDuration = function (_) {
        if (!arguments.length) { return transitionDuration }
        transitionDuration = _
        return chart
    }

    chart.transitionEase = function (_) {
        if (!arguments.length) { return transitionEase }
        transitionEase = _
        return chart
    }

    chart.sort = function (_) {
        if (!arguments.length) { return sort }
        sort = _
        return chart
    }

    chart.inverted = function (_) {
        if (!arguments.length) { return inverted }
        inverted = _
        return chart
    }

    chart.computeDelta = function (_) {
        if (!arguments.length) { return computeDelta }
        computeDelta = _
        return chart
    }

    chart.setLabelHandler = function (_) {
        if (!arguments.length) { return labelHandler }
        labelHandler = _
        return chart
    }
    // Kept for backwards compatibility.
    chart.label = chart.setLabelHandler

    chart.search = function (term) {
        const searchResults = []
        let searchSum = 0
        let totalValue = 0
        selection.each(function (data) {
            const res = searchTree(data, term)
            searchResults.push(...res[0])
            searchSum += res[1]
            totalValue += data.originalValue
        })
        searchHandler(searchResults, searchSum, totalValue)
        update()
    }

    chart.findById = function (id) {
        if (typeof (id) === 'undefined' || id === null) {
            return null
        }
        let found = null
        selection.each(function (data) {
            if (found === null) {
                found = findTree(data, id)
            }
        })
        return found
    }

    chart.clear = function () {
        detailsHandler(null)
        selection.each(function (root) {
            clear(root)
            update()
        })
    }

    chart.zoomTo = function (d) {
        zoom(d)
    }

    chart.resetZoom = function () {
        selection.each(function (root) {
            zoom(root) // zoom to root
        })
    }

    chart.onClick = function (_) {
        if (!arguments.length) {
            return clickHandler
        }
        clickHandler = _
        return chart
    }

    chart.onHover = function (_) {
        if (!arguments.length) {
            return hoverHandler
        }
        hoverHandler = _
        return chart
    }

    chart.merge = function (data) {
        if (!selection) { return chart }

        // TODO: Fix merge with zoom
        // Merging a zoomed chart doesn't work properly, so
        //  clearing zoom before merge.
        // To apply zoom on merge, we would need to set hide
        //  and fade on new data according to current data.
        // New ids are generated for the whole data structure,
        //  so previous ids might not be the same. For merge to
        //  work with zoom, previous ids should be maintained.
        this.resetZoom()

        selection.datum((root) => {
            merge([root.data], [data])
            return root.data
        })
        processData()
        update()
        // TODO: redo search
        return chart
    }

    chart.update = function (data) {
        if (!selection) { return chart }
        if (data) {
            selection.datum(data)
            processData()
        }
        update()
        return chart
    }

    chart.destroy = function () {
        if (!selection) { return chart }
        if (tooltip) {
            tooltip.hide()
            if (typeof tooltip.destroy === 'function') {
                tooltip.destroy()
            }
        }
        selection.selectAll('svg').remove()
        return chart
    }

    chart.setColorMapper = function (_) {
        if (!arguments.length) {
            colorMapper = originalColorMapper
            return chart
        }
        colorMapper = (d) => {
            const originalColor = originalColorMapper(d)
            return _(d, originalColor)
        }
        return chart
    }
    // Kept for backwards compatibility.
    chart.color = chart.setColorMapper

    chart.setColorHue = function (_) {
        if (!arguments.length) {
            colorHue = null
            return chart
        }
        colorHue = _
        return chart
    }

    chart.minFrameSize = function (_) {
        if (!arguments.length) { return minFrameSize }
        minFrameSize = _
        return chart
    }

    chart.setDetailsElement = function (_) {
        if (!arguments.length) { return detailsElement }
        detailsElement = _
        return chart
    }
    // Kept for backwards compatibility.
    chart.details = chart.setDetailsElement

    chart.selfValue = function (_) {
        if (!arguments.length) { return selfValue }
        selfValue = _
        return chart
    }

    chart.resetHeightOnZoom = function (_) {
        if (!arguments.length) { return resetHeightOnZoom }
        resetHeightOnZoom = _
        return chart
    }

    chart.scrollOnZoom = function (_) {
        if (!arguments.length) { return scrollOnZoom }
        scrollOnZoom = _
        return chart
    }

    chart.getName = function (_) {
        if (!arguments.length) { return getName }
        getName = _
        return chart
    }

    chart.getValue = function (_) {
        if (!arguments.length) { return getValue }
        getValue = _
        return chart
    }

    chart.getChildren = function (_) {
        if (!arguments.length) { return getChildren }
        getChildren = _
        return chart
    }

    chart.getLibtype = function (_) {
        if (!arguments.length) { return getLibtype }
        getLibtype = _
        return chart
    }

    chart.getDelta = function (_) {
        if (!arguments.length) { return getDelta }
        getDelta = _
        return chart
    }

    chart.setSearchHandler = function (_) {
        if (!arguments.length) {
            searchHandler = originalSearchHandler
            return chart
        }
        searchHandler = _
        return chart
    }

    chart.setDetailsHandler = function (_) {
        if (!arguments.length) {
            detailsHandler = originalDetailsHandler
            return chart
        }
        detailsHandler = _
        return chart
    }

    chart.setSearchMatch = function (_) {
        if (!arguments.length) {
            searchMatch = originalSearchMatch
            return chart
        }
        searchMatch = _
        return chart
    }

    return chart
}
