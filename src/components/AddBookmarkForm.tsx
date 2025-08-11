'use client';

import {useState} from 'react';
// import {useRouter} from 'next/navigation';
import {useEditMode} from '@/lib/editMode';
import {createBookmark} from '@/server/actions';

export type CreatedBookmark = {
  id: string;
  name: string;
  url: string;
  icon: string | null;
  iconOnly: boolean;
  subtext: string | null;
  container: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
};

export default function AddBookmarkForm({
  onCreated,
}: {
  onCreated?: (b: CreatedBookmark) => void;
}) {
  const edit = useEditMode((s) => s.edit);
  // const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [subtext, setSubtext] = useState('');
  const [container, setContainer] = useState('');
  const [iconOnly, setIconOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await createBookmark({
        name,
        url,
        icon: icon || undefined,
        subtext: subtext || undefined,
        container: container || undefined,
        iconOnly,
      });
      setName('');
      setUrl('');
      setIcon('');
      setSubtext('');
      setContainer('');
      setIconOnly(false);
      setOpen(false);
      onCreated?.(created);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (!edit) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className='h-10 px-4 rounded bg-white/10 hover:bg-white/20 border border-white/10'
      >
        + Add bookmark
      </button>
      {open && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
          role='dialog'
          aria-modal='true'
        >
          <div className='w-full max-w-lg rounded-xl bg-background/95 backdrop-blur-md border border-white/10 p-4 shadow-xl'>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-lg font-semibold'>Add bookmark</h2>
              <button onClick={() => setOpen(false)} className='opacity-70'>
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
                  placeholder='My Service'
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
                  placeholder='http://localhost:3000'
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
                <p className='text-xs opacity-70 mt-1'>
                  Supports dh-*, mdi-*, si-*, sh-* shorthands or a full image
                  URL.
                </p>
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
              <div className='flex items-center gap-2'>
                <input
                  id='iconOnly'
                  type='checkbox'
                  checked={iconOnly}
                  onChange={(e) => setIconOnly(e.target.checked)}
                />
                <label htmlFor='iconOnly' className='text-sm'>
                  Icon only (renders a 1x1 icon tile)
                </label>
              </div>
              <div>
                <label className='block text-sm mb-1'>
                  Container (optional)
                </label>
                <input
                  className='w-full rounded border border-white/10 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20'
                  value={container}
                  onChange={(e) => setContainer(e.target.value)}
                  placeholder='qbittorrent'
                />
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
                  {saving ? 'Adding…' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
