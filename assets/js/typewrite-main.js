$(function () {
    var typewriter = new Typewriter('#typewriteText', {
        loop: true
    });

    let strings = [
        'Playing with code 💻',
        'Composing with style (￣▽￣)/♫•*¨*•.¸¸♪',
        'Studying 📖',
        'Playing CTFs 🚩',
        'Tinkering with this website 🌐',
        'Napping (＿ ＿*) Z z z',
        'Playing with music ♪♪♪ ヽ(ˇ∀ˇ )ゞ',
        'Making koalaty memes (－‸ლ)',
    ];

    typewriter.typeString('');

    for (s of strings) {
        typewriter.typeString(s).pauseFor(2500).deleteAll();
    }

    typewriter.start();
});