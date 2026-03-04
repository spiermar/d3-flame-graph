import { select } from "d3-selection";
import { format } from "d3-format";
import { ascending } from "d3-array";
import { partition, hierarchy } from "d3-hierarchy";
import { scaleLinear } from "d3-scale";
import { easeCubic } from "d3-ease";
import "d3-transition";
import { generateColorVector } from "./colorUtils";
import { calculateColor } from "./colorScheme";
import "./flamegraph.css";

export * as tooltip from "./tooltip";
export * as colorMapper from "./colorMapper";

/**
 * D3 Flame Graph
 * A D3.js library to produce flame graphs.
 * @returns {Function} The flame graph chart function
 */
export default function () {
    let w = 960; // graph width
    let h = null; // graph height
    let c = 18; // cell height
    let selection = null; // selection
    let tooltip = null; // tooltip
    let title = ""; // graph title
    let transitionDuration = 750;
    let transitionEase = easeCubic; // tooltip offset
    let sort = false;
    let inverted = false; // invert the graph direction
    let clickHandler = null;
    let hoverHandler = null;
    let minFrameSize = 0;
    let detailsElement = null;
    let searchDetails = null;
    let selfValue = false;
    let resetHeightOnZoom = false;
    let scrollOnZoom = false;
    let minHeight = null;
    let computeDelta = false;
    let colorHue = null;

    let getName = function (d) {
        return d.data.n || d.data.name;
    };

    let getValue = function (d) {
        if ("v" in d) {
            return d.v;
        } else {
            return d.value;
        }
    };

    let getChildren = function (d) {
        return d.c || d.children;
    };

    let getLibtype = function (d) {
        return d.data.l || d.data.libtype;
    };

    let getDelta = function (d) {
        if ("d" in d.data) {
            return d.data.d;
        } else {
            return d.data.delta;
        }
    };

    let searchHandler = function (searchResults, searchSum, totalValue) {
        searchDetails = () => {
            if (detailsElement) {
                detailsElement.textContent =
                    "search: " +
                    searchSum +
                    " of " +
                    totalValue +
                    " total samples ( " +
                    format(".3f")(100 * (searchSum / totalValue), 3) +
                    "%)";
            }
        };
        searchDetails();
    };
    const originalSearchHandler = searchHandler;

    let searchMatch = (d, term, ignoreCase = false) => {
        if (!term) {
            return false;
        }
        let label = getName(d);
        if (ignoreCase) {
            term = term.toLowerCase();
            label = label.toLowerCase();
        }
        const re = new RegExp(term);
        return typeof label !== "undefined" && label && label.match(re);
    };
    const originalSearchMatch = searchMatch;

    let detailsHandler = function (d) {
        if (detailsElement) {
            if (d) {
                detailsElement.textContent = d;
            } else {
                if (typeof searchDetails === "function") {
                    searchDetails();
                } else {
                    detailsElement.textContent = "";
                }
            }
        }
    };
    const originalDetailsHandler = detailsHandler;

    let labelHandler = function (d) {
        return (
            getName(d) +
            " (" +
            format(".3f")(100 * (d.x1 - d.x0), 3) +
            "%, " +
            getValue(d) +
            " samples)"
        );
    };

    let colorMapper = function (d) {
        return d.highlight ? "#E600E6" : colorHash(getName(d), getLibtype(d));
    };
    const originalColorMapper = colorMapper;

    function colorHash(name, libtype) {
        // Return a color for the given name and library type. The library type
        // selects the hue, and the name is hashed to a color in that hue.

        // default when libtype is not in use
        let hue = colorHue || "warm";

        if (!colorHue && !(typeof libtype === "undefined" || libtype === "")) {
            // Select hue. Order is important.
            hue = "red";
            if (typeof name !== "undefined" && name && name.match(/::/)) {
                hue = "yellow";
            }
            if (libtype === "kernel") {
                hue = "orange";
            } else if (libtype === "jit") {
                hue = "green";
            } else if (libtype === "inlined") {
                hue = "aqua";
            }
        }

        const vector = generateColorVector(name);
        return calculateColor(hue, vector);
    }

    function show(d) {
        d.data.fade = false;
        d.data.hide = false;
        if (d.children) {
            d.children.forEach(show);
        }
    }

    function hideSiblings(node) {
        let child = node;
        let parent = child.parent;
        let children, i, sibling;
        while (parent) {
            children = parent.children;
            i = children.length;
            while (i--) {
                sibling = children[i];
                if (sibling !== child) {
                    sibling.data.hide = true;
                }
            }
            child = parent;
            parent = child.parent;
        }
    }

    function fadeAncestors(d) {
        if (d.parent) {
            d.parent.data.fade = true;
            fadeAncestors(d.parent);
        }
    }

    function zoom(d, node) {
        if (tooltip) tooltip.hide();
        hideSiblings(d);
        show(d);
        fadeAncestors(d);
        update();
        if (scrollOnZoom) {
            const chartOffset = node.parentNode.offsetTop;
            const maxFrames = (window.innerHeight - chartOffset) / c;
            const frameOffset = (d.height - maxFrames + 10) * c;
            window.scrollTo({
                top: chartOffset + frameOffset,
                left: 0,
                behavior: "smooth",
            });
        }
        if (typeof clickHandler === "function") {
            clickHandler(d);
        }
    }

    function searchTree(d, term) {
        const results = [];
        let sum = 0;

        function searchInner(d, foundParent) {
            let found = false;

            if (searchMatch(d, term)) {
                d.highlight = true;
                found = true;
                if (!foundParent) {
                    sum += getValue(d);
                }
                results.push(d);
            } else {
                d.highlight = false;
            }

            if (getChildren(d)) {
                getChildren(d).forEach(function (child) {
                    searchInner(child, foundParent || found);
                });
            }
        }
        searchInner(d, false);

        return [results, sum];
    }

    function findTree(d, id) {
        if (d.id === id) {
            return d;
        } else {
            const children = getChildren(d);
            if (children) {
                for (let i = 0; i < children.length; i++) {
                    const found = findTree(children[i], id);
                    if (found) {
                        return found;
                    }
                }
            }
        }
    }

    function clear(d) {
        d.highlight = false;
        if (getChildren(d)) {
            getChildren(d).forEach(function (child) {
                clear(child);
            });
        }
    }

    function doSort(a, b) {
        if (typeof sort === "function") {
            return sort(a, b);
        } else if (sort) {
            return ascending(getName(a), getName(b));
        }
    }

    const p = partition();

    function filterNodes(root) {
        let nodeList = root.descendants();
        if (minFrameSize > 0) {
            const kx = w / (root.x1 - root.x0);
            nodeList = nodeList.filter(function (el) {
                return (el.x1 - el.x0) * kx > minFrameSize;
            });
        }
        return nodeList;
    }

    function update() {
        selection.each(function (root) {
            const x = scaleLinear().range([0, w]);
            const y = scaleLinear().range([0, c]);

            reappraiseNode(root);

            if (sort) root.sort(doSort);

            p(root);

            const kx = w / (root.x1 - root.x0);
            function width(d) {
                return (d.x1 - d.x0) * kx;
            }

            const descendants = filterNodes(root);
            const svg = select(this).select("svg");
            svg.attr("width", w);

            let g = svg.selectAll("g").data(descendants, function (d) {
                return d.id;
            });

            // if height is not set: set height on first update, after nodes were filtered by minFrameSize
            if (!h || resetHeightOnZoom) {
                let maxDepth = 0;
                for (let i = 0; i < descendants.length; ++i) {
                    if (descendants[i].depth > maxDepth) {
                        maxDepth = descendants[i].depth;
                    }
                }

                h = (maxDepth + 3) * c;
                if (h < minHeight) h = minHeight;

                svg.attr("height", h);
            }

            g.transition()
                .duration(transitionDuration)
                .ease(transitionEase)
                .attr("transform", function (d) {
                    return (
                        "translate(" +
                        x(d.x0) +
                        "," +
                        (inverted ? y(d.depth) : h - y(d.depth) - c) +
                        ")"
                    );
                });

            g.select("rect")
                .transition()
                .duration(transitionDuration)
                .ease(transitionEase)
                .attr("width", width);

            const node = g
                .enter()
                .append("svg:g")
                .attr("transform", function (d) {
                    return (
                        "translate(" +
                        x(d.x0) +
                        "," +
                        (inverted ? y(d.depth) : h - y(d.depth) - c) +
                        ")"
                    );
                });

            node.append("svg:rect")
                .transition()
                .delay(transitionDuration / 2)
                .attr("width", width);

            if (!tooltip) {
                node.append("svg:title");
            }

            node.append("foreignObject").append("xhtml:div");

            // Now we have to re-select to see the new elements (why?).
            g = svg.selectAll("g").data(descendants, function (d) {
                return d.id;
            });

            g.attr("width", width)
                .attr("height", function (_) {
                    return c;
                })
                .attr("name", function (d) {
                    return getName(d);
                })
                .attr("class", function (d) {
                    return d.data.fade ? "frame fade" : "frame";
                });

            g.select("rect")
                .attr("height", function (_) {
                    return c;
                })
                .attr("fill", function (d) {
                    return colorMapper(d);
                });

            if (!tooltip) {
                g.select("title").text(labelHandler);
            }

            g.select("foreignObject")
                .attr("width", width)
                .attr("height", function (_) {
                    return c;
                })
                .style("pointer-events", "none")
                .select("div")
                .attr("class", "d3-flame-graph-label")
                .style("display", function (d) {
                    return width(d) < 35 ? "none" : "block";
                })
                .transition()
                .delay(transitionDuration)
                .text(getName);

            g.on("click", function (event, d) {
                zoom(d, this);
            });

            g.exit().remove();

            g.on("mouseover", function (event, d) {
                if (tooltip) tooltip.show(event, d);
                detailsHandler(labelHandler(d));
                if (typeof hoverHandler === "function") {
                    hoverHandler(d);
                }
            }).on("mouseout", function () {
                if (tooltip) tooltip.hide();
                detailsHandler(null);
            });
        });
    }

    function merge(data, samples) {
        samples.forEach(function (sample) {
            const node = data.find(function (element) {
                return element.name === sample.name;
            });

            if (node) {
                node.value += sample.value;
                if (sample.children) {
                    if (!node.children) {
                        node.children = [];
                    }
                    merge(node.children, sample.children);
                }
            } else {
                data.push(sample);
            }
        });
    }

    function forEachNode(node, f) {
        f(node);
        let children = node.children;
        if (children) {
            const stack = [children];
            let count, child, grandChildren;
            while (stack.length) {
                children = stack.pop();
                count = children.length;
                while (count--) {
                    child = children[count];
                    f(child);
                    grandChildren = child.children;
                    if (grandChildren) {
                        stack.push(grandChildren);
                    }
                }
            }
        }
    }

    function adoptNode(node) {
        let id = 0;
        forEachNode(node, function (n) {
            n.id = id++;
        });
    }

    function reappraiseNode(root) {
        let node,
            children,
            grandChildren,
            childrenValue,
            i,
            j,
            child,
            childValue;
        const stack = [];
        const included = [];
        const excluded = [];
        const compoundValue = !selfValue;
        let item = root.data;
        if (item.hide) {
            root.value = 0;
            children = root.children;
            if (children) {
                excluded.push(children);
            }
        } else {
            root.value = item.fade ? 0 : getValue(item);
            stack.push(root);
        }
        // First DFS pass:
        // 1. Update node.value with node's self value
        // 2. Populate excluded list with children under hidden nodes
        // 3. Populate included list with children under visible nodes
        while ((node = stack.pop())) {
            children = node.children;
            if (children && (i = children.length)) {
                childrenValue = 0;
                while (i--) {
                    child = children[i];
                    item = child.data;
                    if (item.hide) {
                        child.value = 0;
                        grandChildren = child.children;
                        if (grandChildren) {
                            excluded.push(grandChildren);
                        }
                        continue;
                    }
                    if (item.fade) {
                        child.value = 0;
                    } else {
                        childValue = getValue(item);
                        child.value = childValue;
                        childrenValue += childValue;
                    }
                    stack.push(child);
                }
                // Here second part of `&&` is actually checking for `node.data.fade`. However,
                // checking for node.value is faster and presents more oportunities for JS optimizer.
                if (compoundValue && node.value) {
                    node.value -= childrenValue;
                }
                included.push(children);
            }
        }
        // Postorder traversal to compute compound value of each visible node.
        i = included.length;
        while (i--) {
            children = included[i];
            childrenValue = 0;
            j = children.length;
            while (j--) {
                childrenValue += children[j].value;
            }
            children[0].parent.value += childrenValue;
        }
        // Continue DFS to set value of all hidden nodes to 0.
        while (excluded.length) {
            children = excluded.pop();
            j = children.length;
            while (j--) {
                child = children[j];
                child.value = 0;
                grandChildren = child.children;
                if (grandChildren) {
                    excluded.push(grandChildren);
                }
            }
        }
    }

    function processData() {
        selection.datum((data) => {
            if (data.constructor.name !== "Node") {
                // creating a root hierarchical structure
                const root = hierarchy(data, getChildren);

                // augmenting nodes with ids
                adoptNode(root);

                // calculate actual value
                reappraiseNode(root);

                // store value for later use
                root.originalValue = root.value;

                // computing deltas for differentials
                if (computeDelta) {
                    root.eachAfter((node) => {
                        let sum = getDelta(node);
                        const children = node.children;
                        let i = children && children.length;
                        while (--i >= 0) sum += children[i].delta;
                        node.delta = sum;
                    });
                }

                // setting the bound data for the selection
                return root;
            }
        });
    }

    function chart(s) {
        if (!arguments.length) {
            return chart;
        }

        // saving the selection on `.call`
        selection = s;

        // processing raw data to be used in the chart
        processData();

        // create chart svg
        selection.each(function (_) {
            if (select(this).select("svg").size() === 0) {
                const svg = select(this)
                    .append("svg:svg")
                    .attr("width", w)
                    .attr("class", "partition d3-flame-graph");

                if (h) {
                    if (h < minHeight) h = minHeight;
                    svg.attr("height", h);
                }

                svg.append("svg:text")
                    .attr("class", "title")
                    .attr("text-anchor", "middle")
                    .attr("y", "25")
                    .attr("x", w / 2)
                    .attr("fill", "#808080")
                    .text(title);

                if (tooltip) svg.call(tooltip);
            }
        });

        // first draw
        update();
    }

    /**
     * Get or set the graph height.
     * @param {number} [_] - The height in pixels
     * @returns {number|Chart} Height value or chart instance
     */
    chart.height = function (_) {
        if (!arguments.length) {
            return h;
        }
        h = _;
        return chart;
    };

    /**
     * Get or set the minimum graph height.
     * @param {number} [_] - The minimum height in pixels
     * @returns {number|Chart} Min height value or chart instance
     */
    chart.minHeight = function (_) {
        if (!arguments.length) {
            return minHeight;
        }
        minHeight = _;
        return chart;
    };

    /**
     * Get or set the graph width.
     * @param {number} [_] - The width in pixels
     * @returns {number|Chart} Width value or chart instance
     */
    chart.width = function (_) {
        if (!arguments.length) {
            return w;
        }
        w = _;
        return chart;
    };

    /**
     * Get or set the cell height.
     * @param {number} [_] - The cell height in pixels
     * @returns {number|Chart} Cell height value or chart instance
     */
    chart.cellHeight = function (_) {
        if (!arguments.length) {
            return c;
        }
        c = _;
        return chart;
    };

    /**
     * Get or set the tooltip.
     * @param {Function} [_] - Tooltip show/hide function
     * @returns {Function|Chart} Tooltip function or chart instance
     */
    chart.tooltip = function (_) {
        if (!arguments.length) {
            return tooltip;
        }
        if (typeof _ === "function") {
            tooltip = _;
        }
        return chart;
    };

    /**
     * Get or set the graph title.
     * @param {string} [_] - The title text
     * @returns {string|Chart} Title or chart instance
     */
    chart.title = function (_) {
        if (!arguments.length) {
            return title;
        }
        title = _;
        return chart;
    };

    /**
     * Get or set the transition duration.
     * @param {number} [_] - Duration in milliseconds
     * @returns {number|Chart} Duration or chart instance
     */
    chart.transitionDuration = function (_) {
        if (!arguments.length) {
            return transitionDuration;
        }
        transitionDuration = _;
        return chart;
    };

    /**
     * Get or set the transition ease function.
     * @param {Function} [_] - D3 ease function
     * @returns {Function|Chart} Ease function or chart instance
     */
    chart.transitionEase = function (_) {
        if (!arguments.length) {
            return transitionEase;
        }
        transitionEase = _;
        return chart;
    };

    /**
     * Get or set the sort order.
     * @param {boolean|Function} [_] - Boolean or custom sort function
     * @returns {boolean|Function|Chart} Sort value/function or chart instance
     */
    chart.sort = function (_) {
        if (!arguments.length) {
            return sort;
        }
        sort = _;
        return chart;
    };

    /**
     * Get or set the inverted flag (flips graph direction).
     * @param {boolean} [_] - Inverted flag
     * @returns {boolean|Chart} Inverted flag or chart instance
     */
    chart.inverted = function (_) {
        if (!arguments.length) {
            return inverted;
        }
        inverted = _;
        return chart;
    };

    /**
     * Get or set the computeDelta flag.
     * @param {boolean} [_] - Delta computation flag
     * @returns {boolean|Chart} Delta flag or chart instance
     */
    chart.computeDelta = function (_) {
        if (!arguments.length) {
            return computeDelta;
        }
        computeDelta = _;
        return chart;
    };

    /**
     * Get or set the label handler function.
     * @param {Function} [_] - Label handler function
     * @returns {Function|Chart} Label handler or chart instance
     */
    chart.setLabelHandler = function (_) {
        if (!arguments.length) {
            return labelHandler;
        }
        labelHandler = _;
        return chart;
    };
    // Kept for backwards compatibility.
    chart.label = chart.setLabelHandler;

    /**
     * Search the flame graph for nodes matching the given term.
     * @param {string} term - The search term
     */
    chart.search = function (term) {
        const searchResults = [];
        let searchSum = 0;
        let totalValue = 0;
        selection.each(function (data) {
            const res = searchTree(data, term);
            searchResults.push(...res[0]);
            searchSum += res[1];
            totalValue += data.originalValue;
        });
        searchHandler(searchResults, searchSum, totalValue);
        update();
    };

    /**
     * Find a node in the flame graph by its ID.
     * @param {number} id - The node ID
     * @returns {Object|null} The found node or null
     */
    chart.findById = function (id) {
        if (typeof id === "undefined" || id === null) {
            return null;
        }
        let found = null;
        selection.each(function (data) {
            if (found === null) {
                found = findTree(data, id);
            }
        });
        return found;
    };

    /**
     * Clear all highlights and search results.
     */
    chart.clear = function () {
        detailsHandler(null);
        selection.each(function (root) {
            clear(root);
            update();
        });
    };

    /**
     * Zoom to a specific node.
     * @param {Object} d - The node to zoom to
     */
    chart.zoomTo = function (d) {
        zoom(d, selection.node());
    };

    /**
     * Reset zoom to the root node.
     */
    chart.resetZoom = function () {
        selection.each(function (root) {
            zoom(root, selection.node()); // zoom to root
        });
    };

    /**
     * Get or set the click handler.
     * @param {Function} [_] - Click handler function
     * @returns {Function|Chart} Click handler or chart instance
     */
    chart.onClick = function (_) {
        if (!arguments.length) {
            return clickHandler;
        }
        clickHandler = _;
        return chart;
    };

    /**
     * Get or set the hover handler.
     * @param {Function} [_] - Hover handler function
     * @returns {Function|Chart} Hover handler or chart instance
     */
    chart.onHover = function (_) {
        if (!arguments.length) {
            return hoverHandler;
        }
        hoverHandler = _;
        return chart;
    };

    /**
     * Merge additional data into the flame graph.
     * @param {Object} data - The data to merge
     * @returns {Chart} The chart instance
     */
    chart.merge = function (data) {
        if (!selection) {
            return chart;
        }

        // TODO: Fix merge with zoom
        // Merging a zoomed chart doesn't work properly, so
        //  clearing zoom before merge.
        // To apply zoom on merge, we would need to set hide
        //  and fade on new data according to current data.
        // New ids are generated for the whole data structure,
        //  so previous ids might not be the same. For merge to
        //  work with zoom, previous ids should be maintained.
        this.resetZoom();

        // Clear search details
        // Merge requires a new search, updating data and
        //  the details handler with search results.
        // Since we don't store the search term, can't
        //  perform search again.
        searchDetails = null;
        detailsHandler(null);

        selection.datum((root) => {
            merge([root.data], [data]);
            return root.data;
        });
        processData();
        update();
        return chart;
    };

    /**
     * Update the flame graph with new data.
     * @param {Object} [data] - Optional new data to set
     * @returns {Chart} The chart instance
     */
    chart.update = function (data) {
        if (!selection) {
            return chart;
        }
        if (data) {
            selection.datum(data);
            processData();
        }
        update();
        return chart;
    };

    /**
     * Destroy the flame graph and remove all elements.
     * @returns {Chart} The chart instance
     */
    chart.destroy = function () {
        if (!selection) {
            return chart;
        }
        if (tooltip) {
            tooltip.hide();
            if (typeof tooltip.destroy === "function") {
                tooltip.destroy();
            }
        }
        selection.selectAll("svg").remove();
        return chart;
    };

    /**
     * Get or set the color mapper function.
     * @param {Function} [_] - Color mapper function
     * @returns {Function|Chart} Color mapper or chart instance
     */
    chart.setColorMapper = function (_) {
        if (!arguments.length) {
            colorMapper = originalColorMapper;
            return chart;
        }
        colorMapper = (d) => {
            const originalColor = originalColorMapper(d);
            return _(d, originalColor);
        };
        return chart;
    };
    // Kept for backwards compatibility.
    chart.color = chart.setColorMapper;

    /**
     * Get or set the color hue.
     * @param {string} [_] - Color hue (e.g., 'warm', 'red', 'blue')
     * @returns {string|Chart} Color hue or chart instance
     */
    chart.setColorHue = function (_) {
        if (!arguments.length) {
            colorHue = null;
            return chart;
        }
        colorHue = _;
        return chart;
    };

    /**
     * Get or set the minimum frame size.
     * @param {number} [_] - Minimum frame size in pixels
     * @returns {number|Chart} Min frame size or chart instance
     */
    chart.minFrameSize = function (_) {
        if (!arguments.length) {
            return minFrameSize;
        }
        minFrameSize = _;
        return chart;
    };

    /**
     * Get or set the details element.
     * @param {HTMLElement} [_] - DOM element for details
     * @returns {HTMLElement|Chart} Details element or chart instance
     */
    chart.setDetailsElement = function (_) {
        if (!arguments.length) {
            return detailsElement;
        }
        detailsElement = _;
        return chart;
    };
    // Kept for backwards compatibility.
    chart.details = chart.setDetailsElement;

    chart.selfValue = function (_) {
        if (!arguments.length) {
            return selfValue;
        }
        selfValue = _;
        return chart;
    };

    chart.resetHeightOnZoom = function (_) {
        if (!arguments.length) {
            return resetHeightOnZoom;
        }
        resetHeightOnZoom = _;
        return chart;
    };

    chart.scrollOnZoom = function (_) {
        if (!arguments.length) {
            return scrollOnZoom;
        }
        scrollOnZoom = _;
        return chart;
    };

    chart.getName = function (_) {
        if (!arguments.length) {
            return getName;
        }
        getName = _;
        return chart;
    };

    chart.getValue = function (_) {
        if (!arguments.length) {
            return getValue;
        }
        getValue = _;
        return chart;
    };

    chart.getChildren = function (_) {
        if (!arguments.length) {
            return getChildren;
        }
        getChildren = _;
        return chart;
    };

    chart.getLibtype = function (_) {
        if (!arguments.length) {
            return getLibtype;
        }
        getLibtype = _;
        return chart;
    };

    chart.getDelta = function (_) {
        if (!arguments.length) {
            return getDelta;
        }
        getDelta = _;
        return chart;
    };

    chart.setSearchHandler = function (_) {
        if (!arguments.length) {
            searchHandler = originalSearchHandler;
            return chart;
        }
        searchHandler = _;
        return chart;
    };

    chart.setDetailsHandler = function (_) {
        if (!arguments.length) {
            detailsHandler = originalDetailsHandler;
            return chart;
        }
        detailsHandler = _;
        return chart;
    };

    chart.setSearchMatch = function (_) {
        if (!arguments.length) {
            searchMatch = originalSearchMatch;
            return chart;
        }
        searchMatch = _;
        return chart;
    };

    return chart;
}
