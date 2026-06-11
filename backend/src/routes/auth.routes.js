const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Ruta para login con Google
router.post('/google', authController.googleLogin);

// Ruta para verificar token
router.get('/verify', authController.verifyToken);

// IMPORTANTE: Exportar el router
module.exports = router;