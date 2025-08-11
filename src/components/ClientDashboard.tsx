'use client';

import {
  Grid,
  BookmarkTile,
  GridItem,
  GroupTile,
  MIN_W,
  MIN_H,
} from '@/components/Grid';
import {DndProvider} from '@/components/dnd/DndProvider';
import {Draggable} from '@/components/dnd/Draggable';
import type {DragEndEvent} from '@dnd-kit/core';
import BookmarkCard from '@/components/BookmarkCard';
import AddBookmarkForm, {CreatedBookmark} from '@/components/AddBookmarkForm';
import AddGroupForm from '@/components/AddGroupForm';
import EditBookmarkForm, {
  EditableBookmark,
} from '@/components/EditBookmarkForm';
import {widgetRegistry} from '@/modules/widgets';
import '@/modules/widgets/qbittorrent';
import {useState} from 'react';
import {
  addWidget,
  updateBookmark,
  updateGroupLayout,
  deleteBookmark,
} from '@/server/actions';
import {useEditMode} from '@/lib/editMode';

function WidgetPicker({bookmarkId}: {bookmarkId: string}) {
  const [key, setKey] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const mods = Object.values(widgetRegistry);
  async function add() {
    if (!key) return;
    setSaving(true);
    try {
      await addWidget({bookmarkId, type: key, config: {}});
      setKey('');
    } finally {
      setSaving(false);
    }
  }
  if (mods.length === 0) return null;
  return (
    <div className='flex items-center gap-2 mt-2'>
      <select
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className='px-2 py-1 rounded bg-white/5 border border-white/10'
      >
        <option value=''>Add widget…</option>
        {mods.map((m) => (
          <option key={m.key} value={m.key}>
            {m.title}
          </option>
        ))}
      </select>
      <button
        onClick={add}
        disabled={!key || saving}
        className='px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50'
      >
        Add
      </button>
    </div>
  );
}

type CreatedOrUpdated =
  | (BookmarkTile & {subtext?: string})
  | (CreatedBookmark & {subtext?: string | null});

export default function ClientDashboard({
  bookmarks,
  groups,
}: {
  bookmarks: BookmarkTile[];
  groups: GroupTile[];
}) {
  const edit = useEditMode((s) => s.edit);
  const [localBookmarks, setLocalBookmarks] =
    useState<BookmarkTile[]>(bookmarks);
  const [localGroups, setLocalGroups] = useState<GroupTile[]>(groups);

  async function moveBookmarkIntoGroup(id: string, targetGroupId: string) {
    await updateBookmark({id, groupId: targetGroupId, x: 0, y: 0});
    // Find the bookmark to move from current local state (root or any group)
    const fromRoot = localBookmarks.find((b) => b.id === id);
    const fromGroup = localGroups
      .flatMap((g) => g.bookmarks)
      .find((b) => b.id === id);
    const toMove = fromRoot ?? fromGroup;
    // Remove from root list
    setLocalBookmarks((prev) => prev.filter((b) => b.id !== id));
    // Remove from any group and add to target group
    setLocalGroups((prev) =>
      prev.map((g) => {
        let next = g.bookmarks.filter((b) => b.id !== id);
        if (g.id === targetGroupId && toMove) {
          next = [...next, {...toMove, x: 0, y: 0}];
        }
        return {...g, bookmarks: next};
      })
    );
  }

  async function moveBookmarkToRoot(id: string) {
    await updateBookmark({id, groupId: null});
    const moved = localGroups
      .flatMap((g) => g.bookmarks)
      .find((b) => b.id === id);
    // Remove from all groups
    setLocalGroups((prev) =>
      prev.map((g) => ({
        ...g,
        bookmarks: g.bookmarks.filter((b) => b.id !== id),
      }))
    );
    // Add to root list
    if (moved) {
      setLocalBookmarks((prev) =>
        prev.some((b) => b.id === id) ? prev : [...prev, {...moved, x: 0, y: 0}]
      );
    }
  }

  function renderOverlay(activeId: string | null) {
    if (!activeId) return null;
    const bid = activeId.startsWith('bk:')
      ? activeId.replace(/^bk:/, '')
      : activeId;
    const b =
      localBookmarks.find((x) => x.id === bid) ||
      localGroups.flatMap((g) => g.bookmarks).find((x) => x.id === bid);
    if (!b) return null;
    return (
      <div className='pointer-events-none select-none opacity-95 drop-shadow-2xl ring-2 ring-white/20 rounded-lg'>
        <BookmarkCard tile={b} editable={false} />
      </div>
    );
  }

  async function adjustBookmarkSize(id: string, dx: number, dy: number) {
    let updated = false;
    setLocalBookmarks((prev) =>
      prev.map((bb) => {
        if (bb.id !== id) return bb;
        const nw = Math.max(MIN_W, bb.w + dx);
        const nh = Math.max(MIN_H, bb.h + dy);
        updated = true;
        return {...bb, w: nw, h: nh};
      })
    );
    if (!updated) {
      setLocalGroups((prev) =>
        prev.map((g) => ({
          ...g,
          bookmarks: g.bookmarks.map((bb) => {
            if (bb.id !== id) return bb;
            const nw = Math.max(MIN_W, bb.w + dx);
            const nh = Math.max(MIN_H, bb.h + dy);
            return {...bb, w: nw, h: nh};
          }),
        }))
      );
    }
    const all = [...localBookmarks, ...localGroups.flatMap((g) => g.bookmarks)];
    const cur = all.find((bb) => bb.id === id);
    if (cur) {
      const nw = Math.max(MIN_W, cur.w + dx);
      const nh = Math.max(MIN_H, cur.h + dy);
      await updateBookmark({id, w: nw, h: nh});
    }
  }

  async function adjustGroupSize(id: string, dx: number, dy: number) {
    setLocalGroups((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const nw = Math.max(MIN_W, g.w + dx);
        const nh = Math.max(MIN_H, g.h + dy);
        return {...g, w: nw, h: nh};
      })
    );
    const cur = localGroups.find((g) => g.id === id);
    if (cur) {
      const nw = Math.max(MIN_W, cur.w + dx);
      const nh = Math.max(MIN_H, cur.h + dy);
      await updateGroupLayout({id, w: nw, h: nh});
    }
  }

  function toBookmarkItem(b: BookmarkTile): GridItem {
    return {
      type: 'bookmark',
      id: b.id,
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      iconOnly: b.iconOnly,
      content: (
        <Draggable id={`bk:${b.id}`}>
          <BookmarkCard
            tile={b}
            editable={edit}
            actions={
              edit ? (
                <div className='flex items-center gap-1'>
                  <button
                    className='no-drag px-1.5 py-1 rounded-md hover:bg-white/10'
                    title='Decrease width'
                    onClick={() => adjustBookmarkSize(b.id, -1, 0)}
                    aria-label='Decrease width'
                  >
                    W-
                  </button>
                  <button
                    className='no-drag px-1.5 py-1 rounded-md hover:bg-white/10'
                    title='Increase width'
                    onClick={() => adjustBookmarkSize(b.id, +1, 0)}
                    aria-label='Increase width'
                  >
                    W+
                  </button>
                  <button
                    className='no-drag px-1.5 py-1 rounded-md hover:bg-white/10'
                    title='Decrease height'
                    onClick={() => adjustBookmarkSize(b.id, 0, -1)}
                    aria-label='Decrease height'
                  >
                    H-
                  </button>
                  <button
                    className='no-drag px-1.5 py-1 rounded-md hover:bg-white/10'
                    title='Increase height'
                    onClick={() => adjustBookmarkSize(b.id, 0, +1)}
                    aria-label='Increase height'
                  >
                    H+
                  </button>
                  <EditBookmarkForm
                    bookmark={{
                      id: b.id,
                      name: b.name,
                      url: b.url,
                      icon: b.icon,
                      iconOnly: b.iconOnly,
                      container: b.container,
                    }}
                    onUpdated={(nb: EditableBookmark & {subtext?: string}) =>
                      setLocalBookmarks((prev) =>
                        prev.map((it) =>
                          it.id === nb.id
                            ? {
                                ...it,
                                name: nb.name,
                                url: nb.url,
                                icon: nb.icon,
                                subtext: nb.subtext,
                                iconOnly: nb.iconOnly,
                                container: nb.container,
                              }
                            : it
                        )
                      )
                    }
                    trigger={(open: () => void) => (
                      <button
                        onClick={open}
                        aria-label='Edit bookmark'
                        className='no-drag p-1.5 rounded-md hover:bg-white/10 text-white/80 hover:text-white/95'
                        title='Edit'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                          fill='currentColor'
                          className='h-4 w-4'
                        >
                          <path d='M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712z' />
                          <path d='M17.069 4.931 4.5 17.5V21h3.5L20.569 7.931l-3.5-3z' />
                        </svg>
                      </button>
                    )}
                  />
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete ${b.name}?`)) return;
                      await deleteBookmark(b.id);
                      setLocalBookmarks((prev) =>
                        prev.filter((x) => x.id !== b.id)
                      );
                    }}
                    aria-label='Delete bookmark'
                    className='no-drag p-1.5 rounded-md hover:bg-red-500/20 text-red-300 hover:text-red-200'
                    title='Delete'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      className='h-4 w-4'
                    >
                      <path d='M9 3h6a1 1 0 0 1 1 1v1h4v2H4V5h4V4a1 1 0 0 1 1-1z' />
                      <path d='M6 9h12l-1 10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9z' />
                    </svg>
                  </button>
                </div>
              ) : null
            }
          >
            {!b.iconOnly && b.widgets && b.widgets.length > 0
              ? b.widgets.map((w) => {
                  const mod = widgetRegistry[w.type];
                  if (!mod) {
                    return (
                      <div key={w.id} className='text-xs opacity-60'>
                        Unknown widget: {w.type}
                      </div>
                    );
                  }
                  return <mod.Component key={w.id} bookmarkId={b.id} />;
                })
              : null}
            {edit && <WidgetPicker bookmarkId={b.id} />}
          </BookmarkCard>
        </Draggable>
      ),
    };
  }

  function toGroupItem(g: GroupTile): GridItem {
    return {
      type: 'group',
      id: g.id,
      x: g.x,
      y: g.y,
      w: g.w,
      h: g.h,
      title: g.name,
      icon: g.icon,
      headerRight: edit ? (
        <div className='flex items-center gap-1'>
          <button
            className='no-drag px-1.5 py-1 rounded-md hover:bg-white/10'
            title='Decrease width'
            onClick={() => adjustGroupSize(g.id, -1, 0)}
            aria-label='Decrease group width'
          >
            W-
          </button>
          <button
            className='no-drag px-1.5 py-1 rounded-md hover:bg-white/10'
            title='Increase width'
            onClick={() => adjustGroupSize(g.id, +1, 0)}
            aria-label='Increase group width'
          >
            W+
          </button>
          <button
            className='no-drag px-1.5 py-1 rounded-md hover:bg-white/10'
            title='Decrease height'
            onClick={() => adjustGroupSize(g.id, 0, -1)}
            aria-label='Decrease group height'
          >
            H-
          </button>
          <button
            className='no-drag px-1.5 py-1 rounded-md hover:bg-white/10'
            title='Increase height'
            onClick={() => adjustGroupSize(g.id, 0, +1)}
            aria-label='Increase group height'
          >
            H+
          </button>
        </div>
      ) : undefined,
      children: g.bookmarks.map(toBookmarkItem),
    };
  }

  const rootItems: GridItem[] = [
    ...localGroups.map(toGroupItem),
    ...localBookmarks.map(toBookmarkItem),
  ];

  async function onDndEnd(e: DragEndEvent) {
    if (!edit) return;
    const activeId = e.active?.id as string | undefined;
    const overId = e.over?.id as string | undefined;
    if (!activeId) return;
    if (!activeId.startsWith('bk:')) return;
    const bid = activeId.replace(/^bk:/, '');
    if (overId && overId.startsWith('grp:')) {
      const gid = overId.replace(/^grp:/, '');
      await moveBookmarkIntoGroup(bid, gid);
      return;
    }
    await moveBookmarkToRoot(bid);
  }

  return (
    <DndProvider onDragEnd={onDndEnd} renderOverlay={renderOverlay}>
      <div className='flex items-center justify-between gap-2'>
        <AddBookmarkForm
          onCreated={(b: CreatedOrUpdated) =>
            setLocalBookmarks((prev) => [
              ...prev,
              {
                id: b.id,
                name: b.name,
                url: b.url,
                icon: 'icon' in b ? b.icon ?? undefined : undefined,
                iconOnly: 'iconOnly' in b ? !!b.iconOnly : false,
                subtext: 'subtext' in b ? b.subtext ?? undefined : undefined,
                x: b.x,
                y: b.y,
                w: b.w,
                h: b.h,
                container: b.container ?? undefined,
                widgets: [],
              },
            ])
          }
        />
      </div>

      <div className='mt-3'>
        <AddGroupForm
          onCreated={(g) =>
            setLocalGroups((prev) => [
              ...prev,
              {
                id: g.id,
                name: g.name,
                icon: g.icon ?? undefined,
                x: g.x,
                y: g.y,
                w: g.w,
                h: g.h,
                bookmarks: [],
              },
            ])
          }
        />
      </div>

      <div className='mt-6' data-testid='bookmarks-grid'>
        <Grid items={rootItems} />
      </div>
    </DndProvider>
  );
}
