import { getGitCommitDate } from '../../../eleventy/detail/git-commit-date.js';

function getPostlikeDate(data) {
  if (process.env.ENVIRONMENT === 'production')
    return getGitCommitDate(data.page.inputPath, { keep: /^content/ })
      ?? getGitCommitDate(data.page.inputPath); // Fallback to any last commit.
  return undefined;
}

// const dateCache = {};
// function getCachedPostlikeDate(data) {
//   if (data.page.inputPath in dateCache) {
//     return dateCache[data.page.inputPath];
//   }
//   const val = getPostlikeDate(data);
//   dateCache[data.page.inputPath] = val;
//   return val;
// }

export default {
  layout: 'layouts/post-default',
  showToc: true,
  eleventyComputed: {
    modified: getPostlikeDate,
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
