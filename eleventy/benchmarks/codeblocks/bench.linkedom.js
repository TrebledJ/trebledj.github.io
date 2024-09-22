/* eslint-disable import/no-unresolved */
const linkedom = require('linkedom');
const { setGlobals, setRenderFenceRule } = require('./bench.common');

function textToDOM(text) {
  return linkedom.parseHTML(text).document;
}

module.exports.setup = function (md) {
  setGlobals(linkedom.parseHTML('').window.document);
  setRenderFenceRule(md, textToDOM);
};
