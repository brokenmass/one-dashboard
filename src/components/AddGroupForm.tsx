'use client';

import {useState} from 'react';
import {createGroup} from '@/server/actions';

export default function AddGroupForm({
  onCreated,
}: {
  onCreated: (g: {
    id: string;
    name: string;
    icon?: string | null;
    x: number;
    y: number;
    w: number;
    h: number;
  }) => void;
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const g = await createGroup({
        name: name.trim(),
        icon: icon.trim() || null,
      });
      onCreated(g);
      setName('');
      setIcon('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className='flex items-center gap-2'>
      <input
        className='h-10 px-3 rounded bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-white/20'
        placeholder='Group name'
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className='h-10 px-3 rounded bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-white/20'
        placeholder='Icon (optional)'
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
      />
      <button
        type='submit'
        disabled={saving}
        className='h-10 px-3 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50'
      >
        Add group
      </button>
    </form>
  );
}
