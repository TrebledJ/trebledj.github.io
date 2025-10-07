export default function (eleventyConfig) {
  eleventyConfig.addCollection('tagcount', collectionApi => {
    const counter = {};
    for (const tag of collectionApi.getFilteredByTag('posts').flatMap(post => post.data.tags)) {
      if (!tag || tag === 'posts')
        continue;
      counter[tag] = (counter[tag] ? counter[tag] + 1 : 1);
    }
    return counter;
  });

  eleventyConfig.addCollection('tags', collectionApi => {
    const pages = collectionApi.getAll().filter(p => p.page.filePathStem.match(/tags\/.+/));
    // Tags are not deterministically sorted, since they're marked as the same 'date'. So let's sort dem!
    pages.sort((p, q) => (p.page.fileSlug < q.page.fileSlug ? -1 : p.page.fileSlug > q.page.fileSlug ? 1 : 0));
    return pages;
  });

  eleventyConfig.addCollection('specialTags', collectionApi => (
    collectionApi.getAll()
      .filter(p => p.page.filePathStem.match(/tags\/.+/))
      .filter(p => p.data.special)
      .map(p => p.data.tag)
      .sort()
  ));

  eleventyConfig.addCollection('postsr', collectionApi => (
    // Reversed collection.
    collectionApi.getFilteredByTag('posts').slice().reverse()
  ));
};
