# Tailwind Migration Design

**Date:** 2026-03-04  
**Status:** Approved

## Overview

Replace Bootstrap 3.3.7 CSS with Tailwind CSS via CDN in the demo page (`src/index.html`).

## Goals

- Modernize the demo page styling
- Keep vanilla JS approach (no React)
- Maintain all existing functionality

## Changes

### 1. Remove Bootstrap CSS

Delete the Bootstrap CDN link from `<head>`:

```html
<link
    rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
/>
```

### 2. Add Tailwind CSS

Add to `<head>`:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

### 3. Replace Classes

| Element          | Before                                    | After                                                                              |
| ---------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| Body             | `padding-top: 20px; padding-bottom: 20px` | `pt-5 pb-5`                                                                        |
| Header container | custom `.header` styles                   | `pb-5 border-b border-gray-200`                                                    |
| Title            | `h3.text-muted`                           | `text-2xl font-semibold text-gray-600`                                             |
| Nav container    | -                                         | `flex justify-between items-center`                                                |
| Buttons          | `btn`                                     | `px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50` |
| Primary button   | `btn btn-primary`                         | `px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700`                       |
| Input            | `form-control`                            | `border border-gray-300 rounded px-3 py-1`                                         |
| Form             | `form-inline`                             | `flex items-center gap-2`                                                          |
| Container        | custom max-width 990px                    | `max-w-4xl mx-auto`                                                                |

### 4. Remove IE8 Fallbacks

Delete lines 43-47 (HTML5 shim and Respond.js for IE8).

## Expected Result

- Similar layout to current (header, nav, chart, details)
- Modern minimalist aesthetic with gray tones
- Blue accent for primary actions (Search button)
- All JavaScript functionality preserved
