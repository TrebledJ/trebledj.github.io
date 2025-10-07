/* eslint-disable import/no-unresolved */
import * as domino from 'domino';
import { setGlobals, setRenderFenceRule } from './bench.common.js';

function textToDOM(text) {
  // Use `template` as a workaround: https://github.com/fgnass/domino/issues/73
  const templ = document.createElement('template');
  templ.innerHTML = text;
  return templ.content;
}

module.exports.setup = function (md) {
  setGlobals(domino.createWindow('').document);
  setRenderFenceRule(md, textToDOM);
};
