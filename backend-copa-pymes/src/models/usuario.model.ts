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

@Entity({ tableName: 'usuario', discriminatorColumn: 'role' })
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

  // Métodos de utilidad para verificar roles
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

  // Verificar si tiene permisos de gestión
  hasManagementPermissions(): boolean {
    return this.isAdministrador() || this.isGestor();
  }

  // Verificar si puede crear torneos
  canCreateTournaments(): boolean {
    return this.isAdministrador();
  }

  // Verificar si puede cargar resultados
  canLoadResults(): boolean {
    return this.isAdministrador() || this.isRecepcionista();
  }
}