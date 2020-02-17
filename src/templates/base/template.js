import { select } from 'd3-selection'
import flamegraph from '../../flamegraph'
import '../../flamegraph.css'
import './template.css'

class FlameGraphUI {
    constructor (stacks, options) {
        this.stacks = stacks || { name: 'Stacks were not loaded.', value: 0, children: [] }
        this.options = options

        this.chart = document.getElementById('chart')
        this.details = document.getElementById('details')
        this.resetBtn = document.getElementById('reset-button')
        this.clearBtn = document.getElementById('clear-button')
        this.searchForm = document.getElementById('search-form')
        this.searchInput = document.getElementById('search-input')
    }

    handleSearch () {
        if (this.searchInput.value === '') {
            this.flameGraph.clear()
        } else {
            this.flameGraph.search(this.searchInput.value)
        }
    }

    handleClear () {
        this.searchInput.value = ''
        this.flameGraph.clear()
    }

    handleResetZoom () {
        this.flameGraph.resetZoom()
    }

    handleWindowResize () {
        var width = this.chart.clientWidth
        var graphs = document.getElementsByClassName('d3-flame-graph')
        if (graphs.length > 0) {
            graphs[0].setAttribute('width', width)
        }
        this.flameGraph.width(width)
        this.flameGraph.resetZoom()
    }

    sortByValue (lhs, rhs) {
        if (lhs.value === rhs.value) return 0
        if (lhs.value < rhs.value) return 1
        return -1
    }

    init () {
        this.flameGraph = flamegraph()
            .width(this.chart.clientWidth)
            .cellHeight(16)
            .minFrameSize(5)
            .sort(this.sortByValue)
            .selfValue(true)
            .resetHeightOnZoom(true)
            .scrollOnZoom(true)
            .setDetailsElement(this.details)

        this.resetBtn.addEventListener('click', this.handleResetZoom.bind(this))
        this.clearBtn.addEventListener('click', this.handleClear.bind(this))
        this.searchForm.addEventListener('submit', (event) => {
            event.preventDefault()
            this.handleSearch()
        })
        this.searchInput.addEventListener('blur', this.handleSearch.bind(this))
        window.addEventListener('resize', this.handleWindowResize.bind(this), true)

        this.details.innerHTML = ''
        select(this.chart)
            .datum(this.stacks)
            .call(this.flameGraph)
    }
}

window.flamegraph = (stacks, options) => {
    const ui = new FlameGraphUI(stacks, options)
    ui.init()
}
