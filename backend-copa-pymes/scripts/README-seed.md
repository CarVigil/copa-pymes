# Guía para cargar usuarios de prueba

## Opción 1: Desde MySQL Workbench o phpMyAdmin

1. Abre MySQL Workbench o phpMyAdmin
2. Conecta a tu base de datos `copa_pymes`
3. Abre el archivo `seed-usuarios.sql` o `seed-usuarios-simple.sql`
4. Ejecuta el script completo

## Opción 2: Desde la línea de comandos

### Con MySQL80:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p copa_pymes < scripts/seed-usuarios-simple.sql
```

### Con WampServer:
```powershell
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -u root -p copa_pymes < scripts/seed-usuarios-simple.sql
```

## Opción 3: Usando el script de Node.js (recomendado)

El proyecto ya tiene un script `createAdmin.ts` que puedes ejecutar:

```powershell
cd backend-copa-pymes
npx ts-node src/scripts/createAdmin.ts
```

Este script creará automáticamente un administrador y un jugador de prueba.

## Credenciales de acceso

### Administrador
- Email: `admin@copapymes.com`
- Password: `admin123`
- Acceso: Total al sistema

### Gestor
- Email: `gestor@copapymes.com`
- Password: `gestor123`
- Acceso: ABM de equipos y jugadores

### Recepcionista
- Email: `recepcionista@copapymes.com`
- Password: `recep123`
- Acceso: Carga de asistencia y resultados

### Árbitro
- Email: `arbitro@copapymes.com`
- Password: `arbitro123`
- Acceso: Gestión de partidos

### Jugadores (password: `jugador123`)
- `messi@copapymes.com` - Delantero #10 (25 goles, 20 partidos)
- `dibu@copapymes.com` - Arquero #23 (0 goles, 20 partidos)
- `maradona@copapymes.com` - Mediocampista #10 (18 goles, 18 partidos)
- `otamendi@copapymes.com` - Defensor #19 (Lesionado)

## Verificación

Para verificar que los usuarios se cargaron correctamente:

```sql
SELECT 
    id,
    email,
    nombre,
    apellido,
    role,
    activo
FROM usuario
ORDER BY role, nombre;
```

## Notas importantes

1. **Contraseñas hasheadas**: El script `seed-usuarios.sql` usa contraseñas ya hasheadas con bcrypt.

2. **Contraseñas sin hashear**: El script `seed-usuarios-simple.sql` usa contraseñas en texto plano que deberás hashear manualmente o mediante el endpoint de registro.

3. **Recrear usuarios**: Si quieres empezar de cero, ejecuta primero:
   ```sql
   TRUNCATE TABLE usuario;
   ```

4. **Verificar estructura**: Asegúrate de que la tabla `usuario` tenga todas las columnas necesarias ejecutando primero la migración.
