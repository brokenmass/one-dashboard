'use client';

import {useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {useEditMode} from '@/lib/editMode';
import {updateBookmark} from '@/server/actions';

export type EditableBookmark = {
  id: string;
  name: string;
  url: string;
  icon?: string;
  iconOnly?: boolean;
  container?: string;
  subtext?: string;
};

export default function EditBookmarkForm({
  bookmark,
  onUpdated,
  trigger,
}: {
  bookmark: EditableBookmark;
  onUpdated: (b: EditableBookmark) => void;
  trigger?: (open: () => void) => React.ReactNode;
}) {
  const edit = useEditMode((s) => s.edit);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(bookmark.name);
  const [url, setUrl] = useState(bookmark.url);
  const [icon, setIcon] = useState(bookmark.icon ?? '');
  const [subtext, setSubtext] = useState(bookmark.subtext ?? '');
  const [container, setContainer] = useState(bookmark.container ?? '');
  const [iconOnly, setIconOnly] = useState(!!bookmark.iconOnly);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPortal = useMemo(() => typeof document !== 'undefined', []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateBookmark({
        id: bookmark.id,
        name,
        url,
        icon: icon || null,
        subtext: subtext || null,
        container: container || null,
        iconOnly,
      });
      onUpdated({
        id: bookmark.id,
        name,
        url,
        icon: icon || undefined,
        subtext: subtext || undefined,
        container: container || undefined,
        iconOnly,
      });
      setOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (!edit) return null;

  const openModal = () => setOpen(true);

  const modalContent = (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      role='dialog'
      aria-modal='true'
    >
      <div className='w-full max-w-lg rounded-xl bg-background/95 backdrop-blur-md border border-white/10 p-4 shadow-xl'>
        <div className='flex items-center justify-between mb-3'>
          <h2 className='text-lg font-semibold'>Edit bookmark</h2>
          <button
            onClick={() => setOpen(false)}
            className='opacity-70'
            aria-label='Close'
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className='grid grid-cols-1 gap-3'>
          <div>
            <label className='block text-sm mb-1'>Name</label>
            <input
              className='w-full rounded border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className='block text-sm mb-1'>URL</label>
            <input
              className='w-full rounded border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              type='url'
            />
          </div>
          <div>
            <label className='block text-sm mb-1'>Icon (optional)</label>
            <input
              className='w-full rounded border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20'
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder='dh-jellyfin, mdi-download, si-github, sh-arr, or URL'
            />
          </div>
          <div>
            <label className='block text-sm mb-1'>Subtext (optional)</label>
            <input
              className='w-full rounded border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20'
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              placeholder='Short description shown under the name'
            />
          </div>
          <div>
            <label className='block text-sm mb-1'>Container (optional)</label>
            <input
              className='w-full rounded border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20'
              value={container}
              onChange={(e) => setContainer(e.target.value)}
              placeholder='qbittorrent'
            />
          </div>
          <div className='flex items-center gap-2'>
            <input
              id='edit-iconOnly'
              type='checkbox'
              checked={iconOnly}
              onChange={(e) => setIconOnly(e.target.checked)}
            />
            <label htmlFor='edit-iconOnly' className='text-sm'>
              Icon only (renders a 1x1 icon tile)
            </label>
          </div>
          {error && <div className='text-red-400 text-sm'>{error}</div>}
          <div className='flex justify-end gap-2 pt-2'>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='h-10 px-4 rounded bg-white/5 hover:bg-white/10'
            >
              Cancel
            </button>
            <button
              className='h-10 px-4 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed'
              type='submit'
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {trigger ? (
        trigger(openModal)
      ) : (
        <button
          onClick={openModal}
          className='text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20'
        >
          Edit
        </button>
      )}
      {open && canPortal ? createPortal(modalContent, document.body) : null}
    </>
  );
}
