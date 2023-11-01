module.exports = {
  // Defaults.
  description: '',
  tags: [],
  showToc: false,

  eleventyComputed: {
    permalink: data => (data.draft && !process.env.BUILD_DRAFTS ? false : data.permalink),
    hasDate: data => {
      const file = data.page.inputPath.split('/').pop();
      return file.match(/^\d+-\d+-\d.*/) || data.date;
    },
  },
};
