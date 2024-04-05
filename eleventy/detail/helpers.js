const cheerio = require('cheerio');

function stripBetweenTags(html, tags) {
  const $ = cheerio.load(html, null, false);
  $(tags.join(',')).remove();
  return $.html();
}

function modifyExternalLinksToOpenInSeparateTab(html) {
  const $ = cheerio.load(html);
  [...$('a[href^=http]')].forEach(link => {
    // If rel attr exists, append the value.
    if (!link.attribs.rel) {
      link.attribs.rel = 'noreferrer';
    } else {
      link.attribs.rel += ' noreferrer';
    }
    link.attribs.target = '_blank';
  });
  return $.html();

  // HTML spec doesn't allow duplicate attributes, and sadly the regex doesn't handle this case.
  // Some links are pre-filled with `rel="me"`, e.g. social media buttons.

  // // Anchors with href^=http will be treated as external links.
  // return html.replaceAll(/(<a\s+[^>]*href="https?:\/\/[^"]*")(?=[^>]*>)/gi, `$1 ${newAttributes}`);
}

module.exports = { stripBetweenTags, modifyExternalLinksToOpenInSeparateTab };
