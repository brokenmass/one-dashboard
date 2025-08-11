'use client';

import React, {useState} from 'react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  DragOverlay,
  useSensors,
  useDndMonitor,
} from '@dnd-kit/core';
import {closestCenter} from '@dnd-kit/core';

function DndMonitor({
  onDragEnd,
  setActiveId,
}: {
  onDragEnd?: (e: DragEndEvent) => void;
  setActiveId: (id: string | null) => void;
}) {
  useDndMonitor({
    onDragStart: ({active}) => setActiveId((active?.id as string) ?? null),
    onDragEnd: (e) => {
      setActiveId(null);
      onDragEnd?.(e);
    },
    onDragCancel: () => setActiveId(null),
  });
  return null;
}

export function DndProvider({
  children,
  renderOverlay,
  onDragEnd,
}: {
  children: React.ReactNode;
  renderOverlay?: (activeId: string | null) => React.ReactNode;
  onDragEnd?: (e: DragEndEvent) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {distance: 4},
    })
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}>
      <DndMonitor onDragEnd={onDragEnd} setActiveId={setActiveId} />
      {children}
      {renderOverlay ? (
        <DragOverlay
          dropAnimation={null}
          style={{
            pointerEvents: 'none',
            zIndex: 50,
          }}
        >
          {renderOverlay(activeId)}
        </DragOverlay>
      ) : null}
    </DndContext>
  );
}
