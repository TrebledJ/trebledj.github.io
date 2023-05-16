const process = require('./rake-js/dist/index').default;

const fs = require('fs');
const stopwords = fs.readFileSync('./eleventy/detail/stopwords.txt', 'utf8').split('\n');

const regex = new RegExp(/[\.,?!:;&\{\}\[\]\(\)\/\\<>#…]+|((^|\s+)['‘’‚‛“”„‟"]?)|(n?['‘’‚‛“”„‟"][stlndrvemo]+|\s+|$)/g);
const regexStop = new RegExp(stopwords.filter(w => w.length >= 2).map(s => `\\b${s}\\b`).join('|'), 'g');

/**
 * Extract keywords from a piece of text.
 * @param {*} content The text to extract keywords from.
 * @returns An array of key terms.
 */
module.exports = function (content) {
    function keep(s) {
        if (!s) return false;
        let trimmed = s.trim();
        return trimmed.length >= 2 && !stopwords.includes(trimmed);
    }

    // const keywords = process(content, { stopwords });
    let keywords = content.toLowerCase().replace(regexStop, '').split(regex).filter(keep);
    // keywords = Array.from(new Set(keywords));
    // console.log(`Extracted ${keywords.length} keywords from "${content.slice(0, 40)}..."`);
    return keywords.join(' ');
}
