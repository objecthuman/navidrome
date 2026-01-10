import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { MusicPlayer } from "./components/MusicPlayer";
import { QueueSidebar } from "./components/QueueSidebar";
import { AppProvider } from "./contexts/AppContext";
import { authService } from "./services/auth";
import { audioPlayer } from "./services/audioPlayer";
import { navidromeService } from "./services/navidrome";
import type { NavidromeQueueItem } from "./services/navidrome";

const SIDEBAR_COLLAPSED_KEY = "navidrome_sidebar_collapsed";

function App() {
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Always collapsed on mobile (768px and below)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return true;
    }
    // Load sidebar state from localStorage for desktop
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return saved ? JSON.parse(saved) : false;
  });
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [queue, setQueue] = useState<NavidromeQueueItem[]>([]);
  const [currentSongId, setCurrentSongId] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);

  // Save sidebar state to localStorage whenever it changes (only on desktop)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      localStorage.setItem(
        SIDEBAR_COLLAPSED_KEY,
        JSON.stringify(isSidebarCollapsed),
      );
    }
  }, [isSidebarCollapsed]);

  // Handle mobile sidebar close event
  useEffect(() => {
    const handleCloseSidebar = () => setIsSidebarCollapsed(true);
    document.addEventListener("close-mobile-sidebar", handleCloseSidebar);
    return () => {
      document.removeEventListener("close-mobile-sidebar", handleCloseSidebar);
    };
  }, []);

  // Fetch queue on mount
  useEffect(() => {
    const fetchQueue = async () => {
      if (!authService.isAuthenticated()) return;

      try {
        const queueData = await navidromeService.getQueue();

        if (queueData.items && queueData.items.length > 0) {
          const currentIndex =
            queueData.current !== undefined && queueData.current >= 0
              ? queueData.current
              : 0;
          const currentItem = queueData.items[currentIndex];

          if (currentItem) {
            setQueue(queueData.items);
            setCurrentSongId(currentItem.id);
            audioPlayer.preload(currentItem.id);
          }
        } else {
          setQueue([]);
        }
      } catch (error) {
        console.error("Failed to fetch queue:", error);
        setQueue([]);
      }
    };

    fetchQueue();
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const handleNavigateToAlbum = useCallback(
    (albumId: string) => {
      navigate(`/album/${albumId}`);
    },
    [navigate],
  );

  const handlePlaySong = useCallback(
    (songId: string) => {
      const song = queue.find((item) => item.id === songId);

      if (song) {
        setCurrentSongId(songId);
        setIsPlaying(true);
        audioPlayer.play(songId);
      }
    },
    [queue],
  );

  const handleQueueUpdate = useCallback(
    (
      newQueue: NavidromeQueueItem[],
      newCurrentSongId: string,
      newIsPlaying: boolean,
    ) => {
      setQueue(newQueue);
      setCurrentSongId(newCurrentSongId);
      setIsPlaying(newIsPlaying);
    },
    [],
  );

  const handleToggleQueue = useCallback(() => {
    setIsQueueOpen((prev) => !prev);
  }, []);

  const handleCloseQueue = useCallback(() => {
    setIsQueueOpen(false);
  }, []);

  const handleClearQueue = useCallback(async () => {
    try {
      await navidromeService.clearQueue();
      setQueue([]);
      setCurrentSongId("");
      setIsPlaying(false);
      audioPlayer.stop();
    } catch (error) {
      console.error("Failed to clear queue:", error);
    }
  }, []);

  // Context value to share with child components
  const contextValue = {
    queue,
    currentSongId,
    isPlaying,
    isQueueOpen,
    setQueue,
    setCurrentSongId,
    setIsPlaying,
    setIsQueueOpen,
    onPlaySong: handlePlaySong,
    onQueueUpdate: handleQueueUpdate,
    onToggleQueue: handleToggleQueue,
    onClearQueue: handleClearQueue,
    onNavigateToAlbum: handleNavigateToAlbum,
  };

  return (
    <AppProvider value={contextValue}>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
        />

        <Sidebar isCollapsed={isSidebarCollapsed} />

        <QueueSidebar
          isOpen={isQueueOpen}
          queue={queue}
          currentSongId={currentSongId}
          isPlaying={isPlaying}
          onClose={handleCloseQueue}
          onPlaySong={handlePlaySong}
          onClearQueue={handleClearQueue}
        />

        {/* Main content area where child routes will render */}
        <main
          className={`pt-20 px-4 md:px-6 pb-24 md:pb-8 transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? "md:ml-16" : "md:ml-64"}
            ${isQueueOpen ? "md:mr-80" : "md:mr-6"}
          `}
        >
          <Outlet />
        </main>

        <MusicPlayer
          isQueueOpen={isQueueOpen}
          onToggleQueue={handleToggleQueue}
          onQueueUpdate={handleQueueUpdate}
          queue={queue}
          currentSongId={currentSongId}
          isPlaying={isPlaying}
        />
      </div>
    </AppProvider>
  );
}

export default App;
