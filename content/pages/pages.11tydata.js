export default {
  eleventyComputed: {
    permalink: data => data.permalink || `/${data.page.fileSlug}/index.html`,
  },
  // eleventyExcludeFromCollections: true,
};
