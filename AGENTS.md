# AGENTS.md - Developer Guidelines for d3-flame-graph

This document provides guidance for agentic coding agents working in this repository.

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Production build using webpack |
| `npm run serve` | Start webpack-dev-server in development mode |
| `npm run lint` | Run ESLint on `src` and `test` directories |
| `npm run test` | Run Jest tests (automatically runs build first via pretest) |

### Running a Single Test

To run a specific test file or test:

```bash
# Run tests matching a pattern
npx jest --testPathPattern=flamegraph

# Run a specific test file
npx jest test/flamegraph.js

# Run tests with verbose output
npx jest --verbose

# Run tests in watch mode (useful for development)
npx jest --watch
```

## Code Style Guidelines

### General Rules

- **ESLint Configuration**: Uses `standard` config with 4-space indentation
- **Language**: Plain JavaScript (no TypeScript)
- **Module System**: ES6 modules (`import`/`export`)

### Formatting

- **Indentation**: 4 spaces (enforced by ESLint rule `indent: ["error", 4]`)
- **Line endings**: Unix-style (LF)
- **Quotes**: Single quotes preferred, template literals for string interpolation
- **Semicolons**: Required (standard ESLint config)
- **Maximum line length**: Not strictly enforced, but keep lines readable

### Naming Conventions

- **Variables and functions**: `camelCase` (e.g., `getName`, `colorMapper`)
- **Constants**: `UPPER_SNAKE_CASE` for true constants
- **File names**: `camelCase.js` (e.g., `flamegraph.js`, `colorMapper.js`)
- **Classes**: Not used - this codebase uses functional/closure patterns

### Imports

Group imports by category with blank lines between groups:

```javascript
// D3 library imports
import { select } from 'd3-selection'
import { format } from 'd3-format'

// D3 library side-effect imports
import 'd3-transition'

// Local module imports
import { generateColorVector } from './colorUtils'
import { calculateColor } from './colorScheme'
```

### D3-Style Chart API Pattern

The library uses a closure-based pattern similar to D3.js. This pattern uses:

1. **Factory function** returning a chart function
2. **Getter/setter methods** that return the chart function for chaining:
   ```javascript
   chart.height = function (_) {
       if (!arguments.length) { return h }
       h = _
       return chart
   }
   ```
3. **Direct property access** when needed:
   ```javascript
   chart.width(960)
   chart.height(600)
   ```

### Error Handling

- **No explicit error throwing** in most cases - invalid inputs are silently ignored
- **Type checking** using `typeof` before operations
- **Null/undefined checks** with `=== null` or `=== undefined`
- Use **defensive programming** - check conditions before accessing properties

### Comments

- **Minimal comments** in implementation code - code should be self-documenting
- **JSDoc-style comments** in test files for describe blocks:
  ```javascript
  /**
   * @jest-environment jsdom
   */
  ```
- **TODO comments** are used for known issues (e.g., `// TODO: Fix merge with zoom`)

### Testing

- **Test framework**: Jest with `jsdom` environment
- **Test file location**: `test/` directory
- **Naming**: `<module>.js` for test files
- **Snapshot testing**: Uses Jest inline snapshots (`toMatchInlineSnapshot`)
- **Test structure**: Use `describe` blocks for test suites, `beforeEach` for setup

Example test structure:
```javascript
/**
 * @jest-environment jsdom
 */

import flamegraph from 'd3-flamegraph'
import { select } from 'd3-selection'

describe('flame graph library', () => {
    let chartElem

    beforeEach(() => {
        chartElem = document.createElement('div')
    })

    it('should generate a minimal graph', () => {
        const chart = flamegraph()
        const stacks = { name: 'root', value: 1, children: [] }
        select(chartElem).datum(stacks).call(chart)
        expect(chartElem).toMatchInlineSnapshot(`...`)
    })
})
```

### CSS/Styling

- CSS is kept minimal and bundled with the library
- Follow existing patterns for class naming (e.g., `d3-flame-graph-label`, `frame`, `fade`)

### Common Pitfalls to Avoid

1. **Don't use ES7 property initializers** - use traditional function syntax
2. **Don't forget `return chart`** in getter/setter methods
3. **Don't use arrow functions** for methods that need `this` context
4. **Always check `arguments.length`** in getter/setter methods

## Project Structure

```
d3-flame-graph/
├── src/
│   ├── flamegraph.js      # Main flame graph implementation
│   ├── colorMapper.js     # Color mapping utilities
│   ├── colorScheme.js     # Color scheme calculations
│   ├── colorUtils.js      # Color utility functions
│   └── tooltip.js         # Tooltip implementation
├── test/
│   ├── flamegraph.js      # Main tests
│   ├── colorMapper.js     # Color mapper tests
│   └── edgeCases.js       # Edge case tests
├── index.js               # Main entry point
├── package.json           # Dependencies and scripts
├── webpack.config.js      # Webpack configuration
└── .eslintrc.json         # ESLint configuration
```

## External Dependencies

This library depends on D3.js modules:
- d3-array, d3-dispatch, d3-ease, d3-format
- d3-hierarchy, d3-scale, d3-selection, d3-transition

When adding new functionality, prefer using these D3 modules over vanilla JavaScript where appropriate.