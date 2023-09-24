// node build-index.js <../../../_site/search.json >index.json

var lunr = require('lunr'),
    stdin = process.stdin,
    stdout = process.stdout,
    buffer = []

stdin.resume()
stdin.setEncoding('utf8')

stdin.on('data', function (data) {
  buffer.push(data)
})

stdin.on('end', function () {
  var store = JSON.parse(buffer.join(''))

  const idx = lunr(function () {
    this.ref('id');
    this.field('title', { boost: 50 });
    this.field('keywords');
    this.field('tags', { boost: 30 });
    this.pipeline.remove(lunr.trimmer);
    this.pipeline.remove(lunr.stopWordFilter);
    for (const i in store) {
      this.add({
        id: i,
        title: store[i].title,
        keywords: store[i].keywords,
        tags: store[i].tags,
      });
    }
  });
  stdout.write(JSON.stringify(idx))
})