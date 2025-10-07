import { initializeORM, getORM } from '../shared/db/mikro-orm.config';

async function migrateToHeritage() {
    try {
        console.log('🔄 Iniciando migración a estructura de herencia...');
        
        const orm = await initializeORM();
        const em = orm.em.fork();

        console.log('📝 Paso 1: Agregando nuevas columnas para cada rol...');
        
        // Agregar columnas específicas de jugadores
        try {
            await em.getConnection().execute(`
                ALTER TABLE usuario 
                ADD COLUMN IF NOT EXISTS posicion VARCHAR(255),
                ADD COLUMN IF NOT EXISTS numero_camiseta INT UNIQUE,
                ADD COLUMN IF NOT EXISTS fecha_inicio_club DATETIME,
                ADD COLUMN IF NOT EXISTS goles_marcados INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS tarjetas_amarillas INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS tarjetas_rojas INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS partidos_jugados INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS disponible BOOLEAN DEFAULT TRUE,
                ADD COLUMN IF NOT EXISTS lesion_actual VARCHAR(255)
            `);
            console.log('✅ Columnas de jugador agregadas');
        } catch (error: any) {
            console.log('⚠️ Algunas columnas de jugador ya existen:', error.message);
        }

        // Agregar columnas específicas de gestores
        try {
            await em.getConnection().execute(`
                ALTER TABLE usuario 
                ADD COLUMN IF NOT EXISTS departamento VARCHAR(255),
                ADD COLUMN IF NOT EXISTS fecha_nombramiento DATETIME,
                ADD COLUMN IF NOT EXISTS equipos_a_cargo TEXT,
                ADD COLUMN IF NOT EXISTS puede_crear_jugadores BOOLEAN DEFAULT TRUE,
                ADD COLUMN IF NOT EXISTS puede_modificar_equipos BOOLEAN DEFAULT TRUE
            `);
            console.log('✅ Columnas de gestor agregadas');
        } catch (error: any) {
            console.log('⚠️ Algunas columnas de gestor ya existen:', error.message);
        }

        // Agregar columnas específicas de recepcionistas
        try {
            await em.getConnection().execute(`
                ALTER TABLE usuario 
                ADD COLUMN IF NOT EXISTS turno VARCHAR(255),
                ADD COLUMN IF NOT EXISTS fecha_ingreso DATETIME,
                ADD COLUMN IF NOT EXISTS puede_cargar_asistencia BOOLEAN DEFAULT TRUE,
                ADD COLUMN IF NOT EXISTS puede_cargar_resultados BOOLEAN DEFAULT TRUE,
                ADD COLUMN IF NOT EXISTS puede_crear_partidos BOOLEAN DEFAULT FALSE
            `);
            console.log('✅ Columnas de recepcionista agregadas');
        } catch (error: any) {
            console.log('⚠️ Algunas columnas de recepcionista ya existen:', error.message);
        }

        // Agregar columnas específicas de árbitros
        try {
            await em.getConnection().execute(`
                ALTER TABLE usuario 
                ADD COLUMN IF NOT EXISTS categoria VARCHAR(255),
                ADD COLUMN IF NOT EXISTS fecha_licencia DATETIME,
                ADD COLUMN IF NOT EXISTS numero_licencia VARCHAR(255),
                ADD COLUMN IF NOT EXISTS partidos_arbitrados INT DEFAULT 0,
                ADD COLUMN IF NOT EXISTS disponible_para_arbitrar BOOLEAN DEFAULT TRUE,
                ADD COLUMN IF NOT EXISTS especialidad VARCHAR(255)
            `);
            console.log('✅ Columnas de árbitro agregadas');
        } catch (error: any) {
            console.log('⚠️ Algunas columnas de árbitro ya existen:', error.message);
        }

        // Agregar columnas específicas de administradores
        try {
            await em.getConnection().execute(`
                ALTER TABLE usuario 
                ADD COLUMN IF NOT EXISTS nivel_acceso VARCHAR(255),
                ADD COLUMN IF NOT EXISTS permisos_especiales TEXT
            `);
            console.log('✅ Columnas de administrador agregadas');
        } catch (error: any) {
            console.log('⚠️ Algunas columnas de administrador ya existen:', error.message);
        }

        console.log('📝 Paso 2: Actualizando schema con MikroORM...');
        try {
            await orm.getSchemaGenerator().updateSchema();
            console.log('✅ Schema actualizado exitosamente');
        } catch (error: any) {
            console.log('⚠️ Error actualizando schema:', error.message);
        }

        // Verificar usuarios existentes
        const usuarios = await em.getConnection().execute(
            "SELECT id, email, nombre, apellido, role FROM usuario"
        );
        
        console.log('👥 Usuarios existentes:');
        usuarios.forEach((user: any) => {
            console.log(`   - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
        });

        await orm.close();
        console.log('✅ Migración completada exitosamente');

    } catch (error: any) {
        console.error('❌ Error en migración:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    migrateToHeritage()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

export { migrateToHeritage };