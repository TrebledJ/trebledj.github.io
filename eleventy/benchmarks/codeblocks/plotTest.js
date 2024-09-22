const { plot } = require('./plotBenchmark');

// Output data, to be plotted.
const labels = ['A', 'B', 'C'];
const times = [3, 1, 2];

plot({
  title: 'Markdown-to-HTML with Prism - DOM Benchmark',
  labels,
  data: times,
  filename: 'dom-benchmark.png',
});
