/* eslint-disable import/no-unresolved */
const domino = require('domino');
const { setGlobals, setRenderFenceRule } = require('./bench.common');

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
