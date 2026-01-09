import { Search, Plus, Activity, User, ChevronLeft, ChevronRight } from 'lucide-react'

interface NavbarProps {
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export function Navbar({ isSidebarCollapsed, onToggleSidebar }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Sidebar Toggle - Left */}
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="p-1 hover:bg-zinc-800 rounded transition-colors"
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-zinc-300" />
            )}
          </button>
        </div>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-xl mx-4 md:mx-8">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-violet-400 transition-colors" />
            <input
              type="text"
              placeholder="Search tracks, artists, albums..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Action Icons - Right */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors relative group"
            aria-label="Add music to server"
          >
            <Plus className="w-5 h-5 text-zinc-300 group-hover:text-violet-400 transition-colors" />
          </button>

          <button
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors relative group"
            aria-label="Current activity"
          >
            <Activity className="w-5 h-5 text-zinc-300 group-hover:text-violet-400 transition-colors" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full"></span>
          </button>

          <button
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors relative group"
            aria-label="User profile"
          >
            <User className="w-5 h-5 text-zinc-300 group-hover:text-violet-400 transition-colors" />
          </button>
        </div>
      </div>
    </nav>
  )
}
