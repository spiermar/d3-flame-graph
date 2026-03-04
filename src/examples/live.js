import { flamegraph } from "../lib";
import { setupFormHandlers } from "../lib/common.js";

export function createLiveChart() {
    var chart = flamegraph()
        .height(1080)
        .width(960)
        .cellHeight(18)
        .transitionDuration(0)
        .minFrameSize(0)
        .transitionEase(d3.easeCubic)
        .sort(true)
        .title("");

    var details = document.getElementById("details");
    chart.setDetailsElement(details);

    setupFormHandlers(chart);

    var start = {
        name: "root",
        value: 1,
        children: [],
    };

    d3.select("#chart").datum(start).call(chart);

    d3.json("live.json")
        .then((data) => {
            var i = 1;
            for (var value in data) {
                setTimeout(
                    function (timestamp) {
                        chart.merge(data[timestamp]);
                    },
                    1000 * i,
                    value,
                );
                i++;
            }
        })
        .catch((error) => {
            return console.warn(error);
        });

    return chart;
}
