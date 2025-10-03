// ------------------------------------------ //
// Markdown-It Prism Adapter
// ----------

import PrismLoad from 'prismjs/components/index.js';
import { escapeHtml, unescapeAll } from './markdown-it-utils.js';
// import * as domino from 'domino';
import * as jsdom from 'jsdom';

let _prism;
if (typeof Prism === 'undefined') {
  _prism = import('prismjs');
} else {
  _prism = Prism;
}

// ------------------------------------------ //
// DOMify the runtime.
// ----------

// This must run AFTER loading the base PrismJS (because they do some weird
// shenanigans with window.Element), but BEFORE loading plugins.

function textToDOM(text) {
  return jsdom.JSDOM.fragment(text);
}

if (typeof window === 'undefined') {
  global.window = (new jsdom.JSDOM('')).window;
  global.getComputedStyle = global.window.getComputedStyle;
  global.document = global.window.document;
}

// if (typeof window === 'undefined') {
//   global.window = domino.createWindow('');
//   global.getComputedStyle = global.window.getComputedStyle;
//   global.document = global.window.document;
// }

// function textToDOM(text) {
//   // domino: Use `template` as a workaround: https://github.com/fgnass/domino/issues/73
//   const templ = document.createElement('template');
//   templ.innerHTML = text;
//   return templ.content;
// }

function parseMark(code) {
  const atatDelims = code.split('@@');
  if (atatDelims.length % 2 !== 1) {
    // throw new Error(`expected an even number of '@@' characters (odd count of segments)`);
    return code; // No change.
  }

  // // Iterate through "in"-segments and ensure no newlines.
  // for (let i = 1; i < atatDelims.length; i += 2) {
  //   if (atatDelims[i].includes('\n')) {
  //     return code; // Fail.
  //   }
  // }

  let reconstructed = '';
  for (let i = 0; i < atatDelims.length; i++) {
    reconstructed += atatDelims[i];
    if (i < atatDelims.length - 1) {
      reconstructed += (i % 2 === 0 ? '<mark>' : '</mark>');
    }
  }
  return reconstructed;
}

// ------------------------------------------ //

const DEFAULT_OPTIONS = {
  init: () => { },
  defaultLanguage: undefined,
  // ...
};

export default function MarkdownItPrismAdapter(markdownit, useroptions) {
  const options = { ...DEFAULT_OPTIONS, ...useroptions };

  options.init(_prism);

  // eslint-disable-next-line max-len
  // Adapted from https://github.com/markdown-it/markdown-it/blob/0fe7ccb4b7f30236fb05f623be6924961d296d3d/lib/renderer.mjs#L29
  markdownit.renderer.rules.fence = function (tokens, idx, mdoptions, _env, slf) {
    const token = tokens[idx];
    const info = token.info ? unescapeAll(token.info).trim() : '';
    let langName;

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
        tmpAttrs.push(['class', mdoptions.langPrefix + langName]);
      } else {
        tmpAttrs[i] = tmpAttrs[i].slice();
        tmpAttrs[i][1] += ` ${mdoptions.langPrefix}${langName}`;
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
        if (!Prism.languages[langName])
          PrismLoad([langName]);
      }

      // Handle @@x@@ --> <mark>x</mark>.
      const withMark = parseMark(escaped);

      // Some plugins such as toolbar venture into codeElement.parentElement.parentElement,
      // so we'll wrap the `pre` in an additional `div` for class purposes.
      // eslint-disable-next-line max-len
      const result = `<div><pre${slf.renderAttrs(tmpToken)}><code class="${mdoptions.langPrefix}${langName}">${withMark}</code></pre></div>`;
      const el = textToDOM(result);
      Prism.highlightElement(el.firstChild.firstChild.firstChild);
      const newResult = el.firstChild.firstChild.outerHTML;
      // let newResult = result;
      // if (!newResult.endsWith('\n'))
      //   newResult += '\n';
      return newResult;
    }

    return `<pre${slf.renderAttrs(token)}><code>${escaped}</code></pre>\n`;
  };
};
