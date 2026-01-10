import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { subsonicService } from '../services/subsonic'
import type { SubsonicAlbum } from '../services/subsonic'
import { useApp } from '../contexts/AppContext'
import { Vibrant } from 'node-vibrant/browser'

interface AlbumWithColor extends SubsonicAlbum {
  dominantColor: string
}

export function AlbumSlideshow() {
  const { onNavigateToAlbum } = useApp()
  const navigate = useNavigate()
  const [albums, setAlbums] = useState<AlbumWithColor[]>([])
  const [loading, setLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true)
        const data = await subsonicService.getAlbumList2('random', 20, 0)

        // Extract colors for each album using node-vibrant
        const albumsWithColors = await Promise.all(
          data.map(async (album) => {
            try {
              const imageUrl = subsonicService.getCoverArtUrl(album.coverArt, 100)
              const palette = await Vibrant.from(imageUrl).getPalette()
              const dominantColor = palette.Vibrant?.hex || palette.DarkVibrant?.hex || palette.Muted?.hex || '#18181b'
              return { ...album, dominantColor }
            } catch (err) {
              console.error('Failed to extract color for album:', album.name, err)
              return { ...album, dominantColor: '#18181b' }
            }
          })
        )

        setAlbums(albumsWithColors)
      } catch (error) {
        console.error('Failed to fetch albums:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
  }, [])

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

  // Touch events for mobile
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

  if (loading) {
    return (
      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Discover</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 md:w-56 h-80 bg-zinc-900 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-zinc-800"></div>
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
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Discover</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors cursor-pointer"
            aria-label="Scroll left"
            title="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors cursor-pointer"
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
        {albums.map((album) => (
          <div
            key={`discover-${album.id}`}
            className="flex-shrink-0 w-48 md:w-56 h-80 rounded-2xl overflow-hidden group cursor-pointer relative shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
            style={{ backgroundColor: album.dominantColor }}
            onClick={() => onNavigateToAlbum(album.id)}
          >
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80 z-0"></div>

            {/* Album Name - Top */}
            <div className="relative z-10 pt-5 px-4 shrink-0">
              <h3 className="font-bold text-base md:text-lg text-white drop-shadow-lg line-clamp-2 leading-tight">
                {album.name}
              </h3>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Album Image - Center */}
            <div className="relative z-10 px-4 shrink-0">
              <img
                src={subsonicService.getCoverArtUrl(album.coverArt, 400)}
                alt={album.name}
                className="w-full h-36 md:h-40 object-cover rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Artist Name - Bottom */}
            <div className="relative z-10 px-4 pb-5 pt-3 shrink-0 flex items-end justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p
                  className="text-sm md:text-base text-white/90 font-medium drop-shadow-md truncate cursor-pointer hover:text-white transition-colors"
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
                {album.year && (
                  <p className="text-xs text-white/70 drop-shadow-md">{album.year}</p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Play all songs from this album
                  console.log('Play album:', album.id)
                }}
                className="p-3 bg-violet-500 hover:bg-violet-600 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 shrink-0 cursor-pointer"
                aria-label="Play album"
                title="Play album"
              >
                <Play className="w-5 h-5 text-white fill-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
