const { getGitCommitDate } = require('../../../eleventy/detail/git-commit-date');

module.exports = {
  layout: 'layouts/post-default',
  showToc: true,
  eleventyComputed: {
    lastContentCommit: data => {
      if (process.env.ENVIRONMENT === 'production')
        return getGitCommitDate(data.page.inputPath, { keep: /^content/ });
      return undefined;
    },
  },
  thumbnail_src: '~/assets/img/posts/thumbnail/default.png',
  thumbnail_banner: false,
  sharable: false,
  comments: false,
  related: {
    disable: true,
    num: 6,
  },
};
