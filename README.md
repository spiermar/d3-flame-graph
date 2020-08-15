# d3-flame-graph

A D3.js plugin that produces flame graphs from hierarchical data.

[![Flame Graph Example](https://media.giphy.com/media/l41JMjBaxrZw1bqpi/giphy.gif)](http://spiermar.github.io/d3-flame-graph/)

If you don't know what flame graphs are, check [Brendan Gregg's post](http://www.brendangregg.com/flamegraphs.html).

> Flame graphs are a visualization of profiled software, allowing the most frequent code-paths to be identified quickly and accurately. They can be generated using my open source programs on [github.com/brendangregg/FlameGraph](http://github.com/brendangregg/FlameGraph), which create interactive SVGs.
>
> <cite>Brendan Gregg</cite>

## Examples

Click [here](http://spiermar.github.io/d3-flame-graph/) to check the demo, and [source](https://github.com/spiermar/d3-flame-graph/blob/gh-pages/index.html).

Click [here](http://spiermar.github.io/d3-flame-graph/live.html) to check the animated assembly demo, and [source](https://github.com/spiermar/d3-flame-graph/blob/gh-pages/live.html)

Click [here](http://bl.ocks.org/spiermar/4509343495f8d6e214cb) to check the simplified demo on bl.ocks.org.

## Getting Started

### jsdelivr CDN

Just reference the CDN hosted CSS and JS files!

```html
<head>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/spiermar/d3-flame-graph@4.0.0/dist/d3-flamegraph.css">
</head>
<body>
  <div id="chart"></div>
  <script type="text/javascript" src="https://d3js.org/d3.v4.min.js"></script>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/gh/spiermar/d3-flame-graph@4.0.0/dist/d3-flamegraph.min.js"></script>
  <script type="text/javascript">
  var chart = flamegraph()
    .width(960);

  d3.json("data.json", function(error, data) {
    if (error) return console.warn(error);
    d3.select("#chart")
      .datum(data)
      .call(chart);
  });
  </script>
</body>
```

### NPM

Make sure [Node]() and [npm]() installed on your system.

Install the d3-flame-graph plugin.

```
$ npm install d3-flame-graph --save
```

And use it!

```html
<head>
  <link rel="stylesheet" type="text/css" href="node_modules/d3-flame-graph/dist/d3-flamegraph.css">
</head>
<body>
  <div id="chart"></div>
  <script type="text/javascript" src="node_modules/d3/d3.js"></script>
  <script type="text/javascript" src="node_modules/d3-flame-graph/dist/d3-flamegraph.js"></script>
  <script type="text/javascript">
  var chart = flamegraph()
    .width(960);

  d3.json("data.json", function(error, data) {
    if (error) return console.warn(error);
    d3.select("#chart")
      .datum(data)
      .call(chart);
  });
  </script>
</body>
```

More detailed examples in the [/examples](/examples) directory.

## Input Format

Input stack is a simple hierarchical data structure in JSON format.

```js
{
  "name": "<name>",
  "value": <value>,
  "children": [
    <Object>
  ]
}
```

The [burn](https://github.com/spiermar/burn) CLI tool can convert multiple file formats to this hierarchical data structure.

## Interacting with entries

Internally, the data is transformed into a d3 **hierarchy**.
Functions like `onClick`, `label` and `zoom` expose individual entries as hierarchy Nodes, which wrap the provided data and add more properties:

```
{
  "data": <original user-provided object>,
  "parent": <another hierarchy node>,
  "children": [
    <hierarchy node>
  ],
  "x1": <double>,  // x2 - x1 is the size of this node, as a fraction of the root.
  "x2": <double>
}
```

This is a breaking change from previous versions of d3-flame-graph, which were based on version 3 of the d3 library. See [d3-hierarchy](https://github.com/d3/d3-hierarchy#hierarchy).

## API Reference

<a name="flamegraph" href="#flamegraph">#</a> flamegraph()

Create a new Flame Graph.

<a name="selfValue" href="#selfValue">#</a> flamegraph.<b>selfValue</b>(<i>[enabled]</i>)

Defines if the plugin should use the self value logic to calculate the node value for the Flame Graph frame size. If set to `true`, it will assume the node value from the input callgraph represents only the internal node value, or self value, not the sum of all children. If set to `false` it will assume the value includes the chidren values too. Defaults to `false` if not explicitely set, which if the same behavior 1.x had. 

<a name="width" href="#width">#</a> flamegraph.<b>width</b>(<i>[size]</i>)

Graph width in px. Defaults to 960px if not set. If <i>size</i> is specified, it will set the graph width, otherwise it will return the current graph width.

<a name="height" href="#height">#</a> flamegraph.<b>height</b>(<i>[size]</i>)

Graph height in px. Defaults to the number of cell rows times <a name="cellHeight" href="#cellHeight"><b>cellHeight</b></a> if not set. If <i>size</i> is specified, it will set the cell height, otherwise it will return the current graph height. If <a name="minHeight" href="#minHeight"><b>minHeight</b></a> is specified, and higher than the provided or calculated values, it will override height.

<a name="minHeight" href="#minHeight">#</a> flamegraph.<b>minHeight</b>(<i>[size]</i>)

Minumum graph height in px. If <i>size</i> is specified, and higher than the provided or calculated <i>height</i>, it will override it.

<a name="cellHeight" href="#cellHeight">#</a> flamegraph.<b>cellHeight</b>(<i>[size]</i>)

Cell height in px. Defaults to 18px if not set. If <i>size</i> is specified, it will set the cell height, otherwise it will return the current cell height.

<a name="minFrameSize" href="#minFrameSize">#</a> flamegraph.<b>minFrameSize</b>(<i>[size]</i>)

Minimum size of a frame, in px, to be displayed in the flame graph. Defaults to 0px if not set. If <i>size</i> is specified, it will set the minimum frame size, otherwise it will return the current minimum frame size.

<a name="title" href="#title">#</a> flamegraph.<b>title</b>(<i>[title]</i>)

Title displayed on top of graph. Defaults to empty if not set. If <i>title</i> is specified, it will set the title displayed on the graph, otherwise it will return the current title.

<a name="tooltip" href="#tooltip">#</a> flamegraph.<b>tooltip</b>(<i>[function]</i>)

Sets a tooltip for the flamegraph frames. The tooltip function should implement two methods, `.show(d)` and `.hide()`, that will be called when the tooltip should be made visible or hidden respectively. The `.show` method takes a single argument, which is the flamegraph frame. The <i>d3-flame-graph</i> package includes a simple tooltip function, `flamegraph.tooltip.defaultFlamegraphTooltip()`.

```html
<script type="text/javascript" src="d3-flamegraph-tooltip.js"></script>
```

```js
var tip = flamegraph.tooltip.defaultFlamegraphTooltip()
    .html(function(d) { return "name: " + d.data.name + ", value: " + d.data.value; });
flamegraph.tooltip(tip)
```

The <a name="tooltip" href="#tooltip"><b>tooltip</b></a> is compatible with [d3-tip](https://github.com/Caged/d3-tip). This was the default library until version <i>2.1.10</i>.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3-tip/0.9.1/d3-tip.min.js"></script>
```

```js
var tip = d3.tip()
  .attr('class', 'd3-flame-graph-tip')
  .html(function(d) { return "name: " + d.data.name + ", value: " + d.data.value; });
flamegraph.tooltip(tip)
```

<a name="transitionDuration" href="#transitionDuration">#</a> flamegraph.<b>transitionDuration</b>(<i>[duration]</i>)

Specifies transition duration in milliseconds. The default duration is 750ms. If <i>duration</i> is not specified, returns the current transition duration.

See [d3.duration](https://github.com/mbostock/d3/wiki/Transitions#duration).

<a name="transitionEase" href="#transitionEase">#</a> flamegraph.<b>transitionEase</b>(<i>[ease]</i>)

Specifies the transition easing function. The default easing function is `d3.easeCubic`.

See [d3-ease](https://github.com/d3/d3-ease).

<a name="label" href="#label">#</a> flamegraph.<b>label</b>(<i>[function]</i>)

Adds a function that returns a formatted label. Example:

```js
flamegraph.label(function(d) {
    return "name: " + d.name + ", value: " + d.value;
});
```

<a name="sort" href="#sort">#</a> flamegraph.<b>sort</b>(<i>[enabled]</i>)

Enables/disables sorting of children frames. Defaults to <i>true</i> if not set to sort in ascending order by frame's name. If set to a function, the function takes two frames (a,b) and returns -1 if frame a is less than b, 1 if greater, or 0 if equal. If a value is specified, it will enable/disable sorting, otherwise it will return the current sort configuration.

<a name="inverted" href="#inverted">#</a> flamegraph.<b>inverted</b>(<i>[bool]</i>)

Invert the flame graph direction. A top-down visualization of the flame graph, also known as _icicle_ plot. Defaults to <i>false</i> if not set. If a value is specified, it will enable/disable the inverted flame graphs direction, otherwise it will return the current inverted configuration.

<a name="computeDelta" href="#computeDelta">#</a> flamegraph.<b>computeDelta</b>(<i>[bool]</i>)

If enabled, computes delta for all nodes. Delta value of each node is a sum if its own value from the <i>getDelta(node)</i> function, plus its children. Defaults to <i>false</i> if not set. If a value is specified, it will enable/disable the delta computation, otherwise it will return the current inverted configuration.

<a name="resetZoom" href="#resetZoom">#</a> flamegraph.<b>resetZoom</b>()

Resets the zoom so that everything is visible.

<a name="onClick" href="#onClick">#</a> flamegraph.<b>onClick</b>(<i>[function]</i>)

Adds a function that will be called when the user clicks on a frame. Example:

```js
flamegraph.onClick(function (d) {
    console.info("You clicked on frame "+ d.data.name);
});
```

If called with no arguments, `onClick` will return the click handler. 

<a name="setDetailsElement" href="#setDetailsElement">#</a> flamegraph.<b>setDetailsElement</b>(<i>[element]</i>)

Sets the element that should be updated with the focused sample details text. Example:

```html
<div id="details">
</div>
```

```js
flamegraph.setDetailsElement(document.getElementById("details"));
```

If called with no arguments, `setDetailsElement` will return the current details element.

<a name="setDetailsHandler" href="#setDetailsHandler">#</a> flamegraph.<b>setDetailsHandler</b>(<i>[function]</i>)

Sets the handler function that is called when the `details` element needs to be updated. The function receives a single paramenter, the details text to be set. Example:

```js
flamegraph.setDetailsHandler(
  function (d) {
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
);
```

If not set, `setDetailsHandler` will default to the above function.

If called with no arguments, `setDetailsHandler` will reset the details handler function. 

<a name="setSearchHandler" href="#setSearchHandler">#</a> flamegraph.<b>setSearchHandler</b>(<i>[function]</i>)

Sets the handler function that is called when search results are returned. The function receives a three paramenters, the search results array, the search sample sum, and root value, Example:

```js
flamegraph.setSearchHandler(
  function (searchResults, searchSum, totalValue) {
    if (detailsElement) { detailsElement.innerHTML = `${searchSum} of ${totalValue} samples (${format('.3f')(100 * (searchSum / totalValue), 3)}%)`}
  }
);
```

If not set, `setSearchHandler` will default to the above function.

If called with no arguments, `setSearchHandler` will reset the search handler function.

<a name="setColorMapper" href="#setColorMapper">#</a> flamegraph.<b>setColorMapper</b>(<i>[function]</i>)

Replaces the built-in node color hash function. Function takes two arguments, the node data structure and the original color string for that node. It must return a color string. Example:

```js
// Purple if highlighted, otherwise the original color
flamegraph.setColorMapper(function(d, originalColor) {
    return d.highlight ? "#E600E6" : originalColor;
});
```

If called with no arguments, `setColorMapper` will reset the color hash function.

<a name="setColorHue" href="#setColorHue">#</a> flamegraph.<b>setColorHue</b>(<i>[string]</i>)

Sets the flame graph color hue. Options are `warm`, `cold`, `red`, `orange`, `yellow`, `green` and `aqua`.

If called with no arguments, `setColorHue` will reset the color hash function.

<a name="setSearchMatch" href="#setSearchMatch">#</a> flamegraph.<b>setSearchMatch</b>(<i>[function]</i>)

Replaces the built-in node search match function. Function takes three arguments,
the node data structure, the search term and an optional boolean argument to ignore case during search. If the third argument is not provided, the search will be case-sensitive by default. The function must return a boolean. Example:

```js
flamegraph.setSearchMatch(function(d, term, true) {
  // Non-regex implementation of the search function
  return d.data.name.indexOf(term) != 0;
})
```

If called with no arguments, `setSearchMatch` will return reset the search
match function.

<a name="merge" href="#merge">#</a> flamegraph.<b>merge</b>(<i>samples</i>)

Merges the current nodes with the given nodes.

<a name="update" href="#update">#</a> flamegraph.<b>update</b>(<i>samples</i>)

Updates (replaces) the current set of nodes with the given nodes.

<a name="destroy" href="#destroy">#</a> flamegraph.<b>destroy</b>()

Removes the flamegraph.

**All API functions will return the flame graph object if no other behavior is specified in the function details.**

## Issues

For bugs, questions and discussions please use the [GitHub Issues](https://github.com/spiermar/d3-flame-graph/issues).

## Contributing

We love contributions! But in order to avoid total chaos, we have a few guidelines.

If you found a bug, have questions or feature requests, don't hesitate to open an [issue](https://github.com/spiermar/d3-flame-graph/issues).

If you're working on an issue, please comment on it so we can assign you to it.

If you have code to submit, follow the general pull request format. Fork the repo, make your changes, and submit a [pull request](https://github.com/spiermar/d3-flame-graph/pulls).

### Build

This plugin uses Webpack as build system. It includes a development server with live refresh on any changes. To start it, just execute the `serve` npm script.

```
$ git clone https://github.com/spiermar/d3-flame-graph.git
$ cd d3-flame-graph
$ npm install
$ npm run serve
```

### Template

A standalone template with all JavaScript and CSS inlined gets built at `dist/templates/d3-flamegraph-base.html`.
It contains a placeholder `/** @flamegraph_params **/` which needs to be replaced with the stacks in the format described in [Input Format](#input-format).

## License

Copyright 2018 Martin Spier. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with the License. You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
