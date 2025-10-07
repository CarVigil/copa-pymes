import { Usuario, UsuarioRole } from './usuario.model';
import { Administrador } from './especialized/administrador.model';
import { Gestor } from './especialized/gestor.model';
import { Recepcionista } from './especialized/recepcionista.model';
import { Arbitro } from './especialized/arbitro.model';
import { Jugador } from './especialized/jugador.model';

export interface CreateUsuarioData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  role: UsuarioRole;
  documento?: string;
  telefono?: string;
  fecha_nacimiento?: Date;
  
  // Campos específicos según el rol
  // Para Jugador
  posicion?: string;
  numero_camiseta?: number;
  equipo_id?: number;
  
  // Para Gestor
  departamento?: string;
  
  // Para Recepcionista
  turno?: string;
  
  // Para Árbitro
  categoria?: string;
  numero_licencia?: string;
  especialidad?: string;
  
  // Para Administrador
  nivel_acceso?: string;
}

export class UsuarioFactory {
  static create(data: CreateUsuarioData): Usuario {
    let usuario: Usuario;

    switch (data.role) {
      case UsuarioRole.ADMINISTRADOR:
        usuario = new Administrador();
        if (data.nivel_acceso) {
          (usuario as Administrador).nivel_acceso = data.nivel_acceso;
        }
        break;

      case UsuarioRole.GESTOR:
        usuario = new Gestor();
        if (data.departamento) {
          (usuario as Gestor).departamento = data.departamento;
        }
        break;

      case UsuarioRole.RECEPCIONISTA:
        usuario = new Recepcionista();
        if (data.turno) {
          (usuario as Recepcionista).turno = data.turno;
        }
        break;

      case UsuarioRole.ARBITRO:
        usuario = new Arbitro();
        const arbitro = usuario as Arbitro;
        if (data.categoria) arbitro.categoria = data.categoria;
        if (data.numero_licencia) arbitro.numero_licencia = data.numero_licencia;
        if (data.especialidad) arbitro.especialidad = data.especialidad;
        break;

      case UsuarioRole.JUGADOR:
        usuario = new Jugador();
        const jugador = usuario as Jugador;
        if (data.posicion) jugador.posicion = data.posicion;
        if (data.numero_camiseta) jugador.numero_camiseta = data.numero_camiseta;
        if (data.equipo_id) jugador.equipo_id = data.equipo_id;
        break;

      default:
        throw new Error(`Rol de usuario no válido: ${data.role}`);
    }

    // Asignar campos comunes
    usuario.email = data.email;
    usuario.password = data.password;
    usuario.nombre = data.nombre;
    usuario.apellido = data.apellido;
    usuario.role = data.role;
    
    if (data.documento) usuario.documento = data.documento;
    if (data.telefono) usuario.telefono = data.telefono;
    if (data.fecha_nacimiento) usuario.fecha_nacimiento = data.fecha_nacimiento;

    return usuario;
  }

  static getUsuarioClass(role: UsuarioRole): typeof Usuario {
    switch (role) {
      case UsuarioRole.ADMINISTRADOR:
        return Administrador;
      case UsuarioRole.GESTOR:
        return Gestor;
      case UsuarioRole.RECEPCIONISTA:
        return Recepcionista;
      case UsuarioRole.ARBITRO:
        return Arbitro;
      case UsuarioRole.JUGADOR:
        return Jugador;
      default:
        throw new Error(`Rol de usuario no válido: ${role}`);
    }
  }
}

// Exportar todas las clases especializadas
export { Administrador } from './especialized/administrador.model';
export { Gestor } from './especialized/gestor.model';
export { Recepcionista } from './especialized/recepcionista.model';
export { Arbitro } from './especialized/arbitro.model';
export { Jugador } from './especialized/jugador.model';