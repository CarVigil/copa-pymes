import { initializeORM, getORM } from '../shared/db/mikro-orm.config';

async function migrateUserRoles() {
    try {
        console.log('🔄 Iniciando migración de roles de usuario...');
        
        const orm = await initializeORM();
        const em = orm.em.fork();

        // Primero, actualizar los datos existentes usando SQL directo
        console.log('📝 Actualizando roles existentes...');
        
        try {
            // Actualizar 'admin' a 'administrador'
            const updateAdminResult = await em.getConnection().execute(
                "UPDATE usuario SET role = 'administrador' WHERE role = 'admin'"
            );
            console.log(`✅ Actualizados ${updateAdminResult.affectedRows || 0} usuarios admin → administrador`);

            // Actualizar 'jugador' si existe (mantener igual)
            const updateJugadorResult = await em.getConnection().execute(
                "UPDATE usuario SET role = 'jugador' WHERE role = 'jugador'"
            );
            console.log(`✅ Confirmados ${updateJugadorResult.affectedRows || 0} usuarios jugador`);

            // Verificar roles actuales
            const currentRoles = await em.getConnection().execute(
                "SELECT role, COUNT(*) as count FROM usuario GROUP BY role"
            );
            console.log('📊 Roles actuales en la base de datos:');
            currentRoles.forEach((row: any) => {
                console.log(`   - ${row.role}: ${row.count} usuarios`);
            });

        } catch (error: any) {
            console.error('❌ Error actualizando roles:', error.message);
            throw error;
        }

        // Ahora actualizar el esquema
        console.log('🔄 Actualizando esquema de base de datos...');
        
        try {
            await orm.getSchemaGenerator().updateSchema();
            console.log('✅ Esquema actualizado exitosamente');
        } catch (schemaError: any) {
            console.error('❌ Error actualizando esquema:', schemaError.message);
            
            // Si aún hay problemas, intentar una migración más agresiva
            if (schemaError.message.includes('Data truncated')) {
                console.log('🔧 Intentando migración alternativa...');
                
                // Obtener todos los usuarios y sus roles actuales
                const usuarios = await em.getConnection().execute(
                    "SELECT id, role FROM usuario"
                );
                
                console.log('📝 Usuarios encontrados:', usuarios.length);
                
                // Mapear roles antiguos a nuevos
                const roleMapping: Record<string, string> = {
                    'admin': 'administrador',
                    'administrador': 'administrador',
                    'jugador': 'jugador',
                    'gestor': 'gestor',
                    'recepcionista': 'recepcionista',
                    'arbitro': 'arbitro'
                };
                
                // Actualizar uno por uno si es necesario
                for (const usuario of usuarios) {
                    const newRole = roleMapping[usuario.role] || 'jugador';
                    if (newRole !== usuario.role) {
                        await em.getConnection().execute(
                            `UPDATE usuario SET role = ? WHERE id = ?`,
                            [newRole, usuario.id]
                        );
                        console.log(`   - Usuario ${usuario.id}: ${usuario.role} → ${newRole}`);
                    }
                }
                
                // Intentar el esquema nuevamente
                await orm.getSchemaGenerator().updateSchema();
                console.log('✅ Migración alternativa exitosa');
            } else {
                throw schemaError;
            }
        }

        // Verificar resultado final
        const finalRoles = await em.getConnection().execute(
            "SELECT role, COUNT(*) as count FROM usuario GROUP BY role"
        );
        
        console.log('🎉 Migración completada. Roles finales:');
        finalRoles.forEach((row: any) => {
            console.log(`   - ${row.role}: ${row.count} usuarios`);
        });

        await orm.close();
        console.log('✅ Migración de roles completada exitosamente');

    } catch (error: any) {
        console.error('❌ Error en migración:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    migrateUserRoles()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

export { migrateUserRoles };