import { initializeORM } from '../shared/db/mikro-orm.config';
import { Usuario, UsuarioRole } from '../models/usuario.model';
import { UsuarioFactory, CreateUsuarioData } from '../models/usuarioFactory';

async function createTestUsers() {
    try {
        console.log('🔄 Inicializando ORM...');
        const orm = await initializeORM();

        console.log('🔄 Actualizando esquema de base de datos...');
        await orm.getSchemaGenerator().updateSchema();

        const em = orm.em.fork();

        // Verificar si ya existe un admin
        const existingAdmin = await em.findOne(Usuario, { role: UsuarioRole.ADMINISTRADOR });

        if (!existingAdmin) {
            // Crear usuario administrador usando el factory
            const adminData: CreateUsuarioData = {
                email: 'admin@copapymes.com',
                password: 'admin123',
                nombre: 'Administrador',
                apellido: 'Copa Pymes',
                role: UsuarioRole.ADMINISTRADOR
            };

            const admin = UsuarioFactory.create(adminData);
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
            // Crear usuario jugador de prueba usando el factory
            const jugadorData: CreateUsuarioData = {
                email: 'jugador@test.com',
                password: '123456',
                nombre: 'Lionel',
                apellido: 'Messi',
                role: UsuarioRole.JUGADOR,
                posicion: 'delantero',
                numero_camiseta: 10
            };

            const jugador = UsuarioFactory.create(jugadorData);
            await em.persistAndFlush(jugador);
            console.log('✅ Usuario jugador creado exitosamente:');
            console.log('📧 Email: jugador@test.com');
            console.log('🔑 Contraseña: 123456');
            console.log('⚽ Posición: delantero, Número: 10');
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