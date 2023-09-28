module.exports = {
	// Draft posts:
	eleventyComputed: {
		permalink: data => {
			let permalink = data.permalink;
			if (!permalink && data.page.filePathStem.startsWith('/posts') && data.page.outputFileExtension === 'html') {
				permalink = `/posts/${data.page.fileSlug}/index.html`;
			}

			if (data.archive) {
				return false;
			}
			
			if (data.draft) {
				// BUILD_DRAFTS is set in eleventy.config.js
				if (process.env.BUILD_DRAFTS) {
					return permalink;
				}

				// Always skip during non-watch/serve builds
				return false;
			}

			return permalink;
		},
	},
};
