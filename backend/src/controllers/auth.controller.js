const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authController = {
    // Login con Google
    googleLogin: async (req, res) => {
        try {
            const { credential } = req.body;
            
            if (!credential) {
                return res.status(400).json({
                    success: false,
                    message: 'Credencial de Google no proporcionada'
                });
            }
            
            // Verificar el token con Google
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            
            const payload = ticket.getPayload();
            console.log('✅ Login exitoso para:', payload.email);
            
            const { 
                sub: googleId, 
                email, 
                name, 
                picture 
            } = payload;
            
            // Buscar o crear usuario en MySQL
            const [users] = await pool.query(
                'SELECT * FROM users WHERE google_id = ?',
                [googleId]
            );
            
            let user;
            
            if (users.length === 0) {
                // Crear nuevo usuario
                const [result] = await pool.query(
                    `INSERT INTO users (google_id, email, name, avatar_url) 
                     VALUES (?, ?, ?, ?)`,
                    [googleId, email, name, picture]
                );
                
                user = {
                    id: result.insertId,
                    google_id: googleId,
                    email,
                    name,
                    avatar_url: picture
                };
                
                console.log('👤 Nuevo usuario creado:', email);
            } else {
                user = users[0];
                console.log('👤 Usuario existente:', email);
            }
            
            // Generar JWT para nuestra app
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email,
                    name: user.name 
                },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );
            
            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar_url
                }
            });
            
        } catch (error) {
            console.error('❌ Error en login de Google:', error);
            res.status(401).json({
                success: false,
                message: 'Error de autenticación con Google',
                error: error.message
            });
        }
    },
    
    // Verificar token JWT
    verifyToken: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({ 
                    success: false,
                    valid: false 
                });
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Verificar que el usuario aún existe en BD
            const [users] = await pool.query(
                'SELECT id, name, email, avatar_url FROM users WHERE id = ?',
                [decoded.id]
            );
            
            if (users.length === 0) {
                return res.status(401).json({ 
                    success: false,
                    valid: false 
                });
            }
            
            res.json({ 
                success: true,
                valid: true, 
                user: users[0] 
            });
            
        } catch (error) {
            res.status(401).json({ 
                success: false,
                valid: false 
            });
        }
    }
};

module.exports = authController;