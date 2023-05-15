const htmlmin = require("html-minifier");

const plugins = require('./eleventy/plugins');
const filters = require('./eleventy/filters');
const markdown = require('./eleventy/markdown');
const collections = require('./eleventy/collections');

module.exports = function (eleventyConfig) {
	process.env.ENVIRONMENT = process.env.ENVIRONMENT || 'development';
	console.log(`environment: ${process.env.ENVIRONMENT}`);

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./assets/img": "/img",
		"./assets/webfonts": "/webfonts",
		"./node_modules/bootstrap/dist/": "/",
		"./assets/js/**/*.js": "/js/",
		"./node_modules/@popperjs/core/dist/umd/popper.min.{js,js.map}": "/js/",
		"./node_modules/lunr/*.js": "/js/",
		"./node_modules/sharer.js/*.js": "/js/",
		"./assets/css/**/*.{css,map}": "/css/",
		"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css",
	});

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Process content images to the image pipeline.
	eleventyConfig.addWatchTarget("assets/**/*.{png,jpg}");

	eleventyConfig.setWatchThrottleWaitTime(100);

	eleventyConfig.setServerOptions({
		liveReload: true,
		watch: [
			'./_site/css/**/*.css',
			'./_site/posts/*',
			'./_site/tags/*',
			'./_site/music',
		]
	});


	// Plugins
	plugins(eleventyConfig);

	// Collections
	collections(eleventyConfig);

	// Filters
	filters(eleventyConfig);

	// Transforms
	eleventyConfig.addTransform("htmlmin", function (content) {
		// Prior to Eleventy 2.0: use this.outputPath instead
		if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
			let minified = htmlmin.minify(content, {
				removeComments: true,
				includeAutoGeneratedTags: false,
				minifyCSS: true,
				minifyJS: true,
				collapseWhitespace: true
			});
			return minified;
		}

		return content;
	});


	// Customize Markdown library settings:
	markdown(eleventyConfig);
	

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	return {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html, *.liquid
		templateFormats: [
			"md",
			"njk",
			"html",
			"liquid"
		],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		// These are all optional:
		dir: {
			input: "content",         // default: "."
			includes: "../_includes",  // default: "_includes"
			data: "../_data",          // default: "_data"
			output: "_site"
		},

		// -----------------------------------------------------------------
		// Optional items:
		// -----------------------------------------------------------------

		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

		// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
		// it will transform any absolute URLs in your HTML to include this
		// folder name and does **not** affect where things go in the output folder.
		pathPrefix: "/",
	};
};
