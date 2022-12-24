const Movie = require('../models/movies');
const {
  ServerError,
  NotFoundError,
  CastError,
  ForbiddenError,
} = require('../utils/errors');

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner = req.user._id,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner,
  })
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new CastError(`Переданы не верные данные фильма. Поле${err.message.replace('movie validation failed:', '').replace(':', '')}`));
      } else {
        next(new ServerError('Ошибка на стороне сервера'));
      }
    });
};

module.exports.getSavedMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movie) => {
      res.send(movie);
    })
    .catch(() => next(new ServerError('Ошибка на стороне сервера')));
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.id)
    .then((movie) => {
      if (movie) {
        if (movie.owner.toString() === req.user._id.toString()) {
          Movie.findByIdAndRemove(movie._id)
            .then(() => res.send({ message: 'Фильм удалён из сохранённых' }));
        } else {
          next(new ForbiddenError('Доступ запрещен'));
        }
      } else {
        next(new NotFoundError(`Фильм c id: ${req.params.id} не найдена`));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CastError('Переданы некорректные данные при удалении фильма'));
      } else {
        next(new ServerError('Ошибка на стороне сервера'));
      }
    });
};
