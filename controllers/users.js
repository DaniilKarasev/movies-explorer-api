/* eslint-disable consistent-return */
/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const {
  ServerError,
  NotFoundError,
  CastError,
  ConflictError,
} = require('../utils/errors');

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hashedPassword) => {
      User.create({
        name,
        email,
        password: hashedPassword,
      })
        .then((user) => {
          res.send(user);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            return next(new CastError(`Переданы некорректные данные при создании пользователя. Поле${err.message.replace('user validation failed:', '').replace(':', '')}`));
          }
          if (err.code === 11000) {
            return next(new ConflictError(`Пользователь с email '${err.keyValue.email}' уже зарегистрирован`));
          }
          return next(new ServerError('Произошла ошибка'));
        });
    })
    .catch(() => {
      next(new ServerError('Произошла ошибка'));
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const { NODE_ENV, JWT_SECRET } = process.env;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({
        _id: user._id,
      }, NODE_ENV ? JWT_SECRET : 'dev-secret');

      res.cookie('jwt', token, {
        maxAge: 604800000,
        httpOnly: true,
        sameSite: true,
      });

      res.send({ data: user.toJSON() });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.signout = (req, res, next) => {
  try {
    res.clearCookie('jwt').status(200).send({ message: 'Вы вышли из профиля' });
  } catch (err) {
    return next(new ServerError('Произошла ошибка'));
  }
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(() => next(new ServerError('Ошибка на стороне сервера')));
};

module.exports.getCurrentUserInfo = (req, res, next) => {
  User.findById(req.user)
    .then((user) => {
      if (user) {
        return res.send(user);
      }
      return next(new NotFoundError(`Пользователь ${req.user} не найден`));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new CastError('Передан некорректный id пользователя'));
      }
      return next(new ServerError('Произошла ошибка'));
    });
};

module.exports.editUserProfile = (req, res, next) => {
  const {
    name,
    email,
  } = req.body;

  User.findByIdAndUpdate(req.user._id, {
    name,
    email,
  }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new CastError('Передан некорректный id при обновлении профиля'));
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new CastError(`Переданы некорректные данные при обновлении профиля. Поле${err.message.replace('Validation failed:', '').replace(':', '')}`));
      } else {
        next(new ServerError('Произошла ошибка'));
      }
    });
};
