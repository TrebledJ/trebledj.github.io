const { DateTime } = require("luxon");

const { relatedPosts, relatedTags } = require('./detail/related')
const selectHomePosts = require('./detail/select-home-posts')
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

	eleventyConfig.addFilter("endsWith", (str, ...args) => {
		return str.endsWith(...args);
	});

	eleventyConfig.addFilter("startsWith", (str, ...args) => {
		return str.startsWith(...args);
	});

	// Smarter truncate filter.
	function appendAfterTruncate(truncated, append = '...', keepIf = '.?!', deleteIf = ',') {
		if (keepIf.includes(truncated[truncated.length - 1])) {
			return truncated; // No need to append a (...).
		}
		if (deleteIf.includes(truncated[truncated.length - 1])) {
			// Delete and append.
			return truncated.slice(0, truncated.length - 1) + append;
		}
		// Append :).
		return truncated + append;
	}
	eleventyConfig.addFilter("truncateChars", (str, nchars, append = '...') => {
		let truncated = str.slice(0, nchars);
		truncated = truncated.slice(0, truncated.lastIndexOf(' ')); // Truncate to last word.
		return appendAfterTruncate(truncated, append);
	});
	eleventyConfig.addFilter("truncateWords", (str, nwords, append = '...') => {
		const truncated = str.split(' ').slice(0, nwords).join(' ');
		return appendAfterTruncate(truncated, append);
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

	eleventyConfig.addFilter("relatedPosts", relatedPosts);
	eleventyConfig.addFilter("relatedTags", relatedTags);
	eleventyConfig.addFilter("selectHomePosts", selectHomePosts);

	/**
	 * Accepts an array of objects, and maps each object to a particular attr.
	 * 
	 * Example:
	 * 	[{id: 1, color: red}, {id: 2, color: green}, {id: 3, color: blue}] | mapattr(color)
	 *  == [red, green, blue]
	 */
	eleventyConfig.addFilter("mapattr", function (array, attr) {
		return array.map(e => e[attr]);
	});

	const md = require("markdown-it")({
		html: true,
		breaks: false,
		linkify: true,
	});

	eleventyConfig.addFilter("markdownify", (markdownString) => md.render(markdownString));
	eleventyConfig.addFilter("mdInline", (markdownString) => md.renderInline(markdownString));

	eleventyConfig.addFilter("md", eleventyConfig.getFilter("markdownify"));
	eleventyConfig.addFilter("mdInline", eleventyConfig.getFilter("mdInline"));

	eleventyConfig.addFilter("jsonify", (object) =>
		JSON.stringify(object)
	);

	eleventyConfig.addFilter("keywords", findKeywords);

	eleventyConfig.addFilter("maxDate", (a, b) => {
		if (!b)
			return undefined;
		const da = new Date(a), db = new Date(b);
		return da > db ? da : db;
	});
};