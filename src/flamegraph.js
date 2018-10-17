import { select } from 'd3-selection'
import { format } from 'd3-format'
import { ascending } from 'd3-array'
import { partition, hierarchy } from 'd3-hierarchy'
import { scaleLinear } from 'd3-scale'

export default function () {
  var w = null // graph width
  var h = null // graph height
  var cellHeight = 18
  var root = null
  var tooltip = true // enable tooltip
  var title = '' // graph title
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
  var p = partition()

  const containerElement = document.createElement('div')
  const titleElement = document.createElement('div')
  const nodesSpaceElement = document.createElement('div')
  const nodesElement = document.createElement('div')
  const tipElement = document.createElement('div')
  // Safari is very annoying with its default tooltips for text with ellipsis.
  // The only way to disable it is to add dummy block element inside.
  const tipDeterringElement = document.createElement('div')
  containerElement.className = 'd3-flame-graph'
  titleElement.className = 'title'
  nodesSpaceElement.className = 'nodes-space'
  nodesElement.className = 'nodes'
  tipElement.className = 'tip'
  nodesSpaceElement.appendChild(nodesElement)
  nodesSpaceElement.appendChild(tipElement)
  containerElement.appendChild(titleElement)
  containerElement.appendChild(nodesSpaceElement)

  const externalState = {
    shiftKey: false,
    handleEvent (event) {
      switch (event.type) {
        case 'keydown':
        case 'keyup':
          this.shiftKey = event.shiftKey
          break
      }
    },
    listen () {
      document.addEventListener('keydown', this, false)
      document.addEventListener('keyup', this, false)
    },
    textSelected () {
      return window.getSelection().type === 'Range'
    }
  }

  var getItemName = function (item) {
    return item.n || item.name
  }

  var getItemValue = function (item) {
    return item.v || item.value
  }

  var getItemDelta = function (item) {
    return item.d || item.delta
  }

  var getItemChildren = function (item) {
    return item.c || item.children
  }

  var getLibtype = function (d) {
    return d.data.l || d.data.libtype
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
    return getItemName(d.data) + ' (' + format('.3f')(100 * (d.x1 - d.x0), 3) + '%, ' + d.value + ' samples)'
  }

  function setSearchDetails () {
    detailsElement.innerHTML = `${searchSum} of ${totalValue} samples (${format('.3f')(100 * (searchSum / totalValue), 3)}%)`
  }

  var classMapper = function (d, base) {
    let classes = base
    if (d.fade) classes += ' stem'
    if (d.highlight) classes += ' highlight'
    return classes
  }

  var colorMapper = function (d) {
    return colorHash(getItemName(d.data), getLibtype(d), getItemDelta(d.data))
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

  function show (d) {
    d.fade = false
    d.hide = false
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
          sibling.hide = true
        }
      }
      child = parent
      parent = child.parent
    }
  }

  function fadeAncestors (d) {
    if (d.parent) {
      d.parent.fade = true
      fadeAncestors(d.parent)
    }
  }

  function tipShow (d, itemRect, insideRect) {
    tipElement.innerHTML = labelHandler(d)
    // Need to reset `display` here, so `getBoundingClientRect()` will actually layout the `tipElement`.
    tipElement.style.display = 'unset'
    const tipRect = tipElement.getBoundingClientRect()
    const cw = document.documentElement.clientWidth
    const ch = document.documentElement.clientHeight
    let x = -insideRect.left
    if (cw < itemRect.left + tipRect.width) {
      x += cw - tipRect.width
    } else if (itemRect.left > 0) {
      x += itemRect.left
    }
    let y = -insideRect.top
    if (ch < itemRect.top + itemRect.height + tipRect.height) {
      y += itemRect.top - tipRect.height
    } else {
      y += itemRect.top + itemRect.height
    }
    tipElement.style.transform = 'translate(' + x + 'px,' + y + 'px)'
  }

  function tipHide () {
    tipElement.style.display = 'none'
  }

  function tipShown () {
    return tipElement.style.display !== 'none'
  }

  function zoom (d) {
    hideSiblings(d)
    show(d)
    fadeAncestors(d)
    update()
  }

  function searchTree (d, term) {
    var re = new RegExp(term)
    var results = []
    var sum = 0

    function searchInner (d, foundParent) {
      var label = getItemName(d.data)
      var found = false

      if (typeof label !== 'undefined' && label && label.match(re)) {
        d.highlight = true
        found = true
        if (!foundParent) {
          sum += d.value
        }
        results.push(d)
      } else {
        d.highlight = false
      }

      if (d.children) {
        d.children.forEach(function (child) {
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
    if (d.children) {
      d.children.forEach(function (child) {
        clear(child)
      })
    }
  }

  function doSort (a, b) {
    if (typeof sort === 'function') {
      return sort(a, b)
    } else if (sort) {
      return ascending(getItemName(a.data), getItemName(b.data))
    }
  }

  function filterNodes (root, width) {
    var nodeList = root.descendants()
    if (minFrameSize > 0) {
      nodeList = nodeList.filter(function (el) {
        return width(el) > minFrameSize
      })
    }
    return nodeList
  }

  function nodeClick () {
    if (!externalState.textSelected()) {
      if (tooltip) tipHide()
      const d = this.__data__
      zoom(d)
      if (clickHandler) {
        clickHandler.call(this, d)
      }
    }
  }

  function nodeMouseOver () {
    if (tooltip) {
      this.appendChild(tipDeterringElement)
      if (!(externalState.shiftKey && tipShown())) {
        tipShow(this.__data__, this.getBoundingClientRect(), this.parentElement.getBoundingClientRect())
      }
    }
  }

  function nodeMouseOut () {
    if (tooltip) {
      if (tipDeterringElement.parentElement === this) {
        this.removeChild(tipDeterringElement)
      }
      if (!externalState.shiftKey) {
        tipHide()
      }
    }
  }

  function update () {
    const nodesRect = nodesElement.getBoundingClientRect()
    const x = scaleLinear().rangeRound([0, nodesRect.width])
    const y = scaleLinear().rangeRound([0, cellHeight])

    // FIXME: This can return list of children lists (since it builds it anyway) that can efficiently sorted without
    // FIXME: full tree traversal. This list also can be used later in filtering step with the same benefits.
    reappraiseNode(root)
    if (sort) {
      root.sort(doSort)
    }
    p(root)
    const kx = nodesRect.width / (root.x1 - root.x0)
    const dy = nodesRect.height - cellHeight
    const width = function (d) { return Math.round((d.x1 - d.x0) * kx) }
    const top = inverted ? function (d) { return y(d.depth) } : function (d) { return dy - y(d.depth) }

    const descendants = filterNodes(root, width)

    // JOIN new data with old elements.
    const g = select(nodesElement)
      .selectAll(function () { return nodesElement.childNodes })
      .data(descendants, function (d) { return d.id })

    // EXIT old elements not present in new data.
    g.exit().each(function (d) {
      this.style.display = 'none'
    })

    // UPDATE old elements present in new data.
    g.each(function (d) {
      const wpx = width(d)
      this.className = classMapper(d, wpx < 35 ? 'node-sm' : 'node')
      this.style.backgroundColor = colorMapper(d)
      this.style.width = wpx + 'px'
      this.style.left = x(d.x0) + 'px'
      this.style.top = top(d) + 'px'
      this.textContent = wpx < 35 ? '' : getItemName(d.data)
      this.style.display = 'unset'
    })

    // ENTER new elements present in new data.
    g.enter().append(function (d) {
      const wpx = width(d)
      const element = document.createElement('div')
      element.className = classMapper(d, wpx < 35 ? 'node-sm' : 'node')
      element.style.backgroundColor = colorMapper(d)
      element.style.width = wpx + 'px'
      element.style.left = x(d.x0) + 'px'
      element.style.top = top(d) + 'px'
      element.textContent = wpx < 35 ? '' : getItemName(d.data)
      if (!tooltip) element.title = labelHandler(d)
      element.addEventListener('click', nodeClick)
      element.addEventListener('mouseover', nodeMouseOver)
      element.addEventListener('mouseout', nodeMouseOut)
      return element
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
        delta = Math.abs(getItemDelta(n.data))
        if (maxDelta < delta) {
          maxDelta = delta
        }
      }
    })
  }

  function reappraiseNode (root) {
    // FIXME: No need to set value for children of hidden nodes, since we will filter them out
    let node, children, grandChildren, childrenValue, i, j, child, childValue
    const stack = []
    const included = []
    const excluded = []
    const compoundValue = !selfValue
    if (root.hide) {
      root.value = 0
      children = root.children
      if (children) {
        excluded.push(children)
      }
    } else {
      root.value = root.fade ? 0 : getItemValue(root.data)
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
          if (child.hide) {
            child.value = 0
            grandChildren = child.children
            if (grandChildren) {
              excluded.push(grandChildren)
            }
            continue
          }
          if (child.fade) {
            child.value = 0
          } else {
            childValue = getItemValue(child.data)
            child.value = childValue
            childrenValue += childValue
          }
          stack.push(child)
        }
        // Here second part of `&&` is actually checking for `node.fade`. However,
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
    if (!arguments.length) return chart

    root = hierarchy(s.datum(), getItemChildren)
    adoptNode(root)
    // FIXME: Looks like totalValue logic is broken, since we will recalculate values in update().
    // FIXME: And it doesn't account for `selfValue` option.
    totalValue = root.value

    titleElement.innerHTML = title
    nodesElement.style.width = w ? w + 'px' : '100%'
    nodesElement.style.height = (h || (root.height + 1) * cellHeight) + 'px'

    s.each(function () {
      if (this.childElementCount === 0) {
        this.appendChild(containerElement)
        externalState.listen()
      }
    })

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
    if (!arguments.length) { return cellHeight }
    cellHeight = _
    return chart
  }

  chart.tooltip = function (_) {
    if (!arguments.length) { return tooltip }
    tooltip = !!_
    return chart
  }

  chart.title = function (_) {
    if (!arguments.length) { return title }
    title = _
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
    searchTree(root, term)
    update()
  }

  chart.clear = function () {
    searchSum = 0
    detailsHandler(null)
    clear(root)
    update()
  }

  chart.zoomTo = function (d) {
    zoom(d)
  }

  chart.resetZoom = function () {
    zoom(root)
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
    merge([root.data], [samples])
    newRoot = hierarchy(root.data, getItemChildren)
    adoptNode(newRoot)
    root = newRoot
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

  chart.getItemName = function (_) {
    if (!arguments.length) { return getItemName }
    getItemName = _
    return chart
  }

  chart.getItemValue = function (_) {
    if (!arguments.length) { return getItemValue }
    getItemValue = _
    return chart
  }

  chart.getItemDelta = function (_) {
    if (!arguments.length) { return getItemDelta }
    getItemDelta = _
    return chart
  }

  chart.getItemChildren = function (_) {
    if (!arguments.length) { return getItemChildren }
    getItemChildren = _
    return chart
  }

  chart.getLibtype = function (_) {
    if (!arguments.length) { return getLibtype }
    getLibtype = _
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
