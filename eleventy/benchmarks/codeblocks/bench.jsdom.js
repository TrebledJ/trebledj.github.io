/* eslint-disable import/no-unresolved */
const jsdom = require('jsdom');
const { setGlobals, setRenderFenceRule } = require('./bench.common');

const { JSDOM } = jsdom;

function textToDOM(text) {
  return JSDOM.fragment(text);
}

module.exports.setup = function (md) {
  setGlobals((new JSDOM('')).window.document);
  setRenderFenceRule(md, textToDOM);
};
