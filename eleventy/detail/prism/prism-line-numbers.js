// Modified from Prism's built-in plugins.
(function () {
  if (typeof Prism === 'undefined' || typeof document === 'undefined') {
    return;
  }

  /**
   * Plugin name which is used as a class name for <pre> which is activating the plugin
   *
   * @type {string}
   */
  const PLUGIN_NAME = 'line-numbers';

  /**
   * Regular expression used for determining line breaks
   *
   * @type {RegExp}
   */
  const NEW_LINE_EXP = /\n(?!$)/g;

  /**
   * Global exports
   */
  // const config = Prism.plugins.lineNumbers = {
  //   /**
  //    * Get node for provided line number
  //    *
  //    * @param {Element} element pre element
  //    * @param {number} number line number
  //    * @returns {Element|undefined}
  //    */
  //   getLine(element, number) {
  //     if (element.tagName !== 'PRE' || !element.classList.contains(PLUGIN_NAME)) {
  //       return;
  //     }

  //     const lineNumberRows = element.querySelector('.line-numbers-rows');
  //     if (!lineNumberRows) {
  //       return;
  //     }
  //     const lineNumberStart = parseInt(element.getAttribute('data-start'), 10) || 1;
  //     const lineNumberEnd = lineNumberStart + (lineNumberRows.children.length - 1);

  //     if (number < lineNumberStart) {
  //       number = lineNumberStart;
  //     }
  //     if (number > lineNumberEnd) {
  //       number = lineNumberEnd;
  //     }

  //     const lineIndex = number - lineNumberStart;

  //     return lineNumberRows.children[lineIndex];
  //   },

  //   /**
  //    * Resizes the line numbers of the given element.
  //    *
  //    * This function will not add line numbers. It will only resize existing ones.
  //    *
  //    * @param {HTMLElement} element A `<pre>` element with line numbers.
  //    * @returns {void}
  //    */
  //   resize(element) {
  //     resizeElements([element]);
  //   },

  //   /**
  //    * Whether the plugin can assume that the units font sizes and margins are not depended on the size of
  //    * the current viewport.
  //    *
  //    * Setting this to `true` will allow the plugin to do certain optimizations for better performance.
  //    *
  //    * Set this to `false` if you use any of the following CSS units: `vh`, `vw`, `vmin`, `vmax`.
  //    *
  //    * @type {boolean}
  //    */
  //   assumeViewportIndependence: true,
  // };

  // /**
  //  * Resizes the given elements.
  //  *
  //  * @param {HTMLElement[]} elements
  //  */
  // function resizeElements(elements) {
  //   elements = elements.filter(function (e) {
  //     var codeStyles = getStyles(e);
  //     var whiteSpace = codeStyles['white-space'];
  //     return whiteSpace === 'pre-wrap' || whiteSpace === 'pre-line';
  //   });

  //   if (elements.length == 0) {
  //     return;
  //   }

  //   var infos = elements.map(function (element) {
  //     var codeElement = element.querySelector('code');
  //     var lineNumbersWrapper = element.querySelector('.line-numbers-rows');
  //     if (!codeElement || !lineNumbersWrapper) {
  //       return undefined;
  //     }

  //     /** @type {HTMLElement} */
  //     var lineNumberSizer = element.querySelector('.line-numbers-sizer');
  //     var codeLines = codeElement.textContent.split(NEW_LINE_EXP);

  //     if (!lineNumberSizer) {
  //       lineNumberSizer = document.createElement('span');
  //       lineNumberSizer.className = 'line-numbers-sizer';

  //       // codeElement.appendChild(lineNumberSizer);
  //       element.appendChild(lineNumberSizer);
  //     }

  //     lineNumberSizer.innerHTML = '0';
  //     lineNumberSizer.style.display = 'block';

  //     var oneLinerHeight = lineNumberSizer.getBoundingClientRect().height;
  //     lineNumberSizer.innerHTML = '';

  //     return {
  //       element: element,
  //       lines: codeLines,
  //       lineHeights: [],
  //       oneLinerHeight: oneLinerHeight,
  //       sizer: lineNumberSizer,
  //     };
  //   }).filter(Boolean);

  //   infos.forEach(function (info) {
  //     var lineNumberSizer = info.sizer;
  //     var lines = info.lines;
  //     var lineHeights = info.lineHeights;
  //     var oneLinerHeight = info.oneLinerHeight;

  //     lineHeights[lines.length - 1] = undefined;
  //     lines.forEach(function (line, index) {
  //       if (line && line.length > 1) {
  //         var e = lineNumberSizer.appendChild(document.createElement('span'));
  //         e.style.display = 'block';
  //         e.textContent = line;
  //       } else {
  //         lineHeights[index] = oneLinerHeight;
  //       }
  //     });
  //   });

  //   infos.forEach(function (info) {
  //     var lineNumberSizer = info.sizer;
  //     var lineHeights = info.lineHeights;

  //     var childIndex = 0;
  //     for (var i = 0; i < lineHeights.length; i++) {
  //       if (lineHeights[i] === undefined) {
  //         lineHeights[i] = lineNumberSizer.children[childIndex++].getBoundingClientRect().height;
  //       }
  //     }
  //   });

  //   infos.forEach(function (info) {
  //     var lineNumberSizer = info.sizer;
  //     var wrapper = info.element.querySelector('.line-numbers-rows');

  //     lineNumberSizer.style.display = 'none';
  //     lineNumberSizer.innerHTML = '';

  //     info.lineHeights.forEach(function (height, lineNumber) {
  //       wrapper.children[lineNumber].style.height = height + 'px';
  //     });
  //   });
  // }

  // /**
  //  * Returns style declarations for the element
  //  *
  //  * @param {Element} element
  //  */
  // function getStyles(element) {
  //   if (!element) {
  //     return null;
  //   }

  //   return window.getComputedStyle ? getComputedStyle(element) : (element.currentStyle || null);
  // }

  // var lastWidth = undefined;
  // window.addEventListener('resize', function () {
  //   if (config.assumeViewportIndependence && lastWidth === window.innerWidth) {
  //     return;
  //   }
  //   console.log("resizing - prism line numbers");
  //   lastWidth = window.innerWidth;

  //   resizeElements(Array.prototype.slice.call(document.querySelectorAll('pre.' + PLUGIN_NAME)));
  // });

  Prism.hooks.add('complete', function (env) {
    if (!env.code) {
      return;
    }

    const code = /** @type {Element} */ (env.element);
    const pre = /** @type {HTMLElement} */ (code.parentNode);

    // works only for <code> wrapped inside <pre> (not inline)
    if (!pre || !/pre/i.test(pre.nodeName)) {
      return;
    }

    // Abort if line numbers already exists
    if (pre.querySelector('.line-numbers-rows')) {
      return;
    }

    // only add line numbers if <code> or one of its ancestors has the `line-numbers` class
    if (!Prism.util.isActive(code, PLUGIN_NAME)) {
      return;
    }

    // Remove the class 'line-numbers' from the <code>
    code.classList.remove(PLUGIN_NAME);
    // Add the class 'line-numbers' to the <pre>
    pre.classList.add(PLUGIN_NAME);

    const match = env.code.match(NEW_LINE_EXP);
    const linesNum = match ? match.length + 1 : 1;
    // let lineNumbersWrapper;

    // var lines = new Array(linesNum + 1).join('<span></span>');
    const lines = new Array(linesNum).fill('<span></span>');

    // Skip lines using the same attribute as command-lines.
    const lineNumbersToSkip = pre.getAttribute('data-output');

    if (lineNumbersToSkip !== null) {
      // Parse line numbers - adapted from the command-line plugin.
      lineNumbersToSkip.split(',').forEach(function (section) {
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
          lineStart--;
          lineEnd--;

          for (let j = lineStart; j <= lineEnd; j++) {
            lines[j] = '<span class="ln-skip"></span>';
          }
        }
      });
    }

    const lineNumbersWrapper = document.createElement('span');
    lineNumbersWrapper.setAttribute('aria-hidden', 'true');
    lineNumbersWrapper.className = 'line-numbers-rows';
    lineNumbersWrapper.innerHTML = lines.join('');

    if (pre.hasAttribute('data-start')) {
      pre.style.counterReset = `linenumber ${parseInt(pre.getAttribute('data-start'), 10) - 1}`;
    }

    env.element.parentElement.appendChild(lineNumbersWrapper);

    // resizeElements([pre]);

    Prism.hooks.run('line-numbers', env);
  });

  Prism.hooks.add('line-numbers', function (env) {
    env.plugins = env.plugins || {};
    env.plugins.lineNumbers = true;
  });
}());
