class Tag {
  constructor(src) {
    this.type = src;
    this.srcs = ["'self'"];
  }

  add(...args) {
    this.srcs.push(...args);
    return this;
  }

  compile() {
    return `${this.type}-src ${this.srcs.join(' ')};`;
  }
}

function tag(src) { return new Tag(src); }

function compileCsp(...tags) {
  return tags.map(t => t.compile()).join('\n');
}

module.exports = compileCsp(
  tag('default'),
  tag('script')
    // In dev/prod builds, we would include CSP hashes in script-src. But this
    // step is skipped to optimise for speed, so for fast builds, we just use
    // unsafe-inline.
    .add(...(process.env.ENVIRONMENT === 'fast' ? ["'unsafe-inline'"] : []))
    // .add('*.disqus.com', '*.disquscdn.com')
    .add('comments.trebledj.me')
    .add('code.jquery.com', 'cdn.jsdelivr.net')
    .add('gist.github.com')
    .add('static.cloudflareinsights.com'),
  tag('style')
    .add("'unsafe-inline'")
    // .add(`'unsafe-hashes'`)
    // .add('*.disquscdn.com')
    .add('cdn.jsdelivr.net')
    .add('cdnjs.cloudflare.com')
    .add('github.githubassets.com'),
  tag('font')
    .add('data:')
    .add('cdn.jsdelivr.net')
    .add('cdnjs.cloudflare.com'),
  tag('img')
    .add('data:'),
  // .add('c.disquscdn.com'), // .add('*')

  tag('frame')
    // .add('disqus.com')
    .add('*.soundcloud.com'),
  tag('connect')
    .add('cloudflareinsights.com')
    .add('formcarry.com') // contact form
  ,
);
