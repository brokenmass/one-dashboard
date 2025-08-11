'use client';

import {useEffect, useState} from 'react';
import {useEditMode} from '@/lib/editMode';

export default function EditModeToggle() {
  const {edit, toggle} = useEditMode();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch on initial SSR
  const checked = mounted ? edit : false;

  return (
    <div className='fixed top-4 right-4 z-50 pointer-events-auto'>
      <button
        type='button'
        role='switch'
        aria-checked={checked}
        onClick={toggle}
        data-testid='edit-mode-toggle'
        className='relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/15'
        style={{
          backgroundColor: checked
            ? 'rgba(16,185,129,0.5)'
            : 'rgba(255,255,255,0.08)',
        }}
        title='Toggle edit mode'
        aria-label='Toggle edit mode'
      >
        <span
          className='inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform'
          style={{
            translate: checked ? '22px 0' : '2px 0',
          }}
        />
      </button>
    </div>
  );
}
