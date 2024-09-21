const { setGlobals, setRenderFenceRule } = require('./bench.common');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function textToDOM(text) {
    return JSDOM.fragment(text);
}

module.exports.setup = function (md) {
    setGlobals((new JSDOM('')).window);
    setRenderFenceRule(md, textToDOM);
}
