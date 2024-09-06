(function () {

	if (typeof Prism === 'undefined' || typeof document === 'undefined') {
		return;
	}

	if (!Prism.plugins.toolbar) {
		console.warn('Show Filename plugin loaded before Toolbar plugin.');

		return;
	}

	Prism.plugins.toolbar.registerButton('show-filename', function (env) {
		var pre = env.element.parentNode;
		if (!pre || !/pre/i.test(pre.nodeName)) {
			return;
		}

        var filename = pre.getAttribute('data-filename');
        if (!filename) {
            return;
        }

		var element = document.createElement('span');
		element.textContent = filename;

		return element;
	});

}());
