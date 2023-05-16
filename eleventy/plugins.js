const path = require("path");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const eleventyImage = require("@11ty/eleventy-img");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const eleventySass = require("eleventy-sass");


module.exports = function (eleventyConfig) {
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

	function relativeToInputPath(inputPath, relativeFilePath) {
		let split = inputPath.split("/");
		split.pop();

		return path.resolve(split.join(path.sep), relativeFilePath);
	}

	// Eleventy Image shortcode
	// https://www.11ty.dev/docs/plugins/image/
	eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt, classes) {
		const useDefaultIf = ['gif'].find(ext => src.endsWith(ext));
		const ext = useDefaultIf || 'webp';
		const animated = src.endsWith('gif');

		// Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
		const formats = [ext];
		// let file = relativeToInputPath(this.page.inputPath, src);
		const file = src;
		const metadata = await eleventyImage(file, {
			widths: ["auto"],
			formats,
			outputDir: path.join(eleventyConfig.dir.output, "img"),
			sharpOptions: {
				animated,
			},
		});

		classes = (typeof classes === 'string' ? classes.split(' ') : typeof classes === 'undefined' ? [] : classes);
		classes.reverse(); // Add classes to the front.
		if (classes.every(c => !c.startsWith('w-')))
			classes.push('w-100'); // Default to full-width;
		if (!classes.includes('multi')) {
			// Solo image.
			classes.push('center');
			classes.push('rw'); 	// Full-width on small screens.
			classes.push('mb-2'); 	// Extra spacing in the bottom.
		}
		classes.reverse();

		const data = metadata[ext][metadata[ext].length - 1];
		const ratio = `aspect-ratio: auto ${data.width} / ${data.height};`; // Alleviate content layout shift.

		return `<img src="${data.url}" class="${classes.join(' ')}" alt="${alt}" title="${alt}" loading="lazy" decoding="async" style="${ratio}">`;
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
					console.log("[11ty] including `draft: true` posts");
				}

				logged = true;
			}
		});
	})
};