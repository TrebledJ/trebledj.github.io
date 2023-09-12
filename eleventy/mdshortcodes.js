/**
 * A collection of useful markdown shortcodes to enhance reader experience.
 */

const image = require('./image');


module.exports = function (eleventyConfig) {
	image(eleventyConfig);


	eleventyConfig.addShortcode("alert", async function (role, emoji) {
		const alert = {
			info: ['info', 'circle-info'],
			fact: ['info', 'bolt'],
			warning: ['warning', 'triangle-exclamation'],
			success: ['success', 'lightbulb'],
			danger: ['danger', 'radiation'],
			simple: ['secondary', ''],
		};
		const accepted = Object.keys(alert);
		if (!accepted.includes(role)) {
			throw new Error(`Expected a valid alert role (${accepted.join(', ')}), but got ${role}.`);
		}

		const [state, defaultEmoji] = alert[role];
		if (!emoji) {
			emoji = defaultEmoji;
		}
		let emoji_line = '';
		if (emoji) {
			emoji_line = `<i class="fa fa-${emoji} ms-1 me-3 mt-1 fs-4" role="img"></i>`;
		}

		return `<div class="alert alert-${state} d-flex align-items-start">${emoji_line}<div class="alert-content flex-fill mt-0">\n`;
	});

	// Paired shortcode workaround: see Note [endalert Workaround].
	eleventyConfig.addShortcode("endalert", function () {
		return `</div></div>`;
	});

	
	const escapeHtml = (unsafe) => {
		return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
	}

	eleventyConfig.addShortcode("abbr", function (term, expansion) {
		return `<abbr data-placement="top" data-toggle="tooltip" title="${escapeHtml(expansion)}">${term}</abbr>`;
	});

	eleventyConfig.addShortcode("tag", function (text, tag) {
		tag ||= text;
		return `<a class="tag" href="/tags/${tag}/">${text}</a>`
	});
};

/**
 * Note [endalert Workaround]
 * ---
 * It may seem having separate shortcodes for `alert` and `endalert` are weird.
 * But the issue lies in rendering.
 *
 * Using paired shortcodes, markdown between isn't rendered correctly. Sure, we
 * could use the 11ty render plugin and encapsulate the content inside with
 * `render`... but this doesn't work for MD features which rely on global state,
 * e.g. footnotes.
 *
 * The alternative is to treat the top and bottom shortcodes as separate,
 * leaving the content in between to be rendered normally by the MD processor.
 *
 */