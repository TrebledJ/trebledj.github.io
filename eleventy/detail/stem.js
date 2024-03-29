// Stemming: removal of suffixes and morphs.
/* eslint-disable */

const step2list = {
  ational: 'ate',
  tional: 'tion',
  enci: 'ence',
  anci: 'ance',
  izer: 'ize',
  bli: 'ble',
  alli: 'al',
  entli: 'ent',
  eli: 'e',
  ousli: 'ous',
  ization: 'ize',
  ation: 'ate',
  ator: 'ate',
  alism: 'al',
  iveness: 'ive',
  fulness: 'ful',
  ousness: 'ous',
  aliti: 'al',
  iviti: 'ive',
  biliti: 'ble',
  logi: 'log',
};

const step3list = {
  icate: 'ic',
  ative: '',
  alize: 'al',
  iciti: 'ic',
  ical: 'ic',
  ful: '',
  ness: '',
};

const c = '[^aeiou]'; // consonant
const v = '[aeiouy]'; // vowel
const C = `${c}[^aeiouy]*`; // consonant sequence
const V = `${v}[aeiou]*`; // vowel sequence

const mgr0 = `^(${C})?${V}${C}`; // [C]VC... is m>0
const meq1 = `^(${C})?${V}${C}(${V})?$`; // [C]VC[V] is m=1
const mgr1 = `^(${C})?${V}${C}${V}${C}`; // [C]VCVC... is m>1
const s_v = `^(${C})?${v}`; // vowel in stem

const re_mgr0 = new RegExp(mgr0);
const re_mgr1 = new RegExp(mgr1);
const re_meq1 = new RegExp(meq1);
const re_s_v = new RegExp(s_v);

const re_1a = /^(.+?)(ss|i)es$/;
const re2_1a = /^(.+?)([^s])s$/;
const re_1b = /^(.+?)eed$/;
const re2_1b = /^(.+?)(ed|ing)$/;
const re_1b_2 = /.$/;
const re2_1b_2 = /(at|bl|iz)$/;
const re3_1b_2 = new RegExp('([^aeiouylsz])\\1$');
const re4_1b_2 = new RegExp(`^${C}${v}[^aeiouwxy]$`);

const re_1c = /^(.+?[^aeiou])y$/;
const re_2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;

const re_3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;

const re_4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
const re2_4 = /^(.+?)(s|t)(ion)$/;

const re_5 = /^(.+?)e$/;
const re_5_1 = /ll$/;
const re3_5 = new RegExp(`^${C}${v}[^aeiouwxy]$`);

module.exports = function stem(w) {
  let stem;
  let suffix;
  let firstch;
  let re;
  let re2;
  let re3;
  let re4;

  if (w.length < 3) { return w; }

  firstch = w.substr(0, 1);
  if (firstch == 'y') {
    w = firstch.toUpperCase() + w.substr(1);
  }

  // Step 1a
  re = re_1a;
  re2 = re2_1a;

  if (re.test(w)) { w = w.replace(re, '$1$2'); } else if (re2.test(w)) { w = w.replace(re2, '$1$2'); }

  // Step 1b
  re = re_1b;
  re2 = re2_1b;
  if (re.test(w)) {
    var fp = re.exec(w);
    re = re_mgr0;
    if (re.test(fp[1])) {
      re = re_1b_2;
      w = w.replace(re, '');
    }
  } else if (re2.test(w)) {
    var fp = re2.exec(w);
    stem = fp[1];
    re2 = re_s_v;
    if (re2.test(stem)) {
      w = stem;
      re2 = re2_1b_2;
      re3 = re3_1b_2;
      re4 = re4_1b_2;
      if (re2.test(w)) { w += 'e'; } else if (re3.test(w)) { re = re_1b_2; w = w.replace(re, ''); } else if (re4.test(w)) { w += 'e'; }
    }
  }

  // Step 1c - replace suffix y or Y by i if preceded by a non-vowel which is not the first letter of the word (so cry -> cri, by -> by, say -> say)
  re = re_1c;
  if (re.test(w)) {
    var fp = re.exec(w);
    stem = fp[1];
    w = `${stem}i`;
  }

  // Step 2
  re = re_2;
  if (re.test(w)) {
    var fp = re.exec(w);
    stem = fp[1];
    suffix = fp[2];
    re = re_mgr0;
    if (re.test(stem)) {
      w = stem + step2list[suffix];
    }
  }

  // Step 3
  re = re_3;
  if (re.test(w)) {
    var fp = re.exec(w);
    stem = fp[1];
    suffix = fp[2];
    re = re_mgr0;
    if (re.test(stem)) {
      w = stem + step3list[suffix];
    }
  }

  // Step 4
  re = re_4;
  re2 = re2_4;
  if (re.test(w)) {
    var fp = re.exec(w);
    stem = fp[1];
    re = re_mgr1;
    if (re.test(stem)) {
      w = stem;
    }
  } else if (re2.test(w)) {
    var fp = re2.exec(w);
    stem = fp[1] + fp[2];
    re2 = re_mgr1;
    if (re2.test(stem)) {
      w = stem;
    }
  }

  // Step 5
  re = re_5;
  if (re.test(w)) {
    var fp = re.exec(w);
    stem = fp[1];
    re = re_mgr1;
    re2 = re_meq1;
    re3 = re3_5;
    if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
      w = stem;
    }
  }

  re = re_5_1;
  re2 = re_mgr1;
  if (re.test(w) && re2.test(w)) {
    re = re_1b_2;
    w = w.replace(re, '');
  }

  // and turn initial Y back to y

  if (firstch == 'y') {
    w = firstch.toLowerCase() + w.substr(1);
  }

  return w;
};
