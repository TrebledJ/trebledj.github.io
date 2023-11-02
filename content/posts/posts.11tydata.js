const { getGitCommitDate } = require('../../eleventy/detail/git-commit-date');

module.exports = {
  tags: [
    'posts', // Don't change this tag. This tag is used to recognise blog posts.
  ],
  layout: 'layouts/post-default',
  showToc: true,
  eleventyComputed: {
    lastContentCommit: data => {
      if (process.env.ENVIRONMENT === 'production')
        return getGitCommitDate(data.page.inputPath, { keep: /^content/ });
      return undefined;
    },
    permalink: data => {
      if (data.draft && !process.env.BUILD_DRAFTS)
        return false;
      return `/posts/${data.page.fileSlug}/index.html`;
    },

    eleventyExcludeFromCollections: data => (data.draft && !process.env.BUILD_DRAFTS),
  },
  thumbnail_src: '~/assets/img/posts/thumbnail/default.png',
  thumbnail_banner: false,
  sharable: true,
  comments: true,
  related: {
    auto: true,
    num: 6,
    disable: false,
  },
};
