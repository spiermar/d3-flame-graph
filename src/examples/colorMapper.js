import { flamegraph, colorMapper } from "../../lib";
import { setupFormHandlers } from "../lib/common.js";

export function createColorMapperChart() {
    var chart = flamegraph()
        .width(960)
        .cellHeight(18)
        .transitionDuration(750)
        .minFrameSize(5)
        .transitionEase(d3.easeCubic)
        .sort(true)
        .title("")
        .onClick(onClick)
        .selfValue(false)
        .setColorMapper(colorMapper.offCpuColorMapper);

    var details = document.getElementById("details");
    chart.setDetailsElement(details);

    setupFormHandlers(chart);

    d3.json("stacks.json")
        .then((data) => {
            d3.select("#chart").datum(data).call(chart);
        })
        .catch((error) => {
            return console.warn(error);
        });

    return chart;
}

function onClick(d) {
    console.info(`Clicked on ${d.data.name}, id: "${d.id}"`);
    history.pushState({ id: d.id }, d.data.name, `#${d.id}`);
}
