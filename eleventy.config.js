const path = require("path");
const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItAttrs = require('markdown-it-attrs');

const htmlmin = require("html-minifier");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const eleventyImage = require("@11ty/eleventy-img");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const eleventySass = require("eleventy-sass");

module.exports = function (eleventyConfig) {
	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./assets/": "/",
		"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css",
		"./node_modules/font-awesome/css/font-awesome.css": "/css/font-awesome.min.css",
		"./node_modules/font-awesome/fonts/": "/fonts/",
	});

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Process content images to the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{png,jpeg}");

	eleventyConfig.setBrowserSyncConfig(
		require('./browsersync')('dist')
	);
	// eleventyConfig.setBrowserSyncConfig({
	// 	files: './_site/css/**/*.css'
	// });
	eleventyConfig.setServerOptions({
		liveReload: true,
		// files: './_site/css/**/*.css'
		watch: [
			'./_site/css/**/*.css',
			'./_site/posts/**/*.html'
		]
	});


	// Plugins
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginSyntaxHighlight);
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

	eleventyConfig.addPlugin(eleventySass/* , {
		compileOptions: {
			permalink: function (contents, inputPath) {
				return (data) => data.page.filePathStem.replace(/^\/scss\//, "/css/") + ".css";
			}
		}
	} */);

	// Eleventy Image shortcode
	// https://www.11ty.dev/docs/plugins/image/
	eleventyConfig.addPlugin(eleventyConfig => {
		function relativeToInputPath(inputPath, relativeFilePath) {
			let split = inputPath.split("/");
			split.pop();

			return path.resolve(split.join(path.sep), relativeFilePath);
		}

		eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt, sizes) {
			let file = relativeToInputPath(this.page.inputPath, src);
			let metadata = await eleventyImage(file, {
				widths: ["auto"],
				// You can add "avif" or "jpeg" here if you’d like!
				formats: ["webp", "png"],
				outputDir: path.join(eleventyConfig.dir.output, "img"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
			});
			let imageAttributes = {
				alt,
				sizes,
				loading: "lazy",
				decoding: "async",
			};
			return eleventyImage.generateHTML(metadata, imageAttributes);
		});
	});

	// Drafts implementation, see `content/content.11tydata.js` for additional code.
	// This section *could* be simplified to an environment variable in an npm script,
	// but this way an ENV is not required and this code works cross-platform.
	eleventyConfig.addPlugin(function enableDrafts(eleventyConfig) {
		let logged = false;
		eleventyConfig.on("eleventy.before", ({ runMode }) => {
			// Only show drafts in serve/watch modes
			if (runMode === "serve" || runMode === "watch") {
				process.env.BUILD_DRAFTS = true;

				// Only log once.
				if (!logged) {
					console.log("[11ty/eleventy-base-blog] including `draft: true` posts");
				}

				logged = true;
			}
		});
	})

	// Filters
	eleventyConfig.addFilter("date", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "yyyy-LL-dd");
	});

	eleventyConfig.addFilter("exclude", (array, items) => {
		return array.filter(e => typeof(items) == 'string' ? e != items : !items.includes(e));
	});

	eleventyConfig.addFilter("split", (str, delimiter) => {
		return str ? str.split(delimiter || ' ') : [];
	});

	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if (!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if (n < 0) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return all the tags used in a collection
	eleventyConfig.addFilter("getAllTags", collection => {
		let tagSet = new Set();
		for (let item of collection) {
			(item.data.tags || []).forEach(tag => tagSet.add(tag));
		}
		return Array.from(tagSet);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
	});

	eleventyConfig.addNunjucksFilter("markdownify", (markdownString) =>
		md.render(markdownString)
	);

	// Transforms
	eleventyConfig.addTransform("htmlmin", function (content) {
		// Prior to Eleventy 2.0: use this.outputPath instead
		if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
			let minified = htmlmin.minify(content, {
				useShortDoctype: true,
				removeComments: true,
				minifyJS: true,
				collapseWhitespace: true
			});
			return minified;
		}

		return content;
	});


	// Customize Markdown library settings:
	eleventyConfig.amendLibrary("md", mdLib => {
		mdLib.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "direct-link",
				symbol: "#",
			}),
			level: [1, 2, 3, 4],
			slugify: eleventyConfig.getFilter("slugify")
		});
		mdLib.use(markdownItAttrs, {
			leftDelimiter: '{',
			rightDelimiter: '}',
			allowedAttributes: []  // empty array = all attributes are allowed
		});
	});

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
