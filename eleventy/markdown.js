const markdownItAnchor = require('markdown-it-anchor');
const markdownItAttrs = require('markdown-it-attrs');
const markdownItFootnote = require('markdown-it-footnote');
const markdownItSpoiler = require('@traptitech/markdown-it-spoiler');
const markdownItPrism = require('markdown-it-prism');
const pluginTOC = require('eleventy-plugin-toc');

// import loadLanguages from 'prismjs/components/'
const loadLanguages = require('prismjs/components/');


const jsdom = require("jsdom");
const { JSDOM } = jsdom;

global.window = (new JSDOM('')).window;
global.document = global.window.document;
global.getComputedStyle = window.getComputedStyle;
// global.document = 1;

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
      plugins: ['diff-highlight', 'command-line', 'line-numbers']
    });
    // loadLanguages(['diff']);

    // TODO: cleanup and refactor
    const HTML_ESCAPE_TEST_RE = /[&<>"]/
    const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g
    const HTML_REPLACEMENTS = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }

    function replaceUnsafeChar (ch) {
      return HTML_REPLACEMENTS[ch]
    }

    function escapeHtml (str) {
      if (HTML_ESCAPE_TEST_RE.test(str)) {
        return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar)
      }
      return str
    }


    const UNESCAPE_MD_RE  = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g
    const ENTITY_RE       = /&([a-z#][a-z0-9]{1,31});/gi
    const UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi')

    const DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i

    function replaceEntityPattern (match, name) {
      if (name.charCodeAt(0) === 0x23/* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
        const code = name[1].toLowerCase() === 'x'
          ? parseInt(name.slice(2), 16)
          : parseInt(name.slice(1), 10)

        if (isValidEntityCode(code)) {
          return fromCodePoint(code)
        }

        return match
      }

      const decoded = decodeHTML(match)
      if (decoded !== match) {
        return decoded
      }

      return match
    }

    /* function replaceEntities(str) {
      if (str.indexOf('&') < 0) { return str; }

      return str.replace(ENTITY_RE, replaceEntityPattern);
    } */

    function unescapeMd (str) {
      if (str.indexOf('\\') < 0) { return str }
      return str.replace(UNESCAPE_MD_RE, '$1')
    }

    function unescapeAll (str) {
      if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) { return str }

      return str.replace(UNESCAPE_ALL_RE, function (match, escaped, entity) {
        if (escaped) { return escaped }
        return replaceEntityPattern(match, entity)
      })
    }


    // PrismJS compatibility: attributes on codeblocks should go on `pre`, not `code`.
    // Adapted from https://github.com/markdown-it/markdown-it/blob/0fe7ccb4b7f30236fb05f623be6924961d296d3d/lib/renderer.mjs#L29
    /* eslint-disable */
    mdLib.renderer.rules.fence = function (tokens, idx, options, env, slf) {
      const token = tokens[idx]
      const info = token.info ? unescapeAll(token.info).trim() : ''
      let langName = ''
      let langAttrs = ''
    
      if (info) {
        const arr = info.split(/(\s+)/g)
        langName = arr[0]
        langAttrs = arr.slice(2).join('')
      }

      if (token.content.startsWith('\n'))
        token.content = token.content.substring(1);
      if (token.content.endsWith('\n'))
        token.content = token.content.substring(0, token.content.length - 1);
      
      let highlighted
      if (options.highlight) {
        if (langName.startsWith('diff-')) {
          let diffRemovedRawName = langName.substring("diff-".length);
          if (!Prism.languages[diffRemovedRawName])
            loadLanguages([diffRemovedRawName]);
          if (!Prism.languages.diff)
            loadLanguages(['diff']);
          Prism.languages[langName] = Prism.languages.diff;
          highlighted = Prism.highlight(token.content, Prism.languages.diff, langName);
        } else {
          highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content)
        }
      } else {
        highlighted = escapeHtml(token.content)
      }
    
      // if (highlighted.indexOf('<pre') === 0) {
      //   return highlighted + '\n'
      // }
    
      // If language exists, inject class gently, without modifying original token.
      // May be, one day we will add .deepClone() for token and simplify this part, but
      // now we prefer to keep things local.
      if (info) {
        const i = token.attrIndex('class')
        const tmpAttrs = token.attrs ? token.attrs.slice() : []
    
        if (i < 0) {
          tmpAttrs.push(['class', options.langPrefix + langName])
        } else {
          tmpAttrs[i] = tmpAttrs[i].slice()
          tmpAttrs[i][1] += ' ' + options.langPrefix + langName
        }
    
        // Fake token just to render attributes
        const tmpToken = {
          attrs: tmpAttrs
        }
    
        if (Prism.languages[langName] === undefined) {
          loadLanguages([langName])
          // langObject = Prism.languages[langName]
        }

        const result = `<pre${slf.renderAttrs(tmpToken)}><code class="${options.langPrefix}${langName}">${highlighted}</code></pre>\n`
        // if (langName === 'sh' && highlighted.includes('Multiline')) {
        
        const clss = tmpAttrs.find(e => e[0] === 'class');
        if (tmpAttrs.length > 1 || (clss && (clss[1].match(/ /g)?.length ?? 0) >= 1)) {
          // Complex info - highlight with custom Prism plugins.
          const el = JSDOM.fragment(result);
          Prism.highlightElement(el.firstChild.firstChild);
          const newResult = el.firstChild.outerHTML;
          return newResult;
        }
        
        return result;
      }
    
      return `<pre${slf.renderAttrs(token)}><code>${highlighted}</code></pre>\n`
    }
    /* eslint-enable */
    
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
