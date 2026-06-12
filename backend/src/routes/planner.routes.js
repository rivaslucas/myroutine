const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/planner.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/weekly', plannerController.getWeeklyPlans);
router.post('/weekly', plannerController.createWeeklyPlan);
router.put('/weekly/:id', plannerController.updateWeeklyPlan);
router.delete('/weekly/:id', plannerController.deleteWeeklyPlan);

router.get('/monthly', plannerController.getMonthlyPlans);
router.post('/monthly', plannerController.createMonthlyPlan);
router.delete('/monthly/:id', plannerController.deleteMonthlyPlan); // ← NUEVA

router.get('/report', plannerController.getWeeklyReport);

module.exports = router;