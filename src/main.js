import { createBasicChart } from "./examples/basic.js";
import { createColorMapperChart } from "./examples/colorMapper.js";
import { createDifferentialChart } from "./examples/differential.js";
import { createLiveChart } from "./examples/live.js";
import { createMinifiedChart } from "./examples/minified.js";

var sidebarCollapsed = false;
var currentCleanup = null;

var exampleCreators = {
    basic: createBasicChart,
    colorMapper: createColorMapperChart,
    differential: createDifferentialChart,
    live: createLiveChart,
    minified: createMinifiedChart,
};

function loadExample(exampleName) {
    var creator = exampleCreators[exampleName];
    if (!creator) {
        console.error("Unknown example:", exampleName);
        return;
    }

    if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
    }

    d3.select("#chart").selectAll("*").remove();
    document.getElementById("details").textContent = "";

    var cleanup = creator();
    if (typeof cleanup === "function") {
        currentCleanup = cleanup;
    }

    updateNavActive(exampleName);
}

function updateNavActive(activeExample) {
    document.querySelectorAll(".nav-item").forEach(function (btn) {
        if (btn.dataset.example === activeExample) {
            btn.classList.remove(
                "text-zinc-600",
                "hover:bg-zinc-100",
                "hover:text-zinc-900",
            );
            btn.classList.add("bg-zinc-900", "text-zinc-50");
        } else {
            btn.classList.remove("bg-zinc-900", "text-zinc-50");
            btn.classList.add(
                "text-zinc-600",
                "hover:bg-zinc-100",
                "hover:text-zinc-900",
            );
        }
    });
}

function toggleSidebar() {
    var sidebar = document.getElementById("sidebar");
    var btn = document.getElementById("btn-toggle-sidebar");
    var svg = btn.querySelector("svg");

    sidebarCollapsed = !sidebarCollapsed;

    if (sidebarCollapsed) {
        sidebar.style.marginLeft = "-256px";
        btn.style.left = "0";
        svg.style.transform = "rotate(180deg)";
    } else {
        sidebar.style.marginLeft = "0";
        btn.style.left = "256px";
        svg.style.transform = "rotate(0deg)";
    }
}

document
    .getElementById("example-nav")
    .addEventListener("click", function (event) {
        var btn = event.target.closest(".nav-item");
        if (btn) {
            loadExample(btn.dataset.example);
        }
    });

document
    .getElementById("btn-toggle-sidebar")
    .addEventListener("click", toggleSidebar);

loadExample("basic");
