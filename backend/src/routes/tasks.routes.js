const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const authMiddleware = require('../middleware/auth');

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

// Obtener tareas del día actual
router.get('/today', tasksController.getTodayTasks);

// Marcar/desmarcar tarea como completada
router.put('/:id/toggle', tasksController.toggleTask);

// Crear nueva plantilla de tarea
router.post('/template', tasksController.createTemplate);

// Obtener todas las plantillas
router.get('/templates', tasksController.getTemplates);

// Obtener progreso diario
router.get('/progress/today', tasksController.getDailyProgress);

router.post('/generate-today', tasksController.generateTodayTasks);
// IMPORTANTE: Exportar el router
module.exports = router;