/**
 * LayoutContext — shared UI layout state.
 *
 * Currently tracks navCollapsed (sidebar expanded/collapsed).
 * Persists to localStorage so the user's preference survives page reloads.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "atlas-layout-v1";

interface LayoutContextValue {
  navCollapsed: boolean;
  toggleNav: () => void;
}

const LayoutContext = createContext<LayoutContextValue>({
  navCollapsed: false,
  toggleNav: () => {},
});

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [navCollapsed, setNavCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, navCollapsed ? "1" : "0");
    } catch {
      // localStorage unavailable (private browsing, etc.) — silently ignore
    }
  }, [navCollapsed]);

  const toggleNav = () => setNavCollapsed((c) => !c);

  return (
    <LayoutContext.Provider value={{ navCollapsed, toggleNav }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext);
