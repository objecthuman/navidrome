import { useState, useEffect, useCallback } from 'react'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { MusicPlayer } from './components/MusicPlayer'
import { QueueSidebar } from './components/QueueSidebar'
import { AlbumSlideshow } from './components/AlbumSlideshow'
import { MostPlayed } from './components/MostPlayed'
import { RecentlyPlayed } from './components/RecentlyPlayed'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { authService } from './services/auth'
import { audioPlayer } from './services/audioPlayer'
import { navidromeService } from './services/navidrome'
import type { NavidromeQueueItem } from './services/navidrome'

type Page = 'login' | 'signup' | 'home'

const SIDEBAR_COLLAPSED_KEY = 'navidrome_sidebar_collapsed'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Always collapsed on mobile (768px and below)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return true
    }
    // Load sidebar state from localStorage for desktop
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    return saved ? JSON.parse(saved) : false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isQueueOpen, setIsQueueOpen] = useState(false)
  const [queue, setQueue] = useState<NavidromeQueueItem[]>([])
  const [currentSongId, setCurrentSongId] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)

  // Save sidebar state to localStorage whenever it changes (only on desktop)
  useEffect(() => {
    // Only save to localStorage on desktop (768px and above)
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(isSidebarCollapsed))
    }
  }, [isSidebarCollapsed])

  // Check authentication on load
  useEffect(() => {
    const isAuthenticated = authService.isAuthenticated()
    if (isAuthenticated) {
      setCurrentPage('home')
    }
    setIsLoading(false)

    // Handle mobile sidebar close event
    const handleCloseSidebar = () => setIsSidebarCollapsed(true)
    document.addEventListener('close-mobile-sidebar', handleCloseSidebar)
    return () => {
      document.removeEventListener('close-mobile-sidebar', handleCloseSidebar)
    }
  }, [])

  // Fetch queue on mount (when authenticated)
  useEffect(() => {
    const fetchQueue = async () => {
      if (!authService.isAuthenticated()) return

      try {
        const queue = await navidromeService.getQueue()

        // Get current song from queue
        if (queue.items && queue.items.length > 0) {
          // Use current index if available and valid, otherwise use first song
          const currentIndex = queue.current !== undefined && queue.current >= 0 ? queue.current : 0
          const currentItem = queue.items[currentIndex]

          if (currentItem) {
            setQueue(queue.items)
            setCurrentSongId(currentItem.id)

            // Preload the audio so seeking works immediately
            audioPlayer.preload(currentItem.id)

            // Set current position from queue (in seconds)
            if (queue.position) {
              // We could set initial position here, but let's start from 0
            }
          }
        } else {
          setQueue([])
        }

        console.log('Queue loaded:', queue)
      } catch (error) {
        console.error('Failed to fetch queue:', error)
        setQueue([])
      }
    }

    fetchQueue()
  }, [])

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev)
  }

  const handleLogin = async (username: string, password: string) => {
    setLoginError(null)
    try {
      await authService.login({ username, password })
      setCurrentPage('home')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed')
      console.error('Login error:', error)
    }
  }

  const handleSignup = (username: string, password: string) => {
    console.log('Signup:', { username, password })
    // TODO: Implement actual signup logic
    setCurrentPage('home')
  }

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev)
  }, [])

  const handlePlaySong = useCallback((songId: string) => {
    // Find the song in the queue
    const song = queue.find(item => item.id === songId)

    if (song) {
      // Update current song state
      setCurrentSongId(songId)
      setIsPlaying(true)

      // Play the song using audio player
      audioPlayer.play(songId)
    }
  }, [queue])

  const handleQueueUpdate = useCallback((newQueue: NavidromeQueueItem[], newCurrentSongId: string, newIsPlaying: boolean) => {
    setQueue(newQueue)
    setCurrentSongId(newCurrentSongId)
    setIsPlaying(newIsPlaying)
  }, [])

  const handleToggleQueue = useCallback(() => {
    setIsQueueOpen((prev) => !prev)
  }, [])

  const handleCloseQueue = useCallback(() => {
    setIsQueueOpen(false)
  }, [])

  const handleClearQueue = useCallback(async () => {
    try {
      await navidromeService.clearQueue()
      // Clear local state
      setQueue([])
      setCurrentSongId('')
      setIsPlaying(false)
      // Stop the audio player
      audioPlayer.stop()
    } catch (error) {
      console.error('Failed to clear queue:', error)
    }
  }, [])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  // Render Login Page
  if (currentPage === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToSignup={() => {
          setCurrentPage('signup')
          setLoginError(null)
        }}
        errorMessage={loginError}
      />
    )
  }

  // Render Signup Page
  if (currentPage === 'signup') {
    return (
      <SignupPage
        onSignup={handleSignup}
        onSwitchToLogin={() => {
          setCurrentPage('login')
          setLoginError(null)
        }}
      />
    )
  }

  // Render Home Page
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />

      <Sidebar isCollapsed={isSidebarCollapsed} />

      {/* Queue Sidebar */}
      <QueueSidebar
        isOpen={isQueueOpen}
        queue={queue}
        currentSongId={currentSongId}
        isPlaying={isPlaying}
        onClose={handleCloseQueue}
        onPlaySong={handlePlaySong}
        onClearQueue={handleClearQueue}
      />

      {/* Main Content */}
      <main
        className={`pt-20 px-4 md:px-6 pb-24 md:pb-8 transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}
          ${isQueueOpen ? 'md:mr-80' : 'md:mr-6'}
        `}
      >
        <div className="max-w-7xl mx-auto">
          {/* Album Slideshow */}
          <AlbumSlideshow />

          {/* Most Played */}
          <MostPlayed />

          {/* Recently Played */}
          <RecentlyPlayed />
        </div>
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
  )
}

export default App
