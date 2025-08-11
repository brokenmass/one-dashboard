'use client';

import {useEffect, useState} from 'react';
import {getContainerHealth} from '@/server/actions';

type Props = {container?: string};

type Health = 'running' | 'exited' | 'stopped' | 'unknown';

export default function HealthBadge({container}: Props) {
  const [state, setState] = useState<Health>('unknown');

  useEffect(() => {
    async function fetchHealth() {
      if (!container) return;
      const s = await getContainerHealth(container);
      setState(s as Health);
    }
    fetchHealth();
    const timer = setInterval(fetchHealth, 15000);
    return () => clearInterval(timer);
  }, [container]);

  if (!container) return null;

  const color =
    state === 'running'
      ? 'bg-green-500'
      : state === 'exited' || state === 'stopped'
      ? 'bg-red-500'
      : 'bg-gray-400';

  return (
    <span className='inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/10'>
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {state}
    </span>
  );
}
