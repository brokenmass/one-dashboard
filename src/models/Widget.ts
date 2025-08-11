import {Entity, PrimaryKey, Property, ManyToOne} from '@mikro-orm/core';
import {randomUUID} from 'node:crypto';
import {Bookmark} from './Bookmark';

@Entity()
export class Widget {
  static readonly entityName = 'Widget';
  @PrimaryKey({type: 'string'})
  id: string = randomUUID();

  @Property({type: 'string'})
  type!: string;

  @Property({type: 'json'})
  config: Record<string, unknown> = {};

  @ManyToOne(() => Bookmark, {nullable: true})
  bookmark?: Bookmark | null;

  @Property({type: 'date', onCreate: () => new Date()})
  createdAt: Date = new Date();

  @Property({type: 'date', onUpdate: () => new Date()})
  updatedAt: Date = new Date();
}
