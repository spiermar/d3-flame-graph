/**
 * @vitest-environment jsdom
 */

import flamegraph from "d3-flamegraph";
import { select } from "d3-selection";

describe("flamegraph edge cases", () => {
    let chartElem;
    let detailsElem;

    beforeEach(() => {
        chartElem = document.createElement("div");
        detailsElem = document.createElement("div");
    });

    describe("empty children arrays", () => {
        it("should handle empty children array", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            const frames = chartElem.querySelectorAll("g.frame");
            expect(frames.length).toBe(1);
        });

        it("should handle null children", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 1,
                children: null,
            };

            select(chartElem).datum(stacks).call(chart);
            const frames = chartElem.querySelectorAll("g.frame");
            expect(frames.length).toBe(1);
        });

        it("should handle undefined children", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 1,
            };

            select(chartElem).datum(stacks).call(chart);
            const frames = chartElem.querySelectorAll("g.frame");
            expect(frames.length).toBe(1);
        });
    });

    describe("search with special characters and regex", () => {
        it("should search for substring", () => {
            const chart = flamegraph().setDetailsElement(detailsElem);
            const stacks = {
                name: "root",
                value: 10,
                children: [
                    { name: "func[0]", value: 5 },
                    { name: "func(1)", value: 3 },
                    { name: "func<2>", value: 2 },
                ],
            };

            select(chartElem).datum(stacks).call(chart);
            chart.search("func");
            expect(detailsElem.textContent).toContain("search:");
        });

        it("should search with regex special characters", () => {
            const chart = flamegraph().setDetailsElement(detailsElem);
            const stacks = {
                name: "root",
                value: 10,
                children: [
                    { name: "test.function", value: 5 },
                    { name: "test*function", value: 3 },
                    { name: "test+function", value: 2 },
                ],
            };

            select(chartElem).datum(stacks).call(chart);
            chart.search("test.");
            expect(detailsElem.textContent).toContain("search:");
        });

        it("should handle empty search", () => {
            const chart = flamegraph().setDetailsElement(detailsElem);
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            chart.search("");
            expect(detailsElem.textContent).toContain("search:");
        });

        it("should handle no match search", () => {
            const chart = flamegraph().setDetailsElement(detailsElem);
            const stacks = {
                name: "root",
                value: 10,
                children: [
                    { name: "func1", value: 5 },
                    { name: "func2", value: 5 },
                ],
            };

            select(chartElem).datum(stacks).call(chart);
            chart.search("nonexistent");
            expect(detailsElem.textContent).toBe(
                "search: 0 of 10 total samples ( 0.000%)",
            );
        });

        it("should clear search highlights", () => {
            const chart = flamegraph().setDetailsElement(detailsElem);
            const stacks = {
                name: "root",
                value: 10,
                children: [
                    { name: "match", value: 5 },
                    { name: "other", value: 5 },
                ],
            };

            select(chartElem).datum(stacks).call(chart);
            chart.search("match");
            expect(detailsElem.textContent).toContain("search:");

            chart.clear();
            expect(detailsElem.textContent).toBeTruthy();
        });
    });

    describe("merge functionality", () => {
        it("should merge data correctly", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 10,
                children: [{ name: "func1", value: 5 }],
            };

            select(chartElem).datum(stacks).call(chart);

            const newData = { name: "func2", value: 3 };
            chart.merge(newData);

            const frames = chartElem.querySelectorAll("g.frame");
            expect(frames.length).toBeGreaterThanOrEqual(2);
        });

        it("should merge with existing children", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 10,
                children: [
                    {
                        name: "func1",
                        value: 5,
                        children: [{ name: "func1.child", value: 2 }],
                    },
                ],
            };

            select(chartElem).datum(stacks).call(chart);

            const newData = {
                name: "func1",
                value: 3,
                children: [{ name: "func1.child2", value: 1 }],
            };
            chart.merge(newData);

            const frames = chartElem.querySelectorAll("g.frame");
            expect(frames.length).toBeGreaterThanOrEqual(3);
        });

        it("should merge new root-level nodes", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 10,
                children: [{ name: "func1", value: 5 }],
            };

            select(chartElem).datum(stacks).call(chart);

            const newData = { name: "func1", value: 3 };
            chart.merge(newData);

            const frames = chartElem.querySelectorAll("g.frame");
            expect(frames.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe("update method", () => {
        it("should update with new data", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 10,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);

            const newData = {
                name: "newRoot",
                value: 20,
                children: [{ name: "newChild", value: 10 }],
            };
            chart.update(newData);

            const frames = chartElem.querySelectorAll("g.frame");
            expect(frames.length).toBe(2);
        });

        it("should update without data (re-render)", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 10,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            chart.update();
            expect(chartElem.querySelector("svg")).toBeTruthy();
        });
    });

    describe("destroy method", () => {
        it("should remove svg on destroy", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            expect(chartElem.querySelector("svg")).toBeTruthy();

            chart.destroy();
            expect(chartElem.querySelector("svg")).toBeFalsy();
        });

        it("should return chart for chaining", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            const result = chart.destroy();
            expect(result).toBe(chart);
        });
    });

    describe("differential mode", () => {
        it("should work with computeDelta option", () => {
            const chart = flamegraph().computeDelta(true);
            const stacks = {
                name: "root",
                value: 10,
                children: [{ name: "func1", value: 5, delta: 2 }],
            };

            select(chartElem).datum(stacks).call(chart);
            const frames = chartElem.querySelectorAll("g.frame");
            expect(frames.length).toBe(2);
        });

        it("should use delta from different property names", () => {
            const chart = flamegraph().computeDelta(true);
            const stacks = {
                name: "root",
                value: 10,
                children: [
                    { name: "func1", value: 5, d: 2 },
                    { name: "func2", value: 5, delta: -1 },
                ],
            };

            select(chartElem).datum(stacks).call(chart);
            const frames = chartElem.querySelectorAll("g.frame");
            expect(frames.length).toBe(3);
        });
    });

    describe("inverted mode", () => {
        it("should render correctly in inverted mode", () => {
            const chart = flamegraph().inverted(true);
            const stacks = {
                name: "root",
                value: 10,
                children: [{ name: "func1", value: 5 }],
            };

            select(chartElem).datum(stacks).call(chart);
            expect(chartElem.querySelector("svg")).toBeTruthy();
        });

        it("should toggle inverted mode", () => {
            const chart = flamegraph();
            expect(chart.inverted()).toBe(false);

            chart.inverted(true);
            expect(chart.inverted()).toBe(true);

            chart.inverted(false);
            expect(chart.inverted()).toBe(false);
        });
    });

    describe("zoom functionality", () => {
        it("should zoom to specific node", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 10,
                children: [
                    {
                        name: "func1",
                        value: 5,
                        children: [{ name: "func1.child", value: 2 }],
                    },
                ],
            };

            select(chartElem).datum(stacks).call(chart);

            const node = chart.findById(1);
            if (node) {
                chart.zoomTo(node);
            }

            expect(chartElem.querySelector("svg")).toBeTruthy();
        });

        it("should reset zoom to root", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 10,
                children: [{ name: "func1", value: 5 }],
            };

            select(chartElem).datum(stacks).call(chart);
            chart.resetZoom();
            expect(chartElem.querySelector("svg")).toBeTruthy();
        });

        it("should find node by id", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 10,
                children: [{ name: "func1", value: 5 }],
            };

            select(chartElem).datum(stacks).call(chart);

            const found = chart.findById(0);
            expect(found).toBeTruthy();
            expect(found.data.name).toBe("root");
        });

        it("should return undefined for invalid id", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);

            const found = chart.findById(999);
            expect(found).toBeUndefined();
        });

        it("should return null for null id", () => {
            const chart = flamegraph();
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);

            const found = chart.findById(null);
            expect(found).toBeNull();
        });
    });

    describe("error handling and edge cases", () => {
        it("should handle getter methods without data", () => {
            const chart = flamegraph();
            expect(chart.height()).toBeNull();
            expect(chart.width()).toBe(960);
            expect(chart.cellHeight()).toBe(18);
        });

        it("should handle setter chaining", () => {
            const chart = flamegraph()
                .width(800)
                .height(400)
                .cellHeight(20)
                .title("Test Chart");

            expect(chart.width()).toBe(800);
            expect(chart.height()).toBe(400);
            expect(chart.cellHeight()).toBe(20);
            expect(chart.title()).toBe("Test Chart");
        });

        it("should handle custom label handler", () => {
            const chart = flamegraph().setLabelHandler(
                (d) => "custom: " + d.data.name,
            );
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            const title = chartElem.querySelector("title");
            expect(title.textContent).toBe("custom: root");
        });

        it("should handle custom color hue", () => {
            const chart = flamegraph().setColorHue("blue");
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            const rect = chartElem.querySelector("rect");
            expect(rect.getAttribute("fill")).toMatch(/^rgb\(\d+,\d+,\d+\)$/);
        });

        it("should handle minFrameSize", () => {
            const chart = flamegraph().minFrameSize(100);
            const stacks = {
                name: "root",
                value: 1000,
                children: [
                    { name: "small", value: 1 },
                    { name: "large", value: 500 },
                ],
            };

            select(chartElem).datum(stacks).call(chart);
            expect(chart.minFrameSize()).toBe(100);
        });
    });

    describe("custom getters and setters", () => {
        it("should get and set name accessor", () => {
            const chart = flamegraph().getName((d) => d.data.customName);
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            expect(chart.getName()).toBeDefined();
        });

        it("should get and set children accessor", () => {
            const chart = flamegraph().getChildren((d) => d.customChildren);
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            expect(chart.getChildren()).toBeDefined();
        });

        it("should get and set libtype accessor", () => {
            const chart = flamegraph().getLibtype((d) => d.data.customLibtype);
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            expect(chart.getLibtype()).toBeDefined();
        });

        it("should get and set delta accessor", () => {
            const chart = flamegraph().getDelta((d) => d.data.customDelta);
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            expect(chart.getDelta()).toBeDefined();
        });
    });

    describe("click and hover handlers", () => {
        it("should handle onClick", () => {
            let clickedData = null;
            const chart = flamegraph().onClick((d) => {
                clickedData = d;
            });
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            const g = chartElem.querySelector("g.frame");
            g.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            expect(clickedData).toBeTruthy();
        });

        it("should get click handler", () => {
            const handler = (d) => d;
            const chart = flamegraph().onClick(handler);
            expect(chart.onClick()).toBe(handler);
        });

        it("should handle onHover", () => {
            let hoverData = null;
            const chart = flamegraph().onHover((d) => {
                hoverData = d;
            });
            const stacks = {
                name: "root",
                value: 1,
                children: [],
            };

            select(chartElem).datum(stacks).call(chart);
            const g = chartElem.querySelector("g.frame");
            g.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
            expect(hoverData).toBeTruthy();
        });
    });

    describe("self value mode", () => {
        it("should work with selfValue option", () => {
            const chart = flamegraph().selfValue(true);
            const stacks = {
                name: "root",
                value: 10,
                children: [{ name: "func1", value: 5 }],
            };

            select(chartElem).datum(stacks).call(chart);
            expect(chart.selfValue()).toBe(true);
        });
    });
});
