/* eslint-disable */

// const process = require('./rake-js/dist/index').default;

const stem = require('./stem');
const { tokenise, stopwords } = require('./tokenise');

// const chalk = require('chalk');

function extract(content) {
  function keep(s) {
    if (!s)
      return false;
    const trimmed = s.trim();
    return trimmed.length >= 2 && !stopwords.includes(trimmed);// && trimmed.length < 6;
  }

  return tokenise(content).map(stem).filter(keep);
}

/**
 * Extract keywords from a piece of text.
 * @param {*} content The text to extract keywords from.
 * @returns An array of key terms.
 */
module.exports = function (content) {
  return extract(content);
};
