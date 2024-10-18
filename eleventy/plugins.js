const pluginRss = require('@11ty/eleventy-plugin-rss');
// const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginNavigation = require('@11ty/eleventy-navigation');
const pluginBundle = require('@11ty/eleventy-plugin-bundle');
const { EleventyHtmlBasePlugin, EleventyRenderPlugin } = require('@11ty/eleventy');
const eleventySass = require('eleventy-sass');
// eslint-disable-next-line import/no-extraneous-dependencies
const sitemap = require('@quasibit/eleventy-plugin-sitemap');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const chalk = require('chalk');

const { modifyExternalLinksToOpenInSeparateTab } = require('./detail/helpers');
const htmlcsp = require('./detail/html-csp-transform');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  // eleventyConfig.addPlugin(pluginSyntaxHighlight, {
  //   errorOnInvalidLanguage: true,
  // });
  eleventyConfig.addPlugin(pluginNavigation);

  eleventyConfig.addPlugin(pluginBundle, {
    bundles: ['inlinecss', 'inlinejs'],
    toFileDirectory: 'cb',
    transforms: [
      async function (content) {
        if (process.env.ENVIRONMENT !== 'production')
          return content;

        if (this.type === 'css' || this.type === 'inlinecss') {
          const output = new CleanCSS({}).minify(content);
          if (output.errors.length > 0) {
            console.error(chalk.red(`Errors encountered while running CleanCSS for bundle ${this.type}.`));
            console.error(chalk.red(output.errors.join('\n')));
          }
          if (output.warnings.length > 0) {
            console.warn(chalk.yellow(`Warnings encountered while running CleanCSS for bundle ${this.type}.`));
            console.warn(chalk.yellow(output.warnings.join('\n')));
          }
          return output.styles;
        }

        if (this.type === 'js' || this.type === 'inlinejs') {
          const result = await minify(content);
          return result.code;
        }
        return content;
      },
    ],
  });

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

  if (process.env.ENVIRONMENT === 'production') {
    eleventyConfig.addPlugin(require('./plugins.filemin'));
  }

  // Other Transforms
  if (process.env.ENVIRONMENT !== 'fast') {
    eleventyConfig.addTransform('external-links', function (content) {
      if (this.page.outputPath && this.page.outputPath.endsWith('.html'))
        content = modifyExternalLinksToOpenInSeparateTab(content);
      return content;
    });

    // Indirect: wrap addTransform with addPlugin, so that bundled inline JS
    // gets substituted before calling htmlcsp.
    eleventyConfig.addPlugin(function (eleventyConfig) {
      eleventyConfig.addTransform('htmlcsp', htmlcsp);
    });
  }
};
