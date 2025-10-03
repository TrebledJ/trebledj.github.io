import markdownItAnchor from 'markdown-it-anchor';
import markdownItAttrs from 'markdown-it-attrs';
import markdownItFootnote from 'markdown-it-footnote';
import markdownItPrism from 'markdown-it-prism';
import pluginTOC from 'eleventy-plugin-toc';
import markdownItSpoiler from './detail/markdown-it/markdown-it-spoiler.js';
// import markdownItMark from 'markdown-it-mark';

import PrismLoad from 'prismjs/components/index.js';
import markdownItPrismAdapter from './detail/markdown-it/markdown-it-prism-adapter.js';

function PrismAlias(target, aliases) {
  PrismLoad([target]);
  if (typeof aliases === 'string') {
    Prism.languages[aliases] = Prism.languages[target];
  } else if (Array.isArray(aliases)) {
    aliases.forEach(a => {
      Prism.languages[a] = Prism.languages[target];
    });
  } else {
    throw Error('unable to parse aliases');
  }
}

export default function (eleventyConfig) {
  eleventyConfig.amendLibrary('md', mdLib => {
    mdLib.use(markdownItAttrs, {
      leftDelimiter: '{',
      rightDelimiter: '}',
      allowedAttributes: [], // empty array = all attributes are allowed
    });

    mdLib.use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: 'before',
        class: 'md-anchor',
        symbol: '',
      }),
      level: [2, 3, 4, 5, 6],
      slugify: eleventyConfig.getFilter('slugify'),
    });

    mdLib.use(markdownItSpoiler);
    // mdLib.use(markdownItMark);

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
    mdLib.use(markdownItPrismAdapter, {
      init(_Prism) {
        // Avoid "Language does not exist: " console logs
        PrismLoad.silent = true;

        PrismAlias('cpp', ['csp']);
        PrismAlias('armasm', ['asm']);
        PrismLoad(['diff']);
        (async function () {
          // Load diff-highlight plugin after mdLib.use to avoid triggering warning.
          await import('prismjs/plugins/command-line/prism-command-line.js');
          await import('prismjs/plugins/toolbar/prism-toolbar.js');
          await import('prismjs/plugins/keep-markup/prism-keep-markup.js');
          // await import('prismjs/plugins/diff-highlight/prism-diff-highlight.js');
          await import('./detail/prism/prism-diff-highlight.js');
          // Load custom plugins.
          // await import('prismjs/plugins/line-numbers/prism-line-numbers.js');
          await import('./detail/prism/prism-line-numbers.js');
          await import('./detail/prism/prism-show-language.js');
          await import('./detail/prism/prism-copy-to-clipboard.js');
        })();
      },
    });

    // Apply fence-rendering AFTER applying prism adapter.
    mdLib.use(markdownItPrism, {
      highlightInlineCode: true,
      // defaultLanguage will also set the language for non-pre code elements
      // and overwrite the pretty colours we set. So... not the best idea.
      // ---
      // defaultLanguageForUnspecified: 'text',
    });
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
