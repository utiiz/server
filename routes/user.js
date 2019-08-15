let router = require('express').Router();
let user = require('../controllers/user');

router.get('/users', user.list);
router.get('/users/:id', user.get);
router.post('/users/picture', user.picture);
router.post('/users', user.create);
router.put('/users/:id', user.update);
router.delete('/users/:id', user.remove);

module.exports = router;