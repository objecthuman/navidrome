import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { MobilePlayerBar } from './components/MobilePlayerBar'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'

type Page = 'login' | 'signup' | 'home'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Handle mobile sidebar close event
  useEffect(() => {
    const handleCloseSidebar = () => setIsSidebarCollapsed(true)
    document.addEventListener('close-mobile-sidebar', handleCloseSidebar)
    return () => {
      document.removeEventListener('close-mobile-sidebar', handleCloseSidebar)
    }
  }, [])

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev)
  }

  const handleLogin = (username: string, password: string) => {
    console.log('Login:', { username, password })
    // TODO: Implement actual login logic
    setCurrentPage('home')
  }

  const handleSignup = (username: string, password: string) => {
    console.log('Signup:', { username, password })
    // TODO: Implement actual signup logic
    setCurrentPage('home')
  }

  // Render Login Page
  if (currentPage === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToSignup={() => setCurrentPage('signup')}
      />
    )
  }

  // Render Signup Page
  if (currentPage === 'signup') {
    return (
      <SignupPage
        onSignup={handleSignup}
        onSwitchToLogin={() => setCurrentPage('login')}
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
          {/* Placeholder for main content */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <div className="aspect-square bg-zinc-800 rounded-md mb-3"></div>
                <h3 className="font-medium text-sm truncate">Album {i + 1}</h3>
                <p className="text-xs text-zinc-400 truncate">Artist Name</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MobilePlayerBar />
    </div>
  )
}

export default App
