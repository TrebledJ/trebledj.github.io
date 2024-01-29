const cheerio = require('cheerio');

function stripBetweenTags(html, tags) {
  const $ = cheerio.load(html, null, false);
  $(tags.join(',')).remove();
  return $.html();
//   const dumbHTMLRegex = tag => new RegExp(`<${tag}(\\s+\\w+\\s*=\\s*(("[^"]*")|('[^']*')))*/?>.*(</${tag}>)?`, 'ig');
//   if (typeof tags === 'string')
//     return html.replace(dumbHTMLRegex(tags), '');
//   return tags.reduce((acc, t) => acc.replace(dumbHTMLRegex(t), ''), html);
}

module.exports = { stripBetweenTags };
