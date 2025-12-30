// src/logger.ts
export function patchConsoleLog() {
  const originalLog = console.log;

  console.log = (...args) => {
    const error = new Error();
    const stack = error.stack?.split("\n")[2]?.trim(); // line with caller info
    const timestamp = new Date().toISOString();
    originalLog(`[${timestamp}] [${stack}]`, ...args);
  };
}
