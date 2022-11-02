---
---
function loadDisqus() {
    var d = document, s = d.createElement('script');
    s.src = 'https://{{site.disqus_shortname}}.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
}

function reloadDisqus() {
    var div = document.getElementById('disqus_thread');
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }

    /* Pause a while in order for background color to finish transitioning. */
    setTimeout(loadDisqus, 1000);
}
reloadDisqus();