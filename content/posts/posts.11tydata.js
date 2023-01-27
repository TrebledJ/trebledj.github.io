module.exports = {
	tags: [
		"posts"
	],
	layout: "layouts/post",
	eleventyComputed: {
		permalink: data => '/posts/' + data.page.fileSlug
	},
	author: "trebledj",
	thumbnail: "/img/posts/thumbnail/default.png",
	include_thumbnail: false,
	sharable: true,
	comments: true,
	related_auto: false,
};
