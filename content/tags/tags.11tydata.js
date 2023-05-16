module.exports = {
	eleventyExcludeFromCollections: false,
	layout: "layouts/page-tag",
	eleventyComputed: {
		permalink: data => '/tags/' + data.page.fileSlug + '/index.html'
	},
};
