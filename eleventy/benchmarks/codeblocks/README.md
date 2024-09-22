# Markdown-to-HTML with Prism Plugins - DOM Benchmark

To run the benchmark, first do an install:

```sh
npm i -g jsdom domino linkedom chartjs-node-canvas chart.js
```

Then:

```sh
node eleventy/benchmarks/codeblocks
```

Results should be printed to console, and a graph should be generated in your current directory.
