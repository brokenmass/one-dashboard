// Legacy Gridstack provider removed. This placeholder prevents import errors during refactor.
export type GridProviderProps = React.PropsWithChildren<unknown>;
export function GridStackProvider({children}: GridProviderProps) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('GridStackProvider is deprecated and no longer used.');
  }
  return <>{children}</>;
}
