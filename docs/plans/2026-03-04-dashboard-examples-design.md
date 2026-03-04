# Dashboard Examples Design

## Overview

Create a unified dashboard in `src/index.html` that incorporates all flame graph examples (Basic, Color Mapper, Differential, Live, Minified) with a collapsible sidebar for navigation.

## Architecture

- **Collapsible sidebar** (left) with list of examples
- **Main content area** replaces chart entirely when switching examples
- **Common utilities** to avoid duplicating search/clear/reset zoom logic

## File Structure

```
src/
├── index.html      # Dashboard with sidebar
├── main.js         # Entry point, handles routing
├── examples/
│   ├── basic.js    # Basic flamegraph config
│   ├── colorMapper.js
│   ├── differential.js
│   ├── live.js
│   └── minified.js
└── lib/
    └── common.js   # Shared utilities

public/
├── stacks.json      # moved from examples/
├── stacks.min.json  # moved from examples/
├── differential.json
└── live.json
```

## Examples Configuration

| Example      | Data File         | Special Config                                                |
| ------------ | ----------------- | ------------------------------------------------------------- |
| Basic        | stacks.json       | Default color mapper                                          |
| Color Mapper | stacks.json       | `.setColorMapper(flamegraph.colorMapper.offCpuColorMapper)`   |
| Differential | differential.json | `.computeDelta(true).setColorMapper(differentialColorMapper)` |
| Live         | live.json         | `.height(1080).transitionDuration(0)`, uses `.merge()`        |
| Minified     | stacks.min.json   | Uses short props (`n`, `v`, `c`) - no sorting                 |

## Common Utilities

Create `src/lib/common.js` exporting:

- `search(chart)` - search by term
- `clear(chart)` - clear search
- `resetZoom(chart)` - reset zoom
- `onClick(d)` - click handler with history pushState
- `setupFormHandlers(chart)` - wire up form and buttons

## UI Components

- Sidebar: shadcn-style collapsible nav
- Main area: chart container + details panel
- Form: search input + Reset zoom + Clear buttons
