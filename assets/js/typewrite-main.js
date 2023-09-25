$(function () {
    var typewriter = new Typewriter('#typewrite-text', {
        loop: true
    });

    let strings = [
        'Coding 💻',
        'Playing with embedded systems ⚡️',
        'Composing (￣▽￣)/♫•*¨*•.¸¸♪',
        'Studying 📖',
        'Capturing flags 🚩',
        'Writing articles on this site 📄',
        'Tinkering with this site 🌐',
        'Napping (＿ ＿*) Z z z',
        'Noodling with music ♪♪♪ ヽ(ˇ∀ˇ )ゞ',
        'Making koalaty memes (－‸ლ)',
    ]
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    typewriter.typeString('');

    for (s of strings) {
        typewriter.typeString(s).pauseFor(2500).deleteAll();
    }

    typewriter.start();
});