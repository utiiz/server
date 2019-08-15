let router = require('express').Router();
let session = require('../controllers/session');

router.post('/login', session.login);

module.exports = router;