import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { NavidromeQueueItem } from "../services/navidrome";

interface AppContextType {
  queue: NavidromeQueueItem[];
  currentSongId: string;
  isPlaying: boolean;
  isQueueOpen: boolean;
  setQueue: (queue: NavidromeQueueItem[]) => void;
  setCurrentSongId: (id: string) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsQueueOpen: (open: boolean) => void;
  onPlaySong: (songId: string) => void;
  onQueueUpdate: (
    queue: NavidromeQueueItem[],
    currentSongId: string,
    isPlaying: boolean,
  ) => void;
  onToggleQueue: () => void;
  onClearQueue: () => void;
  onNavigateToAlbum: (albumId: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
  value: AppContextType;
}

export function AppProvider({ children, value }: AppProviderProps) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
