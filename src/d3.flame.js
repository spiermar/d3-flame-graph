(function() {
  'use strict';

  function flame() {

    var container = null,
      w = 1200, // graph width
      h = 600, // graph height
      c = 18, // cell height
      tooltip = true, // enable tooltip
      title = ""; // graph title

    function label(d) {
      if (!d.dummy) {
        return d.name + " (" + d3.round(100 * d.dx, 3) + "%, " + d.value + " samples)";
      } else {
        return "";
      }
    }

    function name(d) {
      return d.name;
    }

    function generateHash(name) {
      // Return a vector (0.0->1.0) that is a hash of the input string.
      // The hash is computed to favor early characters over later ones, so
      // that strings with similar starts have similar vectors. Only the first
      // 6 characters are considered.
      var hash = 0, weight = 1, max_hash = 0, mod = 10, max_char = 6;
      if (name) {
        for (var i = 0; i < name.length; i++) {
          if (i > max_char) { break; }
          hash += weight * (name.charCodeAt(i) % mod);
          max_hash += weight * (mod - 1);
          weight *= 0.70;
        }
        if (max_hash > 0) { hash = hash / max_hash; }
      }
      return hash;
    }

    function colorHash(name) {
      // Return an rgb() color string that is a hash of the provided name,
      // and with a warm palette.
      var vector = 0;
      if (name) {
        name = name.replace(/.*`/, "");		// drop module name if present
        name = name.replace(/\(.*/, "");	// drop extra info
        vector = generateHash(name);
      }
      var r = 200 + Math.round(55 * vector);
      var g = 0 + Math.round(230 * (1 - vector));
      var b = 0 + Math.round(55 * (1 - vector));
      return "rgb(" + r + "," + g + "," + b + ")";
    }

    function augment(root) {
      // Augment partitioning layout with "dummy" nodes so that internal nodes'
      // values dictate their width. Annoying, but seems to be least painful
      // option.  https://github.com/mbostock/d3/pull/574
      if (root.children && (root.children.length > 0)) {
        root.children.forEach(augment);
        var childValues = 0;
        root.children.forEach(function(child) {
          childValues += child.value;
        });
        if (childValues < root.value) {
          root.children.push(
            {
              "name": "",
              "value": root.value - childValues,
              "dummy": true
            }
          );
        }
      }
    }

    var partition = d3.layout.partition()
      .sort(function(a, b) {return d3.ascending(a.name, b.name);})
      .value(function(d) {return d.v || d.value;})
      .children(function(d) {return d.c || d.children;});

    function flameGraph(selector) {
      if (!arguments.length) return flameGraph;
        var x = d3.scale.linear().range([0, w]),
            y = d3.scale.linear().range([0, c]);

        selector.each(function(data) {

          function hide(d) {
            if(!d.original) {
              d.original = d.value;
            }
            d.value = 0;
            if(d.children) {
              d.children.forEach(hide);
            }
          }

          function show(d) {
            d.flag = false;
            if(d.original) {
              d.value = d.original
            }
            if(d.children) {
              d.children.forEach(show);
            }
          }

          function getSiblings(d) {
            var siblings = []
            if (d.parent) {
              var me = d.parent.children.indexOf(d);
              siblings = d.parent.children.slice(0);
              siblings.splice(me, 1);
            }
            return siblings;
          }

          function hideSiblings(d) {
            var siblings = getSiblings(d);
            siblings.forEach(function(s) {
              hide(s);
            })
            if(d.parent) {
              hideSiblings(d.parent);
            }
          }

          function flagAncestors(d) {
            if(d.parent) {
              d.parent.flag = true;
              flagAncestors(d.parent);
            }
          }

          function zoom(d) {
            hideSiblings(d);
            show(d);
            flagAncestors(d);
            update(data);
          }

          container = d3.select(this).append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .attr("class", "partition");

          container.append("svg:text")
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .attr("y", "25")
            .attr("x", w/2)
            .attr("fill", "#808080")
            .text(title);

          augment(data);

          function update(root) {

            var nodes = partition(root),
                kx = w / root.dx;

            // create new elements as needed
            var svg = container.selectAll("g").data(nodes);

            // update old elements with new data
            svg.attr("width", function(d) { return d.dx * kx; })
             .attr("height", function(d) { return c; })
             .attr("name", function(d) { return d.name; })
             .attr("class", function(d) { return d.flag ? "frame flag" : "frame"; })
             .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (h - y(d.depth) - c) + ")"; });

            svg.select("rect")
             .attr("width", function(d) { return d.dx * kx; })
             .attr("height", function(d) { return c; })
             .attr("fill", function(d) { return colorHash(d.name); })
             .style("visibility", function(d) { return d.dummy ? "hidden" : "visible";});

            svg.select("title").text(label);

            svg.select("foreignObject")
              .attr("width", function (d) { return d.dx * kx; })
              .attr("height", function (d) { return c; })
              .select("div")
              .attr("class", "label")
              .style("display", function(d) { return (d.dx * kx < 35) || d.dummy ? "none" : "block";})
              .text(name);

            // and join new data with old elements, if any.
            var g = svg.enter().append("svg:g")
              .attr("width", function(d) { return d.dx * kx; })
              .attr("height", function(d) { return c; })
              .attr("name", function(d) { return d.name; })
              .attr("class", function(d) { return d.flag ? "frame flag" : "frame"; })
              .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (h - y(d.depth) - c) + ")"; })
              .on('click', zoom);

            g.append("svg:rect")
              .attr("width", function(d) { return d.dx * kx; })
              .attr("height", function(d) { return c; })
              .attr("fill", function(d) {return colorHash(d.name); })
              .style("visibility", function(d) {return d.dummy ? "hidden" : "visible";});

            g.append("svg:title")
              .text(label);

            g.append("foreignObject")
              .attr("width", function(d) { return d.dx * kx; })
              .attr("height", function(d) { return c; })
              .append("xhtml:div")
              .attr("class", "label")
              .style("display", function(d) { return (d.dx * kx < 35) || d.dummy ? "none" : "block";})
              .text(name);

            // remove old elements as needed.
            svg.exit().remove();

            // including tooltip
            if (tooltip) {
              var tip = d3.tip()
                .attr('class', 'd3-tip')
                .html(function(d) { return label(d); });
              container.call(tip);
              g.on('mouseover', function(d) {
                if(!d.dummy) { tip.show(d); }

              }).on('mouseout', function(d) {
                if(!d.dummy) { tip.hide(d); }
              });
            }
          }

          // first draw
          update(data);

        });
    }

    flameGraph.height = function (_) {
      if (!arguments.length) { return h; }
      h = _;
      return flameGraph;
    };

    flameGraph.width = function (_) {
      if (!arguments.length) { return w; }
      w = _;
      return flameGraph;
    };

    flameGraph.cellHeight = function (_) {
      if (!arguments.length) { return c; }
      c = _;
      return flameGraph;
    };

    flameGraph.tooltip = function (_) {
      if (!arguments.length) { return tooltip; }
      tooltip = _;
      return flameGraph;
    };

    flameGraph.title = function (_) {
      if (!arguments.length) { return title; }
      title = _;
      return flameGraph;
    };

    return flameGraph;
  }

  if (typeof module !== 'undefined' && module.exports){
		module.exports = flame;
	}
	else {
		d3.flame = flame;
	}
})();
