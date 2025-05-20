module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next /*ili err => next(err) */);
};
