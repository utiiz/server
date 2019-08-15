let router = require('express').Router();
let thread = require('../controllers/thread');

router.get('/threads', thread.list);
router.get('/threads/:id', thread.get);
router.post('/threads', thread.create);
router.put('/threads/:id', thread.update);
router.delete('/threads/:id', thread.remove);

module.exports = router;