/**
 * @vitest-environment jsdom
 */

import { defaultFlamegraphTooltip } from "../lib/tooltip.js";

describe("tooltip", () => {
    let tip;
    let mockEvent;
    let mockData;

    beforeEach(() => {
        tip = defaultFlamegraphTooltip();
        tip();

        mockEvent = {
            pageX: 0,
            pageY: 0,
        };

        mockData = {
            data: {
                name: "test function",
            },
        };

        Object.defineProperty(window, "innerWidth", {
            writable: true,
            value: 1024,
        });

        Object.defineProperty(window, "innerHeight", {
            writable: true,
            value: 768,
        });
    });

    afterEach(() => {
        tip.destroy();
    });

    describe("show method", () => {
        it("should position tooltip at default offset", () => {
            mockEvent = { pageX: 100, pageY: 100 };
            tip.show(mockEvent, mockData);

            const tooltipEl = document.querySelector(".d3-flame-graph-tip");
            expect(tooltipEl).toBeTruthy();
            expect(tooltipEl.style.left).toBe("105px");
            expect(tooltipEl.style.top).toBe("105px");
        });

        it("should adjust position when tooltip would go off right edge", () => {
            const tooltipEl = document.querySelector(".d3-flame-graph-tip");

            Object.defineProperty(tooltipEl, "offsetWidth", {
                writable: true,
                value: 200,
            });
            Object.defineProperty(tooltipEl, "offsetHeight", {
                writable: true,
                value: 50,
            });

            mockEvent = { pageX: 1000, pageY: 100 };
            tip.show(mockEvent, mockData);

            expect(tooltipEl.style.left).toBe("795px");
        });

        it("should adjust position when tooltip would go off left edge", () => {
            const tooltipEl = document.querySelector(".d3-flame-graph-tip");

            Object.defineProperty(tooltipEl, "offsetWidth", {
                writable: true,
                value: 200,
            });
            Object.defineProperty(tooltipEl, "offsetHeight", {
                writable: true,
                value: 50,
            });

            mockEvent = { pageX: -100, pageY: 100 };
            tip.show(mockEvent, mockData);

            expect(tooltipEl.style.left).toBe("5px");
        });

        it("should adjust position when tooltip would go off bottom edge", () => {
            const tooltipEl = document.querySelector(".d3-flame-graph-tip");

            Object.defineProperty(tooltipEl, "offsetWidth", {
                writable: true,
                value: 100,
            });
            Object.defineProperty(tooltipEl, "offsetHeight", {
                writable: true,
                value: 100,
            });

            mockEvent = { pageX: 100, pageY: 700 };
            tip.show(mockEvent, mockData);

            expect(tooltipEl.style.top).toBe("595px");
        });
    });

    describe("hide method", () => {
        it("should hide tooltip", () => {
            tip.show(mockEvent, mockData);
            tip.hide();

            const tooltipEl = document.querySelector(".d3-flame-graph-tip");
            expect(tooltipEl.style.display).toBe("none");
        });
    });

    describe("text method", () => {
        it("should get text content function", () => {
            expect(tip.text()).toBeDefined();
        });

        it("should set text content function", () => {
            const customText = (d) => "Custom: " + d.data.name;
            tip.text(customText);

            tip.show(mockEvent, mockData);
            const tooltipEl = document.querySelector(".d3-flame-graph-tip");
            expect(tooltipEl.textContent).toBe("Custom: test function");
        });
    });

    describe("html method", () => {
        it("should get html content function", () => {
            expect(tip.html()).toBeDefined();
        });

        it("should set html content function", () => {
            const customHtml = (d) => "<strong>" + d.data.name + "</strong>";
            tip.html(customHtml);

            tip.show(mockEvent, mockData);
            const tooltipEl = document.querySelector(".d3-flame-graph-tip");
            expect(tooltipEl.innerHTML).toBe("<strong>test function</strong>");
        });
    });
});
