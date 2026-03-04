import { flamegraph, tooltip } from "../lib";
import { onClick, setupFormHandlers } from "../lib/common.js";

export function createBasicChart() {
    var chart = flamegraph()
        .width(960)
        .cellHeight(18)
        .transitionDuration(750)
        .minFrameSize(5)
        .sort(true)
        .title("")
        .onClick(onClick)
        .selfValue(false)
        .setColorMapper((d, originalColor) =>
            d.highlight ? "#6aff8f" : originalColor,
        );

    var tip = tooltip
        .defaultFlamegraphTooltip()
        .text((d) => "name: " + d.data.name + ", value: " + d.data.value);
    chart.tooltip(tip);

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
