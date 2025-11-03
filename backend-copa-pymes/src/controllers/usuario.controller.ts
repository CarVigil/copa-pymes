import { Request, Response } from "express";
import { getORM, checkConnection } from "../shared/db/mikro-orm.config";
import { Usuario, UsuarioRole } from "../models/usuario.model";
import { Jugador } from "../models/usuario.model";
import { Equipo } from "../models/equipo.model";
import { UsuarioFactory, CreateUsuarioData } from "../models/usuarioFactory";

// Función auxiliar para reintentar operaciones con base de datos
const retryDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const isConnected = await checkConnection();
      if (!isConnected) {
                throw new Error('No hay conexión a la base de datos');
      }

      return await operation();
    } catch (error: any) {
            console.error(`❌ Intento ${attempt}/${maxRetries} falló:`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

            if (error.code === 'ETIMEDOUT' ||
                error.code === 'ECONNRESET' ||
                error.code === 'ENOTFOUND' ||
                error.message.includes('connect') ||
                error.message.includes('timeout')) {
        console.log(`⏳ Reintentando en ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5;
        continue;
      }

      throw error;
    }
  }
    throw new Error('No se pudo completar la operación después de múltiples intentos');
};

export class UsuarioController {
  // Obtener todos los usuarios
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        // Los gestores solo ven jugadores, administradores ven todos
        const isGestor = req.user?.role === UsuarioRole.GESTOR;
        const where = isGestor ? { role: UsuarioRole.JUGADOR } : {};

        const usuarios = await em.findAll(Usuario, { where });
                return usuarios.map(user => user.toJSON());
      });

      res.status(200).json({
        success: true,
        data: result,
                message: 'Usuarios obtenidos exitosamente'
      });
    } catch (error) {
            console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        success: false,
        data: null,
                message: 'Error interno del servidor'
      });
    }
  }

// Obtener usuarios por rol
static async getByRole(req: Request, res: Response): Promise<void> {
  try {
    const { role } = req.params;
    const { equipoId, sinEquipo, activo, posicion } = req.query;
    const currentUser = (req as any).user;

    if (!Object.values(UsuarioRole).includes(role as UsuarioRole)) {
      res.status(400).json({ success: false, message: 'Rol inválido' });
      return;
    }

      // Solo administradores pueden ver usuarios de roles distintos a 'jugador'
    if (role !== UsuarioRole.JUGADOR && currentUser.role !== UsuarioRole.ADMINISTRADOR) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver usuarios de este rol',
      });
      return;
    }

    const result = await retryDatabaseOperation(async () => {
      const orm = getORM();
      const em = orm.em.fork();

      if (role === UsuarioRole.JUGADOR) {
        const where: any = {};

        if (sinEquipo === "true") {
          if (equipoId) {
            where.$or = [
              { equipo: null },
              { equipo: { $ne: parseInt(equipoId as string, 10) } },
            ];
          } else {
            where.equipo = null;
          }
        } else if (equipoId) {
          where.equipo = parseInt(equipoId as string, 10);
        }

        if (posicion) where.posicion = posicion;

        if (activo !== undefined) where.activo = activo === "true";

        const jugadores = await em.find(Jugador, where, {
          populate: ['equipo'],
          orderBy: { apellido: 'ASC', nombre: 'ASC' },
        });

        return jugadores.map((j) => j.toJSON());
      }

      // 🔹 Otros roles se consultan normalmente
      const usuarios = await em.find(Usuario, { role: role as UsuarioRole }, {
        orderBy: { apellido: 'ASC', nombre: 'ASC' },
      });
      return usuarios.map((u) => u.toJSON());
    });

    res.status(200).json({
      success: true,
      data: result,
      message: `Usuarios con rol ${role} obtenidos exitosamente`,
    });
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor',
    });
  }
}

  // Obtener usuario por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        return await em.findOne(Usuario, { id: parseInt(id) });
      });

      if (!result) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Usuario no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result.toJSON(),
        message: "Usuario obtenido exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Crear nuevo usuario
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        password,
        nombre,
        apellido,
        role,
        documento,
        telefono,
        fecha_nacimiento,
        posicion,
        numero_camiseta,
      } = req.body;

      // Validaciones básicas
      if (!email || !password || !nombre || !apellido) {
        res.status(400).json({
          success: false,
          data: null,
          message: "Email, contraseña, nombre y apellido son obligatorios",
        });
        return;
      }

      // Verificar permisos según el rol del usuario autenticado
      const userRole = req.user?.role;
      const targetRole = role || UsuarioRole.JUGADOR;

      if (
        userRole === UsuarioRole.GESTOR &&
        targetRole !== UsuarioRole.JUGADOR
      ) {
        res.status(403).json({
          success: false,
          message: "Los gestores solo pueden crear jugadores",
        });
        return;
      }

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        // Verificar si ya existe un usuario con el mismo email
        const existingUser = await em.findOne(Usuario, {
          email: email.toLowerCase(),
        });
        if (existingUser) {
          throw new Error(`Ya existe un usuario con el email: ${email}`);
        }

        // Verificar número de camiseta único si es jugador
        if (targetRole === UsuarioRole.JUGADOR && numero_camiseta) {
          const existingNumber = await em.findOne(Usuario, {
            role: UsuarioRole.JUGADOR,
          });
          if (existingNumber) {
            // Necesitamos verificar específicamente en jugadores
            const jugadores = await em.find(Usuario, {
              role: UsuarioRole.JUGADOR,
            });
            const existingJugador = jugadores.find(
              (j: any) => j.numero_camiseta === numero_camiseta
            );
            if (existingJugador) {
              throw new Error(
                `El número de camiseta ${numero_camiseta} ya está en uso`
              );
            }
          }
        }

        // Usar el factory para crear el usuario según su rol
        const usuarioData: CreateUsuarioData = {
          email: email.toLowerCase(),
          password,
          nombre,
          apellido,
          role: targetRole,
          documento,
          telefono,
          fecha_nacimiento: fecha_nacimiento
            ? new Date(fecha_nacimiento)
            : undefined,
          posicion,
          numero_camiseta,
        };

        const usuario = UsuarioFactory.create(usuarioData);

        await em.persistAndFlush(usuario);
        return usuario.toJSON();
      });

      res.status(201).json({
        success: true,
        data: result,
        message: "Usuario creado exitosamente",
      });
    } catch (error: any) {
      console.error("Error al crear usuario:", error.message);

      if (
        error.message.includes("Ya existe un usuario") ||
        error.message.includes("número de camiseta")
      ) {
        res.status(409).json({
          success: false,
          data: null,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Actualizar usuario
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verificar permisos
      const userRole = req.user?.role;
      const userId = req.user?.id;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        const usuario = await em.findOne(Usuario, { id: parseInt(id) });
        if (!usuario) {
          throw new Error("Usuario no encontrado");
        }

        // Los gestores solo pueden editar jugadores
        if (
          userRole === UsuarioRole.GESTOR &&
          usuario.role !== UsuarioRole.JUGADOR
        ) {
          throw new Error("Sin permisos para editar este usuario");
        }

        // Los usuarios solo pueden editarse a sí mismos (excepto admins)
        if (
          userRole !== UsuarioRole.ADMINISTRADOR &&
          userRole !== UsuarioRole.GESTOR &&
          userId !== usuario.id
        ) {
          throw new Error("Solo puedes editar tu propio perfil");
        }

        // Verificar número de camiseta único si se está actualizando
        if (
          updateData.numero_camiseta &&
          usuario.role === UsuarioRole.JUGADOR
        ) {
          const jugadores = await em.find(Usuario, {
            role: UsuarioRole.JUGADOR,
            id: { $ne: usuario.id },
          });
          const existingJugador = jugadores.find(
            (j: any) => j.numero_camiseta === updateData.numero_camiseta
          );
          if (existingJugador) {
            throw new Error(
              `El número de camiseta ${updateData.numero_camiseta} ya está en uso`
            );
          }
        }

        // Actualizar campos permitidos
        if (updateData.nombre) usuario.nombre = updateData.nombre;
        if (updateData.apellido) usuario.apellido = updateData.apellido;
        if (updateData.documento) usuario.documento = updateData.documento;
        if (updateData.telefono) usuario.telefono = updateData.telefono;
        if (updateData.fecha_nacimiento)
          usuario.fecha_nacimiento = new Date(updateData.fecha_nacimiento);

        // Actualizar campos específicos según el rol
        if (usuario.role === UsuarioRole.JUGADOR) {
          const jugador = usuario as any;
          if (updateData.posicion) jugador.posicion = updateData.posicion;
          if (updateData.numero_camiseta)
            jugador.numero_camiseta = updateData.numero_camiseta;
          if (updateData.equipo_id) jugador.equipo_id = updateData.equipo_id;
        }

        if (usuario.role === UsuarioRole.GESTOR) {
          const gestor = usuario as any;
          if (updateData.departamento)
            gestor.departamento = updateData.departamento;
        }

        if (usuario.role === UsuarioRole.RECEPCIONISTA) {
          const recepcionista = usuario as any;
          if (updateData.turno) recepcionista.turno = updateData.turno;
        }

        if (usuario.role === UsuarioRole.ARBITRO) {
          const arbitro = usuario as any;
          if (updateData.categoria) arbitro.categoria = updateData.categoria;
          if (updateData.numero_licencia)
            arbitro.numero_licencia = updateData.numero_licencia;
          if (updateData.especialidad)
            arbitro.especialidad = updateData.especialidad;
        }

        // Solo admins pueden cambiar roles y estado
        if (userRole === UsuarioRole.ADMINISTRADOR) {
          if (updateData.role) usuario.role = updateData.role;
          if (updateData.activo !== undefined)
            usuario.activo = updateData.activo;
        }

        await em.persistAndFlush(usuario);
        return usuario.toJSON();
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Usuario actualizado exitosamente",
      });
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error.message);

      if (error.message === "Usuario no encontrado") {
        res.status(404).json({
          success: false,
          data: null,
          message: error.message,
        });
        return;
      }

      if (
        error.message.includes("Sin permisos") ||
        error.message.includes("Solo puedes")
      ) {
        res.status(403).json({
          success: false,
          data: null,
          message: error.message,
        });
        return;
      }

      if (error.message.includes("número de camiseta")) {
        res.status(409).json({
          success: false,
          data: null,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Eliminar usuario (solo administradores)
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        const usuario = await em.findOne(Usuario, { id: parseInt(id) });
        if (!usuario) {
          throw new Error("Usuario no encontrado");
        }

        // No permitir eliminar el último administrador
        if (usuario.role === UsuarioRole.ADMINISTRADOR) {
          const adminCount = await em.count(Usuario, {
            role: UsuarioRole.ADMINISTRADOR,
          });
          if (adminCount <= 1) {
            throw new Error("No se puede eliminar el último administrador");
          }
        }

        await em.removeAndFlush(usuario);
        return true;
      });

      res.status(200).json({
        success: true,
        data: null,
        message: "Usuario eliminado exitosamente",
      });
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error.message);

      if (error.message === "Usuario no encontrado") {
        res.status(404).json({
          success: false,
          data: null,
          message: error.message,
        });
        return;
      }

      if (error.message.includes("último administrador")) {
        res.status(400).json({
          success: false,
          data: null,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Obtener estadísticas de usuarios
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        const stats = {
          total: await em.count(Usuario),
          administradores: await em.count(Usuario, {
            role: UsuarioRole.ADMINISTRADOR,
          }),
          gestores: await em.count(Usuario, { role: UsuarioRole.GESTOR }),
          recepcionistas: await em.count(Usuario, {
            role: UsuarioRole.RECEPCIONISTA,
          }),
          arbitros: await em.count(Usuario, { role: UsuarioRole.ARBITRO }),
          jugadores: await em.count(Usuario, { role: UsuarioRole.JUGADOR }),
          activos: await em.count(Usuario, { activo: true }),
          inactivos: await em.count(Usuario, { activo: false }),
        };

        return stats;
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Estadísticas obtenidas exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Crear jugador dentro de un equipo
  static async createJugadorEnEquipo(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { equipoId } = req.params;
      const {
        email,
        password,
        nombre,
        apellido,
        documento,
        telefono,
        fecha_nacimiento,
        posicion,
        numero_camiseta,
      } = req.body;

      if (!email || !password || !nombre || !apellido) {
        res.status(400).json({
          success: false,
          message: "Email, contraseña, nombre y apellido son obligatorios",
        });
        return;
      }

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        // Verificar si el equipo existe
        const equipo = await em.findOne("Equipo", { id: parseInt(equipoId) });
        if (!equipo) {
          throw new Error("Equipo no encontrado");
        }

        // Verificar si ya existe un usuario con ese email
        const existingUser = await em.findOne(Usuario, {
          email: email.toLowerCase(),
        });
        if (existingUser) {
          throw new Error(`Ya existe un usuario con el email: ${email}`);
        }

        // Verificar número de camiseta duplicado dentro del equipo
        if (numero_camiseta) {
          const jugadoresEquipo = await em.find(Usuario as any, {
            role: UsuarioRole.JUGADOR,
            equipo: parseInt(equipoId),
          });
          const existingJugador = jugadoresEquipo.find(
            (j) => (j as any).numero_camiseta === numero_camiseta
          );
          if (existingJugador) {
            throw new Error(
              `El número de camiseta ${numero_camiseta} ya está en uso en este equipo`
            );
          }
        }

        const jugador = UsuarioFactory.create({
          email: email.toLowerCase(),
          password,
          nombre,
          apellido,
          role: UsuarioRole.JUGADOR,
          documento,
          telefono,
          fecha_nacimiento: fecha_nacimiento
            ? new Date(fecha_nacimiento)
            : undefined,
          posicion,
          numero_camiseta,
          equipo_id: parseInt(equipoId),
        });

        await em.persistAndFlush(jugador);
        return jugador.toJSON();
      });

      res.status(201).json({
        success: true,
        data: result,
        message: "Jugador creado y asignado al equipo exitosamente",
      });
    } catch (error: any) {
      console.error("Error al crear jugador en equipo:", error.message);

      if (error.message.includes("Ya existe un usuario")) {
        res.status(409).json({ success: false, message: error.message });
        return;
      }

      if (error.message.includes("Equipo no encontrado")) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

static async getJugadores(req: Request, res: Response): Promise<void> {
  try {
    const { equipoId, sinEquipo, activo, posicion } = req.query;

    const result = await retryDatabaseOperation(async () => {
      const orm = getORM();
      const em = orm.em.fork();

      const where: any = {};

      if (sinEquipo === 'true') {
        if (equipoId) {
          where.$or = [
            { equipo: null },
            { equipo: { $ne: parseInt(equipoId as string, 10) } },
          ];
        } else {
          where.equipo = null;
        }
      } else if (equipoId) {
        where.equipo = parseInt(equipoId as string, 10);
      }

      if (posicion) where.posicion = posicion;
      if (activo !== undefined) where.activo = activo === 'true';

      const jugadores = await em.find(Jugador, where, {
        populate: ['equipo'],
        orderBy: { apellido: 'ASC', nombre: 'ASC' },
      });

      return jugadores.map((j) => j.toJSON());
    });

    res.status(200).json({
      success: true,
      data: result,
        message: "Jugadores obtenidos exitosamente",
    });
  } catch (error) {
      console.error("Error al obtener jugadores:", error);
    res.status(500).json({
      success: false,
      data: null,
        message: "Error interno del servidor",
    });
  }
}

  // Método corregido: getJugadoresByEquipo
  static async getJugadoresByEquipo(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { equipoId } = req.params;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        // Verificar que el equipo existe
        const equipo = await em.findOne("Equipo", { id: parseInt(equipoId) });
        if (!equipo) {
          throw new Error("Equipo no encontrado");
        }

        // Usar Jugador en lugar de Usuario
        const jugadores = await em.find(
          Jugador,
          {
            equipo: parseInt(equipoId),
          },
          {
            populate: ["equipo"],
            orderBy: { numero_camiseta: "ASC", apellido: "ASC" },
          }
        );

        return jugadores.map((jugador) => jugador.toJSON());
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Jugadores del equipo obtenidos exitosamente",
      });
    } catch (error: any) {
      console.error("Error al obtener jugadores del equipo:", error);

      if (error.message === "Equipo no encontrado") {
        res.status(404).json({
          success: false,
          data: null,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Método corregido: getJugadoresStats
  static async getJugadoresStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        // Usar Jugador en lugar de Usuario
        const jugadores = await em.find(
          Jugador,
          {},
          {
            populate: ["equipo"],
          }
        );

        const stats = {
          total: jugadores.length,
          conEquipo: jugadores.filter(
            (j) => j.equipo !== null && j.equipo !== undefined
          ).length,
          sinEquipo: jugadores.filter(
            (j) => j.equipo === null || j.equipo === undefined
          ).length,
          activos: jugadores.filter((j) => j.activo).length,
          inactivos: jugadores.filter((j) => !j.activo).length,
          porPosicion: {} as Record<string, number>,
        };

        // Contar por posición
        jugadores.forEach((j) => {
          if (j.posicion) {
            stats.porPosicion[j.posicion] =
              (stats.porPosicion[j.posicion] || 0) + 1;
          }
        });

        return stats;
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Estadísticas de jugadores obtenidas exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener estadísticas de jugadores:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  static async assignToEquipo(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { equipoId } = req.body;

    if (!equipoId) {
      res.status(400).json({
        success: false,
        message: "Debe especificarse el ID del equipo",
      });
      return;
    }

    const result = await retryDatabaseOperation(async () => {
      const orm = getORM();
      const em = orm.em.fork();

      // Usar Jugador en lugar de Usuario
      const jugador = await em.findOne(Jugador, { id: parseInt(id) });
      if (!jugador) throw new Error("Jugador no encontrado");

      // Usar Equipo en lugar de "Equipo" como string
      const equipo = await em.findOne(Equipo, { id: parseInt(equipoId) });
      if (!equipo) throw new Error("Equipo no encontrado");

      jugador.equipo = equipo;

      await em.persistAndFlush(jugador);
      return jugador.toJSON();
    });

    res.status(200).json({
      success: true,
      data: result,
      message: "Jugador asignado al equipo exitosamente",
    });
  } catch (error: any) {
    console.error("Error al asignar jugador a equipo:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
}

  static async removeFromEquipo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        // Usar Jugador en lugar de Usuario
        const jugador = await em.findOne(Jugador, { id: parseInt(id) });
        if (!jugador) throw new Error("Jugador no encontrado");

        jugador.equipo = undefined;

        await em.persistAndFlush(jugador);
        return jugador.toJSON();
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Jugador removido del equipo exitosamente",
      });
    } catch (error: any) {
      console.error("Error al remover jugador del equipo:", error.message);
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
      });
    }
  }
}
