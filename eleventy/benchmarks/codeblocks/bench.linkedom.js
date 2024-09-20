const { setGlobals, setRenderFenceRule } = require('./bench.common');
const linkedom = require('linkedom');

function textToDOM(text) {
    return linkedom.parseHTML(text).document;
}

module.exports.setup = function (md) {
    setGlobals(linkedom.parseHTML('').window);
    setRenderFenceRule(md, textToDOM);
}
