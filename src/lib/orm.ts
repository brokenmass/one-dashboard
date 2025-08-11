import 'reflect-metadata';
import {
  MikroORM,
  EntityManager,
  ReflectMetadataProvider,
} from '@mikro-orm/core';
import {SqliteDriver} from '@mikro-orm/sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {Bookmark} from '@/models/Bookmark';
import {Widget} from '@/models/Widget';
import {Setting} from '@/models/Setting';
import {Group} from '@/models/Group';

// Ensure single ORM instance across RSC/prerender and dev HMR
type GlobalWithORM = typeof globalThis & {
  __oneDashboardOrm?: MikroORM<SqliteDriver>;
};
const globalWithORM = globalThis as GlobalWithORM;

const isMemoryDsn = (v: string) => v === ':memory:';

export async function getORM() {
  if (globalWithORM.__oneDashboardOrm) return globalWithORM.__oneDashboardOrm;

  // Determine DB location. Prefer explicit env. For tests default to in-memory.
  const dbFile = process.env.ONE_DASHBOARD_DB || 'data/dev.db';

  // Only create folder for real file paths
  const needsDir = !isMemoryDsn(dbFile);
  if (needsDir) {
    const dbPath = dirname(dbFile);
    try {
      mkdirSync(dbPath, {recursive: true});
    } catch {}
  }

  const orm = await MikroORM.init<SqliteDriver>({
    // Register entities statically to match server action imports
    entities: [Bookmark, Widget, Setting, Group],
    dbName: dbFile,
    driver: SqliteDriver,
    metadataProvider: ReflectMetadataProvider,
    baseDir: process.cwd(),
    migrations: {path: 'migrations'},
  });

  // Ensure schema exists (development convenience)
  try {
    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();
  } catch {}

  globalWithORM.__oneDashboardOrm = orm;
  return orm;
}

export async function getEM() {
  const orm = await getORM();
  return orm.em.fork() as EntityManager;
}

// Test-only helper to reset ORM singleton and close connections between tests
export async function __resetORMForTests() {
  const g = globalWithORM;
  if (g.__oneDashboardOrm) {
    await g.__oneDashboardOrm.close(true);
    delete g.__oneDashboardOrm;
  }
}
