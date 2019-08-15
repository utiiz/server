let router = require('express').Router();
let company = require('../controllers/company');

router.get('/companies', company.list);
router.get('/companies/:id', company.get);
router.post('/companies', company.create);
router.put('/companies/:id', company.update);
router.delete('/companies/:id', company.remove);

module.exports = router;