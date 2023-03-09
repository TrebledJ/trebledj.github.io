const { getGitCommitDateFromPath } = require("eleventy-plugin-git-commit-date");

module.exports = {
	tags: [
		"posts"
	],
	layout: "layouts/post-default",
	eleventyComputed: {
		updated: data => {
			let d = getGitCommitDateFromPath(data.page.inputPath);
			console.log(`date of ${data.page.inputPath}: ${d}`);
			return d;
		},
		// updated: data => process.env.ENVIRONMENT === 'development' ? new Date() : getGitCommitDateFromPath(data.page.inputPath),
		permalink: data => '/posts/' + data.page.fileSlug + '/index.html',
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
