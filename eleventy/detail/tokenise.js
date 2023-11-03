/* eslint-disable */

const fs = require('fs');
const stopwords = fs.readFileSync('./eleventy/detail/stopwords.txt', 'utf8').split('\n');

const puncStart = '\\{\\[\\(<#&\\|';
const puncEnd = '\\.\\?\\!:;\\}\\]\\)>';
const punc = '\\/…\\*,`=–—\\$\\^\\\\';
const quotes = '\'‘’‛‚“”„‟"';
const escapes = '(&lt;)|(&gt;)|(&quot;)|(&amp;)';

const footnote = `(?<=[a-zA-Z\\s])[${puncEnd}]+\\d+(\\s+|$)`;

const delimsEnd = `([${puncEnd}]+(?=([${quotes}]|\\s+|$)))|((?<=[a-zA-Z])[${puncEnd}]+(?=[a-zA-Z]))|([${puncEnd}]+[${punc}]+)`;
const delims = `${escapes}|[${puncStart}${punc}]+|${delimsEnd}|[${puncEnd}]{2,}|(--)|\\s+`;

const quotesStart = `(?<=(^|\\s+|[${puncStart}${punc}]))[${quotes}]+`;
const quotesEnd = `[${quotes}]([${punc}${puncStart}${puncEnd}]+|\\s+|$)`;

const code = '(\\+=)|(-=)|(%=)|(--)|(==+)|(!=+)';

const contractionsNt = 'n[\'‘’](t)';
const contractionsRest = '[\'‘’](d|s|ll|m|re|ve)\\b';
const contractions = `(${contractionsNt})|(${contractionsRest})`;

const regex = new RegExp(`${code}|(${delims})|(${footnote})|(${quotesStart})|(${quotesEnd})|(${contractions})`, 'g');

const regexEmojis = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug;

const flexiquotes = s => s.replace('\'', '[\'‘’‛]');

const stopJoined = stopwords
    .reverse()
    .filter(w => !w.startsWith('#') && w.length >= 1)
    .map(flexiquotes).map(s => `\\b${s}\\b`)
    .join('|');

const regexStop = new RegExp(`(?<!-)(${stopJoined})(?!-)`, 'g');

function tokenise(text) {
    return text
        .toLowerCase()
        .replace(regexStop, ' ')
        .replace(regexEmojis, ' ')
        .replace(regex, ' ')
        .split(/\s+/g);
}

module.exports = { stopwords, tokenise };