// test-api.js
const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(body)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Probando API...\n');
    
    // Test 1: Ruta principal
    console.log('1️⃣ GET /');
    const test1 = await testEndpoint('/');
    console.log('   Status:', test1.status);
    console.log('   Response:', test1.data);
    console.log();
    
    // Test 2: Intentar obtener tareas sin token (debe fallar con 401)
    console.log('2️⃣ GET /api/tasks/today (sin token)');
    const test2 = await testEndpoint('/api/tasks/today');
    console.log('   Status:', test2.status);
    console.log('   Response:', test2.data);
    console.log();
    
    // Test 3: Verificar endpoint de auth
    console.log('3️⃣ GET /api/auth/verify');
    const test3 = await testEndpoint('/api/auth/verify');
    console.log('   Status:', test3.status);
    console.log('   Response:', test3.data);
    console.log();
    
    console.log('✅ Pruebas completadas');
    console.log('\n📝 Para probar con autenticación:');
    console.log('1. Necesitas un token JWT válido');
    console.log('2. Puedes generar uno temporal en jwt.io');
    console.log('3. O implementar el frontend con Google Login');
}

runTests().catch(console.error);