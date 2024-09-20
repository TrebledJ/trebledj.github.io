const { setGlobals, setRenderFenceRule } = require('./bench.common');
const domino = require('domino');

function textToDOM(text) {
    // Use `template` as a workaround: https://github.com/fgnass/domino/issues/73 
    const templ = document.createElement('template');
    templ.innerHTML = text;
    return templ.content;
}

module.exports.setup = function (md) {
    setGlobals(domino.createWindow(''));
    setRenderFenceRule(md, textToDOM);
}
