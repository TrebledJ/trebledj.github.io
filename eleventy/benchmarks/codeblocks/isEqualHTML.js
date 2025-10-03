/* eslint-disable import/no-unresolved */
import * as domino from 'domino';

function textToDOM(document, text) {
  // Use `template` as a workaround: https://github.com/fgnass/domino/issues/73
  const templ = document.createElement('template');
  templ.innerHTML = text;
  return templ.content;
}

export function isEqualHTML(text1, text2) {
  // Check HTML is equivalent. `<div a="1" b="2"></div>` === `<div b="2" a="1"></div>`
  const document = domino.createWindow('').document;
  const dom1 = textToDOM(document, text1);
  const dom2 = textToDOM(document, text2);
  return dom1.isEqualNode(dom2);
};
