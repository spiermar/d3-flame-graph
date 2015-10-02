function highlight(elem) {
    elem.firstChild.style.fill = "red";
}

function clear(elem) {
    elem.firstChild.style.fill = "";
}

function highlight_repeats(elem) {
    var matches = document.getElementsByName(elem.name);
    if (matches) {
        [].forEach.call(matches, highlight);
    }
}

function clear_repeats(elem) {
    var matches = document.getElementsByName(elem.name);
    if (matches) {
        [].forEach.call(matches, clear);
    }
}

function s(elem) {
    highlight_repeats(elem);
    details = document.getElementById("details");
    details.innerText = label(elem);
}

function c(elem) {
    clear_repeats(elem);
    details = document.getElementById("details");
    details.innerText = "";
}

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


d3.select("#filter").on("keyup", function() {
    var query = this.value;

    [].forEach.call(document.getElementsByClassName("frame"), clear);
    matches = document.querySelectorAll('[name*=' + query + ']');
    if (matches) {
        [].forEach.call(matches, highlight);
    }
})

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

var w = 1200;
  h = 600,
  frameheight = 18;
  x = d3.scale.linear().range([0, w]),
  y = d3.scale.linear().range([0, frameheight]);

// Support more concise JSON keys
var partition = d3.layout.partition()
  .sort(function(a, b) {return d3.ascending(a.name, b.name)})
  .value(function(d) {return d.v || d.value;})
  .children(function(d) {return d.c || d.children;});


d3.json("/stack.json" + location.search, function(root) {
    augment(root);
    var nodes = partition(root);
    var kx = w / root.dx;

    var g = d3.select("svg g.partition")
      .selectAll("rect")
      .data(nodes)
      .enter()
      .append("svg:g")
      .attr("width", function(d) { return d.dx * kx })
      .attr("height", function(d) { return frameheight; })
      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (h - y(d.depth)) + ")"; })
      .attr("class", "frame")
      .attr("name", function(d) { return d.name; })
      .on('mouseenter', s)
      .on('mouseleave', c)

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
