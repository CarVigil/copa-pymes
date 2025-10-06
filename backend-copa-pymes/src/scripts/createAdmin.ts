import { initializeORM } from '../shared/db/mikro-orm.config';
import { Usuario, UsuarioRole } from '../models/usuario.model';

async function createTestUsers() {
  try {
    console.log('🔄 Inicializando ORM...');
    const orm = await initializeORM();
    
    console.log('🔄 Actualizando esquema de base de datos...');
    await orm.getSchemaGenerator().updateSchema();

    const em = orm.em.fork();

    // Verificar si ya existe un admin
    const existingAdmin = await em.findOne(Usuario, { role: UsuarioRole.ADMIN });

    if (!existingAdmin) {
      // Crear usuario administrador
      const admin = new Usuario();
      admin.email = 'admin@copapymes.com';
      admin.password = 'admin123'; // Se hasheará automáticamente
      admin.nombre = 'Administrador';
      admin.apellido = 'Copa Pymes';
      admin.role = UsuarioRole.ADMIN;

      await em.persistAndFlush(admin);
      console.log('✅ Usuario administrador creado exitosamente:');
      console.log('📧 Email: admin@copapymes.com');
      console.log('🔑 Contraseña: admin123');
    } else {
      console.log('⚠️ Ya existe un usuario administrador:', existingAdmin.email);
    }

    // Verificar si ya existe un jugador de prueba
    const existingJugador = await em.findOne(Usuario, { email: 'jugador@test.com' });

    if (!existingJugador) {
      // Crear usuario jugador de prueba
      const jugador = new Usuario();
      jugador.email = 'jugador@test.com';
      jugador.password = '123456'; // Se hasheará automáticamente
      jugador.nombre = 'Jugador';
      jugador.apellido = 'Prueba';
      jugador.role = UsuarioRole.JUGADOR;

      await em.persistAndFlush(jugador);
      console.log('✅ Usuario jugador creado exitosamente:');
      console.log('📧 Email: jugador@test.com');
      console.log('🔑 Contraseña: 123456');
    } else {
      console.log('⚠️ Ya existe un usuario jugador:', existingJugador.email);
    }

    console.log('');
    console.log('⚠️ IMPORTANTE: Cambia las contraseñas después del primer login');

    await orm.close();

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
    process.exit(1);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  createTestUsers();
}

export { createTestUsers };