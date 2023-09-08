/**
 * Modified from https://github.com/localnerve/csp-hashes.
 */
/**
 * Copyright 2022-2023, Alex Grant, LocalNerve, LLC
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * allcopies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const crypto = require('crypto');
const cheerio = require('cheerio');

/**
 * Collect all CSP Hashes and fill the given `hashes` structure.
 * 
 * Author: @local-nerve
 *
 * @param {Function} hashFn - Creates and formats a csp hash
 * @param {String|Buffer} html - The html content
 * @param {Object} hashes - The hash structure to fill
 */
module.exports = function (algo, html) {
	const hashes = {
		script: [],
		style: [],
	};
	const $ = cheerio.load(html);
	const hash = r => `'${algo}-${crypto.createHash(algo).update(r).digest('base64')}'`;

	Object.keys(hashes).forEach(what => {
		hashes[what] = $(`${what}:not([src])`).map(
			(i, el) => hash($(el).html())
		).toArray();
	});

	hashes.style.push(
		...$('[style]').map((i, el) => hash($(el).attr('style'))).toArray()
	);

	const eventHandlerRe = /^on/i;
	const jsUrlRe = /^javascript:/i;

	$('*').each(function (i, el) {
		for (const attrName in el.attribs) {
			if (eventHandlerRe.test(attrName)) {
				hashes.script.push(
					hash(el.attribs[attrName])
				);
			}
			if (jsUrlRe.test(el.attribs[attrName])) {
				hashes.script.push(
					hash(el.attribs[attrName].split(jsUrlRe)[1])
				);
			}
		}
	});

	return hashes;
}
