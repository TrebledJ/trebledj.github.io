/**
 * A collection of useful markdown shortcodes to enhance reader experience.
 */

const image = require('./image');

module.exports = function (eleventyConfig) {
  image(eleventyConfig);

  eleventyConfig.addShortcode('alert', (role, icon) => {
    const alert = {
      info: ['info', 'circle-info'],
      fact: ['info', 'bolt'],
      warning: ['warning', 'triangle-exclamation'],
      success: ['success', 'lightbulb'],
      danger: ['danger', 'radiation'],
      simple: ['secondary', ''],
    };
    const accepted = Object.keys(alert);
    if (!accepted.includes(role))
      throw new Error(`Expected a valid alert role (${accepted.join(', ')}), but got ${role}.`);

    const [state, defaultEmoji] = alert[role];
    icon ??= defaultEmoji;

    const iconHtml = icon ? `<i class="fa fa-${icon} ms-1 me-3 mt-1 fs-4" role="img"></i>` : '';

    return `<div class="alert alert-${state} d-flex align-items-start">
              ${iconHtml}
              <div class="alert-content flex-fill mt-0">\n`.replace(/\s{2,}/g, ' ');
  });

  // Paired shortcode workaround: see Note [endalert Workaround].
  eleventyConfig.addShortcode('endalert', () => '</div></div>');

  eleventyConfig.addShortcode('details', (summary, state) => {
    state ??= '';
    const md = eleventyConfig.getFilter('mdInline');
    return `<details ${state}><summary>${md(summary)}</summary><div class="details-content">\n`;
  });

  // Paired shortcode workaround: see Note [endalert Workaround].
  eleventyConfig.addShortcode('enddetails', () => (
    // eslint-disable-next-line max-len
    '<div class="details-collapse-bottom"><sub><a class="details-collapse-button">(collapse)</a></sub></div></div></details>'
  ));

  eleventyConfig.addShortcode('table', () => '<div class="table-container">');

  // Paired shortcode workaround: see Note [endalert Workaround].
  eleventyConfig.addShortcode('endtable', () => '</div>');

  const escapeHtml = unsafe => (
    unsafe
      .replaceAll('&', '&amp;')
      // .replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  );

  eleventyConfig.addShortcode('abbr', (term, expansion) => (
    `<abbr data-bs-placement="top" data-bs-toggle="tooltip" title="${escapeHtml(expansion)}">${term}</abbr>`
  ));

  eleventyConfig.addShortcode('tag', (text, tag) => {
    tag ??= text;
    return `<a class="tag" href="/tags/${tag}/">${text}</a>`;
  });

  eleventyConfig.addShortcode('stag', (text, tag) => {
    // Special tag. Use this for unique collections of posts.
    tag ??= text;
    return `<a class="tag special" href="/tags/${tag}/">${text}</a>`;
  });
};

/**
 * Note [endalert Workaround]
 * ---
 * It may seem having separate shortcodes for `alert` and `endalert` are weird.
 * But the issue lies in rendering.
 *
 * Using paired shortcodes, markdown between isn't rendered correctly. Sure, we
 * could use the 11ty render plugin and encapsulate the content inside with
 * `render`... but this doesn't work for MD features which rely on global state,
 * e.g. footnotes.
 *
 * The alternative is to treat the top and bottom shortcodes as separate,
 * leaving the content in between to be rendered normally by the MD processor.
 *
 */
