const chalk = require("chalk");

module.exports = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;

    // Color based on response time
    let coloredDuration;
    if (duration < 100) {
      coloredDuration = chalk.green.bold(`${duration.toFixed(2)} ms`);
    } else if (duration < 500) {
      coloredDuration = chalk.yellow.bold(`${duration.toFixed(2)} ms`);
    } else {
      coloredDuration = chalk.red.bold(`${duration.toFixed(2)} ms`);
    }

    console.log(
      chalk.white.dim("[RESPONSE TIME]") +
        chalk.white.bold.dim(` ${req.method} `) +
        chalk.white.dim(`${req.url}`) +
        chalk.white.dim(" - ") +
        coloredDuration
    );
  });

  next();
};
