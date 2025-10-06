import { initializeORM, getORM } from '../shared/db/mikro-orm.config';

async function migrateRolesStep() {
    try {
        console.log('🔄 Iniciando migración de roles paso a paso...');
        
        const orm = await initializeORM();
        const em = orm.em.fork();

        console.log('📝 Paso 1: Expandir enum para incluir todos los valores...');
        try {
            await em.getConnection().execute(`
                ALTER TABLE usuario 
                MODIFY COLUMN role ENUM('admin', 'jugador', 'administrador', 'gestor', 'recepcionista', 'arbitro') 
                NOT NULL DEFAULT 'jugador'
            `);
            console.log('✅ Enum expandido exitosamente');
        } catch (error: any) {
            console.error('❌ Error expandiendo enum:', error.message);
            throw error;
        }

        console.log('📝 Paso 2: Actualizar datos existentes...');
        try {
            // Actualizar 'admin' a 'administrador'
            const updateResult = await em.getConnection().execute(
                "UPDATE usuario SET role = 'administrador' WHERE role = 'admin'"
            );
            console.log(`✅ Actualizados ${updateResult.affectedRows || 0} usuarios admin → administrador`);
        } catch (error: any) {
            console.error('❌ Error actualizando datos:', error.message);
            throw error;
        }

        console.log('📝 Paso 3: Actualizar enum final (sin valores antiguos)...');
        try {
            await em.getConnection().execute(`
                ALTER TABLE usuario 
                MODIFY COLUMN role ENUM('administrador', 'gestor', 'recepcionista', 'arbitro', 'jugador') 
                NOT NULL DEFAULT 'jugador'
            `);
            console.log('✅ Enum final actualizado exitosamente');
        } catch (error: any) {
            console.error('❌ Error en enum final:', error.message);
            throw error;
        }

        // Verificar resultado final
        console.log('📝 Verificando resultado...');
        const finalRoles = await em.getConnection().execute(
            "SELECT role, COUNT(*) as count FROM usuario GROUP BY role"
        );
        
        console.log('🎉 Migración completada. Roles finales:');
        finalRoles.forEach((row: any) => {
            console.log(`   - ${row.role}: ${row.count} usuarios`);
        });

        // Verificar estructura final
        const tableInfo = await em.getConnection().execute("DESCRIBE usuario");
        const roleColumn = tableInfo.find((col: any) => col.Field === 'role');
        console.log(`📋 Enum final: ${roleColumn.Type}`);

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
    migrateRolesStep()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

export { migrateRolesStep };