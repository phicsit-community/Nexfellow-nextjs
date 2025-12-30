const chalk = require('chalk');

module.exports = (req, res, next) => {
  const method = chalk.bold.green(req.method);
  const url = chalk.blue(req.url);
  console.log(`[${chalk.italic.yellow('REQUEST')}] ${method} ${url}`);
  next();
};
