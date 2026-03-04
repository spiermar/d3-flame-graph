import { flamegraph } from "../lib";
import { setupFormHandlers } from "../lib/common.js";

export function createDifferentialChart() {
    var chart = flamegraph()
        .width(960)
        .cellHeight(18)
        .transitionDuration(750)
        .minFrameSize(5)
        .transitionEase(d3.easeCubic)
        .title("")
        .onClick(onClick)
        .computeDelta(true)
        .selfValue(true)
        .setColorMapper(flamegraph.colorMapper.differentialColorMapper);

    var details = document.getElementById("details");
    chart.setDetailsElement(details);

    setupFormHandlers(chart);

    d3.json("differential.json")
        .then((data) => {
            d3.select("#chart").datum(data).call(chart);
        })
        .catch((error) => {
            return console.warn(error);
        });

    return chart;
}

function onClick(d) {
    console.info("Clicked on " + d.data.name);
}
