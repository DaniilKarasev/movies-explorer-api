const router = require('express').Router();
const { auth } = require('../middlewares/auth');
const { NotFoundError } = require('../utils/errors');

router.use(require('./sign'));

router.use(auth);

router.use('/movies', require('./movies'));
router.use('/users', require('./users'));

router.use('/*', (req, res, next) => next(new NotFoundError('Страница не найдена')));

module.exports = router;
