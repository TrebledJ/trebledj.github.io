// Mobile ToC: Add a special class for dropdown items.
$('#btn-mobile-toc nav.toc a').addClass('dropdown-item');




// ---
// PrismJS - Toolbar - Copy to Clipboard
// TODO: make css look nicer

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
    var text = copyInfo.getText();
    if (!text) {
        copyInfo.error();
        return;
    }
    var textArea = document.createElement('textarea');
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
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

var clipboardSettings = {
    'copy': 'var(--icon-copy)',
    // 'copy-error': '',
    'copy-success': 'var(--icon-copied)',
    'copy-timeout': 5000
};

document.querySelectorAll('.copy-to-clipboard-button').forEach(el => {
    function setState(state) {
        // el.firstChild.textContent = clipboardSettings[state];
        el.style.backgroundImage = clipboardSettings[state];
        el.setAttribute('data-copy-state', state);
    }

    function resetText() {
        setTimeout(function () { setState('copy'); }, clipboardSettings['copy-timeout']);
    }

    registerClipboard(el, {
        getText: function () {
            const children = el.parentElement.parentElement.parentElement.children;
            for (let i = 0; i < children.length; i++) {
                if (children[i].tagName.toLowerCase() === 'pre') {
                    return children[i].textContent;
                }
            }
            return undefined;
        },
        success: function () {
            setState('copy-success');

            resetText();
        },
        error: function () {
            // setState('copy-error');

            setTimeout(function () {
                selectElementText(el);
            }, 1);

            resetText();
        }
    })
});