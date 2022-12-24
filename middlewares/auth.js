const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

// eslint-disable-next-line consistent-return
module.exports.auth = (req, res, next) => {
  const { NODE_ENV, JWT_SECRET } = process.env;

  if (req.cookies.jwt) {
    const token = req.cookies.jwt;
    let payload;

    try {
      payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
    } catch (err) {
      return next(new UnauthorizedError('Ошибка авторизации'));
    }

    req.user = payload;

    next();
  } else {
    return next(new UnauthorizedError('Ошибка авторизации'));
  }
};
