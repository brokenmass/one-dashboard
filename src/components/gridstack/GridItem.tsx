// Legacy Gridstack component removed. Kept as a no-op placeholder to avoid import errors.
// Do not use.
export type GridItemProps = never;
export function GridItem(): null {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('GridItem is deprecated and no longer used.');
  }
  return null;
}
