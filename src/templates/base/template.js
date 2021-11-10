import { select } from 'd3-selection'
import flamegraph from '../../flamegraph'
import { generateColorVector } from '../../colorUtils'
import { calculateColor } from '../../colorScheme'
import '../../flamegraph.css'
import './template.css'

class FlameGraphUI {
    constructor (stacks, options) {
        this.stacks = stacks || { name: 'Stacks were not loaded.', value: 0, children: [] }
        this.options = options || {}
        if (!this.options.context || this.options.context === '') {
            this.options.context = 'No context information available.'
        }

        this.context = document.getElementById('context')
        this.chart = document.getElementById('chart')
        this.details = document.getElementById('details')

        this.contextBtn = document.getElementById('context-button')
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

    toggleContextInfo () {
        if (this.context.style.display === 'none') {
            this.chart.style.display = 'none'
            this.context.style.display = 'block'
        } else {
            this.context.style.display = 'none'
            this.chart.style.display = 'block'
        }
    }

    handleResetZoom () {
        this.flameGraph.resetZoom()
    }

    handleClear () {
        this.searchInput.value = ''
        this.flameGraph.clear()
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

    colorSchemeColorMapper (getName, getLibtype, d, originalColor) {
        if (d.highlight) {
            return '#E600E6' // purple
        } else if (this.options.colorscheme === 'blue-green') {
            const name = getName(d)
            const libtype = getLibtype(d)
            const vector = generateColorVector(name)

            if (libtype === 'root') {
                return 'rgb(217,75,75)'
            } else if (libtype === 'kernel') {
                return calculateColor('blue', vector)
            } else { // userspace
                return calculateColor('pastelgreen', vector)
            }
        } else {
            return originalColor
        }
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

        const getNameFn = this.flameGraph.getName()
        const getLibtypeFn = this.flameGraph.getLibtype()
        this.flameGraph.setColorMapper(this.colorSchemeColorMapper.bind(this, getNameFn, getLibtypeFn))

        this.contextBtn.addEventListener('click', this.toggleContextInfo.bind(this))
        this.resetBtn.addEventListener('click', this.handleResetZoom.bind(this))
        this.clearBtn.addEventListener('click', this.handleClear.bind(this))
        this.searchForm.addEventListener('submit', (event) => {
            event.preventDefault()
            this.handleSearch()
        })
        this.searchInput.addEventListener('blur', this.handleSearch.bind(this))
        window.addEventListener('resize', this.handleWindowResize.bind(this), true)

        this.context.textContent = this.options.context
        this.details.textContent = ''
        select(this.chart)
            .datum(this.stacks)
            .call(this.flameGraph)
    }
}

window.flamegraph = (stacks, options) => {
    const ui = new FlameGraphUI(stacks, options)
    ui.init()
}
