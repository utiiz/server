let router = require('express').Router();
let comment = require('../controllers/comment');

router.get('/comments', comment.list);
router.get('/comments/:id', comment.get);
router.post('/comments', comment.create);
router.put('/comments/:id', comment.update);
router.delete('/comments/:id', comment.remove);

module.exports = router;