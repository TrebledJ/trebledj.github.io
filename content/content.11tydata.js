module.exports = {
	// Draft posts:
	eleventyComputed: {
		permalink: data => {
			if (data.draft) {
				// BUILD_DRAFTS is set in eleventy.config.js
				if (process.env.BUILD_DRAFTS) {
					return data.permalink;
				}

				// Always skip during non-watch/serve builds
				return false;
			}

			return data.permalink;
		},
	},
};
