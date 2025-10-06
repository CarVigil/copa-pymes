import { BaseModel } from '../shared/db/baseModel.model';
import { Entity, Property, Enum, BeforeCreate, BeforeUpdate } from '@mikro-orm/core';
import * as bcrypt from 'bcryptjs';

export enum UsuarioRole {
  ADMIN = 'admin',
  JUGADOR = 'jugador'
}

@Entity()
export class Usuario extends BaseModel {
  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @Property()
  nombre!: string;

  @Property()
  apellido!: string;

  @Enum(() => UsuarioRole)
  role: UsuarioRole = UsuarioRole.JUGADOR;

  @Property({ default: true })
  activo: boolean = true;

  @Property({ nullable: true })
  ultimo_login?: Date;

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
}