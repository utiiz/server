let router = require('express').Router();
let identifier = require('../controllers/identifier');

router.get('/identifiers', identifier.list);
router.get('/identifiers/dashlane', identifier.dashlane);
router.get('/identifiers/:id', identifier.get);
router.post('/identifiers', identifier.create);
router.put('/identifiers/:id', identifier.update);
router.delete('/identifiers/:id', identifier.remove);

module.exports = router;
