---
title: Hello World
date: 2026-05-24
description: Welcome to my brand new minimalist personal blog. Powered by zero-dependency static pages, built for ultimate performance and timeless aesthetics.
tags: [Meta, Design]
---

Welcome to my brand new blog! This space has been fully custom-designed from the ground up to reflect a premium, minimalist aesthetic. It rejects heavy modern frontend frameworks and instead celebrates the sheer speed and absolute control of pure static HTML, CSS, and vanilla JavaScript.

## Core Design Principles

I believe that content should be read, not loaded. To achieve this, this blog adheres to three core directives:

1. **Obsidian Minimalist Aesthetics**: A dark, tactile reading environment utilizing deep pitch-black (`#050505`) backdrops, ultra-thin elegant borders, and soft silver typography.
2. **Editorial Typography**: Pairing the luxury serif typeface **Cormorant Garamond** for titles with the ultra-clean geometric sans-serif **Inter** for long-form reading comfort.
3. **Zero Third-Party Dependencies**: No external npm packages. Every element, from the markdown compiler to the theme engine, runs on raw, native APIs.

---

## Technical Specifications

The compilation pipeline is powered by a custom Node.js engine (`build.js`). Here is a quick demonstration of our zero-dependency markdown syntax:

### 1. Code Highlight Test
Below is an example of a simple function in Javascript:

```javascript
// A simple word count estimator
function estimateReadingTime(text) {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
```

### 2. Formatted Quotations
High-fashion typography requires high-fashion quotes:

> "Simplicity is the ultimate sophistication."
> — Leonardo da Vinci

### 3. Styled Inline Components
Text formatting includes **bold text**, *italic emphasis*, and standard `inline code wrappers` for technical terms.

---

## Writing & Publishing New Posts

Publishing a new article is incredibly streamlined. There are no dev servers to maintain or heavy builders to wait for:

1. **Create** a raw Markdown file in the `posts_source/` directory (e.g., `posts_source/my-creative-thoughts.md`).
2. **Define** standard YAML front-matter at the top of the file:
   ```yaml
   ---
   title: My Creative Thoughts
   date: 2026-05-24
   description: An insightful exploration of design and coding.
   tags: [Thoughts, Design]
   ---
   ```
3. **Run** the compiler script from your workspace directory:
   ```bash
   node build.js
   ```
4. **Deploy** by pushing the updated repository directly to GitHub!

Enjoy reading in this refined, distraction-free atmosphere.
