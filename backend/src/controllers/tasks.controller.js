const { pool } = require('../config/database');

// Función auxiliar para obtener el lunes de la semana actual
function getMonday() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diff);
    return monday.toISOString().split('T')[0];
}

const tasksController = {
    // Obtener tareas del día actual (diarias + semanales + mensuales)
    getTodayTasks: async (req, res) => {
        try {
            const userId = req.user.id;
            const today = new Date();
            const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
            const dayOfMonth = today.getDate();
            const weekStart = getMonday();
            const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
            
            console.log('📅 Buscando tareas para:', {
                userId,
                fecha: today.toISOString().split('T')[0],
                diaSemana: dayOfWeek,
                diaMes: dayOfMonth,
                semanaInicio: weekStart,
                mesInicio: monthStart
            });
            
            // 1. Tareas diarias (plantillas generadas)
            const [dailyTasks] = await pool.query(`
                SELECT 
                    tl.id,
                    tl.completed,
                    tl.completed_at,
                    tlt.task_name,
                    tlt.scheduled_time,
                    'daily' as source,
                    '📋' as icon
                FROM daily_task_logs tl
                JOIN daily_task_templates tlt ON tl.template_id = tlt.id
                WHERE tl.user_id = ? AND tl.task_date = CURDATE()
            `, [userId]);
            
            // 2. Planes semanales para hoy
            const [weeklyPlans] = await pool.query(`
                SELECT 
                    id,
                    completed,
                    NULL as completed_at,
                    task_name,
                    start_time as scheduled_time,
                    'weekly' as source,
                    '📊' as icon
                FROM weekly_plans
                WHERE user_id = ? AND week_start = ? AND day_of_week = ?
            `, [userId, weekStart, dayOfWeek]);
            
            // 3. Planes mensuales para hoy
            const [monthlyPlans] = await pool.query(`
                SELECT 
                    id,
                    completed,
                    NULL as completed_at,
                    task_name,
                    start_time as scheduled_time,
                    'monthly' as source,
                    '📆' as icon
                FROM monthly_plans
                WHERE user_id = ? AND month_year = ? AND day_of_month = ?
            `, [userId, monthStart, dayOfMonth]);
            
            // Combinar todas las tareas
            const allTasks = [...dailyTasks, ...weeklyPlans, ...monthlyPlans];
            
            // Ordenar por hora
            allTasks.sort((a, b) => {
                const timeA = a.scheduled_time || '23:59:59';
                const timeB = b.scheduled_time || '23:59:59';
                return timeA.localeCompare(timeB);
            });
            
            console.log(`✅ Tareas encontradas: ${dailyTasks.length} diarias, ${weeklyPlans.length} semanales, ${monthlyPlans.length} mensuales`);
            
            res.json({
                success: true,
                tasks: allTasks,
                summary: {
                    daily: dailyTasks.length,
                    weekly: weeklyPlans.length,
                    monthly: monthlyPlans.length,
                    total: allTasks.length
                }
            });
            
        } catch (error) {
            console.error('❌ Error obteniendo tareas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener tareas del día',
                error: error.message
            });
        }
    },
    
    // Generar tareas para hoy manualmente
    generateTodayTasks: async (req, res) => {
        try {
            const generateDailyTasks = require('../cron/dailyTasks');
            await generateDailyTasks();
            
            res.json({
                success: true,
                message: '✅ Tareas diarias generadas correctamente'
            });
        } catch (error) {
            console.error('❌ Error generando tareas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar tareas',
                error: error.message
            });
        }
    },
    
    // Marcar/desmarcar tarea (funciona para diarias, semanales y mensuales)
  // Marcar/desmarcar tarea (funciona para diarias, semanales y mensuales)
    toggleTask: async (req, res) => {
    try {
        const { id } = req.params;
        const { source } = req.body;
        const userId = req.user.id;
        
        console.log('🔄 Toggle task:', { id, source, userId });
        
        if (!source) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tipo de tarea no especificado (source: daily, weekly, monthly)' 
            });
        }
        
        let table, idField;
        
        // Determinar qué tabla actualizar
        switch(source) {
            case 'daily':
                table = 'daily_task_logs';
                idField = 'id';
                break;
            case 'weekly':
                table = 'weekly_plans';
                idField = 'id';
                break;
            case 'monthly':
                table = 'monthly_plans';
                idField = 'id';
                break;
            default:
                return res.status(400).json({ 
                    success: false, 
                    message: 'Tipo de tarea no válido: ' + source 
                });
        }
        
        // Obtener estado actual
        const [tasks] = await pool.query(
            `SELECT completed FROM ${table} WHERE ${idField} = ? AND user_id = ?`,
            [id, userId]
        );
        
        if (tasks.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Tarea no encontrada' 
            });
        }
        
        const newStatus = !tasks[0].completed;
        const completedAt = newStatus ? new Date() : null;
        
        // Actualizar
        if (source === 'daily') {
            await pool.query(
                'UPDATE daily_task_logs SET completed = ?, completed_at = ? WHERE id = ? AND user_id = ?',
                [newStatus, completedAt, id, userId]
            );
        } else {
            // Para weekly y monthly, solo actualizar completed
            await pool.query(
                `UPDATE ${table} SET completed = ? WHERE ${idField} = ? AND user_id = ?`,
                [newStatus, id, userId]
            );
        }
        
        console.log('✅ Tarea actualizada:', { id, source, completed: newStatus });
        
        res.json({
            success: true,
            completed: newStatus,
            completed_at: completedAt,
            source: source
        });
        
    } catch (error) {
        console.error('❌ Error actualizando tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar tarea',
            error: error.message
        });
    }
},
    
    // Crear plantilla de tarea diaria
    createTemplate: async (req, res) => {
        try {
            const userId = req.user.id;
            const { task_name, description, scheduled_time, days_of_week } = req.body;
            
            if (!task_name) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de la tarea es requerido'
                });
            }
            
            const [result] = await pool.query(
                `INSERT INTO daily_task_templates 
                (user_id, task_name, description, scheduled_time, days_of_week) 
                VALUES (?, ?, ?, ?, ?)`,
                [userId, task_name, description || null, scheduled_time || null, JSON.stringify(days_of_week || [1,2,3,4,5,6,7])]
            );
            
            res.status(201).json({
                success: true,
                message: '✅ Plantilla creada exitosamente',
                id: result.insertId
            });
            
        } catch (error) {
            console.error('❌ Error creando plantilla:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear plantilla',
                error: error.message
            });
        }
    },
    
    // Obtener todas las plantillas
    getTemplates: async (req, res) => {
        try {
            const userId = req.user.id;
            
            const [templates] = await pool.query(
                'SELECT * FROM daily_task_templates WHERE user_id = ? AND is_active = TRUE ORDER BY scheduled_time',
                [userId]
            );
            
            res.json({
                success: true,
                templates
            });
            
        } catch (error) {
            console.error('❌ Error obteniendo plantillas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener plantillas',
                error: error.message
            });
        }
    },
    
    // Obtener progreso diario (incluye todas las fuentes)
 getDailyProgress: async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
        const dayOfMonth = today.getDate();
        const weekStart = getMonday();
        const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        
        // Contar tareas diarias
        const [dailyResult] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) as completed
            FROM daily_task_logs 
            WHERE user_id = ? AND task_date = CURDATE()
        `, [userId]);
        
        // Contar planes semanales de hoy
        const [weeklyResult] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) as completed
            FROM weekly_plans 
            WHERE user_id = ? AND week_start = ? AND day_of_week = ?
        `, [userId, weekStart, dayOfWeek]);
        
        // Contar planes mensuales de hoy
        const [monthlyResult] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) as completed
            FROM monthly_plans 
            WHERE user_id = ? AND month_year = ? AND day_of_month = ?
        `, [userId, monthStart, dayOfMonth]);
        
        // Convertir a números
        const dailyTotal = parseInt(dailyResult[0].total) || 0;
        const dailyCompleted = parseInt(dailyResult[0].completed) || 0;
        const weeklyTotal = parseInt(weeklyResult[0].total) || 0;
        const weeklyCompleted = parseInt(weeklyResult[0].completed) || 0;
        const monthlyTotal = parseInt(monthlyResult[0].total) || 0;
        const monthlyCompleted = parseInt(monthlyResult[0].completed) || 0;
        
        // Sumar totales
        const totalTasks = dailyTotal + weeklyTotal + monthlyTotal;
        const completedTasks = dailyCompleted + weeklyCompleted + monthlyCompleted;
        
        // Calcular porcentaje (evitar división por cero)
        let progressPercentage = 0;
        if (totalTasks > 0) {
            progressPercentage = Math.round((completedTasks / totalTasks) * 100 * 100) / 100;
        }
        
        // Asegurar que no pase de 100
        if (progressPercentage > 100) progressPercentage = 100;
        if (progressPercentage < 0) progressPercentage = 0;
        
        console.log('📊 Progreso calculado:', {
            total: totalTasks,
            completed: completedTasks,
            percentage: progressPercentage,
            daily: `${dailyCompleted}/${dailyTotal}`,
            weekly: `${weeklyCompleted}/${weeklyTotal}`,
            monthly: `${monthlyCompleted}/${monthlyTotal}`
        });
        
        res.json({
            success: true,
            progress: {
                total_tasks: totalTasks,
                completed_tasks: completedTasks,
                progress_percentage: progressPercentage,
                breakdown: {
                    daily: {
                        total: dailyTotal,
                        completed: dailyCompleted
                    },
                    weekly: {
                        total: weeklyTotal,
                        completed: weeklyCompleted
                    },
                    monthly: {
                        total: monthlyTotal,
                        completed: monthlyCompleted
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo progreso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener progreso',
            error: error.message
        });
    }
},
// Eliminar tarea diaria
deleteTask: async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const [result] = await pool.query(
            'DELETE FROM daily_task_logs WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Tarea eliminada correctamente'
        });
        
    } catch (error) {
        console.error('❌ Error eliminando tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar tarea',
            error: error.message
        });
    }
},

// Eliminar plantilla
deleteTemplate: async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // Eliminar plantilla y sus registros diarios
        await pool.query('DELETE FROM daily_task_logs WHERE template_id = ? AND user_id = ?', [id, userId]);
        
        const [result] = await pool.query(
            'DELETE FROM daily_task_templates WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Plantilla no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Plantilla y sus registros eliminados'
        });
        
    } catch (error) {
        console.error('❌ Error eliminando plantilla:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar plantilla',
            error: error.message
        });
    }
}
};

module.exports = tasksController;