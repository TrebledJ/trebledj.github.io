const keywords = require('../detail/keywords');

test('keyword tokens', () => {
  expect(
    keywords(`A series of low-cost, low-power system-on-a-chip microcontrollers 
            with integrated Wi-Fi and dual-mode Bluetooth.`),
  ).toBe('series low-cost low-power system-on-a-chip microcontrollers integrated wi-fi dual-mode bluetooth');

  expect(
    keywords('the student card to be able to use it for electronic transactions (e-payment). The idea is akin'),
  ).toBe('student card electronic transactions e-payment idea akin');

  expect(
    keywords(`#include <stdio.h>
        // C++ D++'s
        #include &lt;stdio.h&gt;
    
        int main() {
            printf("Hello world!\\n");
        }`),
  ).toBe('include stdio c++ d++ include stdio int main printf world');

  expect(keywords('&amp;sigsegv_sigaction,0,0x98')).toBe('sigsegv_sigaction 0x98');

  expect(keywords('important &varname &amp;foo **varname 1000 + 2000 / 3.14159 || 456'))
    .toBe('important varname foo varname 1000 2000 3.14159 456');

  expect(keywords(' (`open(\'message.txt\', \'rb\')`)'))
    .toBe('open message txt rb');

  expect(keywords('encoded = base64.b64encode(message).decode().rstrip(\'=\')'))
    .toBe('encoded base64.b64encode message decode rstrip');

  expect(keywords('0x100 3.145 100.254 abc.def foo2.bar3'))
    .toBe('0x100 3.145 100.254 abc def foo2.bar3');

  expect(
    keywords(
      `I’ll be taking a didactic approach to this writeup, with some sections starting with questions for guidance.1 
        Anytime there's a set of questions,2 feel free to pause, challenge yourself, 
        and try thinking through them!3`,
    ),
  ).toBe('didactic approach writeup sections questions guidance anytime set questions free pause challenge');

  expect(keywords('To get the flag you\'ll need to get...  We\'ll make a mental note of this.'))
    .toBe('flag make mental note');

  expect(keywords(
    'dynamic allocation is everywhere.1 Not so in embedded.',
  )).toBe('dynamic allocation embedded');

  expect(keywords('So I won’t delve precisely into what I worked on.'))
    .toBe('delve precisely worked');

  expect(keywords('combobulator 🤫 ⭐️ 👍 🤔 ☹️ rockwell'))
    .toBe('combobulator rockwell');

  expect(
    keywords(`
            if (local_c0 == &DAT_13398000) {
                puts("Well done! Wrap that in DUCTF{}.");
            }
            else {
                oops(0);
            }`),
  ).toBe('local_c0 dat_13398000 wrap ductf oops');

  expect(
    keywords(
      'Virtual classes, exceptions, runtime type information (RTTI)—these are all no-nos for some embedded companies.',
    ),
  ).toBe('virtual classes exceptions runtime type information rtti no-nos embedded companies');
});
