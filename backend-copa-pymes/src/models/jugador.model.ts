import { BaseModel } from '../shared/db/baseModel.model';
import { Entity, ManyToMany, Property } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';

@Entity()
export class Jugador extends BaseModel {
    @Property({ nullable: true })
    nombre!: string;

    @Property({ nullable: true })
    apellido!: string;

    @Property({ nullable: true })
    dni!: string;

    @Property({ nullable: true })
    email!: string;

    @Property({ nullable: true, columnType: 'date' })
    fecha_nacimiento!: Date;

}