const mysql = require('mysql2/promise');

async function crearEquiposDePrueba() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'copa_pymes',
    password: ''
  });

  try {
    console.log('🏃 Creando equipos de prueba...');
    
    // Crear 5 equipos más para completar 8
    const equipos = [
      { nombre: 'Equipo Prueba 4', sigla: 'EP4' },
      { nombre: 'Equipo Prueba 5', sigla: 'EP5' },
      { nombre: 'Equipo Prueba 6', sigla: 'EP6' },
      { nombre: 'Equipo Prueba 7', sigla: 'EP7' },
      { nombre: 'Equipo Prueba 8', sigla: 'EP8' },
    ];

    for (const equipo of equipos) {
      const [result] = await connection.query(
        'INSERT INTO equipo (nombre, sigla, estado) VALUES (?, ?, ?)',
        [equipo.nombre, equipo.sigla, 1]
      );
      console.log(`✅ ${equipo.nombre} creado con ID: ${result.insertId}`);
      
      // Crear 14 jugadores para cada equipo (mínimo requerido)
      const equipoId = result.insertId;
      for (let i = 1; i <= 14; i++) {
        await connection.query(
          `INSERT INTO usuario (nombre, apellido, email, password, rol, activo, equipo_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `Jugador ${i}`,
            `${equipo.sigla}`,
            `jugador${i}.${equipo.sigla.toLowerCase()}@test.com`,
            '$2a$10$dummyHashForTesting',
            'jugador',
            1,
            equipoId
          ]
        );
      }
      console.log(`   ✅ 14 jugadores creados para ${equipo.nombre}`);
    }

    console.log('\n✅ ¡Equipos de prueba creados exitosamente!');
    console.log('📋 Ahora ve al frontend y agrega estos equipos al torneo uno por uno');
    console.log('🎯 Cuando agregues el 8vo equipo, la llave se generará automáticamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

crearEquiposDePrueba();
