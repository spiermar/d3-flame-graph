# Tailwind Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Bootstrap 3.3.7 CSS with Tailwind CSS via CDN in src/index.html

**Architecture:** Direct class replacement - remove Bootstrap CDN, add Tailwind CDN, replace all CSS classes with Tailwind utilities

**Tech Stack:** Tailwind CSS (CDN), vanilla JavaScript

---

### Task 1: Modify src/index.html - Remove Bootstrap and Add Tailwind

**Files:**

- Modify: `src/index.html:1-87`

**Step 1: Remove Bootstrap CSS link**

Delete lines 8-11:

```html
<link
    rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
/>
```

**Step 2: Add Tailwind CDN**

Add after the meta tags (around line 7):

```html
<script src="https://cdn.tailwindcss.com"></script>
```

**Step 3: Replace CSS classes**

Replace the entire `<style>` block (lines 13-39) with empty or remove it entirely. Update body class to use Tailwind.

Replace body `div.container` (line 50) from:

```html
<div class="container"></div>
```

to:

```html
<div class="max-w-4xl mx-auto px-4"></div>
```

Replace header div (line 51) from:

```html
<div class="header clearfix"></div>
```

to:

```html
<div class="pb-5 border-b border-gray-200 mb-5"></div>
```

Replace nav (lines 52-73) from:

```html
<nav>
    <div class="pull-right">
        <form class="form-inline" id="form">
            <a class="btn" href="javascript: resetZoom();">Reset zoom</a>
            <a class="btn" href="javascript: clear();">Clear</a>
            <div class="form-group">
                <input type="text" class="form-control" id="term" />
            </div>
            <a class="btn btn-primary" href="javascript: search();">Search</a>
        </form>
    </div>
</nav>
```

to:

```html
<nav class="flex justify-end items-center gap-2">
    <form id="form" class="flex items-center gap-2">
        <a
            class="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            href="javascript: resetZoom();"
            >Reset zoom</a
        >
        <a
            class="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            href="javascript: clear();"
            >Clear</a
        >
        <input
            type="text"
            class="border border-gray-300 rounded px-3 py-1"
            id="term"
        />
        <a
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            href="javascript: search();"
            >Search</a
        >
    </form>
</nav>
```

Replace title h3 (line 74) from:

```html
<h3 class="text-muted">d3-flame-graph</h3>
```

to:

```html
<h3 class="text-2xl font-semibold text-gray-600">d3-flame-graph</h3>
```

**Step 4: Remove IE8 fallbacks**

Delete lines 43-47 (HTML5 shim and Respond.js).

**Step 5: Verify visually**

Run: `npm run dev`
Expected: Page loads with Tailwind styling, all functionality works

---

### Task 2: Verify functionality

**Step 1: Run dev server**

Run: `npm run dev`

**Step 2: Verify in browser**

- Check that the page renders correctly
- Verify Reset zoom button works
- Verify Clear button works
- Verify Search functionality works
- Verify chart displays correctly

---

### Task 3: Commit

**Step 1: Stage and commit**

Run:

```bash
git add src/index.html
git commit -m "refactor: replace Bootstrap with Tailwind CSS"
```
