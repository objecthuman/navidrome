import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Play, Clock, Heart } from 'lucide-react'
import { subsonicService } from '../services/subsonic'
import type { SubsonicAlbumInfo, SubsonicAlbum } from '../services/subsonic'
import { useApp } from '../contexts/AppContext'
import { Vibrant } from 'node-vibrant/browser'

interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  trackNumber: number
}

export function AlbumPage() {
  const { albumId } = useParams<{ albumId: string }>()
  const navigate = useNavigate()
  const { onPlaySong } = useApp()
  const [albumInfo, setAlbumInfo] = useState<SubsonicAlbumInfo | null>(null)
  const [album, setAlbum] = useState<SubsonicAlbum & { song: any[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set())
  const [dominantColor, setDominantColor] = useState<string>('#18181b')

  useEffect(() => {
    const fetchAlbumData = async () => {
      if (!albumId) return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch both album info and album details in parallel
        const [infoResponse, albumResponse] = await Promise.all([
          subsonicService.getAlbumInfo(albumId),
          subsonicService.getAlbum(albumId),
        ])

        setAlbumInfo(infoResponse)
        setAlbum(albumResponse)

        // Extract dominant color from cover art using node-vibrant
        if (infoResponse.mediumImageUrl) {
          try {
            const palette = await Vibrant.from(infoResponse.mediumImageUrl).getPalette()
            const dominantColor = palette.Vibrant?.hex || palette.DarkVibrant?.hex || palette.Muted?.hex || '#18181b'
            setDominantColor(dominantColor)
          } catch (err) {
            console.error('Failed to extract color:', err)
            setDominantColor('#18181b')
          }
        }
      } catch (err) {
        console.error('Failed to fetch album data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load album')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlbumData()
  }, [albumId])

  // Scroll to top when album changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [albumId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours} hr ${mins} min`
    }
    return `${mins} min`
  }

  const handlePlayAll = useCallback(() => {
    if (album?.song && album.song.length > 0) {
      onPlaySong(album.song[0].id)
    }
  }, [album, onPlaySong])

  const toggleLike = useCallback((songId: string) => {
    setLikedSongs((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(songId)) {
        newSet.delete(songId)
      } else {
        newSet.add(songId)
      }
      return newSet
    })
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-zinc-400">Loading album...</div>
      </div>
    )
  }

  if (error || !album) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-red-400">{error || 'Album not found'}</div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-950 text-white pb-24 md:pb-8">
      {/* Album Info */}
      <div
        className="px-4 md:px-6 py-8"
        style={{
          background: `linear-gradient(to bottom, ${dominantColor} 0%, ${dominantColor}40 40%, transparent 100%)`,
        }}
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Cover Art */}
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl bg-zinc-800 flex-shrink-0">
            {albumInfo?.mediumImageUrl ? (
              <img
                src={albumInfo.mediumImageUrl}
                alt={album.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <span className="text-6xl font-bold text-white/30">{album.name.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Album Details */}
          <div className="flex-1 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{album.name}</h2>
                <p
                  className="text-lg text-zinc-400 hover:text-violet-400 transition-colors cursor-pointer mb-3"
                  onClick={() => {
                    if (album.artistId) {
                      navigate(`/artist/${album.artistId}`)
                    } else {
                      navigate(`/search?q=${encodeURIComponent(album.artist)}`)
                    }
                  }}
                >
                  {album.artist}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  {album.year && <span>{album.year}</span>}
                  {album.year && <span>•</span>}
                  <span>{album.songCount} songs</span>
                  <span>•</span>
                  <span>{formatDuration(album.duration)}</span>
                  {album.genre && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
                        {album.genre}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Play Button */}
              <button
                onClick={handlePlayAll}
                className="flex-shrink-0 p-4 bg-violet-500 hover:bg-violet-600 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
                aria-label="Play album"
                title="Play album"
              >
                <Play className="w-6 h-6 text-white fill-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Album Description */}
      {albumInfo?.notes && (
        <div className="px-4 md:px-6 py-6 border-b border-zinc-800">
          <h3 className="text-lg font-semibold mb-3">About this album</h3>
          <div
            className="prose prose-invert max-w-none text-zinc-400 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: albumInfo.notes.replace(/<a href="https:\/\/www\.last\.fm[^"]*"[^>]*>Read more on Last\.fm[^<]*<\/a>/gi, ''),
            }}
          />
          {albumInfo.lastFmUrl && (
            <a
              href={albumInfo.lastFmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-violet-400 hover:text-violet-300 text-sm transition-colors"
            >
              Read more on Last.fm →
            </a>
          )}
        </div>
      )}

      {/* Track List */}
      <div className="px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Tracks</h3>
          <span className="text-sm text-zinc-500">{album.songCount} songs</span>
        </div>

        <div className="space-y-1">
          {album.song?.map((song, index) => (
            <div
              key={song.id}
              onClick={() => onPlaySong(song.id)}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-900/50 transition-colors cursor-pointer group"
            >
              {/* Track Number */}
              <div className="w-8 text-center">
                <span className="text-sm text-zinc-500 group-hover:hidden">{index + 1}</span>
                <Play className="w-4 h-4 text-zinc-400 hidden group-hover:block" />
              </div>

              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white truncate group-hover:text-violet-300 transition-colors">
                  {song.title}
                </h4>
                {song.artist && song.artist !== album.artist && (
                  <p
                    className="text-sm text-zinc-500 truncate hover:text-violet-400 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/search?q=${encodeURIComponent(song.artist)}`)
                    }}
                  >
                    {song.artist}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-500">{formatTime(song.duration)}</span>

                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLike(song.id)
                  }}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    likedSongs.has(song.id)
                      ? 'text-red-500 hover:bg-red-500/10'
                      : 'text-zinc-400 hover:bg-zinc-800'
                  }`}
                  aria-label={likedSongs.has(song.id) ? 'Unlike song' : 'Like song'}
                  title={likedSongs.has(song.id) ? 'Unlike song' : 'Like song'}
                >
                  <Heart className={`w-4 h-4 ${likedSongs.has(song.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
