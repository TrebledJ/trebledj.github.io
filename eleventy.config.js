const htmlmin = require('html-minifier');
const { minify } = require('terser');
const { Transform } = require('stream');
const chalk = require('chalk');
const { modifyExternalLinksToOpenInSeparateTab } = require('./eleventy/detail/helpers');
const htmlcsp = require('./eleventy/detail/html-csp-transform');

const plugins = require('./eleventy/plugins');
const filters = require('./eleventy/filters');
const shortcodes = require('./eleventy/shortcodes');
const markdown = require('./eleventy/markdown');
const collections = require('./eleventy/collections');

module.exports = function (eleventyConfig) {
  process.env.ENVIRONMENT ??= 'development';
  // console.log(`environment: ${process.env.ENVIRONMENT}`);

  // Copy the contents of the `public` folder to the output folder
  // For example, `./public/css/` ends up in `_site/css/`
  eleventyConfig.addPassthroughCopy({
    './assets/favicon.ico': '/favicon.ico',
    './assets/img': '/img',
    './content/**/assets/*.mp4': '/img',
    './assets/webfonts': '/webfonts',
    './assets/css/**/*.{css,map}': '/css',
    './content/pages/slides/assets': '/img/slides',
  });
  eleventyConfig.addPassthroughCopy({
    './assets/js/**/*.js': '/js/',
  }, {
    transform(src, _dest, _stats) {
      if (process.env.ENVIRONMENT !== 'production')
        return null;

      if (!src.endsWith('.js') ?? src.includes('third-party'))
        return null;

      return new Transform({
        transform(chunk, encoding, callback) {
          minify(chunk.toString())
            .then(res => {
              callback(null, res.code);
            });
        },
      });
    },
  });

  // Run Eleventy when these files change:
  // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

  // Process content images to the image pipeline.
  eleventyConfig.addWatchTarget('content/**/*.{png,jpg,jpeg,gif,webp,svg}');
  eleventyConfig.addWatchTarget('assets/js.bundle/**');
  eleventyConfig.watchIgnores.add('{package,package-lock}.json');
  eleventyConfig.watchIgnores.add('.gitignore');

  if (process.env.ENVIRONMENT === 'fast') {
    // Fast: Don't generate feeds.
    eleventyConfig.ignores.add('content/feeds/**');
  }

  // Wait for other files, in case of batch changes.
  eleventyConfig.setWatchThrottleWaitTime(10);

  eleventyConfig.setServerOptions({
    liveReload: true,
    watch: [
      './_site/**/*.css',
      './_site/**/*.html',
    ],
    // Silence dev-server spammy output.
    logger: {
      log() { },
      info() { },
      error(x) { console.error(`[11ty] error: ${x}`); },
    },
  });

  plugins(eleventyConfig);
  collections(eleventyConfig);
  filters(eleventyConfig);
  shortcodes(eleventyConfig);

  // Transforms
  if (process.env.ENVIRONMENT === 'production') {
    eleventyConfig.addTransform('htmlmin', function (content) {
      if (this.page.outputPath && this.page.outputPath.endsWith('.html')) {
        const minified = htmlmin.minify(content, {
          removeComments: true,
          includeAutoGeneratedTags: false,
          minifyCSS: false,
          minifyJS: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true, // e.g. no <script defer="defer">.
        });
        return minified;
      }

      return content;
    });

    eleventyConfig.addTransform('jsmin', async function (content) {
      if (this.page.outputPath && this.page.outputPath.endsWith('.js')) {
        try {
          const minified = (await minify(content)).code;
          return minified;
        } catch (error) {
          const {
            message, filename, line, col, pos,
          } = error;
          console.error(chalk.red(
            `[11ty] Error while minifying JS: ${message} in ${filename} L${line}:${col}:${pos}`,
          ));
        }
      }

      return content;
    });

    eleventyConfig.addTransform('jsonmin', function (content) {
      if (this.page.outputPath && this.page.outputPath.endsWith('.json'))
        return JSON.stringify(JSON.parse(content));

      return content;
    });
  }

  if (process.env.ENVIRONMENT !== 'fast') {
    eleventyConfig.addTransform('external-links', function (content) {
      if (this.page.outputPath && this.page.outputPath.endsWith('.html'))
        content = modifyExternalLinksToOpenInSeparateTab(content);
      return content;
    });

    eleventyConfig.addTransform('htmlcsp', htmlcsp);
  }

  // Customize Markdown library settings:
  markdown(eleventyConfig);

  eleventyConfig.addNunjucksGlobal('throw', function (msg) {
    console.error(chalk.red(`[error] in ${this.page.inputPath}:`));
    console.error(chalk.red(msg));
  });

  // Features to make your build faster (when you need them)

  // If your passthrough copy gets heavy and cumbersome, add this line
  // to emulate the file copy on the dev server. Learn more:
  // https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

  // eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: [
      'md',
      'njk',
      'html',
      'liquid',
    ],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: 'njk',

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: 'njk',

    // These are all optional:
    dir: {
      input: 'content', // default: "."
      includes: '../_includes', // default: "_includes"
      data: '../_data', // default: "_data"
      output: '_site',
    },

    // -----------------------------------------------------------------
    // Optional items:
    // -----------------------------------------------------------------

    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

    // When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
    // it will transform any absolute URLs in your HTML to include this
    // folder name and does **not** affect where things go in the output folder.
    pathPrefix: '/',
  };
};
