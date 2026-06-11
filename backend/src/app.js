const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

// Importar configuraciones
const { testConnection } = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const tasksRoutes = require('./routes/tasks.routes');
const plannerRoutes = require('./routes/planner.routes');
const remindersRoutes = require('./routes/reminders.routes');
// Importar tareas programadas
const generateDailyTasks = require('./cron/dailyTasks');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARES
// ==========================================

// Configurar CORS para permitir peticiones del frontend
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        process.env.FRONTEND_URL || 'https://miagenda.vercel.app'
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging básico
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📝 [${timestamp}] ${req.method} ${req.url}`);
    next();
});

// ==========================================
// RUTAS
// ==========================================

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de tareas
app.use('/api/tasks', tasksRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/reminders', remindersRoutes);

// Ruta principal - Prueba de servidor
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: '🚀 API de Agenda Personal funcionando',
        version: '1.0.0',
        server: 'online',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: {
                login: 'POST /api/auth/google',
                verify: 'GET /api/auth/verify'
            },
            tasks: {
                today: 'GET /api/tasks/today',
                templates: 'GET /api/tasks/templates',
                createTemplate: 'POST /api/tasks/template',
                toggleTask: 'PUT /api/tasks/:id/toggle',
                progress: 'GET /api/tasks/progress/today'
            }
        }
    });
});

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// MANEJO DE ERRORES
// ==========================================

// Ruta no encontrada (404)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.url}`,
        tip: 'Visita http://localhost:' + PORT + ' para ver los endpoints disponibles'
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

// ==========================================
// TAREAS PROGRAMADAS (CRON)
// ==========================================

// Generar tareas diarias a las 00:00 todos los días
cron.schedule('0 0 * * *', () => {
    console.log('🕛 Ejecutando generación de tareas diarias...');
    generateDailyTasks().catch(err => {
        console.error('❌ Error en tarea programada:', err);
    });
});

// Generar reporte semanal los domingos a las 23:55
cron.schedule('55 23 * * 0', () => {
    console.log('📊 Generando reportes semanales...');
    // Aquí se puede agregar la función de reporte semanal
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

async function startServer() {
    console.log('🚀 Iniciando servidor...\n');
    
    // Probar conexión a MySQL
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
        console.warn('⚠️  ADVERTENCIA: No se pudo conectar a MySQL');
        console.warn('   El servidor iniciará pero la base de datos no estará disponible');
        console.warn('   Verifica tu archivo .env y que MySQL esté corriendo\n');
    }
    
    // Crear servidor HTTP
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log('='.repeat(55));
        console.log('✅  SERVIDOR INICIADO EXITOSAMENTE');
        console.log('='.repeat(55));
        console.log(`📍  Local:    http://localhost:${PORT}`);
        console.log(`📍  IPv4:     http://127.0.0.1:${PORT}`);
        console.log(`📅  Entorno:  ${process.env.NODE_ENV || 'development'}`);
        console.log(`🗄️  MySQL:    ${dbConnected ? 'Conectado ✅' : 'Desconectado ❌'}`);
        console.log('='.repeat(55));
        console.log('📋 Endpoints disponibles en: http://localhost:' + PORT);
        console.log('💡 Presiona Ctrl+C para detener el servidor\n');
        
        // Generar tareas diarias al iniciar
        if (dbConnected) {
            console.log('🔄 Generando tareas para hoy...');
            generateDailyTasks().catch(err => {
                console.error('❌ Error generando tareas:', err.message);
            });
        }
    });
    
    // Manejar errores del servidor
    server.on('error', (error) => {
        console.error('\n❌ ERROR DEL SERVIDOR:');
        
        switch (error.code) {
            case 'EADDRINUSE':
                console.error(`   El puerto ${PORT} ya está en uso`);
                console.error('   Soluciones:');
                console.error(`   1. Cierra el programa que usa el puerto ${PORT}`);
                console.error('   2. O cambia el puerto en el archivo .env (ej: PORT=3001)');
                console.error('\n   Para ver qué programa usa el puerto:');
                console.error('   netstat -ano | findstr :' + PORT);
                break;
                
            case 'EACCES':
                console.error(`   Permiso denegado para usar el puerto ${PORT}`);
                console.error('   Prueba con un puerto mayor a 1024 (ej: 3001, 8080)');
                break;
                
            default:
                console.error('   Código:', error.code);
                console.error('   Mensaje:', error.message);
        }
        
        process.exit(1);
    });
    
    // Manejar señales de terminación
    process.on('SIGTERM', () => {
        console.log('\n⚠️  Señal SIGTERM recibida. Cerrando servidor...');
        server.close(() => {
            console.log('✅ Servidor cerrado correctamente');
            process.exit(0);
        });
    });
    
    process.on('SIGINT', () => {
        console.log('\n⚠️  Cerrando servidor...');
        server.close(() => {
            console.log('✅ Servidor cerrado correctamente');
            process.exit(0);
        });
    });
    
    // Manejar errores no capturados
    process.on('uncaughtException', (error) => {
        console.error('❌ Error no capturado:', error);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Promesa rechazada no manejada:', reason);
    });
    
    return server;
}

// Iniciar todo
startServer().catch(error => {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
});