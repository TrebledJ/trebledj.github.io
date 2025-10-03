export default {
  eleventyExcludeFromCollections: true,
  noindex: true,
  sitemap: {
    ignore: true,
  },
  eleventyComputed: {
    permalink: data => data.page.filePathStem,
  },
};
