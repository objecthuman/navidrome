import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Play, Music } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { subsonicService } from '../services/subsonic'
import type { SubsonicAlbum } from '../services/subsonic'

const ALBUMS_PER_PAGE = 20

interface RecentlyPlayedProps {
  onAlbumClick?: (albumId: string) => void
}

export function RecentlyPlayed({ onAlbumClick }: RecentlyPlayedProps) {
  const navigate = useNavigate()
  const [albums, setAlbums] = useState<SubsonicAlbum[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerTarget = useRef<HTMLDivElement>(null)

  const fetchAlbums = useCallback(async () => {
    if (loading || !hasMore) return

    try {
      setLoading(true)
      const data = await subsonicService.getAlbumList2('recent', ALBUMS_PER_PAGE, offset)

      if (data.length === 0) {
        setHasMore(false)
      } else {
        setAlbums((prev) => {
          // Create a Set of existing album IDs for quick lookup
          const existingIds = new Set(prev.map((album) => album.id))
          // Filter out duplicates
          const uniqueNewAlbums = data.filter((album) => !existingIds.has(album.id))
          return [...prev, ...uniqueNewAlbums]
        })
        setOffset((prev) => prev + ALBUMS_PER_PAGE)

        if (data.length < ALBUMS_PER_PAGE) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Failed to fetch recently played:', error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, offset])

  useEffect(() => {
    fetchAlbums()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchAlbums()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [fetchAlbums, hasMore, loading])

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return

    const scrollAmount = containerRef.current.clientWidth * 0.8
    const newScrollLeft =
      direction === 'left'
        ? containerRef.current.scrollLeft - scrollAmount
        : containerRef.current.scrollLeft + scrollAmount

    containerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0))
    setScrollLeft(containerRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (containerRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].pageX - (containerRef.current?.offsetLeft || 0))
    setScrollLeft(containerRef.current?.scrollLeft || 0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return
    const x = e.touches[0].pageX - (containerRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  if (albums.length === 0 && loading) {
    return (
      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Recently Played</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-44 md:w-52 bg-zinc-900/50 backdrop-blur rounded-2xl p-3 animate-pulse"
            >
              <div className="aspect-square bg-zinc-800 rounded-xl mb-3"></div>
              <div className="h-4 bg-zinc-800 rounded mb-2"></div>
              <div className="h-3 bg-zinc-800 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (albums.length === 0) {
    return null
  }

  return (
    <div className="w-full mb-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Recently Played</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-zinc-800/80 backdrop-blur hover:bg-zinc-700 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
            aria-label="Scroll left"
            title="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-zinc-800/80 backdrop-blur hover:bg-zinc-700 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
            aria-label="Scroll right"
            title="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide select-none pb-4
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{
          scrollBehavior: isDragging ? 'auto' : 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {albums.map((album, index) => (
          <div
            key={`recently-played-${album.id}`}
            className="flex-shrink-0 w-44 md:w-52 group"
            style={{
              animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
            }}
          >
            <div
              className="relative bg-gradient-to-br from-zinc-900 to-zinc-800/80 backdrop-blur rounded-2xl p-3
                transition-all duration-500 ease-out
                hover:shadow-2xl hover:shadow-violet-500/10
                hover:-translate-y-2
                border border-zinc-800/50 hover:border-violet-500/30
                cursor-pointer"
              onClick={() => {
                if (onAlbumClick) {
                  onAlbumClick(album.id)
                }
              }}
            >
              {/* Album Cover */}
              <div className="relative aspect-square mb-3 rounded-xl overflow-hidden bg-zinc-800">
                <img
                  src={subsonicService.getCoverArtUrl(album.coverArt, 300)}
                  alt={album.name}
                  className="w-full h-full object-cover transition-all duration-700 ease-out
                    group-hover:scale-110 group-hover:rotate-2"
                  loading="lazy"
                />

                {/* Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  flex items-center justify-center">
                  <button
                    className="p-4 bg-violet-500/90 backdrop-blur hover:bg-violet-500
                      rounded-full shadow-lg shadow-violet-500/50
                      transform scale-0 group-hover:scale-100
                      transition-all duration-500 ease-out
                      hover:scale-110 hover:shadow-violet-500/70
                      group-active:scale-95 cursor-pointer"
                    aria-label="Play album"
                    title="Play album"
                  >
                    <Play className="w-6 h-6 text-white fill-white" />
                  </button>
                </div>

                {/* Decorative music icon on hover */}
                <Music className="absolute top-2 right-2 w-5 h-5 text-white/80
                  transform scale-0 group-hover:scale-100 group-hover:rotate-12
                  transition-all duration-500 ease-out delay-100" />
              </div>

              {/* Album Info */}
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-white truncate pr-2
                  group-hover:text-violet-400 transition-colors duration-300">
                  {album.name}
                </h3>
                <p
                  className="text-xs text-zinc-400 truncate group-hover:text-violet-300 transition-colors duration-300 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (album.artistId) {
                      navigate(`/artist/${album.artistId}`)
                    } else {
                      navigate(`/search?q=${encodeURIComponent(album.artist)}`)
                    }
                  }}
                >
                  {album.artist}
                </p>
                {/* Always render metadata line for consistent card height */}
                <div className="flex items-center gap-1 mt-1 min-h-[1.25rem]">
                  {album.year ? (
                    <>
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">
                        {album.year}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-violet-500 transition-colors duration-300"></span>
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">
                        {album.songCount ?? 0} tracks
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">
                      {album.songCount ?? 0} tracks
                    </span>
                  )}
                </div>
              </div>

              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 to-fuchsia-500/0
                group-hover:from-violet-500/5 group-hover:to-fuchsia-500/5
                transition-all duration-700 ease-out
                pointer-events-none -z-10 blur-xl">
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading &&
          [...Array(5)].map((_, i) => (
            <div
              key={`loading-${i}`}
              className="flex-shrink-0 w-44 md:w-52 bg-zinc-900/50 backdrop-blur rounded-2xl p-3 animate-pulse"
            >
              <div className="aspect-square bg-zinc-800 rounded-xl mb-3"></div>
              <div className="h-4 bg-zinc-800 rounded mb-2"></div>
              <div className="h-3 bg-zinc-800 rounded w-3/4"></div>
            </div>
          ))
        }

        {/* Intersection observer target */}
        {hasMore && !loading && (
          <div ref={observerTarget} className="flex-shrink-0 w-10"></div>
        )}
      </div>

      {/* End message */}
      {!hasMore && albums.length > 0 && (
        <div className="text-center text-zinc-500 text-sm mt-2 flex items-center justify-center gap-2">
          <span className="w-8 h-px bg-zinc-700"></span>
          <span>You've reached the end</span>
          <span className="w-8 h-px bg-zinc-700"></span>
        </div>
      )}

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
