import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  ManyToOne,
} from '@mikro-orm/core';
import {randomUUID} from 'node:crypto';
import {Widget} from './Widget';
import {Group} from './Group';

@Entity()
export class Bookmark {
  static readonly entityName = 'Bookmark';
  @PrimaryKey({type: 'string'})
  id: string = randomUUID();

  @Property({type: 'string'})
  name!: string;

  @Property({type: 'string'})
  url!: string;

  @Property({type: 'string', nullable: true})
  icon?: string | null;

  @Property({type: 'boolean', default: false})
  iconOnly: boolean = false;

  @Property({type: 'string', nullable: true})
  container?: string | null;

  @Property({type: 'number', default: 0})
  x: number = 0;

  @Property({type: 'number', default: 0})
  y: number = 0;

  @Property({type: 'number', default: 4})
  w: number = 4;

  @Property({type: 'number', default: 2})
  h: number = 2;

  @Property({type: 'string', nullable: true})
  subtext?: string | null;

  @Property({type: 'date', onCreate: () => new Date()})
  createdAt: Date = new Date();

  @Property({type: 'date', onUpdate: () => new Date()})
  updatedAt: Date = new Date();

  @OneToMany(() => Widget, (w) => w.bookmark)
  widgets = new Collection<Widget>(this);

  @ManyToOne(() => Group, {nullable: true})
  group?: Group | null;
}
