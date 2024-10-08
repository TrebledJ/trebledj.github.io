const markdownItAnchor = require('markdown-it-anchor');
const markdownItAttrs = require('markdown-it-attrs');
const markdownItFootnote = require('markdown-it-footnote');
const markdownItPrism = require('markdown-it-prism');
const pluginTOC = require('eleventy-plugin-toc');

const PrismLoad = require('prismjs/components/');
const markdownItSpoiler = require('./detail/markdown-it/markdown-it-spoiler');

require('./detail/markdown-it/domify');

module.exports = function (eleventyConfig) {
  eleventyConfig.amendLibrary('md', mdLib => {
    mdLib.use(markdownItAttrs, {
      leftDelimiter: '{',
      rightDelimiter: '}',
      allowedAttributes: [], // empty array = all attributes are allowed
    });

    if (process.env.ENVIRONMENT === 'fast') {
      // Fast: Just slugify main headers.
      mdLib.use(markdownItAnchor, {
        level: [2, 3],
        slugify: eleventyConfig.getFilter('slugify'),
      });
    } else {
      // Default: Anchor and slugify everything.
      mdLib.use(markdownItAnchor, {
        permalink: markdownItAnchor.permalink.ariaHidden({
          placement: 'before',
          class: 'md-anchor',
          symbol: '',
        }),
        level: [2, 3, 4, 5, 6],
        slugify: eleventyConfig.getFilter('slugify'),
      });
    }

    mdLib.use(markdownItSpoiler);
    mdLib.use(markdownItFootnote);

    mdLib.renderer.rules.footnote_block_open = () => (
      '<hr class="footnotes-sep"/>\n'
      + '<b>Footnotes</b>\n'
      + '<section class="footnotes">\n'
      + '<ol class="footnotes-list">\n');

    mdLib.renderer.rules.footnote_caption = (tokens, idx/* , options, env, slf */) => {
      const n = Number(tokens[idx].meta.id + 1).toString();
      // This following `if` will enable the sub-id being shown on the footnote marking.
      // Sub-ids > 0 occur when there are multiple footnotes with the same reference.
      // if (tokens[idx].meta.subId > 0) {
      //  n += ':' + tokens[idx].meta.subId;
      // }
      return n;
    };

    // Codeblocks and Syntax Highlighting
    mdLib.use(markdownItPrism, {
      highlightInlineCode: true,
      plugins: ['command-line', 'toolbar'],
      init(Prism) {
        PrismLoad(['cpp']);
        Prism.languages.csp = Prism.languages.cpp;
        PrismLoad(['armasm']);
        Prism.languages.asm = Prism.languages.armasm;
        PrismLoad(['diff']);
      },
    });
    require('prismjs/plugins/diff-highlight/prism-diff-highlight');
    require('./detail/prism/prism-line-numbers');
    require('./detail/prism/prism-show-language');
    require('./detail/prism/prism-copy-to-clipboard');

    mdLib.renderer.rules.fence = require('./detail/markdown-it/markdown-it-prism-adapter');
  });

  eleventyConfig.addPlugin(pluginTOC, {
    tags: ['h2', 'h3'],
    ul: false,
    // wrapper: 'div'
  });

  const tocMemo = {}; // Cache for table-of-contents.

  eleventyConfig.on('eleventy.before', () => {
    // Clear cache on every build.
    for (const mem in tocMemo)
      delete tocMemo[mem];
  });

  eleventyConfig.addFilter('tocFast', function (content, localOpts) {
    // localOpts: see https://github.com/jdsteinbach/eleventy-plugin-toc#5-override-default-options-if-necessary,
    // TODO: refactor as cacheByOutputPath decorator
    const key = this.page.outputPath;
    if (tocMemo[key] !== undefined)
      return tocMemo[key];

    const toc = eleventyConfig.getFilter('toc')(content, localOpts);
    tocMemo[key] = toc ?? '';
    return toc;
  });
};
