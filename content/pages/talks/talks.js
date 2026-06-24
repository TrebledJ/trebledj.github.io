export default {
  eleventyComputed: {
    permalink: data => data.permalink || `/talks/${data.page.fileSlug}/index.html`,
  },
  // eleventyExcludeFromCollections: true,
};
