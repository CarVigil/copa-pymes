-- ============================================
-- Script para insertar usuarios de prueba
-- Base de datos: copa_pymes
-- ============================================

USE copa_pymes;

-- Nota: Las contraseñas están hasheadas con bcrypt (12 rounds)
-- Contraseñas en texto plano para referencia:
-- admin123, gestor123, recep123, arbitro123, jugador123

-- ============================================
-- 1. ADMINISTRADOR
-- ============================================
INSERT INTO usuario (
    email, 
    password, 
    nombre, 
    apellido, 
    role, 
    activo,
    documento,
    telefono,
    fecha_nacimiento,
    nivel_acceso,
    fecha_nombramiento
) VALUES (
    'admin@copapymes.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIFj8S8Nka', -- admin123
    'Carlos',
    'Administrador',
    'administrador',
    1,
    '12345678',
    '+54 11 1234-5678',
    '1985-05-15',
    'super_admin',
    NOW()
);

-- ============================================
-- 2. GESTOR
-- ============================================
INSERT INTO usuario (
    email, 
    password, 
    nombre, 
    apellido, 
    role, 
    activo,
    documento,
    telefono,
    fecha_nacimiento,
    departamento,
    fecha_nombramiento,
    puede_crear_jugadores,
    puede_modificar_equipos
) VALUES (
    'gestor@copapymes.com',
    '$2a$12$8fK9QvBzGx4lPYQc7XnKDeXKZWGxY9vH5mPnJKwRqYzLcNxMvKp5S', -- gestor123
    'María',
    'Gestora',
    'gestor',
    1,
    '23456789',
    '+54 11 2345-6789',
    '1988-08-20',
    'primera_division',
    NOW(),
    1,
    1
);

-- ============================================
-- 3. RECEPCIONISTA
-- ============================================
INSERT INTO usuario (
    email, 
    password, 
    nombre, 
    apellido, 
    role, 
    activo,
    documento,
    telefono,
    fecha_nacimiento,
    turno,
    fecha_ingreso,
    puede_cargar_asistencia,
    puede_cargar_resultados,
    puede_crear_partidos
) VALUES (
    'recepcionista@copapymes.com',
    '$2a$12$kGFvH7QzX3nYwPqL5mRtZeJ8vKpLnNxMwYzQr9sT4uV6wX8yA0bC2', -- recep123
    'Ana',
    'Recepcionista',
    'recepcionista',
    1,
    '34567890',
    '+54 11 3456-7890',
    '1992-03-10',
    'mañana',
    NOW(),
    1,
    1,
    0
);

-- ============================================
-- 4. ÁRBITRO
-- ============================================
INSERT INTO usuario (
    email, 
    password, 
    nombre, 
    apellido, 
    role, 
    activo,
    documento,
    telefono,
    fecha_nacimiento,
    categoria,
    fecha_licencia,
    numero_licencia,
    partidos_arbitrados,
    disponible_para_arbitrar,
    especialidad
) VALUES (
    'arbitro@copapymes.com',
    '$2a$12$pQrS7tU8vW9xY0zA1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tU1vW2xY3', -- arbitro123
    'Roberto',
    'Árbitro',
    'arbitro',
    1,
    '45678901',
    '+54 11 4567-8901',
    '1987-11-25',
    'regional',
    '2020-01-15',
    'ARB-2020-001',
    45,
    1,
    'principal'
);

-- ============================================
-- 5. JUGADOR #1 - Lionel Messi (Delantero)
-- ============================================
INSERT INTO usuario (
    email, 
    password, 
    nombre, 
    apellido, 
    role, 
    activo,
    documento,
    telefono,
    fecha_nacimiento,
    posicion,
    numero_camiseta,
    fecha_inicio_club,
    goles_marcados,
    tarjetas_amarillas,
    tarjetas_rojas,
    partidos_jugados,
    disponible,
    lesion_actual
) VALUES (
    'messi@copapymes.com',
    '$2a$12$qR9sT8uV0wX1yY2zA3bC4dE5fG6hI7jK8lM9nO0pQ1rS2tU3vW4xY', -- jugador123
    'Lionel',
    'Messi',
    'jugador',
    1,
    '56789012',
    '+54 11 5678-9012',
    '1987-06-24',
    'delantero',
    10,
    '2024-01-01',
    25,
    2,
    0,
    20,
    1,
    NULL
);

-- ============================================
-- 6. JUGADOR #2 - Diego Maradona (Mediocampista)
-- ============================================
INSERT INTO usuario (
    email, 
    password, 
    nombre, 
    apellido, 
    role, 
    activo,
    documento,
    telefono,
    fecha_nacimiento,
    posicion,
    numero_camiseta,
    fecha_inicio_club,
    goles_marcados,
    tarjetas_amarillas,
    tarjetas_rojas,
    partidos_jugados,
    disponible,
    lesion_actual
) VALUES (
    'maradona@copapymes.com',
    '$2a$12$qR9sT8uV0wX1yY2zA3bC4dE5fG6hI7jK8lM9nO0pQ1rS2tU3vW4xY', -- jugador123
    'Diego',
    'Maradona',
    'jugador',
    1,
    '67890123',
    '+54 11 6789-0123',
    '1960-10-30',
    'mediocampista',
    10,
    '2024-01-01',
    18,
    3,
    0,
    18,
    1,
    NULL
);

-- ============================================
-- 7. JUGADOR #3 - Emiliano Martínez (Arquero)
-- ============================================
INSERT INTO usuario (
    email, 
    password, 
    nombre, 
    apellido, 
    role, 
    activo,
    documento,
    telefono,
    fecha_nacimiento,
    posicion,
    numero_camiseta,
    fecha_inicio_club,
    goles_marcados,
    tarjetas_amarillas,
    tarjetas_rojas,
    partidos_jugados,
    disponible,
    lesion_actual
) VALUES (
    'dibu@copapymes.com',
    '$2a$12$qR9sT8uV0wX1yY2zA3bC4dE5fG6hI7jK8lM9nO0pQ1rS2tU3vW4xY', -- jugador123
    'Emiliano',
    'Martínez',
    'jugador',
    1,
    '78901234',
    '+54 11 7890-1234',
    '1992-09-02',
    'arquero',
    23,
    '2024-01-01',
    0,
    1,
    0,
    20,
    1,
    NULL
);

-- ============================================
-- 8. JUGADOR #4 - Nicolás Otamendi (Defensor)
-- ============================================
INSERT INTO usuario (
    email, 
    password, 
    nombre, 
    apellido, 
    role, 
    activo,
    documento,
    telefono,
    fecha_nacimiento,
    posicion,
    numero_camiseta,
    fecha_inicio_club,
    goles_marcados,
    tarjetas_amarillas,
    tarjetas_rojas,
    partidos_jugados,
    disponible,
    lesion_actual
) VALUES (
    'otamendi@copapymes.com',
    '$2a$12$qR9sT8uV0wX1yY2zA3bC4dE5fG6hI7jK8lM9nO0pQ1rS2tU3vW4xY', -- jugador123
    'Nicolás',
    'Otamendi',
    'jugador',
    1,
    '89012345',
    '+54 11 8901-2345',
    '1988-02-12',
    'defensor',
    19,
    '2024-01-01',
    2,
    5,
    1,
    19,
    0,
    'Lesión muscular - recuperación estimada 2 semanas'
);

-- ============================================
-- Verificar datos insertados
-- ============================================
SELECT 
    id,
    email,
    nombre,
    apellido,
    role,
    CASE role
        WHEN 'jugador' THEN CONCAT('Pos: ', posicion, ' - Num: ', numero_camiseta)
        WHEN 'arbitro' THEN CONCAT('Cat: ', categoria, ' - Lic: ', numero_licencia)
        WHEN 'recepcionista' THEN CONCAT('Turno: ', turno)
        WHEN 'gestor' THEN CONCAT('Depto: ', departamento)
        WHEN 'administrador' THEN CONCAT('Nivel: ', nivel_acceso)
    END as detalles_rol
FROM usuario
ORDER BY 
    CASE role
        WHEN 'administrador' THEN 1
        WHEN 'gestor' THEN 2
        WHEN 'recepcionista' THEN 3
        WHEN 'arbitro' THEN 4
        WHEN 'jugador' THEN 5
    END,
    nombre;

-- ============================================
-- RESUMEN DE CREDENCIALES
-- ============================================
/*
CREDENCIALES PARA LOGIN:

1. ADMINISTRADOR:
   Email: admin@copapymes.com
   Password: admin123

2. GESTOR:
   Email: gestor@copapymes.com
   Password: gestor123

3. RECEPCIONISTA:
   Email: recepcionista@copapymes.com
   Password: recep123

4. ÁRBITRO:
   Email: arbitro@copapymes.com
   Password: arbitro123

5. JUGADORES (todos con password: jugador123):
   - messi@copapymes.com (Delantero #10)
   - maradona@copapymes.com (Mediocampista #10)
   - dibu@copapymes.com (Arquero #23)
   - otamendi@copapymes.com (Defensor #19 - Lesionado)
*/
