// logger.js
const path = require("path");

const getCallerFile = () => {
  const orig = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const err = new Error();
  const stack = err.stack;
  Error.prepareStackTrace = orig;
  // stack[0] = getCallerFile, stack[1] = overridden console.log, stack[2] = original caller
  const caller = stack[2];
  const fileName = caller?.getFileName?.();
  const lineNumber = caller?.getLineNumber?.();
  const relativeFileName = path.relative(process.cwd(), fileName || "");

  if (relativeFileName === "utils\\requestLogger.js" && lineNumber === 6) {
    return "";
  }
  if (relativeFileName === "utils\\responseTimeLogger.js" && lineNumber === 19) {
    return "";
  }

  return `${relativeFileName}:${lineNumber}`;
};

const patchConsole = () => {
  const originalLog = console.log;

  console.log = (...args) => {
    const caller = getCallerFile();
    if (caller) {
      originalLog(`[${caller}]`, ...args);
    } else {
      originalLog(...args);
    }
  };
};

const attachLogger = () => {
  patchConsole();
};

module.exports = attachLogger;
