import 'reflect-metadata';
import {beforeEach} from 'vitest';
import {__resetORMForTests} from '@/lib/orm';

process.env.ONE_DASHBOARD_DB = ':memory:';

beforeEach(async () => {
  await __resetORMForTests();
});
