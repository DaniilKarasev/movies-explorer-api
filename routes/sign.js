const router = require('express').Router();
const { celebrate, Joi, Segments } = require('celebrate');
const validator = require('validator');
const { login, signout, createUser } = require('../controllers/users');

router.post('/signup', celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    password: Joi.string().required(),
    email: Joi.string().required().custom((value, helpers) => {
      if (validator.isEmail(value)) {
        return value;
      }
      return helpers.message('Email указан с ошибкой');
    }),
  }),
}), createUser);

router.post('/signin', celebrate({
  [Segments.BODY]: Joi.object().keys({
    password: Joi.string().required(),
    email: Joi.string().required().custom((value, helpers) => {
      if (validator.isEmail(value)) {
        return value;
      }
      return helpers.message('Email указан с ошибкой');
    }),
  }),
}), login);

router.get('/signout', signout);

module.exports = router;
