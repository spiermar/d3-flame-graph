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

Click [here](http://spiermar.github.io/d3-flame-graph/) to check the demo!

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
var flamegraph = d3.flame().height(600).width(1200);

d3.json("stacks.json", function(error, data) {
  if (error) return console.warn(error);
  d3.select("#chart")
      .datum(data)
      .call(flamegraph);
});
</script>
```

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
