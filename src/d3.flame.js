(function() {
  'use strict';

  function flame() {

    var container = null,
      w = 1200, // graph width
      h = 600, // graph height
      c = 18, // cell height
      tooltip = true; // enable tooltip

    function label(d) {
      return d.name + " (" + d3.round(100 * d.dx, 3) + "%, " + d.value + " samples)";
    }
    function name(d) {
      return d.name;
    }

    function hash(name) {
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

    function color_hash(name) {
      // Return an rgb() color string that is a hash of the provided name,
      // and with a warm palette.
      var vector = 0;
      if (name) {
        name = name.replace(/.*`/, "");		// drop module name if present
        name = name.replace(/\(.*/, "");	// drop extra info
        vector = hash(name);
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
        var child_values = 0;
        root.children.forEach(function(child) {
          child_values += child.value;
        });
        if (child_values < root.value) {
          root.children.push(
            {
              "name": null,
              "value": root.value - child_values,
              "dummy": true
            }
          )
        }
      }
    }

    var partition = d3.layout.partition()
      .sort(function(a, b) {return d3.ascending(a.name, b.name)})
      .value(function(d) {return d.v || d.value;})
      .children(function(d) {return d.c || d.children;});

    function flameGraph(selector) {
      if (!arguments.length) return flameGraph;
        var x = d3.scale.linear().range([0, w]),
          y = d3.scale.linear().range([0, c]);

        selector.each(function(data) {
          container = d3.select(this).append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .attr("id", "container")
            .append("svg:g")
            .attr("class", "partition");

          augment(data);
          var nodes = partition(data);
          var kx = w / data.dx;

          if (tooltip) {
            var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return label(d); });
            container.call(tip);
          }

          var g = container.selectAll("rect")
            .data(nodes)
            .enter()
            .append("svg:g")
            .attr("width", function(d) { return d.dx * kx })
            .attr("height", function(d) { return c; })
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (h - y(d.depth) - c) + ")"; })
            .attr("class", "frame")
            .attr("name", function(d) { return d.name; });

          if (tooltip) {
            g.on('mouseover', tip.show).on('mouseout', tip.hide);
          }

          g.append("svg:rect")
            .attr("width", function(d) { return d.dx * kx })
            .attr("height", function(d) { return c; })
            .attr("fill", function(d) {return color_hash(d.name); })
            .style("opacity", function(d) {return d.dummy ? 0 : 1;})

          g.each(function(d) {
            if (!d.dummy) {
              var thisGroup = d3.select(this);
              thisGroup.append("svg:title").text(label);
              thisGroup.append("foreignObject")
                .attr("class", "foreignObject")
                .attr("width", function (d) { return d.dx * kx; })
                .attr("height", function (d) { return c; })
                .append("xhtml:div")
                .attr("class", "label")
                .style("display", function (d) { return d.dx * kx < 35 ? "none" : "block";})
                .text(name)
            }
          });
        });

    }

    flameGraph.height = function (_) {
      if (!arguments.length) { return h; }
      h = _;
      return flameGraph;
    }

    flameGraph.width = function (_) {
      if (!arguments.length) { return w; }
      w = _;
      return flameGraph;
    }

    flameGraph.cellHeight = function (_) {
      if (!arguments.length) { return c; }
      c = _;
      return flameGraph;
    }

    flameGraph.tooltip = function (_) {
      if (!arguments.length) { return tooltip; }
      tooltip = _;
      return flameGraph;
    }

    return flameGraph;
  }

  if (typeof module !== 'undefined' && module.exports){
		module.exports = flame;
	}
	else {
		d3.flame = flame;
	}
})();
