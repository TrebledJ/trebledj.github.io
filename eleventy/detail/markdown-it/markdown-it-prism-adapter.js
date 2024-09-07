const loadLanguages = require('prismjs/components/');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

/* eslint-disable */
const HTML_ESCAPE_TEST_RE = /[&<>"]/
const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g
const HTML_REPLACEMENTS = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
}

function replaceUnsafeChar(ch) {
    return HTML_REPLACEMENTS[ch]
}

function escapeHtml(str) {
    if (HTML_ESCAPE_TEST_RE.test(str)) {
        return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar)
    }
    return str
}


const UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g
const ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi
const UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi')

const DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i

function replaceEntityPattern(match, name) {
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

function unescapeMd(str) {
    if (str.indexOf('\\') < 0) { return str }
    return str.replace(UNESCAPE_MD_RE, '$1')
}

function unescapeAll(str) {
    if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) { return str }

    return str.replace(UNESCAPE_ALL_RE, function (match, escaped, entity) {
        if (escaped) { return escaped }
        return replaceEntityPattern(match, entity)
    })
}


// PrismJS compatibility: attributes on codeblocks should go on `pre`, not `code`.
// Adapted from https://github.com/markdown-it/markdown-it/blob/0fe7ccb4b7f30236fb05f623be6924961d296d3d/lib/renderer.mjs#L29
module.exports = function (tokens, idx, options, _env, slf) {
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
    // if (options.highlight) {
    if (langName.startsWith('diff-')) {
        let diffRemovedRawName = langName.substring("diff-".length);
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
        highlighted = escapeHtml(token.content)
    }

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

        // Some plugins such as toolbar venture into codeElement.parentElement.parentElement,
        // so we'll wrap the `pre` in an additional `div` for class purposes.
        const result = `<div><pre${slf.renderAttrs(tmpToken)}><code class="${options.langPrefix}${langName}">${highlighted}</code></pre></div>`

        const el = JSDOM.fragment(result);
        Prism.highlightElement(el.firstChild.firstChild.firstChild);
        let newResult = el.firstChild.firstChild.outerHTML;
        if (!newResult.endsWith('\n'))
            newResult += '\n';
        return newResult;
    }

    return `<pre${slf.renderAttrs(token)}><code>${highlighted}</code></pre>\n`
}
