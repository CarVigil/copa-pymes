import { BaseModel } from '../shared/db/baseModel.model';
import { Entity, Property, Enum, BeforeCreate, BeforeUpdate } from '@mikro-orm/core';
import * as bcrypt from 'bcryptjs';

export enum UsuarioRole {
  ADMINISTRADOR = 'administrador',
  GESTOR = 'gestor',
  RECEPCIONISTA = 'recepcionista',
  ARBITRO = 'arbitro',
  JUGADOR = 'jugador'
}

@Entity({
  tableName: 'usuario',
  discriminatorColumn: 'role',
  discriminatorMap: {
    [UsuarioRole.ADMINISTRADOR]: 'Administrador',
    [UsuarioRole.GESTOR]: 'Gestor',
    [UsuarioRole.RECEPCIONISTA]: 'Recepcionista',
    [UsuarioRole.ARBITRO]: 'Arbitro',
    [UsuarioRole.JUGADOR]: 'Jugador',
  }
})
export abstract class Usuario extends BaseModel {
  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @Property()
  nombre!: string;

  @Property()
  apellido!: string;

  @Enum(() => UsuarioRole)
  role!: UsuarioRole;

  @Property({ default: true })
  activo: boolean = true;

  @Property({ nullable: true })
  ultimo_login?: Date;

  @Property({ nullable: true })
  documento?: string;

  @Property({ nullable: true })
  telefono?: string;

  @Property({ nullable: true })
  fecha_nacimiento?: Date;

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const { password, ...rest } = this;
    return rest;
  }

  isAdministrador(): boolean {
    return this.role === UsuarioRole.ADMINISTRADOR;
  }

  isGestor(): boolean {
    return this.role === UsuarioRole.GESTOR;
  }

  isRecepcionista(): boolean {
    return this.role === UsuarioRole.RECEPCIONISTA;
  }

  isArbitro(): boolean {
    return this.role === UsuarioRole.ARBITRO;
  }

  isJugador(): boolean {
    return this.role === UsuarioRole.JUGADOR;
  }

  hasManagementPermissions(): boolean {
    return this.isAdministrador() || this.isGestor();
  }

  canCreateTournaments(): boolean {
    return this.isAdministrador();
  }

  canLoadResults(): boolean {
    return this.isAdministrador() || this.isRecepcionista();
  }
}

// Clases especializadas
@Entity()
export class Administrador extends Usuario {
  @Property({ nullable: true })
  nivel_acceso?: string;
}

@Entity()
export class Gestor extends Usuario {
  @Property({ nullable: true })
  departamento?: string;
}

@Entity()
export class Recepcionista extends Usuario {
  @Property({ nullable: true })
  turno?: string;
}

@Entity()
export class Arbitro extends Usuario {
  @Property({ nullable: true })
  categoria?: string;

  @Property({ nullable: true })
  numero_licencia?: string;

  @Property({ nullable: true })
  especialidad?: string;
}

@Entity()
export class Jugador extends Usuario {
  @Property({ nullable: true })
  posicion?: string;

  @Property({ nullable: true })
  numero_camiseta?: number;

  @Property({ nullable: true })
  equipo_id?: number;
}