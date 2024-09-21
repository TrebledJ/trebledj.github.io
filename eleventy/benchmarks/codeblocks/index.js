const { Timer } = require('./stoolmark');
const isEqualHTML = require('./isEqualHTML');
const { plot } = require('./plotBenchmark');

// Setup markdown and prism.

const loadLanguages = require('prismjs/components/');

const md = require('markdown-it')({
    html: true,
    breaks: false,
    linkify: true,
});

md.use(require('markdown-it-attrs'), {
    leftDelimiter: '{',
    rightDelimiter: '}',
    allowedAttributes: [], // empty array = all attributes are allowed
});

md.use(require('markdown-it-prism'), {
    highlightInlineCode: true,
    plugins: ['command-line', 'toolbar'],
    init(Prism) {
        loadLanguages(['cpp']);
        Prism.languages.csp = Prism.languages.cpp;
        loadLanguages(['armasm']);
        Prism.languages.asm = Prism.languages.armasm;
    },
});
loadLanguages(['diff']);
require('prismjs/plugins/diff-highlight/prism-diff-highlight');
require('../../detail/prism/prism-line-numbers');
require('../../detail/prism/prism-show-language');
require('../../detail/prism/prism-copy-to-clipboard');


// Prepare content.
const fs = require('fs');
const content = fs.readFileSync('eleventy/benchmarks/codeblocks/fixtures/codeblocks.md', 'utf8');
const expectedHtml = fs.readFileSync('eleventy/benchmarks/codeblocks/fixtures/codeblocks.out.html', 'utf8');

// Benchmark cases.
cases = [
    {
        name: 'JSDOM',
        loaderFile: './bench.jsdom',
    },
    {
        name: 'domino',
        loaderFile: './bench.domino',
    },
    {
        name: 'LinkeDOM',
        loaderFile: './bench.linkedom',
    },
]

// Output data, to be plotted.
const labels = [];
const times = [];

for (const { name, loaderFile } of cases) {
    const timer = new Timer(name);
    timer.time({
        seconds: 120,
        setup() {
            const { setup } = require(loaderFile);
            setup(md);

            // Sanity check: ensure rendered HTML is equivalent.
            const rendered = md.render(content);
            if (!isEqualHTML(rendered, expectedHtml)) {
                const filename = `eleventy/benchmarks/codeblocks/fixtures/codeblocks.bad.${name}.out.html`;
                console.log(`HTML output mismatch! Check ${filename}.`);
                fs.writeFileSync(filename, rendered, 'utf8');
            }
        },
        run() {
            const _ = md.render(content);
        }
    });
    timer.report();

    labels.push(name);
    times.push(timer.mean());
}

// Remove DOM globals so it doesn't mess with Node-based ChartJS.
if (typeof document !== 'undefined') delete document;
if (typeof window !== 'undefined') delete window;

plot({
    title: "Markdown-to-HTML with Prism - DOM Benchmark",
    labels,
    data: times,
    filename: 'dom-benchmark.png'
});
