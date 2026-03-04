import { flamegraph } from "../../lib";
import { setupFormHandlers } from "../lib/common.js";

export function createMinifiedChart() {
    var chart = flamegraph()
        .width(960)
        .cellHeight(18)
        .transitionDuration(750)
        .minFrameSize(0)
        .transitionEase(d3.easeCubic)
        .sort(false)
        .title("")
        .onClick(onClick);

    var details = document.getElementById("details");
    chart.setDetailsElement(details);

    setupFormHandlers(chart);

    d3.json("stacks.min.json")
        .then((data) => {
            d3.select("#chart").datum(data).call(chart);
        })
        .catch((error) => {
            return console.warn(error);
        });

    return chart;
}

function onClick(d) {
    console.info("Clicked on " + d.data.n);
}
