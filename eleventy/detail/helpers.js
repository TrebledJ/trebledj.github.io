const cheerio = require('cheerio');

function stripBetweenTags(html, tags) {
  const $ = cheerio.load(html, null, false);
  $(tags.join(',')).remove();
  return $.html();
}

function addAttributesToExternalLinks(html, newAttributes) {
  // Anchors with href^=http will be treated as external links.
  return html.replaceAll(/(<a\s+[^>]*href="https?:\/\/[^"]*")(?=[^>]*>)/gi, `$1 ${newAttributes}`);
}

module.exports = { stripBetweenTags, addAttributesToExternalLinks };
