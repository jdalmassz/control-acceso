const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🔌 Intentando conectar a la base de datos...');
console.log(`📊 Host: ${process.env.DB_HOST}`);
console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
console.log(`👤 Usuario: ${process.env.DB_USER}`);

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error al conectar:', err.message);
        console.error('📝 Detalles:', err);
        process.exit(1);
    }
    
    console.log('✅ ¡Conexión exitosa!');
    console.log(`🆔 ID de conexión: ${connection.threadId}`);
    
    // CORREGIDO: Usar "fecha_hora" como alias, no "current_time"
    connection.query('SELECT NOW() as fecha_hora, VERSION() as version_mariadb', (err, results) => {
        if (err) {
            console.error('❌ Error en consulta:', err.message);
            connection.end();
            process.exit(1);
        }
        
        console.log('📅 Fecha/Hora del servidor:', results[0].fecha_hora);
        console.log(`📌 Versión de MariaDB: ${results[0].version_mariadb}`);
        
        // Ver las tablas disponibles
        connection.query('SHOW TABLES', (err, tables) => {
            if (err) {
                console.error('❌ Error al listar tablas:', err.message);
                connection.end();
                process.exit(1);
            }
            
            if (tables.length === 0) {
                console.log('\n⚠️ No hay tablas en la base de datos');
            } else {
                console.log(`\n📋 Tablas en la base de datos (${tables.length}):`);
                tables.forEach(row => {
                    const tableName = Object.values(row)[0];
                    console.log(`  - ${tableName}`);
                });
            }
            
            // Probar contar registros en las tablas principales
            const tablesToCheck = ['partners', 'payments', 'operations', 'cashbook', 'goods', 'objects'];
            let checked = 0;
            
            tablesToCheck.forEach(tableName => {
                connection.query(`SELECT COUNT(*) as total FROM ${tableName}`, (err, count) => {
                    if (!err && count && count[0]) {
                        console.log(`  📊 ${tableName}: ${count[0].total} registros`);
                    }
                    checked++;
                    
                    // Cuando terminemos de revisar todas
                    if (checked === tablesToCheck.length) {
                        // Cerrar conexión
                        connection.end((err) => {
                            if (err) {
                                console.error('❌ Error al cerrar conexión:', err.message);
                            } else {
                                console.log('\n🔒 Conexión cerrada correctamente');
                                console.log('✅ ¡TODO FUNCIONA PERFECTAMENTE!');
                                console.log('🎉 Puedes comenzar a desarrollar tu API');
                            }
                        });
                    }
                });
            });
        });
    });
});