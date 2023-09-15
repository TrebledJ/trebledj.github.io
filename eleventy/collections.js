
module.exports = function (eleventyConfig) {
    eleventyConfig.addCollection("tagcount", function (collectionApi) {
        let counter = {};
        for (let tag of collectionApi.getFilteredByTag('posts').flatMap(post => post.data.tags)) {
            if (!tag || tag === "posts")
                continue;
            counter[tag] = (counter[tag] ? counter[tag] + 1 : 1);
        }
        return counter;
    });

    eleventyConfig.addCollection("tags", function (collectionApi) {
        return collectionApi.getAll().filter(p => p.page.filePathStem.match(/tags\/.+/));
    });

    eleventyConfig.addCollection("postsr", function (collectionApi) {
        // Reversed collection.
        return collectionApi.getFilteredByTag('posts').slice().reverse();
    });
};