/**
 * When the given elements is clicked by the user, the given text will be copied to clipboard.
 *
 * @param {HTMLElement} element
 * @param {CopyInfo} copyInfo
 *
 * @typedef CopyInfo
 * @property {() => string} getText
 * @property {() => void} success
 * @property {(reason: unknown) => void} error
 */
function registerClipboard(element, copyInfo) {
  element.addEventListener('click', function () {
    copyTextToClipboard(copyInfo);
  });
}

// https://stackoverflow.com/a/30810322/7595472

/** @param {CopyInfo} copyInfo */
function fallbackCopyTextToClipboard(copyInfo) {
  const text = copyInfo.getText();
  if (!text) {
    copyInfo.error();
    return;
  }
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    setTimeout(function () {
      if (successful) {
        copyInfo.success();
      } else {
        copyInfo.error();
      }
    }, 1);
  } catch (err) {
    setTimeout(function () {
      copyInfo.error(err);
    }, 1);
  }

  document.body.removeChild(textArea);
}
/** @param {CopyInfo} copyInfo */
function copyTextToClipboard(copyInfo) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(copyInfo.getText()).then(copyInfo.success, function () {
      // try the fallback in case `writeText` didn't work
      fallbackCopyTextToClipboard(copyInfo);
    });
  } else {
    fallbackCopyTextToClipboard(copyInfo);
  }
}

/**
 * Selects the text content of the given element.
 *
 * @param {Element} element
 */
function selectElementText(element) {
  // https://stackoverflow.com/a/20079910/7595472
  window.getSelection().selectAllChildren(element);
}

const clipboardSettings = {
  copy: 'var(--icon-copy)',
  // 'copy-error': '',
  'copy-success': 'var(--icon-copied)',
  'copy-timeout': 5000,
};

document.querySelectorAll('.copy-to-clipboard-button').forEach(el => {
  function setState(state) {
    el.style.backgroundImage = clipboardSettings[state];
    el.setAttribute('data-copy-state', state);
  }

  function resetText() {
    setTimeout(function () { setState('copy'); }, clipboardSettings['copy-timeout']);
  }

  registerClipboard(el, {
    getText() {
      const children = el.parentElement.parentElement.parentElement.children;
      for (let i = 0; i < children.length; i++) {
        if (children[i].tagName.toLowerCase() === 'pre') {
          return filterTextToCopy(children[i], children[i].textContent);
        }
        console.error('Error obtaining text, could not find PRE element.');
      }
      return undefined;
    },
    success() {
      setState('copy-success');

      resetText();
    },
    error() {
      // setState('copy-error');

      setTimeout(function () {
        selectElementText(el);
      }, 1);

      resetText();
    },
  });
});

const NEW_LINE_EXP = /\n(?!$)/g;

function filterTextToCopy(preElement, code) {
  // Filter out output lines from the command-line or line-number plugins.
  const lineNumbersToSkip = preElement.getAttribute('data-output');
  const lines = code.split(NEW_LINE_EXP);
  if (lineNumbersToSkip !== null) {
    const linesNum = lines.length;

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
          lines[j] = undefined;
        }
      }
    });

    code = lines.filter(s => s !== undefined);
  } else if (preElement.classList.contains('command-line')) {
    const nonOutputLines = preElement.querySelectorAll('.token.command');
    code = Array.prototype.slice.call(nonOutputLines)
      .map(e => e.textContent);
  } else {
    code = lines;
  }

  // Filter out diff lines from the diff-highlight plugin.
  let isDiffBlock = false;
  for (let i = 0; i < preElement.classList.length; i++)
    if (preElement.classList[i].startsWith('language-diff')) {
      isDiffBlock = true;
      break;
    }

  if (isDiffBlock) {
    code = code
      .map(line => (line.startsWith('-') ? undefined : line.slice(1)))
      .filter(l => l !== undefined);
  }

  code = code.join('\n');

  return code;
}
