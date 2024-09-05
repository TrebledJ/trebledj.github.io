function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
}

module.exports = {
  eleventyExcludeFromCollections: false,
  layout: 'layouts/page-tag',
  sortByLatest: true,
  date: '2022-08-01',
  eleventyComputed: {
    permalink: data => `/tags/${data.page.fileSlug}/index.html`,
    title: data => data.title || toTitleCase(data.page.fileSlug),
    tag: data => data.page.fileSlug,

    // Remove /tags/, /{fileSlug}..., and convert the remaining folders into dotty notation.
    group: data => data.page.filePathStem.replace(/^\/tags\//, '').replace(/\/[\w-]+$/, '').replace('/', '.'),
  },
};
