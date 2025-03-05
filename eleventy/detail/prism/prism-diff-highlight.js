(function () {
  if (typeof Prism === 'undefined') {
    return;
  }

  const LANGUAGE_REGEX = /^diff-([\w-]+)/i;
  const HTML_TAG = /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/g;
  // this will match a line plus the line break while ignoring the line breaks HTML tags may contain.
  const HTML_LINE = RegExp(/(?:__|[^\r\n<])*(?:\r\n?|\n|(?:__|[^\r\n<])(?![^\r\n]))/.source.replace(/__/g, function () { return HTML_TAG.source; }), 'gi');

  let warningLogged = false;

  const NEW_LINE_EXP = /\n(?!$)/g;
  function iterLineParam(lines, lineNos, callback) {
    if (!lineNos)
      return;
    // Iterates over a line parameter, e.g. 1-4,5,8-10, and runs callback(i) for each line.
    const linesNum = lines.length;

    for (const section of lineNos.split(',')) {
      const range = section.split('-');
      let lineStart = parseInt(range[0], 10);
      let lineEnd = range.length === 2 ? parseInt(range[1], 10) : lineStart;

      if (!Number.isNaN(lineStart) && !Number.isNaN(lineEnd)) {
        if (lineStart < 1) {
          lineStart = 1;
        }
        if (lineEnd > linesNum) {
          lineEnd = linesNum;
        }
        lineStart--; // 0-based index.
        lineEnd--;

        for (let j = lineStart; j <= lineEnd; j++)
          callback(j);

        if (lineEnd == linesNum - 1)
          break;
      }
    }
  }

  Prism.hooks.add('before-sanity-check', function (env) {
    const lang = env.language;
    const pre = env.element.parentElement;
    if (pre.getAttribute('data-diff-add') || pre.getAttribute('data-diff-del')) {
      const lines = env.code.split(NEW_LINE_EXP);
      const added = new Set();
      iterLineParam(lines, pre.getAttribute('data-diff-add'), i => {
        lines[i] = `+${lines[i]}`;
        added.add(i);
      });
      iterLineParam(lines, pre.getAttribute('data-diff-del'), i => {
        if (!added.has(i)) {
          lines[i] = `-${lines[i]}`;
          added.add(i);
        }
      });
      for (let i = 0; i < lines.length; i++) {
        if (!added.has(i)) {
          lines[i] = ` ${lines[i]}`;
        }
      }
      env.code = lines.join('\n');
    }
    if (LANGUAGE_REGEX.test(lang) && !env.grammar) {
      env.grammar = Prism.languages[lang] = Prism.languages.diff;
    }
  });
  Prism.hooks.add('before-tokenize', function (env) {
    if (!warningLogged && !Prism.languages.diff && !Prism.plugins.autoloader) {
      warningLogged = true;
      console.warn("Prism's Diff Highlight plugin requires the Diff language definition (prism-diff.js)."
				+ "Make sure the language definition is loaded or use Prism's Autoloader plugin.");
    }

    const lang = env.language;
    if (LANGUAGE_REGEX.test(lang) && !Prism.languages[lang]) {
      Prism.languages[lang] = Prism.languages.diff;
    }
  });

  Prism.hooks.add('wrap', function (env) {
    let diffLanguage; let diffGrammar;

    if (env.language !== 'diff') {
      const langMatch = LANGUAGE_REGEX.exec(env.language);
      if (!langMatch) {
        return; // not a language specific diff
      }

      diffLanguage = langMatch[1];
      diffGrammar = Prism.languages[diffLanguage];
    }

    const PREFIXES = Prism.languages.diff && Prism.languages.diff.PREFIXES;

    // one of the diff tokens without any nested tokens
    if (PREFIXES && env.type in PREFIXES) {
      /** @type {string} */
      const content = env.content.replace(HTML_TAG, ''); // remove all HTML tags

      /** @type {string} */
      const decoded = content.replace(/&lt;/g, '<').replace(/&amp;/g, '&');

      // remove any one-character prefix
      const code = decoded.replace(/(^|[\r\n])./g, '$1');

      // highlight, if possible
      let highlighted;
      if (diffGrammar) {
        highlighted = Prism.highlight(code, diffGrammar, diffLanguage);
      } else {
        highlighted = Prism.util.encode(code);
      }

      // get the HTML source of the prefix token
      const prefixToken = new Prism.Token('prefix', PREFIXES[env.type], [/\w+/.exec(env.type)[0]]);
      const prefix = Prism.Token.stringify(prefixToken, env.language);

      // add prefix
      const lines = []; let m;
      HTML_LINE.lastIndex = 0;
      while ((m = HTML_LINE.exec(highlighted))) {
        lines.push(prefix + m[0]);
      }
      if (/(?:^|[\r\n]).$/.test(decoded)) {
        // because both "+a\n+" and "+a\n" will map to "a\n" after the line prefixes are removed
        lines.push(prefix);
      }
      env.content = lines.join('');

      if (diffGrammar) {
        env.classes.push(`language-${diffLanguage}`);
      }
    }
  });
}());
