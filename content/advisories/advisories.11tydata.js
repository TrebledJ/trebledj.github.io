import { getGitCommitDate } from '../../eleventy/detail/git-commit-date.js';

export default {
  tags: [
    'advisory', // Don't change this tag. This tag is used to recognise advisory posts.
  ],
  layout: 'layouts/post-default',
  showToc: true,
  eleventyComputed: {
    // Note: `modified` is also used to determine a page's lastmod field for sitemap.xml.
    modified: data => {
      if (process.env.ENVIRONMENT === 'production')
        return getGitCommitDate(data.page.inputPath, { keep: /^content/ });
      return undefined;
    },
    permalink: data => {
      if (data.draft && !process.env.BUILD_DRAFTS)
        return false;
      return `/advisories/${data.page.fileSlug}/index.html`;
    },

    eleventyExcludeFromCollections: data => data.archived || (data.draft && !process.env.BUILD_DRAFTS),
  },
  thumbnail_src: '~/assets/img/posts/thumbnail/default.webp',
  thumbnail_banner: false,
  sharable: true,
  comments: true,
  related: false,
};
