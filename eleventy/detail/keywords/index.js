/* eslint-disable */

// import process from './rake-js/dist/index.js'.default;

import { stem } from './stem.js';
import { tokenise, stopwords } from './tokenise.js';

// import chalk from 'chalk';

function exclude_stopwords(s) {
  if (!s)
    return false;
  const trimmed = s.trim();
  return trimmed.length >= 2 && !stopwords.includes(trimmed);// && trimmed.length < 6;
}

function extract(content, useStemming) {
  const tokenised = tokenise(content);
  if (useStemming) {
    return tokenised.map(stem).filter(exclude_stopwords);
  }
  return tokenised.filter(exclude_stopwords);
}

/**
 * Extract keywords from a piece of text.
 * @param {*} content The text to extract keywords from.
 * @returns An array of key terms.
 */
export function findKeywords(content, useStemming) {
  useStemming ??= true;
  return extract(content, useStemming);
}
