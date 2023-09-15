const path = require('path');

function toTitleCase(str) {
	return str.replace(
		/\w\S*/g,
		function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}

module.exports = {
	eleventyExcludeFromCollections: false,
	layout: "layouts/page-tag",
	eleventyComputed: {
		permalink: data => '/tags/' + data.page.fileSlug + '/index.html',
		title: data => data.title ? data.title : toTitleCase(data.page.fileSlug),
		tag: data => data.page.fileSlug,
		group: data => data.page.filePathStem.replace(/^\/tags\//, '').replace(/\/[\w-]+$/, '').replace('/', '.'),
	},
};
