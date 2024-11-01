// ------------------------------------------ // 
// Markdown-It Prism Adapter
// ----------


const PrismLoad = require('prismjs/components/');
const { escapeHtml, unescapeAll } = require('./markdown-it-utils');

let _prism = undefined;
if (typeof Prism === 'undefined') {
  _prism = require('prismjs');
} else {
  _prism = Prism;
}

// ------------------------------------------ // 
// DOMify the runtime.
// ----------

// This must run AFTER loading the base PrismJS (because they do some weird
// shenanigans with window.Element), but BEFORE loading plugins.

if (typeof window === 'undefined') {
  const domino = require('domino');
  global.window = domino.createWindow('');
  global.getComputedStyle = global.window.getComputedStyle;
  global.document = global.window.document;
}


function textToDOM(text) {
  // domino: Use `template` as a workaround: https://github.com/fgnass/domino/issues/73
  const templ = document.createElement('template');
  templ.innerHTML = text;
  return templ.content;
}

// ------------------------------------------ // 

const DEFAULT_OPTIONS = {
  init: () => {},
  defaultLanguage: undefined,
  // ...
};

exports.default = function MarkdownItPrismAdapter(markdownit, useroptions) {
  const options = Object.assign({}, DEFAULT_OPTIONS, useroptions);

  options.init(_prism);

  // eslint-disable-next-line max-len
  // Adapted from https://github.com/markdown-it/markdown-it/blob/0fe7ccb4b7f30236fb05f623be6924961d296d3d/lib/renderer.mjs#L29
  markdownit.renderer.rules.fence = function (tokens, idx, options, _env, slf) {
    const token = tokens[idx];
    const info = token.info ? unescapeAll(token.info).trim() : '';
    let langName = undefined;

    if (info) {
      const arr = info.split(/(\s+)/g);
      langName = arr[0];
    }

    if (langName === undefined) {
      langName = options.defaultLanguage;
    }

    // Fences are parsed with extra newline at the end. Drop it.
    if (token.content.endsWith('\n'))
      token.content = token.content.substring(0, token.content.length - 1);

    const escaped = escapeHtml(token.content);

    // If language exists, inject class gently, without modifying original token.
    // May be, one day we will add .deepClone() for token and simplify this part, but
    // now we prefer to keep things local.
    if (langName !== undefined) {
      const i = token.attrIndex('class');
      const tmpAttrs = token.attrs ? token.attrs.slice() : [];

      if (i < 0) {
        tmpAttrs.push(['class', options.langPrefix + langName]);
      } else {
        tmpAttrs[i] = tmpAttrs[i].slice();
        tmpAttrs[i][1] += ` ${options.langPrefix}${langName}`;
      }

      // Fake token just to render attributes
      const tmpToken = {
        attrs: tmpAttrs,
      };

      // Make sure language is loaded.
      if (langName.startsWith('diff-')) {
        const diffRemovedRawName = langName.substring('diff-'.length);
        if (!Prism.languages[diffRemovedRawName])
          PrismLoad([diffRemovedRawName]);
      } else {
        if (Prism.languages[langName] === undefined)
          PrismLoad([langName]);
      }

      // Some plugins such as toolbar venture into codeElement.parentElement.parentElement,
      // so we'll wrap the `pre` in an additional `div` for class purposes.
      // eslint-disable-next-line max-len
      const result = `<div><pre${slf.renderAttrs(tmpToken)}><code class="${options.langPrefix}${langName}">${escaped}</code></pre></div>`;
      const el = textToDOM(result);
      Prism.highlightElement(el.firstChild.firstChild.firstChild);
      let newResult = el.firstChild.firstChild.outerHTML;
      // let newResult = result;
      // if (!newResult.endsWith('\n'))
      //   newResult += '\n';
      return newResult;
    }

    return `<pre${slf.renderAttrs(token)}><code>${escaped}</code></pre>\n`;
  };
}

module.exports = exports.default;
module.exports.default = exports.default;
