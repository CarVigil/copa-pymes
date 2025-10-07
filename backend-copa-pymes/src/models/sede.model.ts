import { BaseModel } from '../shared/db/baseModel.model';
import { Entity, ManyToMany, Property } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';

@Entity()
export class Sede extends BaseModel {
    @Property({ nullable: true })
    nombre!: string;

    @Property({ nullable: true })
    ubicacion!: string;

    @Property({ nullable: true })
    capacidad!: string;

}