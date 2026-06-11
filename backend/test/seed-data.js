// seed-data.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function seedData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    
    console.log('🌱 Insertando datos de prueba...\n');
    
    // 1. Crear usuario de prueba
    const [userResult] = await connection.query(`
        INSERT IGNORE INTO users (google_id, email, name) 
        VALUES ('test_user_123', 'test@example.com', 'Usuario Prueba')
    `);
    
    let userId;
    
    if (userResult.affectedRows > 0) {
        userId = userResult.insertId;
        console.log('✅ Usuario creado con ID:', userId);
    } else {
        const [users] = await connection.query(
            "SELECT id FROM users WHERE google_id = 'test_user_123'"
        );
        userId = users[0].id;
        console.log('✅ Usuario existente ID:', userId);
    }
    
    // 2. Crear plantillas de tareas diarias
    const tasks = [
        {
            name: 'Tender la cama',
            time: '07:00',
            days: [1,2,3,4,5,6,7] // Todos los días
        },
        {
            name: 'Bañarme',
            time: '07:30',
            days: [1,2,3,4,5,6,7]
        },
        {
            name: 'Desayunar sano',
            time: '08:00',
            days: [1,2,3,4,5,6,7]
        },
        {
            name: 'Estudiar',
            time: '09:00',
            days: [1,2,3,4,5] // Lunes a viernes
        },
        {
            name: 'Hacer ejercicio',
            time: '17:00',
            days: [1,2,3,4,5]
        },
        {
            name: 'Leer 30 minutos',
            time: '21:00',
            days: [1,2,3,4,5,6,7]
        },
        {
            name: 'Planificar día siguiente',
            time: '22:00',
            days: [1,2,3,4,5,6,7]
        }
    ];
    
    for (let task of tasks) {
        await connection.query(`
            INSERT INTO daily_task_templates 
            (user_id, task_name, scheduled_time, days_of_week) 
            VALUES (?, ?, ?, ?)
        `, [userId, task.name, task.time, JSON.stringify(task.days)]);
        console.log(`  ✅ ${task.name} - ${task.time}`);
    }
    
    // 3. Crear algunos recordatorios de prueba
    const reminders = [
        {
            title: 'Pagar renta',
            type: 'payment',
            recurring: true,
            recurrence_type: 'monthly',
            days: [1] // Día 1 de cada mes
        },
        {
            title: 'Pagar internet',
            type: 'payment',
            recurring: true,
            recurrence_type: 'monthly',
            days: [15] // Día 15 de cada mes
        },
        {
            title: 'Cita con doctor',
            type: 'appointment',
            recurring: false,
            date: '2026-06-20'
        }
    ];
    
    for (let reminder of reminders) {
        await connection.query(`
            INSERT INTO reminders 
            (user_id, title, reminder_type, is_recurring, recurrence_type, recurrence_days, start_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            userId, 
            reminder.title, 
            reminder.type, 
            reminder.recurring,
            reminder.recurrence_type || null,
            JSON.stringify(reminder.days || []),
            reminder.date || new Date().toISOString().split('T')[0]
        ]);
        console.log(`  ✅ Recordatorio: ${reminder.title}`);
    }
    
    await connection.end();
    console.log('\n✅ Datos de prueba insertados correctamente');
    console.log(`👤 Usuario ID: ${userId}`);
    console.log('📧 Email: test@example.com');
}

seedData().catch(console.error);