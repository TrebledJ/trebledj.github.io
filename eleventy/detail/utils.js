const chalk = require('chalk');

// Report cases which return an empty container.
function expectNonEmpty(container, label, file) {
  const report = () => console.warn(chalk.yellow(`[11ty] ${label} is empty for ${file}`));
  if (container === undefined || container === null) {
    report();
  } else if (Array.isArray(container)) {
    if (container.length === 0) {
      report();
    }
  } else {
    if (Object.keys(container).length === 0) {
      report();
    }
  }
}

// A decorator to warn us when a returned container is empty.
function nonEmptyContainerSentinel(label) {
  return function (func) {
    return function (...args) {
      const result = func.call(this, ...args);
      expectNonEmpty(result, label, this.page.fileSlug);
      return result;
    };
  };
}

module.exports = { nonEmptyContainerSentinel };
