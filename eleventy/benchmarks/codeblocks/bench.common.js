const loadLanguages = require('prismjs/components/');
const { unescapeAll, escapeHtml } = require('./markdown-it-helpers');

module.exports.setGlobals = function (_document) {
  if (typeof global.document !== 'undefined')
    delete global.document;
  global.document = _document;
};

module.exports.setRenderFenceRule = function (md, fTextToNode) {
  md.renderer.rules.fence = function (tokens, idx, options, _env, slf) {
    const token = tokens[idx];
    const info = token.info ? unescapeAll(token.info).trim() : '';
    let langName = '';
    // let langAttrs = '';

    if (info) {
      const arr = info.split(/(\s+)/g);
      langName = arr[0];
      // langAttrs = arr.slice(2).join('');
    }

    if (token.content.startsWith('\n'))
      token.content = token.content.substring(1);
    if (token.content.endsWith('\n'))
      token.content = token.content.substring(0, token.content.length - 1);

    let highlighted;
    // if (options.highlight) {
    if (langName.startsWith('diff-')) {
      const diffRemovedRawName = langName.substring('diff-'.length);
      if (!Prism.languages[diffRemovedRawName])
        loadLanguages([diffRemovedRawName]);
      if (!Prism.languages.diff)
        loadLanguages(['diff']);
      Prism.languages[langName] = Prism.languages.diff;
      highlighted = Prism.highlight(token.content, Prism.languages.diff, langName) || escapeHtml(token.content);
      //   } else {
      //     highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content)
      // }
    } else {
      highlighted = escapeHtml(token.content);
    }

    // If language exists, inject class gently, without modifying original token.
    // May be, one day we will add .deepClone() for token and simplify this part, but
    // now we prefer to keep things local.
    if (info) {
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

      if (Prism.languages[langName] === undefined) {
        loadLanguages([langName]);
        // langObject = Prism.languages[langName]
      }

      // Some plugins such as toolbar venture into codeElement.parentElement.parentElement,
      // so we'll wrap the `pre` in an additional `div` for class purposes.
      // eslint-disable-next-line max-len
      const result = `<div><pre${slf.renderAttrs(tmpToken)}><code class="${options.langPrefix}${langName}">${highlighted}</code></pre></div>`;

      const el = fTextToNode(result);
      Prism.highlightElement(el.firstChild.firstChild.firstChild);
      let newResult = el.firstChild.firstChild.outerHTML;
      if (!newResult.endsWith('\n'))
        newResult += '\n';
      return newResult;
    }

    return `<pre${slf.renderAttrs(token)}><code>${highlighted}</code></pre>\n`;
  };
};
