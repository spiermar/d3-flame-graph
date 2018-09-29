import { select } from 'd3-selection'
import { format } from 'd3-format'
import { ascending } from 'd3-array'
import { partition, hierarchy } from 'd3-hierarchy'
import { scaleLinear } from 'd3-scale'
import { easeCubic } from 'd3-ease'
import { default as d3Tip } from 'd3-tip'
import 'd3-transition'

export default function () {
  var w = 960 // graph width
  var h = null // graph height
  var c = 18 // cell height
  var selection = null // selection
  var tooltip = true // enable tooltip
  var title = '' // graph title
  var transitionDuration = 750
  var transitionEase = easeCubic // tooltip offset
  var sort = false
  var inverted = false // invert the graph direction
  var clickHandler = null
  var minFrameSize = 0
  var detailsElement = null
  var selfValue = false
  var differential = false
  var elided = false
  var searchSum = 0
  var totalValue = 0
  var maxDelta = 0

  var getName = function (d) {
    return d.data.n || d.data.name
  }

  var getValue = function (d) {
    return d.v || d.value
  }

  var getChildren = function (d) {
    return d.c || d.children
  }

  var getLibtype = function (d) {
    return d.data.l || d.data.libtype
  }

  var getDelta = function (d) {
    return d.data.d || d.data.delta
  }

  var searchHandler = function () {
    if (detailsElement) { setSearchDetails() }
  }
  var originalSearchHandler = searchHandler

  var detailsHandler = function (d) {
    if (detailsElement) {
      if (d) {
        detailsElement.innerHTML = d
      } else {
        if (searchSum) {
          setSearchDetails()
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

  var tip = d3Tip()
    .direction('s')
    .offset([8, 0])
    .attr('class', 'd3-flame-graph-tip')
    .html(function (d) { return labelHandler(d) })

  var svg

  function setSearchDetails () {
    detailsElement.innerHTML = `${searchSum} of ${totalValue} samples (${format('.3f')(100 * (searchSum / totalValue), 3)}%)`
  }

  var colorMapper = function (d) {
    return d.highlight ? '#E600E6' : colorHash(getName(d), getLibtype(d), getDelta(d))
  }
  var originalColorMapper = colorMapper

  function generateHash (name) {
    // Return a vector (0.0->1.0) that is a hash of the input string.
    // The hash is computed to favor early characters over later ones, so
    // that strings with similar starts have similar vectors. Only the first
    // 6 characters are considered.
    const MAX_CHAR = 6

    var hash = 0
    var maxHash = 0
    var weight = 1
    var mod = 10

    if (name) {
      for (var i = 0; i < name.length; i++) {
        if (i > MAX_CHAR) { break }
        hash += weight * (name.charCodeAt(i) % mod)
        maxHash += weight * (mod - 1)
        weight *= 0.70
      }
      if (maxHash > 0) { hash = hash / maxHash }
    }
    return hash
  }

  function colorHash (name, libtype, delta) {
    // Return a color for the given name and library type. The library type
    // selects the hue, and the name is hashed to a color in that hue.

    var r
    var g
    var b

    if (differential) {
      r = 220
      g = 220
      b = 220

      if (!delta) {
        delta = 0
      }

      if (delta > 0) {
        b = Math.round(210 * (maxDelta - delta) / maxDelta)
        g = b
      } else if (delta < 0) {
        r = Math.round(210 * (maxDelta + delta) / maxDelta)
        g = r
      }
    } else {
      // default when libtype is not in use
      var hue = elided ? 'cold' : 'warm'

      if (!elided && !(typeof libtype === 'undefined' || libtype === '')) {
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

      // calculate hash
      var vector = 0
      if (name) {
        var nameArr = name.split('`')
        if (nameArr.length > 1) {
          name = nameArr[nameArr.length - 1] // drop module name if present
        }
        name = name.split('(')[0] // drop extra info
        vector = generateHash(name)
      }

      // calculate color
      if (hue === 'red') {
        r = 200 + Math.round(55 * vector)
        g = 50 + Math.round(80 * vector)
        b = g
      } else if (hue === 'orange') {
        r = 190 + Math.round(65 * vector)
        g = 90 + Math.round(65 * vector)
        b = 0
      } else if (hue === 'yellow') {
        r = 175 + Math.round(55 * vector)
        g = r
        b = 50 + Math.round(20 * vector)
      } else if (hue === 'green') {
        r = 50 + Math.round(60 * vector)
        g = 200 + Math.round(55 * vector)
        b = r
      } else if (hue === 'aqua') {
        r = 50 + Math.round(60 * vector)
        g = 165 + Math.round(55 * vector)
        b = g
      } else if (hue === 'cold') {
        r = 0 + Math.round(55 * (1 - vector))
        g = 0 + Math.round(230 * (1 - vector))
        b = 200 + Math.round(55 * vector)
      } else {
        // original warm palette
        r = 200 + Math.round(55 * vector)
        g = 0 + Math.round(230 * (1 - vector))
        b = 0 + Math.round(55 * (1 - vector))
      }
    }

    return 'rgb(' + r + ',' + g + ',' + b + ')'
  }

  function hide (d) {
    d.data.hide = true
    if (getChildren(d)) {
      getChildren(d).forEach(hide)
    }
  }

  function show (d) {
    d.data.fade = false
    d.data.hide = false
    if (getChildren(d)) {
      getChildren(d).forEach(show)
    }
  }

  function getSiblings (d) {
    var siblings = []
    if (d.parent) {
      var me = getChildren(d.parent).indexOf(d)
      siblings = getChildren(d.parent).slice(0)
      siblings.splice(me, 1)
    }
    return siblings
  }

  function hideSiblings (d) {
    var siblings = getSiblings(d)
    siblings.forEach(function (s) {
      hide(s)
    })
    if (d.parent) {
      hideSiblings(d.parent)
    }
  }

  function fadeAncestors (d) {
    if (d.parent) {
      d.parent.data.fade = true
      fadeAncestors(d.parent)
    }
  }

  // function getRoot (d) {
  //   if (d.parent) {
  //     return getRoot(d.parent)
  //   }
  //   return d
  // }

  function zoom (d) {
    tip.hide(d)
    hideSiblings(d)
    show(d)
    fadeAncestors(d)
    update()
    if (typeof clickHandler === 'function') {
      clickHandler(d)
    }
  }

  function searchTree (d, term) {
    var re = new RegExp(term)
    var results = []
    var sum = 0

    function searchInner (d, foundParent) {
      var label = getName(d)
      var found = false

      if (typeof label !== 'undefined' && label && label.match(re)) {
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
    searchSum = sum
    searchHandler(results, sum, totalValue)
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
      var g = select(this).select('svg').selectAll('g').data(descendants, function (d) { return d.id })

      // if height is not set: set height on first update, after nodes were filtered by minFrameSize
      if (!h) {
        var maxDepth = Math.max.apply(null, descendants.map(function (n) { return n.depth }))
        h = (maxDepth + 2) * c
        select(this).select('svg').attr('height', h)
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
      g = select(this).select('svg').selectAll('g').data(descendants, function (d) { return d.id })

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
        if (tooltip) tip.show(d, this)
        detailsHandler(labelHandler(d))
      }).on('mouseout', function (d) {
        if (tooltip) tip.hide(d)
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
        if (node.original) {
          node.original += sample.value
        } else {
          node.value += sample.value
        }
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
    maxDelta = 0
    let id = 0
    let delta = 0
    const wantDelta = differential
    forEachNode(node, function (n) {
      n.id = id++
      if (wantDelta) {
        delta = Math.abs(getDelta(n))
        if (maxDelta < delta) {
          maxDelta = delta
        }
      }
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

  function chart (s) {
    var root = hierarchy(s.datum(), getChildren)
    adoptNode(root)

    // This line is invalid - root is a d3 node, while getValue() expects data item. Will address in next patch.
    totalValue = getValue(root)

    selection = s.datum(root)

    if (!arguments.length) return chart

    selection.each(function (data) {
      if (!svg) {
        svg = select(this)
          .append('svg:svg')
          .attr('width', w)
          .attr('height', h || (root.height + 2) * c)
          .attr('class', 'partition d3-flame-graph')
          .call(tip)

        svg.append('svg:text')
          .attr('class', 'title')
          .attr('text-anchor', 'middle')
          .attr('y', '25')
          .attr('x', w / 2)
          .attr('fill', '#808080')
          .text(title)
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
      tip = _
    }
    tooltip = !!_
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

  chart.differential = function (_) {
    if (!arguments.length) { return differential }
    differential = _
    return chart
  }

  chart.elided = function (_) {
    if (!arguments.length) { return elided }
    elided = _
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
    selection.each(function (data) {
      searchTree(data, term)
      update()
    })
  }

  chart.clear = function () {
    searchSum = 0
    detailsHandler(null)
    selection.each(function (data) {
      clear(data)
      update()
    })
  }

  chart.zoomTo = function (d) {
    zoom(d)
  }

  chart.resetZoom = function () {
    selection.each(function (data) {
      zoom(data) // zoom to root
    })
  }

  chart.onClick = function (_) {
    if (!arguments.length) {
      return clickHandler
    }
    clickHandler = _
    return chart
  }

  chart.merge = function (samples) {
    var newRoot // Need to re-create hierarchy after data changes.
    selection.each(function (root) {
      merge([root.data], [samples])
      newRoot = hierarchy(root.data, getChildren)
      adoptNode(newRoot)
    })
    selection = selection.datum(newRoot)
    update()
  }

  chart.setColorMapper = function (_) {
    if (!arguments.length) {
      colorMapper = originalColorMapper
      return chart
    }
    colorMapper = _
    return chart
  }
  // Kept for backwards compatibility.
  chart.color = chart.setColorMapper

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

  return chart
}
