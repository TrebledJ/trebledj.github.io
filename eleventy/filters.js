const { DateTime } = require("luxon");

const findPostsRelatedTo = require('./detail/related')
const findKeywords = require('./detail/keywords')


module.exports = function (eleventyConfig) {
	eleventyConfig.addFilter("date", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "yyyy-LL-dd").replace(/-/g, '&#8209;');
	});

	eleventyConfig.addFilter("dateISO", (dateObj, zone) => {
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toISO();
	});

	eleventyConfig.addFilter("contains", (array, e) => {
		return array.includes(e);
	});

	eleventyConfig.addFilter("exclude", (array, items) => {
		return array.filter(e => typeof (items) == 'string' ? e != items : !items.includes(e));
	});

	eleventyConfig.addFilter("push", (array, item) => {
		if (array === undefined) {
			throw new Error('push: array is undefined');
		}
		let array2 = array.slice(); // Soft-copy.
		array2.push(item);
		return array2;
	});

	// Push in-place.
	eleventyConfig.addFilter("pushi", (array, item) => {
		if (array === undefined) {
			throw new Error('push: array is undefined');
		}
		array.push(item);
		return array;
	});

	eleventyConfig.addFilter("extend", (array, items) => {
		if (array === undefined) {
			throw new Error('extend: array is undefined');
		}
		let array2 = array.slice(); // Soft-copy.
		array2.push(...items);
		return array2;
	});

	eleventyConfig.addFilter("split", (str, delimiter) => {
		return str ? str.split(delimiter || ' ') : [];
	});

	// A smarter truncate filter?
	eleventyConfig.addFilter("truncatewords", (str, nwords, append='...') => {
		const truncated = str.split(' ').slice(0, nwords).join(' ');
		const punc = '.?!';
		const punk = ','; // Wassup punk!
		if (punc.includes(truncated[truncated.length - 1])) {
			return truncated; // No need to append a (...).
		}
		if (punk.includes(truncated[truncated.length - 1])) {
			// Delete and append.
			return truncated.slice(0, truncated.length - 1) + append;
		}
		// Append :).
		return truncated + append;
	});

	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
	});

	// A filter to murder tags and their children brutally with regex. Please don't take this comment seriously.
	eleventyConfig.addFilter('annihilateTags', (html, tags) => {
		let dumbHTMLRegex = tag => new RegExp(`<${tag}(\\s+\\w+\\s*=\\s*("[^"]*"|'[^']*'))*>.*?</${tag}>`, "ig");
		if (typeof tags === 'string')
			return html.replace(dumbHTMLRegex(tags), '');
		else /* Otherwise, assume tags is an Array. */
			return tags.reduce((acc, x) => acc.replace(dumbHTMLRegex(x), ''), html);
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

	eleventyConfig.addFilter("relatedTo", findPostsRelatedTo);


	const md = require("markdown-it")({
		html: false,
		breaks: true,
		linkify: true,
	});

	eleventyConfig.addFilter("markdownify", (markdownString) =>
		md.render(markdownString)
	);

	eleventyConfig.addFilter("jsonify", (object) =>
		JSON.stringify(object)
	);

	eleventyConfig.addFilter("keywords", findKeywords);

	eleventyConfig.addPairedShortcode("alert", async function (content, role, emoji) {
		const alert = {
			primary: ['info', ''],
			note: ['primary', 'pencil'],
			info: ['primary', ''],
			fact: ['primary', 'lightbulb'],
			warning: ['warning', 'triangle-exclamation'],
			success: ['success', 'rocket'],
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

		return `<div class="alert alert-${state} d-flex align-items-start">${emoji_line}
		<div class="alert-content">
		${content.trimEnd()}
		</div></div>`;
	});
};