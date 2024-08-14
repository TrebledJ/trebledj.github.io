const { getGitCommitDate } = require('../eleventy/detail/git-commit-date');

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
    date: data => {
      if (!data.page.inputPath.includes('/posts/')) {
        // Set date for sitemap lastmod.
        return getGitCommitDate(data.page.inputPath);
      }
      // Posts will default to their own date or updated date.
    },
  },
};
