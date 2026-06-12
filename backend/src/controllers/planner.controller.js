const { pool } = require('../config/database');

const plannerController = {
    // Obtener planes semanales
    getWeeklyPlans: async (req, res) => {
        try {
            const userId = req.user.id;
            const { week_start } = req.query;
            
            const [plans] = await pool.query(`
                SELECT * FROM weekly_plans 
                WHERE user_id = ? AND week_start = ?
                ORDER BY day_of_week, start_time
            `, [userId, week_start || getCurrentWeekStart()]);
            
            res.json({ success: true, plans });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Crear plan semanal
    createWeeklyPlan: async (req, res) => {
        try {
            const userId = req.user.id;
            const { week_start, day_of_week, task_name, start_time, end_time } = req.body;
            
            const [result] = await pool.query(`
                INSERT INTO weekly_plans 
                (user_id, week_start, day_of_week, task_name, start_time, end_time)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [userId, week_start, day_of_week, task_name, start_time, end_time]);
            
            res.status(201).json({ success: true, id: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Actualizar plan semanal
    updateWeeklyPlan: async (req, res) => {
        try {
            const { id } = req.params;
            const { completed, task_name, start_time, end_time } = req.body;
            
            await pool.query(`
                UPDATE weekly_plans 
                SET completed = ?, task_name = ?, start_time = ?, end_time = ?
                WHERE id = ? AND user_id = ?
            `, [completed, task_name, start_time, end_time, id, req.user.id]);
            
            res.json({ success: true, message: 'Actualizado' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Eliminar plan semanal
    deleteWeeklyPlan: async (req, res) => {
        try {
            await pool.query('DELETE FROM weekly_plans WHERE id = ? AND user_id = ?', 
                [req.params.id, req.user.id]);
            res.json({ success: true, message: 'Eliminado' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Obtener planes mensuales
    getMonthlyPlans: async (req, res) => {
        try {
            const userId = req.user.id;
            const { month_year } = req.query;
            
            const [plans] = await pool.query(`
                SELECT * FROM monthly_plans 
                WHERE user_id = ? AND month_year = ?
                ORDER BY day_of_month, start_time
            `, [userId, month_year || getCurrentMonthStart()]);
            
            res.json({ success: true, plans });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Crear plan mensual
    createMonthlyPlan: async (req, res) => {
        try {
            const userId = req.user.id;
            const { month_year, day_of_month, task_name, start_time, end_time } = req.body;
            
            const [result] = await pool.query(`
                INSERT INTO monthly_plans 
                (user_id, month_year, day_of_month, task_name, start_time, end_time)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [userId, month_year, day_of_month, task_name, start_time, end_time]);
            
            res.status(201).json({ success: true, id: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 🆕 Eliminar plan mensual
    deleteMonthlyPlan: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            const [result] = await pool.query(
                'DELETE FROM monthly_plans WHERE id = ? AND user_id = ?',
                [id, userId]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Plan no encontrado' });
            }
            
            res.json({ success: true, message: 'Plan mensual eliminado' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Obtener reporte semanal
    getWeeklyReport: async (req, res) => {
        try {
            const userId = req.user.id;
            
            const [report] = await pool.query(`
                SELECT * FROM weekly_reports 
                WHERE user_id = ? 
                ORDER BY week_start DESC 
                LIMIT 4
            `, [userId]);
            
            res.json({ success: true, reports: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

function getCurrentWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
}

function getCurrentMonthStart() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

module.exports = plannerController;