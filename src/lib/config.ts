import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import {z} from 'zod';
import {getEM} from './orm';
import {Bookmark} from '@/models/Bookmark';
import {Widget} from '@/models/Widget';
import {Setting} from '@/models/Setting';
// import { Group } from '@/models/Group';

const WidgetSchema = z.object({
  type: z.string(),
  config: z.record(z.string(), z.any()).optional().default({}),
});

const BookmarkSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  icon: z.string().optional(),
  iconOnly: z.boolean().optional(),
  subtext: z.string().optional(),
  container: z.string().optional(),
  x: z.number().int().nonnegative().optional(),
  y: z.number().int().nonnegative().optional(),
  w: z.number().int().positive().optional(),
  h: z.number().int().positive().optional(),
  widgets: z.array(WidgetSchema).optional().default([]),
});

const ConfigSchema = z.object({
  bookmarks: z.array(BookmarkSchema).default([]),
});

function defaultYamlPath() {
  return path.join(process.cwd(), 'config', 'one-dashboard.yaml');
}

export async function loadAndSyncConfig(): Promise<void> {
  // Determine YAML path from DB setting or default
  let configPath = defaultYamlPath();
  try {
    const em = await getEM();
    const setting = await em.findOne(Setting, {});
    configPath = setting?.yamlPath ?? configPath;
  } catch {
    // DB not ready; skip
    return;
  }

  let parsed: z.infer<typeof ConfigSchema> | null = null;
  try {
    const raw = await fs.readFile(configPath, 'utf-8');
    const data = yaml.load(raw);
    parsed = ConfigSchema.parse(data ?? {});
  } catch {
    // If file not found or invalid, skip syncing silently
    return;
  }

  if (!parsed) return;

  try {
    const em = await getEM();
    for (const b of parsed.bookmarks) {
      const found = await em.findOne(
        Bookmark,
        {name: b.name, url: b.url},
        {populate: ['widgets']}
      );
      if (!found) {
        const created = em.create(Bookmark, {
          name: b.name,
          url: b.url,
          icon: b.icon ?? null,
          iconOnly: b.iconOnly ?? false,
          container: b.container ?? null,
          subtext: b.subtext ?? null,
          x: b.x ?? 0,
          y: b.y ?? 0,
          w: b.w ?? 4,
          h: b.h ?? 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        em.persist(created);
        for (const w of b.widgets ?? []) {
          const wid = em.create(Widget, {
            type: w.type,
            config: w.config ?? {},
            bookmark: created,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          em.persist(wid);
        }
      } else {
        found.icon = b.icon ?? found.icon ?? null;
        found.iconOnly = b.iconOnly ?? found.iconOnly ?? false;
        found.container = b.container ?? found.container ?? null;
        found.subtext = b.subtext ?? found.subtext ?? null;
        // keep layout
        em.persist(found);
        if (b.widgets && b.widgets.length) {
          const existing = found.widgets.getItems() as Widget[];
          for (const w of b.widgets) {
            const exists = existing.find((ew: Widget) => ew.type === w.type);
            if (!exists) {
              const wid = em.create(Widget, {
                type: w.type,
                config: w.config ?? {},
                bookmark: found,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              em.persist(wid);
            }
          }
        }
      }
    }
    await em.flush();
  } catch {
    return;
  }
}
