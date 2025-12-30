module.exports = (func) => {
  return (req, res, next) => {
    if (typeof func !== "function") {
      return next(
        new Error("CatchAsync expects a function but received " + typeof func)
      );
    }
    Promise.resolve(func(req, res, next)).catch(next);
  };
};
