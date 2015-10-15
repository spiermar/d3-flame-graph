(function() {
  'use strict';

  function flameGraph() {

    var container = null,
      w = 1200, // graph width
      h = 600, // graph height
      c = 18, // cell height
      tooltip = true, // enable tooltip
      title = "", // graph title
      tooltipDirection = "s", // tooltip direction
      tooltipOffset = [26, 0],
      transitionDuration = 750,
      transitionEase = "cubic-in-out"; // tooltip offset

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

    function searchTree(d, term) {
      var re = new RegExp(term),
          label = d.name;

      if (d.children) {
        d.children.forEach(function(child) {
          searchTree(child, term);
        });
      }

      if (label.match(re)) {
        d.highlight = true;
      }
    }

    var partition = d3.layout.partition()
      .sort(function(a, b) {return d3.ascending(a.name, b.name);})
      .value(function(d) {return d.v || d.value;})
      .children(function(d) {return d.c || d.children;});

    var testData = null;

    function chart(selector) {
      if (!arguments.length) return chart;
        var x = d3.scale.linear().range([0, w]),
            y = d3.scale.linear().range([0, c]);

        var tip = d3.tip()
          .direction(tooltipDirection)
          .offset(tooltipOffset)
          .attr('class', 'd3-tip')
          .html(function(d) { return label(d); });

        //TODO: switch to var data = selector.data()

        selector.each(function(data) {

          testData = data;

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
            d.fade = false;
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

          function fadeAncestors(d) {
            if(d.parent) {
              d.parent.fade = true;
              fadeAncestors(d.parent);
            }
          }

          function zoom(d) {
            tip.hide(d);
            hideSiblings(d);
            show(d);
            fadeAncestors(d);
            update(data);
          }

          container = d3.select(this).append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .attr("class", "partition")
            .call(tip);

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
            var g = container.selectAll("g").data(nodes);

            // update old elements with new data
            g.attr("width", function(d) { return d.dx * kx; })
             .attr("height", function(d) { return c; })
             .attr("name", function(d) { return d.name; })
             .attr("class", function(d) { return d.fade ? "frame fade" : "frame"; })
             .transition()
             .duration(transitionDuration)
             .ease(transitionEase)
             .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (h - y(d.depth) - c) + ")"; });


            g.select("rect")
             .attr("height", function(d) { return c; })
             .attr("fill", function(d) { return d.highlight ? "red" : colorHash(d.name); })
             .style("visibility", function(d) { return d.dummy ? "hidden" : "visible";})
             .transition()
             .duration(transitionDuration)
             .ease(transitionEase)
             .attr("width", function(d) { return d.dx * kx; });

            g.select("title").text(label);

            g.select("foreignObject")
              .attr("width", function (d) { return d.dx * kx; })
              .attr("height", function (d) { return c; })
              .select("div")
              .attr("class", "label")
              .style("display", function(d) { return (d.dx * kx < 35) || d.dummy ? "none" : "block";})
              .text(name);

            // and join new data with old elements, if any.
            var node = g.enter().append("svg:g")
              .attr("width", function(d) { return d.dx * kx; })
              .attr("height", function(d) { return c; })
              .attr("name", function(d) { return d.name; })
              .attr("class", function(d) { return d.fade ? "frame fade" : "frame"; })
              .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (h - y(d.depth) - c) + ")"; })
              .on('click', zoom);

            node.append("svg:rect")
              .attr("height", function(d) { return c; })
              .attr("fill", function(d) {return colorHash(d.name); })
              .style("visibility", function(d) {return d.dummy ? "hidden" : "visible";})
              .attr("width", function(d) { return d.dx * kx; });

            node.append("svg:title")
              .text(label);

            node.append("foreignObject")
              .attr("width", function(d) { return d.dx * kx; })
              .attr("height", function(d) { return c; })
              .append("xhtml:div")
              .attr("class", "label")
              .style("display", function(d) { return (d.dx * kx < 35) || d.dummy ? "none" : "block";})
              .text(name);

            // remove old elements as needed.
            g.exit().remove();

            // including tooltip
            if (tooltip) {
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

    chart.height = function (_) {
      if (!arguments.length) { return h; }
      h = _;
      return chart;
    };

    chart.width = function (_) {
      if (!arguments.length) { return w; }
      w = _;
      return chart;
    };

    chart.cellHeight = function (_) {
      if (!arguments.length) { return c; }
      c = _;
      return chart;
    };

    chart.tooltip = function (_) {
      if (!arguments.length) { return tooltip; }
      tooltip = _;
      return chart;
    };

    chart.title = function (_) {
      if (!arguments.length) { return title; }
      title = _;
      return chart;
    };

    chart.tooltipDirection = function (_) {
      if (!arguments.length) { return tooltipDirection; }
      tooltipDirection = _;
      return chart;
    };

    chart.tooltipOffset = function (_) {
      if (!arguments.length) { return tooltipOffset; }
      tooltipOffset = _;
      return chart;
    };

    chart.transitionDuration = function (_) {
      if (!arguments.length) { return transitionDuration; }
      transitionDuration = _;
      return chart;
    };

    chart.transitionEase = function (_) {
      if (!arguments.length) { return transitionEase; }
      transitionEase = _;
      return chart;
    };

    chart.search = function(term) {
      searchTree(testData, term);
      // TODO: update chart
    };

    return chart;
  }

  if (typeof module !== 'undefined' && module.exports){
		module.exports = flameGraph;
	}
	else {
		d3.flameGraph = flameGraph;
	}
})();
