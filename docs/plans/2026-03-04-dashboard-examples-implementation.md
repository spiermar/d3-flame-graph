# Dashboard Examples Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a unified dashboard with collapsible sidebar to switch between 5 flame graph examples.

**Architecture:** Collapsible sidebar navigates between example configs, each loaded from dedicated JS file. Common utilities shared across examples. JSON data moved to public/.

**Tech Stack:** Vanilla JS, D3.js, Tailwind CSS (via CDN)

---

### Task 1: Move JSON files to public/

**Files:**

- Create: `public/differential.json`
- Create: `public/live.json`
- Create: `public/stacks.min.json`
- Delete: `examples/differential.json`
- Delete: `examples/live.json`
- Delete: `examples/stacks.min.json`

**Step 1: Move differential.json**

```bash
mv examples/differential.json public/differential.json
```

**Step 2: Move live.json**

```bash
mv examples/live.json public/live.json
```

**Step 3: Move stacks.min.json**

```bash
mv examples/stacks.min.json public/stacks.min.json
```

---

### Task 2: Create common utilities library

**Files:**

- Create: `src/lib/common.js`

**Step 1: Write the file**

```javascript
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
```

**Step 2: Commit**

```bash
git add src/lib/common.js
git commit -m "feat: add common utilities for flamegraph dashboard"
```

---

### Task 3: Create Basic example config

**Files:**

- Create: `src/examples/basic.js`

**Step 1: Write the file**

```javascript
import { flamegraph, tooltip } from "../lib/index.js";
import {
    search,
    clear,
    resetZoom,
    onClick,
    setupFormHandlers,
} from "../lib/common.js";

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
```

**Step 2: Commit**

```bash
git add src/examples/basic.js
git commit -m "feat: add basic example config"
```

---

### Task 4: Create Color Mapper example config

**Files:**

- Create: `src/examples/colorMapper.js`

**Step 1: Write the file**

```javascript
import { flamegraph } from "../lib/index.js";
import { search, clear, resetZoom, setupFormHandlers } from "../lib/common.js";

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
        .setColorMapper(flamegraph.colorMapper.offCpuColorMapper);

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
```

**Step 2: Commit**

```bash
git add src/examples/colorMapper.js
git commit -m "feat: add color mapper example config"
```

---

### Task 5: Create Differential example config

**Files:**

- Create: `src/examples/differential.js`

**Step 1: Write the file**

```javascript
import { flamegraph } from "../lib/index.js";
import { search, clear, resetZoom, setupFormHandlers } from "../lib/common.js";

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
```

**Step 2: Commit**

```bash
git add src/examples/differential.js
git commit -m "feat: add differential example config"
```

---

### Task 6: Create Live example config

**Files:**

- Create: `src/examples/live.js`

**Step 1: Write the file**

```javascript
import { flamegraph } from "../lib/index.js";
import { search, clear, resetZoom, setupFormHandlers } from "../lib/common.js";

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
```

**Step 2: Commit**

```bash
git add src/examples/live.js
git commit -m "feat: add live example config"
```

---

### Task 7: Create Minified example config

**Files:**

- Create: `src/examples/minified.js`

**Step 1: Write the file**

```javascript
import { flamegraph } from "../lib/index.js";
import { search, clear, resetZoom, setupFormHandlers } from "../lib/common.js";

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
```

**Step 2: Commit**

```bash
git add src/examples/minified.js
git commit -m "feat: add minified example config"
```

---

### Task 8: Update index.html with sidebar

**Files:**

- Modify: `src/index.html`

**Step 1: Update index.html**

Replace the entire file content with:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <script src="https://cdn.tailwindcss.com"></script>

        <title>d3-flame-graph</title>
    </head>
    <body class="bg-zinc-50 min-h-screen">
        <div class="flex min-h-screen">
            <!-- Sidebar -->
            <aside
                id="sidebar"
                class="w-64 bg-white border-r border-zinc-200 flex-shrink-0 transition-all duration-300"
            >
                <div class="p-4">
                    <h2 class="text-lg font-semibold text-zinc-900 mb-4">
                        Examples
                    </h2>
                    <nav class="space-y-1" id="example-nav">
                        <button
                            data-example="basic"
                            class="nav-item w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors bg-zinc-900 text-zinc-50"
                        >
                            Basic
                        </button>
                        <button
                            data-example="colorMapper"
                            class="nav-item w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        >
                            Color Mapper
                        </button>
                        <button
                            data-example="differential"
                            class="nav-item w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        >
                            Differential
                        </button>
                        <button
                            data-example="live"
                            class="nav-item w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        >
                            Live
                        </button>
                        <button
                            data-example="minified"
                            class="nav-item w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        >
                            Minified
                        </button>
                    </nav>
                </div>
            </aside>

            <!-- Toggle Button -->
            <button
                id="btn-toggle-sidebar"
                class="fixed left-0 top-1/2 -translate-y-1/2 bg-white border border-zinc-200 shadow-sm p-2 rounded-r-md hover:bg-zinc-100 z-10"
                style="left: 256px;"
            >
                <svg
                    class="w-4 h-4 text-zinc-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>

            <!-- Main Content -->
            <main class="flex-1 p-8 overflow-auto">
                <div class="max-w-5xl mx-auto">
                    <header class="mb-6">
                        <div
                            class="flex justify-between items-start gap-4 mb-6"
                        >
                            <h1 class="text-3xl font-semibold text-zinc-900">
                                d3-flame-graph
                            </h1>
                            <form id="form" class="flex items-center gap-2">
                                <input
                                    type="text"
                                    class="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                                    id="term"
                                    placeholder="Search..."
                                />
                                <button
                                    type="button"
                                    id="btn-reset-zoom"
                                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 border border-zinc-200 bg-white shadow-sm hover:bg-zinc-100 hover:text-zinc-900 h-9 px-4 py-2"
                                >
                                    Reset zoom
                                </button>
                                <button
                                    type="button"
                                    id="btn-clear"
                                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 border border-zinc-200 bg-white shadow-sm hover:bg-zinc-100 hover:text-zinc-900 h-9 px-4 py-2"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    id="btn-search"
                                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 h-9 px-4 py-2"
                                >
                                    Search
                                </button>
                            </form>
                        </div>
                    </header>
                    <div class="space-y-6">
                        <div
                            class="rounded-lg border border-zinc-200 bg-white shadow-sm p-6"
                        >
                            <div id="chart"></div>
                        </div>
                        <div
                            class="rounded-lg border border-zinc-200 bg-white shadow-sm p-6 min-h-[80px]"
                        >
                            <div id="details"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- D3.js -->
        <script src="https://d3js.org/d3.v7.js" charset="utf-8"></script>

        <!-- main -->
        <script type="module" src="main.js"></script>
    </body>
</html>
```

**Step 2: Commit**

```bash
git add src/index.html
git commit -m "feat: add sidebar navigation to dashboard"
```

---

### Task 9: Update main.js with routing logic

**Files:**

- Modify: `src/main.js`

**Step 1: Replace content**

```javascript
import { createBasicChart } from "./examples/basic.js";
import { createColorMapperChart } from "./examples/colorMapper.js";
import { createDifferentialChart } from "./examples/differential.js";
import { createLiveChart } from "./examples/live.js";
import { createMinifiedChart } from "./examples/minified.js";

var currentChart = null;
var sidebarCollapsed = false;

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

    d3.select("#chart").selectAll("*").remove();
    document.getElementById("details").textContent = "";

    currentChart = creator();

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
```

**Step 2: Commit**

```bash
git add src/main.js
git commit -m "feat: add routing logic for examples"
```

---

### Task 10: Test the dashboard

**Step 1: Run dev server**

```bash
npm run dev
```

**Step 2: Verify in browser**

- Sidebar shows all 5 examples
- Clicking each example loads different chart
- Sidebar toggle works
- Search, reset zoom, clear work for each example

**Step 3: Commit**

```bash
git add .
git commit -m "feat: complete dashboard with examples"
```

---

### Task 11: Run lint and tests

**Step 1: Run lint**

```bash
npm run lint
```

**Step 2: Run tests**

```bash
npm run test
```

**Step 3: Fix any issues**

---

**Plan complete!**
