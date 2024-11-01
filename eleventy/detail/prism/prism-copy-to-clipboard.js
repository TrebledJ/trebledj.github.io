// Modified from Prism's built-in plugins.
(function () {
  if (typeof Prism === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (!Prism.plugins.toolbar) {
    console.warn('Copy to Clipboard plugin loaded before Toolbar plugin.');

    return;
  }

  Prism.plugins.toolbar.registerButton('copy-to-clipboard', function (env) {
    const pre = env.element.parentNode;
    if (!pre || !/pre/i.test(pre.nodeName)) {
      return undefined;
    }

    if (pre.getAttribute('data-copy-off') !== null) {
      return undefined;
    }

    const linkCopy = document.createElement('button');
    linkCopy.className = 'copy-to-clipboard-button';
    linkCopy.setAttribute('type', 'button');
    linkCopy.setAttribute('title', 'Copy Code');
    // var linkSpan = document.createElement('span');
    // linkCopy.appendChild(linkSpan);

    // linkCopy.style.backgroundImage = 'var(--icon-copy)';

    return linkCopy;
  });
}());
