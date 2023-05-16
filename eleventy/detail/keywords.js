const process = require('./rake-js/dist/index').default;

const fs = require('fs');
const stopwords = fs.readFileSync('./eleventy/detail/stopwords.txt', 'utf8').split('\n');

/**
 * Extract keywords from a piece of text.
 * @param {*} content The text to extract keywords from.
 * @returns An array of key terms.
 */
module.exports = function (content) {
    const keywords = process(content, { stopwords });
    console.log(`Extracted ${keywords.length} keywords from "${content.slice(0, 40)}..."`);
    // console.log(`keywords: ${keywords.join('; ')}`);
    return keywords;
}
