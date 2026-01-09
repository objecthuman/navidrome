import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { MobilePlayerBar } from './components/MobilePlayerBar'
import { AlbumSlideshow } from './components/AlbumSlideshow'
import { RecentlyPlayed } from './components/RecentlyPlayed'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { authService } from './services/auth'

type Page = 'login' | 'signup' | 'home'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)

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
        onToggleSidebar={toggleSidebar}
      />

      <Sidebar isCollapsed={isSidebarCollapsed} />

      {/* Main Content */}
      <main
        className={`pt-20 px-4 md:px-6 pb-8 transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}
        `}
      >
        <div className="max-w-7xl mx-auto">
          {/* Album Slideshow */}
          <AlbumSlideshow />

          {/* Recently Played */}
          <RecentlyPlayed />
        </div>
      </main>

      <MobilePlayerBar />
    </div>
  )
}

export default App
