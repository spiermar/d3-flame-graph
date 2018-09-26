# d3-flame-graph

A D3.js plugin that produces flame graphs from hierarchical data.

[![Flame Graph Example](https://media.giphy.com/media/l41JMjBaxrZw1bqpi/giphy.gif)](http://spiermar.github.io/d3-flame-graph/)

If you don't know what flame graphs are, check [Brendan Gregg's post](http://www.brendangregg.com/flamegraphs.html).

> Flame graphs are a visualization of profiled software, allowing the most frequent code-paths to be identified quickly and accurately. They can be generated using my open source programs on [github.com/brendangregg/FlameGraph](http://github.com/brendangregg/FlameGraph), which create interactive SVGs.
>
> <cite>Brendan Gregg</cite>

## Examples

Click [here](http://spiermar.github.io/d3-flame-graph/) to check the demo, and [source](https://github.com/spiermar/d3-flame-graph/blob/gh-pages/index.html).

Click [here](http://spiermar.github.io/d3-flame-graph/differential.html) to check the differential flame graph demo, and [source](https://github.com/spiermar/d3-flame-graph/blob/gh-pages/differential.html)

Click [here](http://spiermar.github.io/d3-flame-graph/live.html) to check the animated assembly demo, and [source](https://github.com/spiermar/d3-flame-graph/blob/gh-pages/live.html)

Click [here](http://bl.ocks.org/spiermar/4509343495f8d6e214cb) to check the simplified demo on bl.ocks.org.

## Getting Started

### jsdelivr CDN

Just reference the CDN hosted CSS and JS files!

```html
<head>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/spiermar/d3-flame-graph@2.0.3/dist/d3-flamegraph.css">
</head>
<body>
  <div id="chart"></div>
  <script type="text/javascript" src="https://d3js.org/d3.v4.min.js"></script>
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3-tip/0.9.1/d3-tip.min.js"></script>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/gh/spiermar/d3-flame-graph@2.0.3/dist/d3-flamegraph.min.js"></script>
  <script type="text/javascript">
  var flamegraph = d3.flamegraph()
    .width(960);

  d3.json("data.json", function(error, data) {
    if (error) return console.warn(error);
    d3.select("#chart")
      .datum(data)
      .call(flamegraph);
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
  <script type="text/javascript" src="node_modules/d3-tip/index.js"></script>
  <script type="text/javascript" src="node_modules/d3-flame-graph/dist/d3-flamegraph.js"></script>
  <script type="text/javascript">
  var flamegraph = d3.flamegraph()
    .width(960);

  d3.json("data.json", function(error, data) {
    if (error) return console.warn(error);
    d3.select("#chart")
      .datum(data)
      .call(flamegraph);
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

<a name="flamegraph" href="#flamegraph">#</a> d3.flamegraph()

Create a new Flame Graph.

<a name="selfValue" href="#selfValue">#</a> flamegraph.<b>selfValue</b>(<i>[enabled]</i>)

Defines if the plugin should use the self value logic to calculate the node value for the Flame Graph frame size. If set to `true`, it will assume the node value from the input callgraph represents only the internal node value, or self value, not the sum of all children. If set to `false` it will assume the value includes the chidren values too. Defaults to `false` if not explicitely set, which if the same behavior 1.x had. 

<a name="width" href="#width">#</a> flamegraph.<b>width</b>(<i>[size]</i>)

Graph width in px. Defaults to 960px if not set. If <i>size</i> is specified, it will set the graph width, otherwise it will return the current graph width.

<a name="height" href="#height">#</a> flamegraph.<b>height</b>(<i>[size]</i>)

Graph height in px. Defaults to the number of cell rows times <a name="cellHeight" href="#cellHeight"><b>cellHeight</b></a> if not set. If <i>size</i> is specified, it will set the cell height, otherwise it will return the current graph height.

<a name="cellHeight" href="#cellHeight">#</a> flamegraph.<b>cellHeight</b>(<i>[size]</i>)

Cell height in px. Defaults to 18px if not set. If <i>size</i> is specified, it will set the cell height, otherwise it will return the current cell height.

<a name="minFrameSize" href="#minFrameSize">#</a> flamegraph.<b>minFrameSize</b>(<i>[size]</i>)

Minimum size of a frame, in px, to be displayed in the flame graph. Defaults to 0px if not set. If <i>size</i> is specified, it will set the minimum frame size, otherwise it will return the current minimum frame size.

<a name="title" href="#title">#</a> flamegraph.<b>title</b>(<i>[title]</i>)

Title displayed on top of graph. Defaults to empty if not set. If <i>title</i> is specified, it will set the title displayed on the graph, otherwise it will return the current title.

<a name="tooltip" href="#tooltip">#</a> flamegraph.<b>tooltip</b>(<i>[enabled]</i>)

Enables/disables display of tooltips on frames. Defaults to <i>true</i> if not set. It can be set to a [d3-tip configurable function](https://github.com/Caged/d3-tip/blob/master/docs/initializing-tooltips.md), which will replace the default function and display a fully customized tooltip. Else, if a truthy value, uses a default label function. If a value is specified, it will enable/disable tooltips, otherwise it will return the current tooltip configuration.

Class should be specified in order to correctly render the tooltip. The default "d3-flame-graph-tip" is available for use too.

```js
.attr('class', 'd3-flame-graph-tip')
```

See [d3-tip](https://github.com/Caged/d3-tip/tree/master/docs) for more details.

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

<a name="inverted" href="#inverted">#</a> flamegraph.<b>inverted</b>(<i>[inverted]</i>)

Invert the flame graph direction. A top-down visualization of the flame graph, also known as _icicle_ plot. Defaults to <i>false</i> if not set. If a value is specified, it will enable/disable the inverted flame graphs direction, otherwise it will return the current inverted configuration.

<a name="inverted" href="#inverted">#</a> flamegraph.<b>differential</b>(<i>[differential]</i>)

Use the _differential_ color hash. Frames are sized according to their `value` but colored based on the `delta` property. Blue for negative numbers, red for positive numbers.

<a name="elided" href="#elided">#</a> flamegraph.<b>elided</b>(<i>[elided]</i>)

Use the _elided_ color hash to show elided frames in a differential heat map. The _elided_ color hash is _cold / blue_ to differentiate from the regular _warm_ palette.

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

Replaces the built-in node color hash function. Function takes a single argument, the node data structure, and returns a color string. Example:

```js
// Purple if highlighted, otherwise a static blue.
flamegraph.setColorMapper(function(d) {
    return d.highlight ? "#E600E6" : "#0A5BC4";
});
```

If called with no arguments, `setColorMapper` will return reset the color hash function.

**All API functions will return the flame graph object if no other behavior is specified in the function details.**

## Issues

For bugs, questions and discussions please use the [GitHub Issues](https://github.com/spiermar/d3-flame-graph/issues).

## Contributing

We love contributions! But in order to avoid total chaos, we have a few guidelines.

If you found a bug, have questions or feature requests, don't hesitate to open an [issue](https://github.com/spiermar/d3-flame-graph/issues).

If you're working on an issue, please comment on it so we can assign you to it.

If you have code to submit, follow the general pull request format. Fork the repo, make your changes, and submit a [pull request](https://github.com/spiermar/d3-flame-graph/pulls).

### Gulp.js

This plugin uses Gulp.js as build system. A few tasks are already defined, including browser-sync that can be used for development. To start it, just execute the `serve` task.

```
$ git clone https://github.com/spiermar/d3-flame-graph.git
$ cd d3-flame-graph
$ npm install
$ gulp serve
```

## License

Copyright 2018 Martin Spier. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with the License. You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
