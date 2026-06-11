const express = require('express');
const router = express.Router();
const remindersController = require('../controllers/reminders.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', remindersController.getAll);
router.post('/', remindersController.create);
router.put('/:id', remindersController.update);
router.delete('/:id', remindersController.delete);
router.put('/:id/complete', remindersController.markComplete);

module.exports = router;