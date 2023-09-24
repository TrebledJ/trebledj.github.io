// const process = require('./rake-js/dist/index').default;

const fs = require('fs');
const stopwords = fs.readFileSync('./eleventy/detail/stopwords.txt', 'utf8').split('\n');

const punc_start = `\\{\\[\\(<#&\\|`;
const punc_end = `\\.\\?\\!:;\\}\\]\\)>`;
const punc = `\\/…\\*,\`=–—\\$\\^\\\\`;
const quotes = `'‘’‛‚“”„‟"`;
const escapes = `(&lt;)|(&gt;)|(&quot;)|(&amp;)`;

const footnote = `(?<=[a-zA-Z\\s])[${punc_end}]+\\d+(\\s+|$)`

const delims_end = `([${punc_end}]+(?=([${quotes}]|\\s+|$)))|((?<=[a-zA-Z])[${punc_end}]+(?=[a-zA-Z]))|([${punc_end}]+[${punc}]+)`;
const delims = `${escapes}|[${punc_start}${punc}]+|${delims_end}|[${punc_end}]{2,}|(--)|\\s+`;

const quotes_start = `(?<=(^|\\s+|[${punc_start}${punc}]))[${quotes}]+`;
const quotes_end = `[${quotes}]([${punc}${punc_start}${punc_end}]+|\\s+|$)`;

const code = `(\\+=)|(-=)|(%=)|(--)|(==+)|(!=+)`;

const contractions_n = `n['‘’](t)`;
const contractions_ = `['‘’](d|s|ll|m|re|ve)\\b`;
const contractions = `(${contractions_n})|(${contractions_})`;

const regex = new RegExp(`${code}|(${delims})|(${footnote})|(${quotes_start})|(${quotes_end})|(${contractions})`, 'g');

const regexEmojis = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug

const flexiquotes = s => s.replace(`'`, `['‘’‛]`);

const stopJoined = stopwords.reverse().filter(w => !w.startsWith('#') && w.length >= 1).map(flexiquotes).map(s => `\\b${s}\\b`).join('|');
const regexStop = new RegExp(`(?<!-)(${stopJoined})(?!-)`, 'g');

let test_run = false;

const chalk = require('chalk');

// TODO: refactor into cleaner unit tests
function tester() {
    function test(text, expect) {
        const output = extract(text, true);
        if (JSON.stringify(output) !== JSON.stringify(expect)) {
            const ediff = new Set(expect);
            for (const e of output)
                ediff.delete(e);
            const diff = new Set(output);
            for (const e of expect)
                diff.delete(e);
            console.log(chalk.red(`expected '${new Array(...ediff).join(' ')}', got '${new Array(...diff).join(' ')}'`));
        }
    }

    test("A series of low-cost, low-power system-on-a-chip microcontrollers with integrated Wi-Fi and dual-mode Bluetooth.",
        'series low-cost low-power system-on-a-chip microcontrollers integrated wi-fi dual-mode bluetooth'.split(' '));

    test(`the student card to be able to use it for electronic transactions (e-payment). The idea is akin`,
        'student card electronic transactions e-payment idea akin'.split(' '));

    test(`#include <stdio.h>
    // C++ D++'s
    #include &lt;stdio.h&gt;

    int main() {
        printf("Hello world!\\n");
    }`,
    'include stdio c++ d++ include stdio int main printf world'.split(' '));

    test(`&amp;sigsegv_sigaction,0,0x98`, 'sigsegv_sigaction 0x98'.split(' '));

    test(`important &varname &amp;foo **varname 1000 + 2000 / 3.14159 || 456`, 'important varname foo varname 1000 2000 3.14159 456'.split(' '));
    
    test(` (\`open('message.txt', 'rb')\`)`, 'open message txt rb'.split(' '));

    test(`encoded = base64.b64encode(message).decode().rstrip('=')`, 'encoded base64.b64encode message decode rstrip'.split(' '));

    test(`0x100 3.145 100.254 abc.def foo2.bar3`, '0x100 3.145 100.254 abc def foo2.bar3'.split(' '));

    test(`I’ll be taking a didactic approach to this writeup, with some sections starting with questions for guidance.1 
        Anytime there's a set of questions,2 feel free to pause, challenge yourself, and try thinking through them!3`,
        'didactic approach writeup sections questions guidance anytime set questions free pause challenge'.split(' '));

    test(`To get the flag you'll need to get...  We'll make a mental note of this.`, 'flag make mental note'.split(' '));

    test(`dynamic allocation is everywhere.1 Not so in embedded.`,
        'dynamic allocation embedded'.split(' '))

    test(`So I won’t delve precisely into what I worked on.`,
        'delve precisely worked'.split(' '));

    test(`combobulator 🤫 ⭐️ 👍 🤔 ☹️ rockwell`, 'combobulator rockwell'.split(' '));

    test(`
    if (local_c0 == &DAT_13398000) {
        puts("Well done! Wrap that in DUCTF{}.");
    }
    else {
        oops(0);
    }`,
    'local_c0 dat_13398000 puts wrap ductf oops'.split(' '));

    test(`Virtual classes, exceptions, runtime type information (RTTI)—these are all no-nos for some embedded companies.`,
        'virtual classes exceptions runtime type information rtti no-nos embedded companies'.split(' '));
}


function extract(content, debug=false) {
    function keep(s) {
        if (!s) return false;
        let trimmed = s.trim();
        return trimmed.length >= 2 && !stopwords.includes(trimmed)// && trimmed.length < 6;
    }

    if (debug) {
        console.log();
        console.log(chalk.green(content));
    }

    const cleaned = content.toLowerCase().replace(regexStop, ' ').replace(regexEmojis, ' ');
    if (debug) {
        console.log(cleaned);
        console.log(cleaned.match(regex));
    }

    const keywords = cleaned.replace(regex, ' ').split(/\s+/g).filter(keep);
    if (debug)
        console.log(keywords);
    return keywords;
}


/**
 * Extract keywords from a piece of text.
 * @param {*} content The text to extract keywords from.
 * @returns An array of key terms.
 */
module.exports = function (content) {
    // Uncomment to test. // TODO: unjank this mess.
    // if (!test_run) {
    //     test_run = true;
    //     tester();
    // }
    return extract(content).join(' ');
}
