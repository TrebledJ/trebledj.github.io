/* eslint-disable max-len */
const { stripBetweenTags } = require('../detail/filters');


test('stripBetweenTags: simple', () => {
  expect(stripBetweenTags('1<sub>abc</sub>2', ['sub'])).toBe('12');
  expect(stripBetweenTags('1<sub>abc</sub> 2', ['sub'])).toBe('1 2');
  expect(stripBetweenTags('1 <sub>abc</sub> 2', ['sub'])).toBe('1  2');
  expect(stripBetweenTags('wonderful.<sup><sub>abc</sub></sup> But', ['sub', 'sup'])).toBe('wonderful. But');
  expect(stripBetweenTags('<sub><sup>N[</sup></sub>Subtype Metaprogramming<sub><sup>]</sup></sub> is <sub><sup>N[</sup></sub>Mostly Harmless<sub><sup>]</sup></sub>', ['sub', 'sup']))
    .toBe('Subtype Metaprogramming is Mostly Harmless');
  expect(stripBetweenTags('<sub><sup>N[</sup></sub>Subtype Metaprogramming<sub><sup>]</sup></sub> is <sub><sup>N[</sup></sub>Mostly Harmless<sub><sup>]</sup></sub>', ['sup', 'sub']))
    .toBe('Subtype Metaprogramming is Mostly Harmless');
});

test('stripBetweenTags: with attributes', () => {
  expect(stripBetweenTags('1 <a href="http://example.com" target="_blank" rel="noreferrer">example link</a> 2', ['a'])).toBe('1  2');
  expect(stripBetweenTags('1 <img alt="<b>Wow! Alt text is so great~</b>"/> wonderful image 2', ['img'])).toBe('1  wonderful image 2');
  expect(stripBetweenTags('1 <img alt="<b>Wow! Alt text is so great~</b>"/> wonderful image 2', ['b', 'img'])).toBe('1  wonderful image 2');
});

test('stripBetweenTags: allow some', () => {
  expect(stripBetweenTags('1<img alt="text!">some<br/>text<br>here2', ['br'])).toBe('1<img alt="text!">sometexthere2');
  expect(stripBetweenTags('in<b>bet<em>w</em>ee<br>n</b>', ['em', 'br'])).toBe('in<b>beteen</b>');
});
