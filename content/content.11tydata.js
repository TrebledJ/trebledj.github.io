module.exports = {
  // Defaults.
  excerpt: '',
  tags: [],
  showToc: false,

  eleventyComputed: {
    permalink: data => (data.draft && !process.env.BUILD_DRAFTS ? false : data.permalink),
    hasPostedDate: data => {
      const file = data.page.inputPath.split('/').pop();
      return !!(file.match(/^\d+-\d+-\d+/) || data.date);
    },
    hasUpdatedDate: _ => true,
  },
};
