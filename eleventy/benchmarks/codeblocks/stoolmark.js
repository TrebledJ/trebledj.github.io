/* eslint-disable no-console */
// Custom benchmark class.

const { performance } = require('perf_hooks');

class Timer {
  constructor(name) {
    this.name = name ?? 'Benchmark';
    this.#reset();
  }

  time({
    setup, run, seconds, count,
  }) {
    console.log('Running:', this.name);
    setup();
    seconds ??= 10;

    this.#reset();
    if (count === undefined) {
      // One-shot to determine how many times to run.
      const start = performance.now();
      run();
      const end = performance.now();
      count = Math.max(Math.round(seconds * 1000 / (end - start)), 1);
      console.log(`[auto] Target ${count} runs (~${(end - start).toFixed(0)}ms/run) in ${seconds}s.`);
    }

    // this.#reset();
    // this.#timeFunc(() => {}, 1);

    // const offset = this.mean();
    const offset = 0; // Assume negligible.
    // console.log("null offset:", offset.toFixed(3));

    // Warm up.
    run();

    this.#reset();
    this.#timeFunc(run, count, offset);
  }

  #timeFunc(func, count, sub) {
    sub ??= 0;
    for (let i = 0; i < count; i++) {
      const start = performance.now();
      func();
      const end = performance.now();
      this.#push(Math.max(end - start - sub, 0));
    }
  }

  #reset() {
    this.count = 0;
    this.min = 0;
    this.max = 0;
    this.old_m = 0;
    this.new_m = 0;
    this.old_s = 0;
    this.new_s = 0;
  }

  #push(time) {
    this.count++;
    if (this.count === 1) {
      this.old_m = this.new_m = time;
      this.old_s = 0;
    } else {
      this.new_m = this.old_m + ((time - this.old_m) / this.count);
      this.new_s = this.old_s + ((time - this.old_m) * (time - this.new_m));

      this.old_m = this.new_m;
      this.old_s = this.new_s;
    }
    if (this.count === 1 || time < this.min)
      this.min = time;
    if (this.count === 1 || time > this.max)
      this.max = time;
  }

  mean() {
    return this.count ? this.new_m : 0.0;
  }

  variance() {
    return this.count > 1 ? this.new_s / (this.count - 1) : 0.0;
  }

  stddev() {
    return Math.sqrt(this.variance());
  }

  report() {
    console.log(` --- [${this.name}] ---`);
    console.log(` - ${this.count} runs`);
    console.log(` - mean: µ=${this.mean().toFixed(3)}ms / σ=${this.stddev().toFixed(3)}ms`);
    console.log(` - minmax: ${this.min.toFixed(3)}ms / ${this.max.toFixed(3)}ms`);
    console.log();
  }
}

module.exports = { Timer };
