module.exports = function (eleventyConfig) {
  eleventyConfig.addCollection('tagcount', collectionApi => {
    const counter = {};
    for (const tag of collectionApi.getFilteredByTag('posts').flatMap(post => post.data.tags)) {
      if (!tag || tag === 'posts')
        continue;
      counter[tag] = (counter[tag] ? counter[tag] + 1 : 1);
    }
    return counter;
  });

  eleventyConfig.addCollection('tags', collectionApi => (
    collectionApi.getAll().filter(p => p.page.filePathStem.match(/tags\/.+/))
  ));

  eleventyConfig.addCollection('specialTags', collectionApi => (
    collectionApi.getAll()
      .filter(p => p.page.filePathStem.match(/tags\/.+/))
      .filter(p => p.data.special)
      .map(p => p.data.tag)
  ));

  eleventyConfig.addCollection('postsr', collectionApi => (
    // Reversed collection.
    collectionApi.getFilteredByTag('posts').slice().reverse()
  ));
};
