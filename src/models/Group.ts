import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import {randomUUID} from 'node:crypto';
import {Bookmark} from './Bookmark';

@Entity()
export class Group {
  static readonly entityName = 'Group';
  @PrimaryKey({type: 'string'})
  id: string = randomUUID();

  @Property({type: 'string'})
  name!: string;

  @Property({type: 'string', nullable: true})
  icon?: string | null;

  @Property({type: 'number', default: 0})
  x: number = 0;

  @Property({type: 'number', default: 0})
  y: number = 0;

  @Property({type: 'number', default: 8})
  w: number = 8;

  @Property({type: 'number', default: 4})
  h: number = 4;

  @OneToMany(() => Bookmark, (b) => b.group)
  bookmarks = new Collection<Bookmark>(this);
}
