import { BaseModel } from '../shared/db/baseModel.model';
import { Entity, ManyToMany, Property } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';

@Entity()
export class Torneo extends BaseModel {
    @Property({ nullable: true })
    nombre!: string;

    @Property({ nullable: true })
    tipo!: string;

    @Property({ nullable: true })
    modalidad!: string;

    @Property({ nullable: true, columnType: 'date' })
    fecha_inicio!: Date;

    @Property({ nullable: true, columnType: 'date' })
    fecha_fin!: Date;

}