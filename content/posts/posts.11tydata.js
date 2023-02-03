module.exports = {
	tags: [
		"posts"
	],
	layout: "layouts/post-default",
	eleventyComputed: {
		permalink: data => '/posts/' + data.page.fileSlug + '/index.html'
	},
	author: "trebledj",
	thumbnail: "/img/posts/thumbnail/default.png",
	include_thumbnail: false,
	sharable: true,
	comments: true,
	related: {
		auto: true,
		num: 4,
		disable: false,
	},
	eleventyExcludeFromCollections: false,
};
