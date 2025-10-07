import { DateTime } from 'luxon';
import MarkdownIt from 'markdown-it';
import MarkdownItAttrs from 'markdown-it-attrs';

import * as cheerio from 'cheerio';
import { getRelatedPosts, getRelatedTags, getTagsByPrefix } from './detail/related.js';
import { nonEmptyContainerSentinel } from './detail/utils.js';
import { selectHomePosts } from './detail/select-home-posts.js';
import { findKeywords } from './detail/keywords/index.js';
import { stripBetweenTags } from './detail/helpers.js';

function count(str, needle) {
  return (str.match(needle) || []).length;
}

export default function (eleventyConfig) {
  // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
  eleventyConfig.addFilter('date', (dateObj, format, zone) => (
    DateTime.fromJSDate(
      new Date(dateObj),
      { zone: zone ?? 'utc' },
    ).toFormat(format ?? 'yyyy-LL-dd').replace(/-/g, '&#8209;')
  ));

  eleventyConfig.addFilter('dateISO', (dateObj, zone) => (
    DateTime.fromJSDate(new Date(dateObj), { zone: zone ?? 'utc' }).toISO()
  ));

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

  if (process.env.ENVIRONMENT === 'fast') {
    eleventyConfig.addFilter('wordcountFocused', content => count(content, /\s+/g));
  } else {
    eleventyConfig.addFilter('wordcountFocused', function (content) {
      // Load it with DOM wrapping. The extra HTML wrappers don't really matter,
      // since we'll just call .innerText in the end.
      const $ = cheerio.load(content);

      // const codeWords = $('code').toArray().map(e => (
      //   count($(e).prop('innerText') ?? '', /[A-Za-z_][A-Za-z0-9_-]*/g)
      // )).reduce((a, b) => a + b, 0);
      const codeWords = 0;

      // Ignore auxiliary, non-textual elements.
      $('pre').remove();
      $('details:not([open])').remove();
      $('img').remove();
      $('.footnotes').remove();
      $('.caption').remove();

      const leoa = $('#logical-end-of-article');
      if (leoa.length === 1) {
        const children = leoa.parent().parent().children();
        // Find #leoa in body.
        let idx = 0;
        while (idx < children.length && children[idx++] !== leoa.parent()[0])
          ;
        if (idx === children.length) {
          console.warn(`${this.page.inputPath}: Found #logical-end-of-article, but not a direct child of body.`);
        } else {
          children.slice(idx - 1).remove();
        }
      } else if (leoa.length > 1) {
        console.warn(`${this.page.inputPath}: Found > 1 #logical-end-of-article. Was the tag closed properly?`);
      }

      const article = $('.post-body').prop('innerText') ?? $('*').prop('innerText');
      const words = count(article, /[^\s]{3,}/g);
      return words + codeWords;
    });
  }

  // A filter to murder tags and their children brutally with regex. Please don't take this comment seriously.
  eleventyConfig.addFilter('stripBetweenTags', (html, tags) => stripBetweenTags(html, tags));
  if (process.env.ENVIRONMENT === 'fast') {
    // Fast: Do nothing.
    eleventyConfig.addFilter('annihilate', (html, _selector) => html);
  } else {
    eleventyConfig.addFilter('annihilate', (html, selector) => {
      if (typeof html !== 'string') {
        throw new Error(`[11ty] annihilate: expected HTML string, got ${typeof html}`);
      }
      const $ = cheerio.load(html, null, false);
      $(selector).remove();
      return $.html();
    });
  }

  eleventyConfig.addFilter('brSafe', content => content.replace(/<br\s*\/?\s*>\s*/gi, ''));

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

  eleventyConfig.addFilter('getPostsBySlug', (collection, slugStrOrArray = '') => {
    let filterPost;
    if (typeof slugStrOrArray === 'string') {
      filterPost = (item => slugStrOrArray === item.fileSlug);
    } else if (Array.isArray(slugStrOrArray)) {
      filterPost = (item => slugStrOrArray.includes(item.fileSlug));
    } else {
      throw new Error(`[getPostsBySlug]: expected string or array, got ${typeof slugStrOrArray}`);
    }
    return collection.filter(filterPost);
  });

  // Data wrapper useful for 11ty render plugin.
  eleventyConfig.addFilter('wrapData', data => ({ data }));

  eleventyConfig.addFilter('getRelatedPosts', nonEmptyContainerSentinel('related posts')(getRelatedPosts));
  eleventyConfig.addFilter('getRelatedTags', nonEmptyContainerSentinel('related tags')(getRelatedTags));
  eleventyConfig.addFilter('getTagsByPrefix', nonEmptyContainerSentinel('related tags by prefix')(getTagsByPrefix));
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
  md.use(MarkdownItAttrs);

  eleventyConfig.addFilter('markdownify', markdownString => md.render(markdownString));
  eleventyConfig.addFilter('markdownifyInline', markdownString => md.renderInline(markdownString));

  eleventyConfig.addFilter('md', eleventyConfig.getFilter('markdownify'));
  eleventyConfig.addFilter('mdInline', eleventyConfig.getFilter('markdownifyInline'));

  eleventyConfig.addFilter('jsonify', object => JSON.stringify(object));

  if (process.env.ENVIRONMENT === 'fast') {
    // Keep things fast.
    eleventyConfig.addFilter('keywords', content => content);
  } else {
    // Extract a set of keywords and run-length-encode them to optimise size.
    eleventyConfig.addFilter('keywords', function (content) {
      const res = findKeywords(content);
      const counter = new Map();
      for (const w of res) {
        counter.set(w, (counter.get(w) ?? 0) + 1);
      }
      const lengthEncoded = [...counter.entries()].map(
        ([w, n]) => Math.min(n ?? 0, 99).toString().padStart(2, '0') + w,
      );
      return lengthEncoded.join(' ');
    });
  }

  eleventyConfig.addFilter('maxDate', (a, b) => {
    if (!a || !b)
      return a ?? b;
    const da = new Date(a);
    const db = new Date(b);
    return da > db ? da : db;
  });
};
