import {Entity, PrimaryKey, Property} from '@mikro-orm/core';

@Entity()
export class Setting {
  static readonly entityName = 'Setting';
  @PrimaryKey()
  id: number = 1;

  @Property({type: 'string', nullable: true})
  yamlPath?: string | null;
}
