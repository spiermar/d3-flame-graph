# d3-flame-graph

A D3.js plugin that produces flame graphs from hierarchical data.

[![Flame Graph Example](http://giant.gfycat.com/DelectableResponsibleHart.gif)](http://spiermar.github.io/d3-flame-graph/)

If you don't know what flame graphs are, check [Brendan Gregg's post](http://www.brendangregg.com/flamegraphs.html).

> Flame graphs are a visualization of profiled software, allowing the most frequent code-paths to be identified quickly and accurately. They can be generated using my open source programs on [github.com/brendangregg/FlameGraph](http://github.com/brendangregg/FlameGraph), which create interactive SVGs.
>
> <cite>Brendan Gregg</cite>

## Disclaimer

This is the first release of this plugin. As such, expect to find bugs and issues. We count on your support to find and report them!

**At this point, the plugin provides only basic flame graph functionality. Please check the [issues](https://github.com/spiermar/d3-flame-graph/issues) page for roadmap information.**

## Demo

Click [here](http://spiermar.github.io/d3-flame-graph/) to check the fully-featured demo!

Click [here](http://bl.ocks.org/spiermar/4509343495f8d6e214cb) to check the simplified demo on bl.ocks.org!

## Getting Started

### Bower

Make sure [Bower](http://bower.io/) installed on your system. If not, please install it using [npm](https://www.npmjs.com/).

```
$ npm install bower -g
```

Install the d3-flame-graph plugin.

```
$ cd your-project
$ bower install --save
```

And use it!

```
<script type="text/javascript" src="bower_components/d3/d3.js"></script>
<script type="text/javascript" src="bower_components/d3-flame-graph/dist/d3.layout.flame.js"></script>
<script type="text/javascript">
var flamegraph = d3.flameGraph()
  .width(960)
  .height(540);

d3.json("stacks.json", function(error, data) {
  if (error) return console.warn(error);
  d3.select("#chart")
      .datum(data)
      .call(flamegraph);
});
</script>
```

### Input Format

Input stack is a simple hierarchical data structure in JSON format.

```
{
  "name": "<name>",
  "value": <value>,
  "children": [
    <Object>
  ]
}
```

JSON format can be converted from the folded stack format using the [node-stack-convert](https://github.com/spiermar/node-stack-convert) CLI tool.

## API Reference

<a name="flameGraph" href="#flameGraph">#</a> d3.flameGraph()

Create a new Flame Graph.

<a name="width" href="#width">#</a> flameGraph.<b>width</b>(<i>[size]</i>)

Graph width in px. Defaults to 960px if not set. If <i>size</i> is specified, it will set de graph width, otherwise it will return the flameGraph object.

<a name="height" href="#height">#</a> flameGraph.<b>height</b>(<i>[size]</i>)

Graph height in px. Defaults to 540px if not set. If <i>size</i> is specified, it will set de graph height, otherwise it will return the flameGraph object.

<a name="cellHeight" href="#cellHeight">#</a> flameGraph.<b>cellHeight</b>(<i>[size]</i>)

Cell height in px. Defaults to 18px if not set. If <i>size</i> is specified, it will set de cell height, otherwise it will return the flameGraph object.

<a name="title" href="#title">#</a> flameGraph.<b>title</b>(<i>[title]</i>)

Title displayed on top of graph. Defaults to empty if not set. If <i>title</i> is specified, it will set de title displayed on the graph, otherwise it will return the flameGraph object.

<a name="tooltip" href="#tooltip">#</a> flameGraph.<b>tooltip</b>(<i>[enabled]</i>)

Enables/disables display of tooltips on frames. Defaults to <i>true</i> if not set. It can be set to a [d3-tip configurable function](https://github.com/Caged/d3-tip/blob/master/docs/initializing-tooltips.md), which will replace the default function and display a fully customized tooltip. Else, if a truthy value, uses a default label function. If a value is specified, it will enable/disable tooltips, otherwise it will return the flameGraph object.

Class should be specified in order to correctly render the tooltip. The default "d3-flame-graph-tip" is available for use too.

```
.attr('class', 'd3-flame-graph-tip')
```

See [d3-tip](https://github.com/Caged/d3-tip/tree/master/docs) for more details.

<a name="transitionDuration" href="#transitionDuration">#</a> flameGraph.<b>transitionDuration</b>(<i>[duration]</i>)

Specifies transition duration in milliseconds. The default duration is 750ms. If <i>duration</i> is not specified, returns the flameGraph object.

See [d3.duration](https://github.com/mbostock/d3/wiki/Transitions#duration).

<a name="transitionEase" href="#transitionEase">#</a> flameGraph.<b>transitionEase</b>(<i>[ease]</i>)

Specifies the transition easing function. The default easing function is "cubic-in-out". If ease is not specified, returns the flameGraph object. The following easing types are supported:

* linear - the identity function, t.
* poly(k) - raises t to the specified power k (e.g., 3).
* quad - equivalent to poly(2).
* cubic - equivalent to poly(3).
* sin - applies the trigonometric function sin.
* exp - raises 2 to a power based on t.
* circle - the quarter circle.
* elastic(a, p) - simulates an elastic band; may extend slightly beyond 0 and 1.
* back(s) - simulates backing into a parking space.
* bounce - simulates a bouncy collision.

These built-in types may be extended using a variety of modes:

* in - the identity function.
* out - reverses the easing direction to [1,0].
* in-out - copies and mirrors the easing function from [0,.5] and [.5,1].
* out-in - copies and mirrors the easing function from [1,.5] and [.5,0].

See [d3.ease](https://github.com/mbostock/d3/wiki/Transitions#d3_ease).

<a name="sort" href="#sort">#</a> flameGraph.<b>sort</b>(<i>[enabled]</i>)

Enables/disables sorting of children frames. Defaults to <i>true</i> if not set to sort in ascending order by frame's name. If set to a function, the function takes two frames (a,b) and returns -1 if frame a is less than b, 1 if greater, or 0 if equal. If a value is specified, it will enable/disable sorting, otherwise it will return the flameGraph object.

<a name="resetZoom" href="#resetZoom">#</a> flameGraph.<b>resetZoom</b>()

Resets the zoom so that everything is visible.

<a name="onClick" href="#onClick">#</a> flameGraph.<b>onClick</b>(<i>[function]</i>)

Adds a function that will be called when the user clicks on a frame. Example:

    flameGraph.onClick(function (d) {
        console.info("You clicked on frame "+ d.name);
    });

If called with no arguments, `onClick` will return the click handler. 

## Issues

For bugs, questions and discussions please use the [GitHub Issues](https://github.com/spiermar/d3-flame-graph/issues).

## Contributing

We love contributions! But in order to avoid total chaos, we have a few guidelines.

If you found a bug, have questions or feature requests, don't hesitate to open an [issue](https://github.com/spiermar/d3-flame-graph/issues).

If you're working on an issue, please comment on it so we can assign you to it.

If you have code to submit, follow the general pull request format. Fork the repo, make your changes, and submit a [pull request](https://github.com/spiermar/d3-flame-graph/pulls).

### Gulp.js

This plugin uses Gulp.js as build system. A few tasks are already defined, including browser-sync that can be used for development. To start it, just execute the default task.

```
$ git clone https://github.com/spiermar/d3-flame-graph.git
$ cd d3-flame-graph
$ npm install
$ bower install
$ gulp
```

## License

Copyright 2015 Martin Spier. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with the License. You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
