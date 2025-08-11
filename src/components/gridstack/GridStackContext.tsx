import {createContext, useContext} from 'react';

// Deprecated: no real grid instance anymore
export const GridStackContext = createContext<unknown>(null);
export function useGridStack() {
  return useContext(GridStackContext);
}
