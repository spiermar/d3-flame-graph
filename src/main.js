import { flamegraph, tooltip } from "../lib";

var chart = flamegraph()
    .width(960)
    .cellHeight(18)
    .transitionDuration(750)
    .minFrameSize(5)
    .sort(true)
    //Example to sort in reverse order
    //.sort(function(a,b){ return d3.descending(a.name, b.name);})
    .title("")
    .onClick(onClick)
    .selfValue(false)
    .setColorMapper((d, originalColor) =>
        d.highlight ? "#6aff8f" : originalColor,
    );

// Example on how to use custom a tooltip.
var tip = tooltip
    .defaultFlamegraphTooltip()
    .text((d) => "name: " + d.data.name + ", value: " + d.data.value);
chart.tooltip(tip);

var details = document.getElementById("details");
chart.setDetailsElement(details);

// Example on how to use searchById() function in flamegraph.
// To invoke this function after loading the graph itself, this function should be registered in d3 datum(data).call()
// (See d3.json invocation in this file)
function invokeFind() {
    var searchId = parseInt(location.hash.substring(1), 10);
    if (searchId) {
        find(searchId);
    }
}

// Example on how to use custom labels
// var label = function(d) {
//  return "name: " + d.name + ", value: " + d.value;
// }
// chart.setLabelHandler(label);

// Example of how to set fixed chart height
// chart.height(540);

d3.json("stacks.json")
    .then((data) => {
        d3.select("#chart").datum(data).call(chart).call(invokeFind);
    })
    .catch((error) => {
        return console.warn(error);
    });

document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();
    search();
});

function search() {
    var term = document.getElementById("term").value;
    chart.search(term);
}

function find(id) {
    var elem = chart.findById(id);
    if (elem) {
        console.log(elem);
        chart.zoomTo(elem);
    }
}

function clear() {
    document.getElementById("term").value = "";
    chart.clear();
}

function resetZoom() {
    chart.resetZoom();
}

function onClick(d) {
    console.info(`Clicked on ${d.data.name}, id: "${d.id}"`);
    history.pushState({ id: d.id }, d.data.name, `#${d.id}`);
}
