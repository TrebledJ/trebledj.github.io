module.exports = {
  tags: [
  ],
  layout: 'layouts/post-default',
  eleventyComputed: {
    permalink: data => `/${data.page.fileSlug}/index.html`,
  },
  author: 'trebledj',
  thumbnail_src: '~/assets/img/posts/thumbnail/default.png',
  thumbnail_banner: false,
  sharable: false,
  comments: false,
  related: {
    auto: true,
    num: 4,
    disable: false,
  },
  eleventyExcludeFromCollections: true,
};
