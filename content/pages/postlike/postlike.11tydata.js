const { getGitCommitDate } = require('../../../eleventy/detail/git-commit-date');

const dateCache = {};

function getPostlikeDate(data) {
  if (process.env.ENVIRONMENT === 'production')
    return getGitCommitDate(data.page.inputPath, { keep: /^content/ })
      ?? getGitCommitDate(data.page.inputPath); // Fallback to any last commit.
  return undefined;
}

function getCachedPostlikeDate(data) {
  if (data.page.inputPath in dateCache) {
    return dateCache[data.page.inputPath];
  }
  const val = getPostlikeDate(data);
  dateCache[data.page.inputPath] = val;
  return val;
}

module.exports = {
  layout: 'layouts/post-default',
  showToc: true,
  eleventyComputed: {
    lastContentCommit: getCachedPostlikeDate,
  },
  thumbnail_src: '~/assets/img/posts/thumbnail/default.webp',
  thumbnail_banner: false,
  sharable: false,
  comments: false,
  related: {
    disable: true,
    num: 6,
  },
};
