// Introduce browser APIs such as `document` and `window` to Node.
// Make sure to call this prior to using `document`, e.g. before loading Prism plugins.

const domino = require('domino');

global.window = domino.createWindow('');
global.document = global.window.document;
