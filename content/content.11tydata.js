module.exports = {
  showToc: false,

  // Draft posts:
  eleventyComputed: {
    // Handle all permalink manipulation in one place.
    permalink: data => (data.draft && !process.env.BUILD_DRAFTS ? false : data.permalink),
  },
};
