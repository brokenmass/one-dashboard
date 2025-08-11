import {loadAndSyncConfig} from '@/lib/config';
import {BookmarkTile} from '@/components/Grid';
import type {GroupTile} from '@/components/Grid';
import {getEM} from '@/lib/orm';
// Defer importing entities to runtime to avoid duplicate registration in prerender
import ClientDashboard from '@/components/ClientDashboard';
import {Bookmark} from '@/models/Bookmark';
import {Group} from '@/models/Group';

async function getData(): Promise<{
  bookmarks: BookmarkTile[];
  groups: GroupTile[];
}> {
  await loadAndSyncConfig();
  const em = await getEM();

  const [bookmarks, groups] = await Promise.all([
    em.find(Bookmark, {}, {populate: ['widgets', 'group']}),
    em.find(Group, {}, {populate: ['bookmarks', 'bookmarks.widgets']}),
  ]);
  type W = {id: string; type: string; config: Record<string, unknown>};
  type B = {
    id: string;
    name: string;
    url: string;
    icon?: string | null;
    iconOnly: boolean;
    x: number;
    y: number;
    w: number;
    h: number;
    container?: string | null;
    subtext?: string | null;
    widgets: {getItems(): W[]};
    group?: {id: string} | null;
  };
  const topBookmarks: BookmarkTile[] = (bookmarks as B[])
    .filter((b) => !b.group)
    .map((b: B) => ({
      // Types inferred via BookmarkTile
      id: b.id,
      name: b.name,
      url: b.url,
      icon: b.icon ?? undefined,
      iconOnly: b.iconOnly,
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      container: b.container ?? undefined,
      subtext: b.subtext ?? undefined,
      widgets: b.widgets
        .getItems()
        .map((w: W) => ({id: w.id, type: w.type, config: w.config})),
    }));

  type G = {
    id: string;
    name: string;
    icon?: string | null;
    x: number;
    y: number;
    w: number;
    h: number;
    bookmarks: {getItems(): B[]};
  };
  const groupTiles: GroupTile[] = groups.map((g: G) => ({
    id: g.id,
    name: g.name,
    icon: g.icon ?? undefined,
    x: g.x,
    y: g.y,
    w: g.w,
    h: g.h,
    bookmarks: g.bookmarks.getItems().map((b: B) => ({
      id: b.id,
      name: b.name,
      url: b.url,
      icon: b.icon ?? undefined,
      iconOnly: b.iconOnly,
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      container: b.container ?? undefined,
      subtext: b.subtext ?? undefined,
      widgets: b.widgets
        .getItems()
        .map((w: W) => ({id: w.id, type: w.type, config: w.config})),
    })),
  }));

  return {bookmarks: topBookmarks, groups: groupTiles};
}

export default async function DashboardPage() {
  const {bookmarks, groups} = await getData();

  return (
    <div className='p-6 space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>oneDashboard</h1>
        {/* Edit toggle is client-only; rendered inside ClientDashboard */}
      </div>
      <ClientDashboard bookmarks={bookmarks} groups={groups} />
    </div>
  );
}
