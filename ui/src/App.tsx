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

  const handlePlaySong = (songId: string) => {
    console.log('Play song:', songId)
    setCurrentSongId(songId)
    // TODO: Implement actual song playback logic
  }

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
      />
    </div>
  )
}

export default App
