const { DateTime } = require('luxon');
const MarkdownIt = require('markdown-it');

const { getRelatedPosts, getRelatedTags, getTagsByPrefix } = require('./detail/related');
const selectHomePosts = require('./detail/select-home-posts');
const findKeywords = require('./detail/keywords');

module.exports = function (eleventyConfig) {
  // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
  eleventyConfig.addFilter('date', (dateObj, format, zone) => (
    DateTime.fromJSDate(dateObj, { zone: zone ?? 'utc' }).toFormat(format ?? 'yyyy-LL-dd').replace(/-/g, '&#8209;')
  ));

  eleventyConfig.addFilter('dateISO', (dateObj, zone) => DateTime.fromJSDate(dateObj, { zone: zone ?? 'utc' }).toISO());

  eleventyConfig.addFilter('contains', (array, e) => array.includes(e));

  eleventyConfig.addFilter('exclude', (array, items) => (
    array.filter(e => (typeof (items) === 'string' ? e !== items : !items.includes(e)))
  ));

  eleventyConfig.addFilter('push', (array, item) => {
    if (array === undefined)
      throw new Error('push: array is undefined');

    const array2 = array.slice(); // Soft-copy.
    array2.push(item);
    return array2;
  });

  // Push in-place.
  eleventyConfig.addFilter('pushi', (array, item) => {
    if (array === undefined)
      throw new Error('push: array is undefined');

    array.push(item);
    return array;
  });

  eleventyConfig.addFilter('extend', (array, items) => {
    if (array === undefined)
      throw new Error('extend: array is undefined');

    const array2 = array.slice(); // Soft-copy.
    array2.push(...items);
    return array2;
  });

  eleventyConfig.addFilter('split', (str, delimiter) => (str ? str.split(delimiter ?? ' ') : []));

  eleventyConfig.addFilter('endsWith', (str, ...args) => str.endsWith(...args));

  eleventyConfig.addFilter('startsWith', (str, ...args) => str.startsWith(...args));

  // Smarter truncate filter.
  function appendAfterTruncate(truncated, append = '...', keepIf = '?!', deleteIf = ',.') {
    if (keepIf.includes(truncated[truncated.length - 1])) {
      // Insert append before punctuation.
      return truncated.slice(0, truncated.length - 1) + append + truncated[truncated.length - 1];
    }

    if (deleteIf.includes(truncated[truncated.length - 1])) {
      // Delete and append.
      return truncated.slice(0, truncated.length - 1) + append;
    }
    // Append :).
    return truncated + append;
  }
  eleventyConfig.addFilter('truncateChars', (str, nchars, append = '...') => {
    let truncated = str.slice(0, nchars);
    truncated = truncated.slice(0, truncated.lastIndexOf(' ')); // Truncate to last word.
    return appendAfterTruncate(truncated, append);
  });
  eleventyConfig.addFilter('truncateWords', (str, nwords, append = '...') => {
    const truncated = str.split(' ').slice(0, nwords).join(' ');
    return appendAfterTruncate(truncated, append);
  });

  // A filter to murder tags and their children brutally with regex. Please don't take this comment seriously.
  eleventyConfig.addFilter('annihilateTags', (html, tags) => {
    const dumbHTMLRegex = tag => new RegExp(`<${tag}(\\s+\\w+\\s*=\\s*("[^"]*"|'[^']*'))*>.*?</${tag}>`, 'ig');
    if (typeof tags === 'string')
      return html.replace(dumbHTMLRegex(tags), '');
    return tags.reduce((acc, x) => acc.replace(dumbHTMLRegex(x), ''), html);
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter('head', (array, n) => {
    if (!Array.isArray(array) || array.length === 0)
      return [];

    if (n < 0)
      return array.slice(n);

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter('min', (...numbers) => Math.min.apply(null, numbers));

  // Return all the tags used in a collection
  eleventyConfig.addFilter('getAllTags', collection => {
    const tagSet = new Set();
    collection.forEach(item => (
      (item.data.tags ?? []).forEach(tag => tagSet.add(tag))
    ));

    return Array.from(tagSet);
  });

  eleventyConfig.addFilter('filterTagList', tags => (
    (tags ?? []).filter(tag => ['all', 'nav', 'post', 'posts'].indexOf(tag) === -1)
  ));

  eleventyConfig.addFilter('getRelatedPosts', getRelatedPosts);
  eleventyConfig.addFilter('getRelatedTags', getRelatedTags);
  eleventyConfig.addFilter('getTagsByPrefix', getTagsByPrefix);
  eleventyConfig.addFilter('selectHomePosts', selectHomePosts);

  /**
   * Accepts an array of objects, and maps each object to a particular attr.
   *
   * Example:
   *  [{id: 1, color: red}, {id: 2, color: green}, {id: 3, color: blue}] | mapattr(color)
   *  == [red, green, blue]
   */
  eleventyConfig.addFilter('mapattr', (array, attr) => array.map(e => e[attr]));

  const md = MarkdownIt({
    html: true,
    breaks: false,
    linkify: true,
  });

  eleventyConfig.addFilter('markdownify', markdownString => md.render(markdownString));
  eleventyConfig.addFilter('mdInline', markdownString => md.renderInline(markdownString));

  eleventyConfig.addFilter('md', eleventyConfig.getFilter('markdownify'));
  eleventyConfig.addFilter('mdInline', eleventyConfig.getFilter('mdInline'));

  eleventyConfig.addFilter('jsonify', object => JSON.stringify(object));

  if (process.env.ENVIRONMENT === 'fast') {
    // Keep things fast.
    eleventyConfig.addFilter('keywords', content => content);
  } else {
    eleventyConfig.addFilter('keywords', findKeywords);
  }

  eleventyConfig.addFilter('maxDate', (a, b) => {
    if (!b)
      return a;
    const da = new Date(a); const
      db = new Date(b);
    return da > db ? da : db;
  });
};
