import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { TypeDensity } from './typography';

const TypeDensityContext = createContext<TypeDensity>('default');

/**
 * Scopes a type density to a subtree. `VemtapText` reads it, so a dense hub
 * (e.g. the Account tab) gets smaller type without any per-screen overrides
 * and without forking the text primitive.
 */
export function TypeDensityProvider({
  density,
  children,
}: {
  density: TypeDensity;
  children: ReactNode;
}) {
  const value = useMemo(() => density, [density]);
  return (
    <TypeDensityContext.Provider value={value}>{children}</TypeDensityContext.Provider>
  );
}

export function useTypeDensity(): TypeDensity {
  return useContext(TypeDensityContext);
}
