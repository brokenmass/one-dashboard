'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useDraggable} from '@dnd-kit/core';

export function Draggable({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => setMounted(true), []);

  const {attributes, listeners, setNodeRef, isDragging} = useDraggable({id});

  // Reflect dragging state on the tile container (parent element) for backdrop styling
  useEffect(() => {
    const parent = wrapperRef.current?.parentElement;
    if (!parent) return;
    if (isDragging) parent.setAttribute('data-dragging', 'true');
    else parent.removeAttribute('data-dragging');
  }, [isDragging]);

  return (
    <div
      ref={(el) => {
        wrapperRef.current = el;
        setNodeRef(el);
      }}
      data-dragging={isDragging ? 'true' : undefined}
      suppressHydrationWarning
      {...(mounted ? attributes : {})}
      {...(mounted ? listeners : {})}
    >
      {children}
    </div>
  );
}
