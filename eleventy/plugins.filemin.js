const htmlmin = require('html-minifier');
const { minify } = require('terser');
const chalk = require('chalk');

module.exports = eleventyConfig => {
  // Dev Note: You may be wondering why we wrap the addTransform with
  // addPlugin when we could simply call addTransform outside directly. We
  // do this to sequence file minification transforms after plugins add
  // their transforms. Since plugin execution is deferred, we use this
  // method to synergise with plugins such as EleventyBundle plugin.

  // The problem with running htmlmin BEFORE EleventyBundle, is that the
  // inlinejs bundle gets removed, since htmlmin heavily optimises what it
  // views as deadcode:
  // <script>/*...*/</script>.
  // UglifyJS doesn't seem to allow both COMPRESSION and COMMENT
  // WHITELISTING (via regex). So this forced-ordering will have to do for
  // now.

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
};
