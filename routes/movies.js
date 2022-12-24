const router = require('express').Router();
const validator = require('validator');
const { celebrate, Joi, Segments } = require('celebrate');
const { idValidation } = require('../utils/validationRegex');

const {
  createMovie,
  getSavedMovies,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', getSavedMovies);

router.post('/', celebrate({
  [Segments.BODY]: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom((value, helpers) => {
      if (validator.isURL(value)) {
        return value;
      }
      return helpers.message('Некорректный формат ссылки');
    }),
    trailerLink: Joi.string().required().custom((value, helpers) => {
      if (validator.isURL(value)) {
        return value;
      }
      return helpers.message('Некорректный формат ссылки');
    }),
    thumbnail: Joi.string().required().custom((value, helpers) => {
      if (validator.isURL(value)) {
        return value;
      }
      return helpers.message('Некорректный формат ссылки');
    }),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);

router.delete('/:id', celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().required().regex(idValidation),
  }),
}), deleteMovie);

module.exports = router;
