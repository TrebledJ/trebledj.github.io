
module.exports = function (eleventyConfig) {
    eleventyConfig.addCollection("tags", function (collectionApi) {
        let counter = {};
        for (let tag of collectionApi.getFilteredByTag('posts').flatMap(post => post.data.tags)) {
            if (!tag || tag === "posts")
                continue;
            counter[tag] = (counter[tag] ? counter[tag] + 1 : 1);
        }
        return counter;
    });

    // const categories = ["ctfs", "experience", "music", "programming", "projects"]
    // for (const cat of categories) {
    //     eleventyConfig.addCollection(`cat-${cat}`, function (collectionApi) {
    //         return collectionApi.getFilteredByTag('posts').filter(post => post.data.category === cat);
    //     });
    // }

    eleventyConfig.addCollection("postsr", function (collectionApi) {
        // Reversed collection.
        return collectionApi.getFilteredByTag('posts').slice().reverse();
    });
};