import { generateColorVector } from './colorUtils'

function pickHex (color1, color2, weight) {
    const w1 = weight
    const w2 = 1 - w1
    const rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)]
    return rgb
}

export function allocationColorMapper (d, originalColor) {
    if (d.highlight) return originalColor

    const self = d.data.value
    const total = d.value
    const color = pickHex([0, 255, 40], [196, 245, 233], self / total)

    return `rgb(${color.join()})`
}

export function offCpuColorMapper (d, originalColor) {
    if (d.highlight) return originalColor

    const name = d.data.n || d.data.name
    const vector = generateColorVector(name)

    const r = 0 + Math.round(55 * (1 - vector))
    const g = 0 + Math.round(230 * (1 - vector))
    const b = 200 + Math.round(55 * vector)

    return 'rgb(' + r + ',' + g + ',' + b + ')'
}

export function nodeJsColorMapper (d, originalColor) {
    let color = originalColor

    const { v8_jit: v8JIT, javascript, optimized } = d.data.extras || {}
    // Non-JS JIT frames (V8 builtins) are greyed out.
    if (v8JIT && !javascript) {
        color = '#dadada'
    }
    // JavaScript frames are colored based on optimization level
    if (javascript) {
        let opt = (optimized || 0) / d.value
        let r = 255
        let g = 0
        let b = 0
        if (opt < 0.4) {
            opt = opt * 2.5
            r = 240 - opt * 200
        } else if (opt < 0.9) {
            opt = (opt - 0.4) * 2
            r = 0
            b = 200 - (200 * opt)
            g = 100 * opt
        } else {
            opt = (opt - 0.9) * 10
            r = 0
            b = 0
            g = 100 + (150 * opt)
        }
        color = `rgb(${r} , ${g}, ${b})`
    }
    return color
}

export function differentialColorMapper (d, originalColor) {
    if (d.highlight) return originalColor

    let r = 220
    let g = 220
    let b = 220

    const delta = d.delta || d.data.d || d.data.delta
    const unsignedDelta = Math.abs(delta)
    let value = d.value || d.data.v || d.data.value
    if (value <= unsignedDelta) value = unsignedDelta
    const vector = unsignedDelta / value

    if (delta === value) {
        // likely a new frame, color orange
        r = 255
        g = 190
        b = 90
    } else if (delta > 0) {
        // an increase, color red
        b = Math.round(235 * (1 - vector))
        g = b
    } else if (delta < 0) {
        // a decrease, color blue
        r = Math.round(235 * (1 - vector))
        g = r
    }

    return 'rgb(' + r + ',' + g + ',' + b + ')'
}
