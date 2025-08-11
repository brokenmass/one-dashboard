'use client';

import Link from 'next/link';
import Image from 'next/image';
import {BookmarkTile} from './Grid';
import dynamic from 'next/dynamic';

const HealthBadge = dynamic(() => import('./HealthBadge'), {ssr: false});

export default function BookmarkCard({
  tile,
  children,
  editable = true,
  actions,
}: {
  tile: BookmarkTile;
  children?: React.ReactNode;
  editable?: boolean;
  actions?: React.ReactNode;
}) {
  // router not needed in this component after refactor

  const isIconOnly = !!tile.iconOnly;
  const linkDisabledClass = editable ? 'pointer-events-none' : '';

  return (
    <div className='h-full w-full flex flex-col relative group'>
      {editable && actions && !isIconOnly ? (
        <div className='absolute top-1.5 right-1.5 z-10 flex items-center gap-1 no-drag'>
          {actions}
        </div>
      ) : null}
      {isIconOnly && (
        <Link
          href={tile.url}
          target='_blank'
          title={tile.name}
          className={`block w-full h-full relative ${linkDisabledClass}`}
          tabIndex={editable ? -1 : undefined}
        >
          <div className='absolute inset-0 flex items-center justify-center'>
            <IconBadge icon={tile.icon ?? ''} size={48} />
          </div>
          <div className='absolute left-0 right-0 bottom-0 translate-y-3/2 group-hover:translate-y-0 transition-transform duration-200 ease-out text-center text-xs bg-black/40 py-1'>
            <span className='px-2'>{tile.name}</span>
          </div>
        </Link>
      )}
      {!isIconOnly && (
        <>
          <div className='flex items-center justify-between gap-2 px-2.5 py-1.5'>
            <div className='min-w-0 flex-1 flex items-center gap-2'>
              {tile.icon && (
                <span className='shrink-0'>
                  <IconBadge icon={tile.icon} />
                </span>
              )}
              {
                <div className='min-w-0'>
                  <div className='font-medium truncate'>
                    <Link
                      href={tile.url}
                      target='_blank'
                      className={`hover:underline ${linkDisabledClass}`}
                      tabIndex={editable ? -1 : undefined}
                    >
                      {tile.name}
                    </Link>
                  </div>
                  {tile.subtext && (
                    <div className='text-xs opacity-70 truncate'>
                      {tile.subtext}
                    </div>
                  )}
                </div>
              }
              {<HealthBadge container={tile.container} />}
            </div>
          </div>
          <div className='flex-1 p-2.5'>{children}</div>
        </>
      )}
    </div>
  );
}

function IconBadge({icon, size = 28}: {icon: string; size?: number}) {
  // Shorthands:
  // dh-XX(.ext) -> Dashboard Icons (default png if no ext)
  // mdi-XX -> Material Design Icons (SVG via CDN)
  // si-XX -> Simple Icons (SVG via CDN)
  // sh-XX(.ext) -> selfh.st icons (default png)
  // Otherwise: treat as a full URL

  const isUrl = /^(https?:)?\/\//i.test(icon);
  let src = '';

  if (isUrl) {
    src = icon;
  } else if (icon.startsWith('dh-')) {
    // homarr-labs/dashboard-icons via jsDelivr
    const base = icon.replace(/^dh-/, '');
    const extMatch = base.match(/\.(svg|png|webp)$/i);
    if (extMatch) {
      const ext = extMatch[1].toLowerCase();
      const name = base.replace(/\.(svg|png|webp)$/i, '');
      src = `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/${ext}/${name}.${ext}`;
    } else {
      src = `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/${base}.png`;
    }
  } else if (icon.startsWith('mdi-')) {
    // Material Design Icons: remove mdi- prefix
    const name = icon.replace(/^mdi-/, '');
    src = `https://unpkg.com/@mdi/svg/svg/${name}.svg`;
  } else if (icon.startsWith('si-')) {
    // Simple Icons: lowercase names
    const name = icon.replace(/^si-/, '').toLowerCase();
    src = `https://unpkg.com/simple-icons@latest/icons/${name}.svg`;
  } else if (icon.startsWith('sh-')) {
    // selfh.st icons
    const base = icon.replace(/^sh-/, '');
    const file = /\.(svg|png|webp)$/i.test(base) ? base : `${base}.png`;
    src = `https://selfh.st/icons/${file}`;
  } else {
    return null;
  }

  return (
    <Image
      src={src}
      alt='icon'
      width={size}
      height={size}
      className='inline-block shrink-0 rounded opacity-90'
    />
  );
}
