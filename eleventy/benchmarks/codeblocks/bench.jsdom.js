/* eslint-disable import/no-unresolved */
import jsdom from 'jsdom';
import { setGlobals, setRenderFenceRule } from './bench.common.js';

const { JSDOM } = jsdom;

function textToDOM(text) {
  return JSDOM.fragment(text);
}

module.exports.setup = function (md) {
  setGlobals((new JSDOM('')).window.document);
  setRenderFenceRule(md, textToDOM);
};
