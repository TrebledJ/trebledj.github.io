// node build-index.js <../../../_site/search.json >index.json

import lunr from 'lunr';

const { stdin } = process;
const { stdout } = process;
const buffer = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', data => {
  buffer.push(data);
});

stdin.on('end', () => {
  const store = JSON.parse(buffer.join(''));

  const idx = lunr(function () {
    this.ref('id');
    this.field('title', { boost: 50 });
    this.field('keywords');
    this.field('tags', { boost: 30 });
    this.pipeline.remove(lunr.trimmer);
    this.pipeline.remove(lunr.stopWordFilter);
    store.forEach((item, i) => {
      this.add({
        id: i,
        title: item.title,
        keywords: item.keywords,
        tags: item.tags,
      });
    });
  });
  stdout.write(JSON.stringify(idx));
});
