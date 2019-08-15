let router = require('express').Router();
let ticket = require('../controllers/ticket');

router.get('/tickets', ticket.list);
router.get('/tickets/:id', ticket.get);
router.post('/tickets', ticket.create);
router.put('/tickets/:id', ticket.update);
router.delete('/tickets/:id', ticket.remove);

router.post('/tickets/:id/comment', ticket.comment);
router.delete('/tickets/:id/comment/:comment_id', ticket.uncomment);

module.exports = router;