import { initializeORM, getORM } from '../shared/db/mikro-orm.config';

async function checkCurrentSchema() {
    try {
        console.log('🔍 Verificando esquema actual...');
        
        const orm = await initializeORM();
        const em = orm.em.fork();

        // Verificar estructura de la tabla usuario
        const tableInfo = await em.getConnection().execute(
            "DESCRIBE usuario"
        );
        
        console.log('📋 Estructura actual de la tabla usuario:');
        tableInfo.forEach((column: any) => {
            console.log(`   - ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'nullable' : 'not null'})`);
        });

        // Verificar roles actuales
        const currentRoles = await em.getConnection().execute(
            "SELECT DISTINCT role FROM usuario"
        );
        
        console.log('📊 Roles actuales en la base de datos:');
        currentRoles.forEach((row: any) => {
            console.log(`   - ${row.role}`);
        });

        // Verificar todos los usuarios
        const usuarios = await em.getConnection().execute(
            "SELECT id, email, nombre, apellido, role FROM usuario"
        );
        
        console.log('👥 Usuarios existentes:');
        usuarios.forEach((user: any) => {
            console.log(`   - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
        });

        await orm.close();

    } catch (error: any) {
        console.error('❌ Error verificando esquema:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    checkCurrentSchema()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

export { checkCurrentSchema };