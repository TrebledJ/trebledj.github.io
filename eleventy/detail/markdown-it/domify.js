// Introduce browser APIs such as `document` and `window` to Node.
// Make sure to call this prior to using `document`, e.g. before loading Prism plugins.

const jsdom = require('jsdom');

const { JSDOM } = jsdom;

global.window = (new JSDOM('')).window;
global.document = global.window.document;
global.getComputedStyle = window.getComputedStyle;
