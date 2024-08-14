module.exports = {
  eleventyComputed: {
    permalink: data => data.permalink || `/slides/${data.page.fileSlug}/index.html`,
  },
  // eleventyExcludeFromCollections: true,
};
