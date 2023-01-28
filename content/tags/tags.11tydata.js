module.exports = {
	eleventyExcludeFromCollections: true,
	layout: "layouts/page-tag",
	eleventyComputed: {
		permalink: data => '/tags/' + data.page.fileSlug + '/index.html'
	},
};
