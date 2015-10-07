(function() {
  function flame() {

    var container = null,
      w = 1200,
      h = 600,
      frameheight = 18;

    function label(d) {
      return d.name + " (" + d3.round(100 * d.dx, 3) + "%, " + d.value + " samples)";
    }

    function color(name) {

      var hash = 0, i, chr, len;
      if (name) {
        for (i = 0, len = name.length; i < len; i++) {
          if (name[i] == '(') { break; }
          chr = name.charCodeAt(i);
          hash  = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
      }
      hash = Math.abs((hash % 256) / 256.);
      var r = 50 + Math.round(60 * hash);
      var gb = 135 + Math.round(90 * hash);
      return "rgb(" + r + "," + gb + "," + gb + ")";
    }

    function augment(root) {
      // Augment partitioning layout with "dummy" nodes so that internal nodes'
      // values dictate their width. Annoying, but seems to be least painful
      // option.  https://github.com/mbostock/d3/pull/574
      if (root.children && (n = root.children.length)) {
        root.children.forEach(augment);
        var child_values = 0;
        root.children.forEach(function(child) {
          child_values += child.value;
        });
        if (child_values < root.value) {
          root.children.push(
            {"name": null,
            "value": root.value - child_values,
            "dummy": true}
          )
        }
      }
    }

    // Support more concise JSON keys
    var partition = d3.layout.partition()
      .sort(function(a, b) {return d3.ascending(a.name, b.name)})
      .value(function(d) {return d.v || d.value;})
      .children(function(d) {return d.c || d.children;});

    function flameGraph(selector) {
      if (!arguments.length) return flameGraph;
        var x = d3.scale.linear().range([0, w]),
          y = d3.scale.linear().range([0, frameheight]);

        selector.each(function(data) {
          container = d3.select(this);

          augment(data);
          var nodes = partition(data);
          var kx = w / data.dx;

          var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return label(d); });

          container.call(tip);

          var g = container.selectAll("rect")
            .data(nodes)
            .enter()
            .append("svg:g")
            .attr("width", function(d) { return d.dx * kx })
            .attr("height", function(d) { return frameheight; })
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (h - y(d.depth)) + ")"; })
            .attr("class", "frame")
            .attr("name", function(d) { return d.name; })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

          rect = g.append("svg:rect")
            .attr("width", function(d) { return d.dx * kx })
            .attr("height", function(d) { return frameheight; })
            .attr("fill", function(d) {return color(d.name); })
            .style("opacity", function(d) {return d.dummy ? 0 : 1;})

          g.each(function(d) {
            if (!d.dummy) {
              var thisGroup = d3.select(this);
              thisGroup.append("svg:title").text(label);
              thisGroup.append("foreignObject")
                .attr("class", "foreignObject")
                .attr("width", function (d) { return d.dx * kx; })
                .attr("height", function (d) { return frameheight; })
                .append("xhtml:div")
                .attr("class", "label")
                .style("display", function (d) { return d.dx * kx < 25 ? "none" : "block";})
                .text(label)
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

    return flameGraph;
  }

  if (typeof module !== 'undefined' && module.exports){
		module.exports = flame;
	}
	else {
		d3.layout.flame = flame;
	}
})();
