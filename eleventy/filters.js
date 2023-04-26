const { DateTime } = require("luxon");

const findPostsRelatedTo = require('./detail/related')


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
};