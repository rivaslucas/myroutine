const { pool } = require('../config/database');

async function generateDailyTasks() {
    try {
        const today = new Date();
        const dayNumber = today.getDay(); // 0=Domingo, 1=Lunes...
        const mysqlDay = dayNumber === 0 ? 7 : dayNumber; // MySQL: 1=Lunes, 7=Domingo
        
        console.log(`Generando tareas para el día ${mysqlDay}...`);
        
        // Obtener todas las plantillas activas para este día
        const [templates] = await pool.query(`
            SELECT * FROM daily_task_templates 
            WHERE is_active = TRUE 
            AND JSON_CONTAINS(days_of_week, ?)
        `, [String(mysqlDay)]);
        
        console.log(`📋 Plantillas encontradas: ${templates.length}`);
        
        // Crear registros para el día actual (SIN DUPLICADOS)
        let created = 0;
        let skipped = 0;
        
        for (let template of templates) {
            try {
                // Verificar si ya existe antes de insertar
                const [existing] = await pool.query(`
                    SELECT id FROM daily_task_logs 
                    WHERE user_id = ? AND template_id = ? AND task_date = CURDATE()
                `, [template.user_id, template.id]);
                
                if (existing.length === 0) {
                    // No existe, insertar
                    await pool.query(`
                        INSERT INTO daily_task_logs 
                        (user_id, template_id, task_date) 
                        VALUES (?, ?, CURDATE())
                    `, [template.user_id, template.id]);
                    created++;
                } else {
                    skipped++;
                }
            } catch (insertError) {
                console.error(`Error insertando tarea ${template.id}:`, insertError.message);
            }
        }
        
        console.log(`✅ Tareas diarias generadas: ${created} nuevas, ${skipped} ya existían`);
        
        // También generar reporte si es domingo
        if (dayNumber === 0) {
            await generateWeeklyReport();
        }
        
    } catch (error) {
        console.error('❌ Error general en generateDailyTasks:', error.message);
    }
}

async function generateWeeklyReport() {
    try {
        const [users] = await pool.query('SELECT id FROM users');
        
        for (let user of users) {
            const [stats] = await pool.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) as completed,
                    ROUND(
                        SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) / COUNT(*) * 100, 
                        2
                    ) as rate
                FROM daily_task_logs
                WHERE user_id = ? 
                AND task_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE()
            `, [user.id]);
            
            if (stats[0].total > 0) {
                await pool.query(`
                    INSERT INTO weekly_reports 
                    (user_id, week_start, week_end, total_tasks, completed_tasks, completion_rate)
                    VALUES (?, DATE_SUB(CURDATE(), INTERVAL 6 DAY), CURDATE(), ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    total_tasks = VALUES(total_tasks),
                    completed_tasks = VALUES(completed_tasks),
                    completion_rate = VALUES(completion_rate)
                `, [user.id, stats[0].total, stats[0].completed, stats[0].rate]);
            }
        }
        
        console.log('✅ Reportes semanales generados');
        
    } catch (error) {
        console.error('Error generando reportes:', error);
    }
}

module.exports = generateDailyTasks;