const markdownItAnchor = require('markdown-it-anchor');
const markdownItAttrs = require('markdown-it-attrs');
const markdownItFootnote = require('markdown-it-footnote');
const markdownItSpoiler = require('@traptitech/markdown-it-spoiler');
const pluginTOC = require('eleventy-plugin-toc');

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
    mdLib.renderer.rules.footnote_caption = (tokens, idx/* , options, env, slf */) => {
      const n = Number(tokens[idx].meta.id + 1).toString();
      // This following `if` will enable the sub-id being shown on the footnote marking.
      // Sub-ids > 0 occur when there are multiple footnotes with the same reference.
      // if (tokens[idx].meta.subId > 0) {
      //  n += ':' + tokens[idx].meta.subId;
      // }
      return n;
    };
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

  eleventyConfig.addFilter('tocFast', function (content) {
    const key = this.page.outputPath;
    if (tocMemo[key] !== undefined)
      return tocMemo[key];

    const toc = eleventyConfig.getFilter('toc')(content);
    tocMemo[key] = toc || '';
    return toc;
  });
};
