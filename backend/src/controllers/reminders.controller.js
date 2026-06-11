const { pool } = require('../config/database');

const remindersController = {
    getAll: async (req, res) => {
        try {
            const [reminders] = await pool.query(`
                SELECT * FROM reminders 
                WHERE user_id = ? AND (completed = FALSE OR completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))
                ORDER BY 
                    CASE WHEN is_recurring THEN 0 ELSE 1 END,
                    start_date ASC
            `, [req.user.id]);
            
            res.json({ success: true, reminders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const { 
                title, reminder_type, start_date, start_time,
                is_recurring, recurrence_type, recurrence_interval, recurrence_days,
                description 
            } = req.body;
            
            const [result] = await pool.query(`
                INSERT INTO reminders 
                (user_id, title, reminder_type, start_date, start_time,
                 is_recurring, recurrence_type, recurrence_interval, recurrence_days, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [req.user.id, title, reminder_type, start_date, start_time,
                is_recurring, recurrence_type, recurrence_interval, 
                JSON.stringify(recurrence_days), description]);
            
            res.status(201).json({ success: true, id: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const { title, start_date, start_time, description } = req.body;
            await pool.query(`
                UPDATE reminders SET title = ?, start_date = ?, start_time = ?, description = ?
                WHERE id = ? AND user_id = ?
            `, [title, start_date, start_time, description, req.params.id, req.user.id]);
            
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await pool.query('DELETE FROM reminders WHERE id = ? AND user_id = ?', 
                [req.params.id, req.user.id]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    markComplete: async (req, res) => {
        try {
            await pool.query(`
                UPDATE reminders SET completed = TRUE, completed_at = NOW()
                WHERE id = ? AND user_id = ?
            `, [req.params.id, req.user.id]);
            
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = remindersController;