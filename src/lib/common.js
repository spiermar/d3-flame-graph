export function search(chart) {
    var term = document.getElementById("term").value;
    chart.search(term);
}

export function clear(chart) {
    document.getElementById("term").value = "";
    chart.clear();
}

export function resetZoom(chart) {
    chart.resetZoom();
}

export function onClick(d) {
    console.info(`Clicked on ${d.data.name}, id: "${d.id}"`);
    history.pushState({ id: d.id }, d.data.name, `#${d.id}`);
}

export function setupFormHandlers(chart) {
    document
        .getElementById("form")
        .addEventListener("submit", function (event) {
            event.preventDefault();
            search(chart);
        });

    document
        .getElementById("btn-search")
        .addEventListener("click", function (event) {
            event.preventDefault();
            search(chart);
        });

    document.getElementById("btn-clear").addEventListener("click", function () {
        clear(chart);
    });

    document
        .getElementById("btn-reset-zoom")
        .addEventListener("click", function () {
            resetZoom(chart);
        });
}
