module.exports = {
	tags: [
		"posts"
	],
	layout: "layouts/post",
	eleventyComputed: {
		permalink: data => '/posts/' + data.page.fileSlug
	}
};
