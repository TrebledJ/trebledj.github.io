(function () {

	if (typeof Prism === 'undefined' || typeof document === 'undefined') {
		return;
	}

	if (!Prism.plugins.toolbar) {
		console.warn('Copy to Clipboard plugin loaded before Toolbar plugin.');

		return;
	}

	Prism.plugins.toolbar.registerButton('copy-to-clipboard', function (env) {
		var element = env.element;

		var linkCopy = document.createElement('button');
		linkCopy.className = 'copy-to-clipboard-button';
		linkCopy.setAttribute('type', 'button');
		linkCopy.setAttribute('title', 'Copy Code')
		// var linkSpan = document.createElement('span');
		// linkCopy.appendChild(linkSpan);

        // linkCopy.style.backgroundImage = 'var(--icon-copy)';

		return linkCopy;
	});
}());
