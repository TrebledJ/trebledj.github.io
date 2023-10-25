module.exports = {
  // Draft posts:
  eleventyComputed: {
    permalink: data => {
      let { permalink } = data;
      if (!permalink) {
        if (data.page.filePathStem.startsWith('/posts') && data.page.outputFileExtension === 'html') {
          // HTML Blog post.
          permalink = `/posts/${data.page.fileSlug}/index.html`;
        } else if (data.page.inputPath.endsWith('.js.njk')) {
          permalink = data.page.filePathStem;
        }
      }

      if (data.draft) {
        // BUILD_DRAFTS is set in eleventy.config.js
        if (process.env.BUILD_DRAFTS)
          return permalink;

        // Always skip during non-watch/serve builds
        return false;
      }

      return permalink;
    },
  },
};
