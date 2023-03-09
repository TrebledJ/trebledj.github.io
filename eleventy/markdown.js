const markdownItAnchor = require("markdown-it-anchor");
const markdownItAttrs = require('markdown-it-attrs');
const markdownItFootnote = require('markdown-it-footnote');
const pluginTOC = require('eleventy-plugin-toc')


module.exports = function(eleventyConfig) {
    eleventyConfig.amendLibrary("md", mdLib => {
		mdLib.use(markdownItAnchor, {
			// permalink: markdownItAnchor.permalink.ariaHidden({
			// 	placement: "after",
			// 	class: "md-anchor",
			// 	symbol: "§",
			// }),
			level: [2, 3, 4],
			slugify: eleventyConfig.getFilter("slugify"),
		});
		mdLib.use(markdownItFootnote);
		mdLib.renderer.rules.footnote_caption = (tokens, idx/*, options, env, slf*/) => {
			var n = Number(tokens[idx].meta.id + 1).toString();
			if (tokens[idx].meta.subId > 0) {
				n += ':' + tokens[idx].meta.subId;
			}
			return n;
		};

		mdLib.use(markdownItAttrs, {
			leftDelimiter: '{',
			rightDelimiter: '}',
			allowedAttributes: []  // empty array = all attributes are allowed
		});
	});

	eleventyConfig.addPlugin(pluginTOC, {
		tags: ['h2', 'h3'],
		ul: false,
		// wrapper: 'div'
	});
};