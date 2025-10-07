import { Entity, Property } from '@mikro-orm/core';
import { BaseModel } from '../shared/db/baseModel.model';

@Entity()
export class Equipo extends BaseModel {
    @Property()
    nombre!: string;

    @Property()
    sigla!: string;

    @Property({ default: true })
    estado!: boolean;

    @Property({ nullable: true })
    escudo?: string;
}