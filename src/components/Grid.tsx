'use client';

import React from 'react';
import {Droppable} from '@/components/dnd/Droppable';

// Grid constants
export const COLS = 16;
export const ROW_HEIGHT = 60; // px
export const MARGIN: [number, number] = [8, 8];
export const MIN_W = 1;
export const MIN_H = 1;

export type GroupTile = LayoutTile & {
  id: string;
  name: string;
  icon?: string | null;
  bookmarks: BookmarkTile[];
};

export type BookmarkWidget = {
  id: string;
  type: string;
  config: Record<string, unknown>;
};

export type BookmarkTile = {
  id: string;
  name: string;
  url: string;
  icon?: string;
  iconOnly?: boolean;
  subtext?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  container?: string;
  widgets?: BookmarkWidget[];
};

export type LayoutTile = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  iconOnly?: boolean;
};

export type GridBookmarkItem = LayoutTile & {
  type: 'bookmark';
  content: React.ReactNode;
};

export type GridGroupItem = LayoutTile & {
  type: 'group';
  title: string;
  icon?: string | null;
  headerRight?: React.ReactNode;
  children: GridItem[];
};

export type GridItem = GridBookmarkItem | GridGroupItem;

export function Grid({items}: {items: GridItem[]}) {
  return (
    <div
      className='layout grid gap-2'
      style={{
        gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
        gridAutoRows: `${ROW_HEIGHT}px`,
      }}
    >
      {items.map((t) => {
        if (t.type === 'group') {
          return (
            <div
              key={t.id}
              data-grid-id={t.id}
              data-group-id={t.id}
              className={
                'rounded-lg bg-white/[0.04] border border-white/10 overflow-hidden shadow-sm backdrop-blur-sm relative'
              }
              style={{
                gridColumnEnd: `span ${t.w || 1}`,
                gridRowEnd: `span ${t.h || 1}`,
              }}
            >
              <div className='flex items-center justify-between gap-2 px-3 py-2'>
                <div className='min-w-0 flex-1 flex items-center gap-2'>
                  {t.icon && <span className='opacity-80'>📁</span>}
                  <div className='font-medium truncate'>{t.title}</div>
                </div>
                {t.headerRight ?? null}
              </div>
              <Droppable id={`grp:${t.id}`}>
                <div
                  className='grid gap-2 p-2'
                  style={{
                    gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                    gridAutoRows: `${ROW_HEIGHT}px`,
                  }}
                >
                  <Grid items={t.children} />
                </div>
              </Droppable>
              {/* simple bottom-right resize affordance (visual only) */}
              <div
                className='absolute right-1.5 bottom-1.5 h-3 w-3 border-r-2 border-b-2 border-white/30 opacity-60 pointer-events-none'
                aria-hidden
              />
            </div>
          );
        }
        const isIconOnly = !!t.iconOnly;
        return (
          <div
            key={t.id}
            data-grid-id={t.id}
            className={
              'rounded-lg bg-white/[0.04] border border-white/10 overflow-hidden shadow-sm backdrop-blur-sm transition-colors hover:bg-white/[0.06] relative data-[dragging=true]:opacity-40 data-[dragging=true]:ring-2 data-[dragging=true]:ring-white/20' +
              (isIconOnly ? ' flex items-center justify-center p-2' : '')
            }
            style={{
              gridColumnEnd: `span ${t.w || 1}`,
              gridRowEnd: `span ${t.h || 1}`,
            }}
          >
            {t.content}
            {/* simple bottom-right resize affordance (visual only) */}
            <div
              className='absolute right-1.5 bottom-1.5 h-3 w-3 border-r-2 border-b-2 border-white/30 opacity-60 pointer-events-none'
              aria-hidden
            />
          </div>
        );
      })}
    </div>
  );
}
