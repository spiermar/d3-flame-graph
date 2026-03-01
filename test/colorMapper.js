/**
 * @jest-environment jsdom
 */

import {
    allocationColorMapper,
    offCpuColorMapper,
    nodeJsColorMapper,
    differentialColorMapper
} from '../src/colorMapper'
import { generateColorVector } from '../src/colorUtils'
import { calculateColor } from '../src/colorScheme'

describe('colorMapper', () => {
    describe('allocationColorMapper', () => {
        it('returns highlight color when node is highlighted', () => {
            const d = {
                highlight: true,
                data: { value: 10 },
                value: 100
            }
            const result = allocationColorMapper(d, '#E600E6')
            expect(result).toBe('#E600E6')
        })

        it('returns green color for 100% self value', () => {
            const d = {
                highlight: false,
                data: { value: 100 },
                value: 100
            }
            const result = allocationColorMapper(d, '#000000')
            expect(result).toBe('rgb(0,255,40)')
        })

        it('returns light green color for 50% self value', () => {
            const d = {
                highlight: false,
                data: { value: 50 },
                value: 100
            }
            const result = allocationColorMapper(d, '#000000')
            expect(result).toBe('rgb(98,250,137)')
        })

        it('returns dark teal color for 0% self value', () => {
            const d = {
                highlight: false,
                data: { value: 0 },
                value: 100
            }
            const result = allocationColorMapper(d, '#000000')
            expect(result).toBe('rgb(196,245,233)')
        })

        it('handles non-zero total value', () => {
            const d = {
                highlight: false,
                data: { value: 25 },
                value: 50
            }
            const result = allocationColorMapper(d, '#000000')
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })
    })

    describe('offCpuColorMapper', () => {
        it('returns highlight color when node is highlighted', () => {
            const d = {
                highlight: true,
                data: { name: 'test' },
                value: 100
            }
            const result = offCpuColorMapper(d, '#E600E6')
            expect(result).toBe('#E600E6')
        })

        it('generates color from name using generateColorVector', () => {
            const d = {
                highlight: false,
                data: { name: 'test' },
                value: 100
            }
            const vector = generateColorVector('test')
            const expectedR = Math.round(55 * (1 - vector))
            const expectedG = Math.round(230 * (1 - vector))
            const expectedB = Math.round(200 + 55 * vector)

            const result = offCpuColorMapper(d, '#000000')
            expect(result).toBe(`rgb(${expectedR},${expectedG},${expectedB})`)
        })

        it('uses n property as name fallback', () => {
            const d = {
                highlight: false,
                data: { n: 'namedFunction' },
                value: 100
            }
            const result = offCpuColorMapper(d, '#000000')
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })

        it('handles empty name', () => {
            const d = {
                highlight: false,
                data: { name: '' },
                value: 100
            }
            const result = offCpuColorMapper(d, '#000000')
            expect(result).toBe('rgb(55,230,200)')
        })
    })

    describe('nodeJsColorMapper', () => {
        it('returns original color when no extras', () => {
            const d = {
                data: {},
                value: 100
            }
            const result = nodeJsColorMapper(d, '#123456')
            expect(result).toBe('#123456')
        })

        it('returns grey for non-JS V8 JIT frames', () => {
            const d = {
                data: {
                    extras: {
                        v8_jit: true,
                        javascript: false,
                        optimized: 50
                    }
                },
                value: 100
            }
            const result = nodeJsColorMapper(d, '#123456')
            expect(result).toBe('#dadada')
        })

        it('returns dark red for unoptimized JavaScript', () => {
            const d = {
                data: {
                    extras: {
                        v8_jit: true,
                        javascript: true,
                        optimized: 0
                    }
                },
                value: 100
            }
            const result = nodeJsColorMapper(d, '#123456')
            expect(result).toContain('rgb(240')
            expect(result).toContain('0, 0)')
        })

        it('returns bluish color for partially optimized JavaScript (40-90%)', () => {
            const d = {
                data: {
                    extras: {
                        v8_jit: true,
                        javascript: true,
                        optimized: 50
                    }
                },
                value: 100
            }
            const result = nodeJsColorMapper(d, '#123456')
            expect(result).toMatch(/^rgb\(\s*0\s*,\s*\d+(\.\d+)?\s*,\s*\d+\s*\)$/)
        })

        it('returns greenish color for highly optimized JavaScript (>90%)', () => {
            const d = {
                data: {
                    extras: {
                        v8_jit: true,
                        javascript: true,
                        optimized: 95
                    }
                },
                value: 100
            }
            const result = nodeJsColorMapper(d, '#123456')
            expect(result).toMatch(/^rgb\(\s*0\s*,\s*\d+(\.\d+)?\s*,\s*0\s*\)$/)
        })

        it('handles missing extras', () => {
            const d = {
                data: {},
                value: 100
            }
            const result = nodeJsColorMapper(d, '#123456')
            expect(result).toBe('#123456')
        })
    })

    describe('differentialColorMapper', () => {
        it('returns highlight color when node is highlighted', () => {
            const d = {
                highlight: true,
                data: {},
                value: 100
            }
            const result = differentialColorMapper(d, '#E600E6')
            expect(result).toBe('#E600E6')
        })

        it('returns orange for new frame (delta equals value)', () => {
            const d = {
                highlight: false,
                data: { delta: 100 },
                value: 100
            }
            const result = differentialColorMapper(d, '#000000')
            expect(result).toBe('rgb(255,190,90)')
        })

        it('returns light gray for increase (positive delta)', () => {
            const d = {
                highlight: false,
                data: { delta: 50 },
                value: 100
            }
            const result = differentialColorMapper(d, '#000000')
            expect(result).toContain('rgb(220,')
            expect(result).toContain(',118)')
        })

        it('returns light gray for decrease (negative delta)', () => {
            const d = {
                highlight: false,
                data: { delta: -50 },
                value: 100
            }
            const result = differentialColorMapper(d, '#000000')
            expect(result).toContain('rgb(118,118,')
        })

        it('handles unsignedDelta when value is less than unsignedDelta', () => {
            const d = {
                highlight: false,
                data: { delta: 200 },
                value: 50
            }
            const result = differentialColorMapper(d, '#000000')
            expect(result).toBe('rgb(255,190,90)')
        })

        it('uses d property as delta fallback', () => {
            const d = {
                highlight: false,
                data: { d: 50 },
                value: 100
            }
            const result = differentialColorMapper(d, '#000000')
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })

        it('handles zero delta', () => {
            const d = {
                highlight: false,
                data: { delta: 0 },
                value: 100
            }
            const result = differentialColorMapper(d, '#000000')
            expect(result).toBe('rgb(220,220,220)')
        })

        it('handles node.v property as value fallback', () => {
            const d = {
                highlight: false,
                data: { delta: 50, v: 100 }
            }
            const result = differentialColorMapper(d, '#000000')
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })
    })
})

describe('colorUtils', () => {
    describe('generateColorVector', () => {
        it('returns 0 for null/undefined input', () => {
            expect(generateColorVector(null)).toBe(0)
            expect(generateColorVector(undefined)).toBe(0)
        })

        it('returns 0 for empty string', () => {
            expect(generateColorVector('')).toBe(0)
        })

        it('returns consistent vector for same input', () => {
            const v1 = generateColorVector('functionName')
            const v2 = generateColorVector('functionName')
            expect(v1).toBe(v2)
        })

        it('drops module name after backtick', () => {
            const withModule = generateColorVector('module`functionName')
            const withoutModule = generateColorVector('functionName')
            expect(withModule).toBe(withoutModule)
        })

        it('drops content after parenthesis', () => {
            const withParen = generateColorVector('functionName(args)')
            const withoutParen = generateColorVector('functionName')
            expect(withParen).toBe(withoutParen)
        })

        it('favors early characters over later ones', () => {
            const v1 = generateColorVector('abcdef')
            const v2 = generateColorVector('ghijkl')
            expect(v1).not.toBe(v2)
        })

        it('produces similar vectors for similar prefixes', () => {
            const v1 = generateColorVector('abcdefghij')
            const v2 = generateColorVector('abcdef')
            expect(Math.abs(v1 - v2)).toBeLessThan(0.1)
        })
    })
})

describe('colorScheme', () => {
    describe('calculateColor', () => {
        it('calculates red hue colors', () => {
            const result = calculateColor('red', 0.5)
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })

        it('calculates orange hue colors', () => {
            const result = calculateColor('orange', 0.5)
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })

        it('calculates yellow hue colors', () => {
            const result = calculateColor('yellow', 0.5)
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })

        it('calculates green hue colors', () => {
            const result = calculateColor('green', 0.5)
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })

        it('calculates pastelgreen hue colors', () => {
            const result = calculateColor('pastelgreen', 0.5)
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })

        it('calculates blue hue colors', () => {
            const result = calculateColor('blue', 0.5)
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })

        it('calculates aqua hue colors', () => {
            const result = calculateColor('aqua', 0.5)
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })

        it('calculates cold hue colors', () => {
            const result = calculateColor('cold', 0.5)
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })

        it('calculates warm hue colors (default)', () => {
            const result = calculateColor('warm', 0.5)
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })

        it('handles unknown hue as warm', () => {
            const result = calculateColor('unknown', 0.5)
            expect(result).toMatch(/^rgb\(\d+,\d+,\d+\)$/)
        })

        it('handles vector 0', () => {
            const result = calculateColor('red', 0)
            expect(result).toBe('rgb(200,50,50)')
        })

        it('handles vector 1', () => {
            const result = calculateColor('red', 1)
            expect(result).toBe('rgb(255,130,130)')
        })

        it('produces different colors for different hues', () => {
            const red = calculateColor('red', 0.5)
            const green = calculateColor('green', 0.5)
            const blue = calculateColor('blue', 0.5)
            expect(red).not.toBe(green)
            expect(green).not.toBe(blue)
            expect(red).not.toBe(blue)
        })
    })
})