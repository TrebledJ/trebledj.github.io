import collectHashes from './html-csp-collect-hashes.js';

export function htmlcsp(content) {
  if (this.page.outputPath?.endsWith?.('.html')) {
    const hashes = collectHashes('sha256', content);

    return content
      .replace(/\bscript-src (.*?'self')/, `script-src $1 ${Array.from(new Set(hashes.script)).join(' ')}`);
    // .replace(/\bstyle-src (.*?'self')/, `style-src $1 ${Array.from(new Set(hashes.style)).join(' ')}`)
  }
  return content;
};
