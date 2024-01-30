const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginNavigation = require('@11ty/eleventy-navigation');
const { EleventyHtmlBasePlugin, EleventyRenderPlugin } = require('@11ty/eleventy');
const eleventySass = require('eleventy-sass');
// eslint-disable-next-line import/no-extraneous-dependencies
const sitemap = require('@quasibit/eleventy-plugin-sitemap');
const { addAttributesToExternalLinks } = require('./detail/helpers');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    errorOnInvalidLanguage: true,
  });
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(EleventyRenderPlugin);

  // https://www.npmjs.com/package/@quasibit/eleventy-plugin-sitemap
  eleventyConfig.addPlugin(sitemap, {
    lastModifiedProperty: 'modified',
    sitemap: {
      hostname: 'https://trebledj.me',
    },
  });

  eleventyConfig.addPlugin(eleventySass);

  eleventyConfig.addPlugin(eleventyConfig => {
    eleventyConfig.on('eleventy.before', () => {
      process.env.ENABLE_LIGHTBOX = true;
    });
  });

  if (process.env.ENVIRONMENT !== 'fast') {
    eleventyConfig.addTransform('external-links', function (content) {
      if (this.page.outputPath?.endsWith('.html'))
        content = addAttributesToExternalLinks(content, 'target="_blank" rel="noreferrer"');
      return content;
    });
  }

  // Drafts implementation, see `content/content.11tydata.js` for additional code.
  // This section *could* be simplified to an environment variable in an npm script,
  // but this way an ENV is not required and this code works cross-platform.
  eleventyConfig.addPlugin(eleventyConfig => {
    let logged = false;
    eleventyConfig.on('eleventy.before', ({ runMode }) => {
      // Only show drafts in serve/watch modes
      if (runMode === 'serve' || runMode === 'watch') {
        process.env.BUILD_DRAFTS = true;

        // Only log once.
        if (!logged)
          console.log('[11ty] including `draft: true` posts'); // eslint-disable-line no-console

        logged = true;
      }
    });
  });
};
