import {
  Search,
  Plus,
  Activity,
  User,
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowLeft,
  ArrowRight,
} from "../lib/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, FormEvent, useEffect, useRef } from "react";
import { Button } from "./ui/8bit/button";
import { Input } from "./ui/8bit/input";

interface NavbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Navbar({ isSidebarCollapsed, onToggleSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const previousQueryRef = useRef<string | null>(null);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoForward = () => {
    window.history.forward();
  };

  // Sync search input with URL query param only on mount or external navigation
  useEffect(() => {
    const currentQuery = searchParams.get("q") || "";

    // Only sync if the query in URL is different from what we previously set
    if (previousQueryRef.current !== currentQuery) {
      setSearchQuery(currentQuery);
      previousQueryRef.current = currentQuery;
    }
  }, [searchParams]);

  // Debounced search navigation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && searchQuery !== previousQueryRef.current) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        previousQueryRef.current = searchQuery.trim();
      } else if (!searchQuery.trim() && previousQueryRef.current) {
        // User cleared the input, navigate to empty search page
        navigate("/search");
        previousQueryRef.current = "";
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, navigate]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim();
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      previousQueryRef.current = trimmedQuery;
    }
  };

  const handleSearchIconClick = () => {
    if (searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim();
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      previousQueryRef.current = trimmedQuery;
    } else {
      navigate("/search");
      previousQueryRef.current = "";
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Sidebar Toggle & Home Button - Left */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            aria-label="Go to home"
            title="Go to home"
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-xl mx-4 md:mx-8 flex items-center gap-2">
          {/* Left Navigation Arrow - Desktop Only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="hidden md:flex"
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative group flex-1">
            <button
              type="button"
              onClick={handleSearchIconClick}
              className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-violet-400 transition-colors" />
            </button>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks, artists, albums..."
              className="pl-10 pr-4 text-sm bg-zinc-800"
            />
          </form>

          {/* Right Navigation Arrow - Desktop Only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoForward}
            className="hidden md:flex"
            aria-label="Go forward"
            title="Go forward"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Icons - Right */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            aria-label="Add music to server"
            title="Add music to server"
          >
            <Plus className="w-5 h-5 group-hover:text-violet-400 transition-colors" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            aria-label="Current activity"
            title="Current activity"
          >
            <Activity className="w-5 h-5 group-hover:text-violet-400 transition-colors" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full"></span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            aria-label="User profile"
            title="User profile"
          >
            <User className="w-5 h-5 group-hover:text-violet-400 transition-colors" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
