const { getGitCommitDate } = require('../eleventy/detail/git-commit-date');
const { stripBetweenTags } = require('../eleventy/detail/helpers');

module.exports = {
  // Defaults.
  excerpt: '',
  tags: [],
  showToc: false,

  eleventyComputed: {
    eleventyExcludeFromCollections: data => data.archived || (data.draft && !process.env.BUILD_DRAFTS),
    permalink: data => (data.draft && !process.env.BUILD_DRAFTS ? false : data.permalink),
    hasPostedDate: data => {
      // Check if the file contains a date.
      // We need to use `inputPath`. `fileSlug` doesn't work because 11ty alrdy strips the date.
      const file = data.page.inputPath.split('/').pop();
      return !!(file.match(/^\d+-\d+-\d+/));
    },
    hasUpdatedDate: _ => true,

    // Set date for sitemap lastmod.
    modified: data => {
      if (process.env.ENVIRONMENT !== 'production')
        return undefined;

      if (!data.page.inputPath.includes('/posts/')) {
        const date = getGitCommitDate(data.page.inputPath);
        return date;
      }

      // Posts will default to their own date or updated date.
      return undefined;
    },

    safeTitle: data => {
      if (!data.title)
        return data.title;
      // No &nbsp, no tags, good for attributes, etc.
      let title = data.title.replace('&nbsp;', ' ');
      title = stripBetweenTags(title, ['sub', 'sup', 's']);
      // eslint-disable-next-line max-len, no-useless-escape
      const HTML_TAG = /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/g;
      title = title.replace(HTML_TAG, '');
      return title;
    },
  },
};
