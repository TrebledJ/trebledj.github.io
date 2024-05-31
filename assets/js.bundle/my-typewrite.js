/* eslint-disable no-undef, no-var */
// JS controller for https://github.com/tameemsafi/typewriterjs.
// For documentation, see Typewriter JS: https://safi.me.uk/typewriterjs/.

function prefixLength(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++)
    if (a[i] !== b[i])
      return i;
  return n;
}

$(function () {
  const typewriter = new Typewriter('#typewrite-text', {
    loop: site.typewrite.loop,
  });

  let strings;
  if (site.typewrite.shuffle) {
    strings = site.typewrite.strings
      .map(value => ({ value, sort: Math.random() })) // Everyday I'm shufflin'.
      .sort((a, b) => a.sort - b.sort)
      .map(e => [...e.value]);
  } else {
    strings = site.typewrite.strings.map(s => [...s]);
  }

  typewriter.typeString('');

  if (site.typewrite.keepPrefix) {
    /*
        Get prefix lengths (to know how many characters to delete).
        N.B. there is an issue with `loop: true`, where transitioning from the
        nth to the 1st string will delete the entire string regardless of prefix.
        For this, you may want to set `random: false` and repeat strings,
        or just use `loop: false`. ¯\_(ツ)_/¯
    */
    const stringsWithPrefix = strings.map((curr, i) => {
      const next = strings[i + 1 === strings.length ? 0 : i + 1];
      return [curr, prefixLength(curr, next)];
    });

    let prevPrefix = 0;
    for (const [s, l] of stringsWithPrefix) {
      typewriter
        .typeString(s.slice(prevPrefix))
        .pauseFor(site.typewrite.pauseDuration)
        .deleteChars(s.length - l);
      prevPrefix = l;
    }
  } else {
    // Simple. Deletes the entire string each time.
    for (const s of strings) {
      typewriter.typeString(s).pauseFor(site.typewrite.pauseDuration).deleteAll();
    }
  }

  typewriter.start();
});
