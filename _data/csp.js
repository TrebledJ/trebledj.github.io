class Tag {
    constructor(src) {
        this.type = src;
        this.srcs = [`'self'`];
    }

    add(...args) {
        this.srcs.push(...args);
        return this;
    }

    compile() {
        return `${this.type}-src ${this.srcs.join(' ')};`
    }
}

function tag(src) { return new Tag(src); }

function compile_csp(...tags) {
    return tags.map(t => t.compile()).join('\n');
}

module.exports = compile_csp(
    tag('default'),
    tag('script')
        // .add(`'unsafe-inline'`)
        .add('*.disqus.com', '*.disquscdn.com')
        .add('code.jquery.com', 'cdn.jsdelivr.net')
        .add('gist.github.com')
        .add('static.cloudflareinsights.com')
        .add('launchpad-wrapper.privacymanager.io')
    ,
    tag('style')
        .add(`'unsafe-inline'`)
        // .add(`'unsafe-hashes'`)
        .add('*.disquscdn.com')
        .add('cdn.jsdelivr.net')
        .add('cdnjs.cloudflare.com')
        .add('github.githubassets.com')
    ,
    tag('font')
        .add('data: cdn.jsdelivr.net')
        .add('cdnjs.cloudflare.com')
    ,
    tag('img')
        .add('data: *')
    ,
    tag('frame')
        .add('disqus.com')
        .add('*.soundcloud.com')
    ,
    tag('connect')
        .add('cloudflareinsights.com')
    ,
);
