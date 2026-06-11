// generate-today.js
require('dotenv').config();
const generateDailyTasks = require('../../backend/src/cron/dailyTasks');

console.log('🔄 Generando tareas para hoy...');
generateDailyTasks()
    .then(() => {
        console.log('✅ Proceso completado');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });