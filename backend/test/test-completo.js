// test-completo.js
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql2/promise');

async function testTodo() {
    console.log('🔍 INICIANDO PRUEBAS COMPLETAS\n');
    
    // 1. Probar MySQL
    console.log('1️⃣ Probando MySQL...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
        
        const [result] = await connection.query('SELECT 1 + 1 AS resultado');
        console.log('   ✅ MySQL conectado:', result[0].resultado);
        
        // Ver tablas
        const [tables] = await connection.query('SHOW TABLES');
        console.log('   📊 Tablas encontradas:', tables.length);
        tables.forEach(t => console.log('      -', Object.values(t)[0]));
        
        await connection.end();
    } catch (error) {
        console.log('   ❌ Error MySQL:', error.message);
    }
    
    // 2. Probar Google OAuth
    console.log('\n2️⃣ Probando Google OAuth...');
    console.log('   Client ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ No configurado');
    console.log('   Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Configurado' : '❌ No configurado');
    
    try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        console.log('   ✅ Cliente OAuth creado exitosamente');
    } catch (error) {
        console.log('   ❌ Error creando cliente OAuth:', error.message);
    }
    
    // 3. Probar JWT
    console.log('\n3️⃣ Probando JWT...');
    const jwt = require('jsonwebtoken');
    try {
        const token = jwt.sign({ test: 'test' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('   ✅ JWT funciona correctamente');
        console.log('   Token generado:', token.substring(0, 50) + '...');
    } catch (error) {
        console.log('   ❌ Error JWT:', error.message);
    }
    
    console.log('\n✅ PRUEBAS COMPLETADAS');
}

testTodo();