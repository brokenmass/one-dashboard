'use server';

import {getEM} from '@/lib/orm';
import {Bookmark} from '@/models/Bookmark';
import {Widget} from '@/models/Widget';
import {Group} from '@/models/Group';
import Dockerode from 'dockerode';
export async function createBookmark(input: {
  name: string;
  url: string;
  icon?: string;
  subtext?: string;
  container?: string;
  iconOnly?: boolean;
}) {
  const em = await getEM();
  const bk = em.create(Bookmark, {
    name: input.name,
    url: input.url,
    icon: input.icon ?? null,
    subtext: input.subtext ?? null,
    container: input.container ?? null,
    iconOnly: !!input.iconOnly,
    x: 0,
    y: 0,
    w: 4,
    h: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await em.persistAndFlush(bk);
  return {
    id: bk.id,
    name: bk.name,
    url: bk.url,
    icon: bk.icon ?? null,
    iconOnly: !!bk.iconOnly,
    subtext: bk.subtext ?? null,
    container: bk.container ?? null,
    x: bk.x,
    y: bk.y,
    w: bk.w,
    h: bk.h,
  };
}

export async function updateBookmark(input: {
  id: string;
  name?: string;
  url?: string;
  icon?: string | null;
  subtext?: string | null;
  container?: string | null;
  iconOnly?: boolean;
  groupId?: string | null;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}) {
  const em = await getEM();
  const bk = await em.findOne(Bookmark, {id: input.id});
  if (!bk) throw new Error('not found');
  if (input.name !== undefined) bk.name = input.name;
  if (input.url !== undefined) bk.url = input.url;
  if (input.icon !== undefined) bk.icon = input.icon;
  if (input.subtext !== undefined) bk.subtext = input.subtext;
  if (input.container !== undefined) bk.container = input.container;
  if (input.iconOnly !== undefined) bk.iconOnly = !!input.iconOnly;
  if (input.groupId !== undefined) {
    if (input.groupId === null) {
      bk.group = null;
    } else {
      const g = await em.findOne(Group, {id: input.groupId});
      if (!g) throw new Error('group not found');
      bk.group = g;
    }
  }
  if (input.x !== undefined) bk.x = input.x;
  if (input.y !== undefined) bk.y = input.y;
  if (input.w !== undefined) bk.w = input.w;
  if (input.h !== undefined) bk.h = input.h;
  await em.flush();
  return {
    id: bk.id,
    name: bk.name,
    url: bk.url,
    icon: bk.icon ?? undefined,
    subtext: bk.subtext ?? undefined,
    container: bk.container ?? undefined,
    iconOnly: bk.iconOnly,
    x: bk.x,
    y: bk.y,
    w: bk.w,
    h: bk.h,
  };
}

export async function addWidget(input: {
  bookmarkId: string;
  type: string;
  config?: Record<string, unknown>;
}) {
  const em = await getEM();
  const bk = await em.findOne(Bookmark, {id: input.bookmarkId});
  if (!bk) throw new Error('bookmark not found');
  const widget = em.create(Widget, {
    type: input.type,
    config: input.config ?? {},
    bookmark: bk,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await em.persistAndFlush(widget);
  return {id: widget.id, type: widget.type};
}

export async function updateGroupLayout(input: {
  id: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}) {
  const em = await getEM();
  const g = await em.findOne(Group, {id: input.id});
  if (!g) throw new Error('not found');
  if (input.x !== undefined) g.x = input.x;
  if (input.y !== undefined) g.y = input.y;
  if (input.w !== undefined) g.w = input.w;
  if (input.h !== undefined) g.h = input.h;
  await em.flush();
  return {id: g.id, x: g.x, y: g.y, w: g.w, h: g.h};
}

export async function createGroup(input: {name: string; icon?: string | null}) {
  const em = await getEM();
  const g = em.create(Group, {
    name: input.name,
    icon: input.icon ?? null,
    x: 0,
    y: 0,
    w: 8,
    h: 4,
  });
  await em.persistAndFlush(g);
  return {
    id: g.id,
    name: g.name,
    icon: g.icon ?? null,
    x: g.x,
    y: g.y,
    w: g.w,
    h: g.h,
  };
}

export async function deleteBookmark(id: string) {
  const em = await getEM();
  const bk = await em.findOne(Bookmark, {id}, {populate: ['widgets']});
  if (!bk) return {ok: true};
  for (const w of bk.widgets) em.remove(w);
  em.remove(bk);
  await em.flush();
  return {ok: true};
}

export async function deleteGroup(id: string) {
  const em = await getEM();
  const g = await em.findOne(Group, {id}, {populate: ['bookmarks']});
  if (!g)
    return {
      ok: true,
      moved: [] as Array<{
        id: string;
        name: string;
        url: string;
        icon?: string;
        iconOnly?: boolean;
        subtext?: string;
        container?: string;
        x: number;
        y: number;
        w: number;
        h: number;
      }>,
    };
  const moved: Array<{
    id: string;
    name: string;
    url: string;
    icon?: string;
    iconOnly?: boolean;
    subtext?: string;
    container?: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }> = [];
  for (const b of g.bookmarks) {
    b.group = null;
    // Reset position to let the user place it later
    b.x = 0;
    b.y = 0;
    moved.push({
      id: b.id,
      name: b.name,
      url: b.url,
      icon: b.icon ?? undefined,
      iconOnly: !!b.iconOnly,
      subtext: b.subtext ?? undefined,
      container: b.container ?? undefined,
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
    });
  }
  await em.removeAndFlush(g);
  return {ok: true, moved};
}

export async function getContainerHealth(container?: string) {
  if (!container) return 'unknown' as const;
  try {
    const docker = new Dockerode({socketPath: '/var/run/docker.sock'});
    const c = docker.getContainer(container);
    const info = await c.inspect();
    const state = (info?.State?.Status ?? 'unknown') as
      | 'running'
      | 'exited'
      | 'stopped'
      | 'unknown';
    return state;
  } catch {
    return 'unknown' as const;
  }
}
