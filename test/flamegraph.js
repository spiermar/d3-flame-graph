/**
 * @jest-environment jsdom
 */

import flamegraph from 'flamegraph'
import { select } from 'd3-selection'

describe('flame graph library', () => {
    let chartElem

    beforeEach(() => {
        chartElem = document.createElement('div')
    })

    it('should generate a minimal graph with a single stack', () => {
        const chart = flamegraph()
        const stacks = {
            name: 'root',
            value: 1,
            children: []
        }

        select(chartElem).datum(stacks).call(chart)
        expect(chartElem).toMatchInlineSnapshot(`
            <div>
              <svg
                class="partition d3-flame-graph"
                height="54"
                width="960"
              >
                <text
                  class="title"
                  fill="#808080"
                  text-anchor="middle"
                  x="480"
                  y="25"
                />
                <g
                  class="frame"
                  height="18"
                  name="root"
                  transform="translate(0,36)"
                  width="960"
                >
                  <rect
                    fill="rgb(217,157,38)"
                    height="18"
                  />
                  <title>
                    root (100.000%, 1 samples)
                  </title>
                  <foreignobject
                    height="18"
                    width="960"
                  >
                    <div
                      class="d3-flame-graph-label"
                      style="display: block;"
                    />
                  </foreignobject>
                </g>
              </svg>
            </div>
        `)
    })

    it('should generate a graph with multiple stacks, using the self value logic', () => {
        const sortByValue = (lhs, rhs) => {
            if (lhs.value === rhs.value) return 0
            if (lhs.value < rhs.value) return 1
            return -1
        }

        const chart = flamegraph().sort(sortByValue).selfValue(true)
        const stacks = {
            name: 'root',
            value: 0,
            children: [
                {
                    name: 'root.node1',
                    value: 2,
                    children: [
                        {
                            name: 'root.node1.node1',
                            value: 3
                        }
                    ]
                },
                {
                    name: 'root.node2',
                    value: 4
                }
            ]
        }

        select(chartElem).datum(stacks).call(chart)
        expect(chartElem).toMatchInlineSnapshot(`
            <div>
              <svg
                class="partition d3-flame-graph"
                height="90"
                width="960"
              >
                <text
                  class="title"
                  fill="#808080"
                  text-anchor="middle"
                  x="480"
                  y="25"
                />
                <g
                  class="frame"
                  height="18"
                  name="root"
                  transform="translate(0,72)"
                  width="960"
                >
                  <rect
                    fill="rgb(217,157,38)"
                    height="18"
                  />
                  <title>
                    root (100.000%, 9 samples)
                  </title>
                  <foreignobject
                    height="18"
                    width="960"
                  >
                    <div
                      class="d3-flame-graph-label"
                      style="display: block;"
                    />
                  </foreignobject>
                </g>
                <g
                  class="frame"
                  height="18"
                  name="root.node1"
                  transform="translate(0,54)"
                  width="533.3333333333334"
                >
                  <rect
                    fill="rgb(218,156,37)"
                    height="18"
                  />
                  <title>
                    root.node1 (55.556%, 5 samples)
                  </title>
                  <foreignobject
                    height="18"
                    width="533.3333333333334"
                  >
                    <div
                      class="d3-flame-graph-label"
                      style="display: block;"
                    />
                  </foreignobject>
                </g>
                <g
                  class="frame"
                  height="18"
                  name="root.node2"
                  transform="translate(533.3333333333334,54)"
                  width="426.66666666666663"
                >
                  <rect
                    fill="rgb(218,156,37)"
                    height="18"
                  />
                  <title>
                    root.node2 (44.444%, 4 samples)
                  </title>
                  <foreignobject
                    height="18"
                    width="426.66666666666663"
                  >
                    <div
                      class="d3-flame-graph-label"
                      style="display: block;"
                    />
                  </foreignobject>
                </g>
                <g
                  class="frame"
                  height="18"
                  name="root.node1.node1"
                  transform="translate(0,36)"
                  width="320.00000000000006"
                >
                  <rect
                    fill="rgb(218,156,37)"
                    height="18"
                  />
                  <title>
                    root.node1.node1 (33.333%, 3 samples)
                  </title>
                  <foreignobject
                    height="18"
                    width="320.00000000000006"
                  >
                    <div
                      class="d3-flame-graph-label"
                      style="display: block;"
                    />
                  </foreignobject>
                </g>
              </svg>
            </div>
        `)
    })
})
