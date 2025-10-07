/* eslint-disable import/no-unresolved */
import linkedom from 'linkedom';
import { setGlobals, setRenderFenceRule } from './bench.common.js';

function textToDOM(text) {
  return linkedom.parseHTML(text).document;
}

module.exports.setup = function (md) {
  setGlobals(linkedom.parseHTML('').window.document);
  setRenderFenceRule(md, textToDOM);
};
