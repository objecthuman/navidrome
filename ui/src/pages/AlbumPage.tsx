import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Play, Clock, Heart, Check, MoreVertical } from 'lucide-react'
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
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set())
  const [dominantColor, setDominantColor] = useState<string>('#18181b')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null)
      }
    }

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [openMenuId])

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

  const formatQuality = (song: any) => {
    if (song.bitrate) {
      return `${song.bitrate} kbps`
    }
    if (song.suffix) {
      return song.suffix.toUpperCase()
    }
    return '-'
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

  const toggleSongSelection = useCallback((songId: string) => {
    setSelectedSongs((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(songId)) {
        newSet.delete(songId)
      } else {
        newSet.add(songId)
      }
      return newSet
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (album?.song) {
      const allSongIds = new Set(album.song.map((song) => song.id))
      if (selectedSongs.size === album.song.length) {
        // Deselect all if all are selected
        setSelectedSongs(new Set())
      } else {
        // Select all
        setSelectedSongs(allSongIds)
      }
    }
  }, [album, selectedSongs.size])

  const toggleMenu = useCallback((songId: string) => {
    setOpenMenuId((prev) => (prev === songId ? null : songId))
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
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Tracks</h3>
            {selectedSongs.size > 0 && (
              <span className="text-sm text-violet-400 font-medium">
                {selectedSongs.size} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="text-sm text-zinc-400 hover:text-violet-400 transition-colors cursor-pointer"
            >
              {selectedSongs.size === album?.song?.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-zinc-500">{album.songCount} songs</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="hidden md:table-cell w-10 px-3 py-2 text-left">
                  <div
                    className="w-4 h-4 rounded border border-zinc-600 transition-all duration-200 flex items-center justify-center cursor-pointer hover:border-zinc-500"
                    onClick={toggleSelectAll}
                    style={{
                      borderColor: selectedSongs.size === album?.song?.length && selectedSongs.size > 0 ? '#8b5cf6' : '#52525b',
                      backgroundColor: selectedSongs.size === album?.song?.length && selectedSongs.size > 0 ? '#8b5cf6' : 'transparent',
                    }}
                  >
                    <Check
                      className={`w-3 h-3 text-white transition-all duration-200 ${
                        selectedSongs.size === album?.song?.length && selectedSongs.size > 0 ? 'scale-100' : 'scale-0'
                      }`}
                    />
                  </div>
                </th>
                <th className="w-16 px-3 py-2 text-center">
                  <span className="text-xs text-zinc-500 font-medium">#</span>
                </th>
                <th className="px-3 py-2 text-left">
                  <span className="text-xs text-zinc-500 font-medium">Title</span>
                </th>
                <th className="hidden md:table-cell w-28 px-3 py-2 text-right">
                  <span className="text-xs text-zinc-500 font-medium">Quality</span>
                </th>
                <th className="w-24 px-3 py-2 text-right">
                  <span className="text-xs text-zinc-500 font-medium">Duration</span>
                </th>
                <th className="w-20 px-3 py-2 text-right">
                  <span className="text-xs text-zinc-500 font-medium">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {album.song?.map((song, index) => {
                const isSelected = selectedSongs.has(song.id)
                return (
                  <tr
                    key={song.id}
                    className={`transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? 'bg-violet-500/10'
                        : 'hover:bg-zinc-900/50'
                    }`}
                    onClick={() => onPlaySong(song.id)}
                  >
                    {/* Checkbox */}
                    <td className="hidden md:table-cell px-3 py-2">
                      <div
                        className="w-4 h-4 rounded border border-zinc-600 transition-all duration-200 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSongSelection(song.id)
                        }}
                        style={{
                          borderColor: isSelected ? '#8b5cf6' : '#52525b',
                          backgroundColor: isSelected ? '#8b5cf6' : 'transparent',
                        }}
                      >
                        <Check
                          className={`w-3 h-3 text-white transition-all duration-200 ${
                            isSelected ? 'scale-100' : 'scale-0'
                          }`}
                        />
                      </div>
                    </td>

                    {/* Track Number */}
                    <td className="px-3 py-2 text-center">
                      <span className="text-xs text-zinc-500 group-hover:hidden">{index + 1}</span>
                      <Play className="w-3 h-3 text-zinc-400 hidden group-hover:block mx-auto" />
                    </td>

                    {/* Song Info */}
                    <td className="px-3 py-2">
                      <div className="min-w-0">
                        <h4
                          className={`text-sm truncate transition-colors ${
                            isSelected ? 'text-violet-300' : 'text-white group-hover:text-violet-300'
                          }`}
                        >
                          {song.title}
                        </h4>
                        {song.artist && song.artist !== album.artist && (
                          <p
                            className="text-xs text-zinc-500 truncate hover:text-violet-400 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/search?q=${encodeURIComponent(song.artist)}`)
                            }}
                          >
                            {song.artist}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Quality */}
                    <td className="hidden md:table-cell px-3 py-2 text-right">
                      <span className="text-xs text-zinc-500">{formatQuality(song)}</span>
                    </td>

                    {/* Duration */}
                    <td className="px-3 py-2 text-right">
                      <span className="text-xs text-zinc-500">{formatTime(song.duration)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        {/* Like Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLike(song.id)
                          }}
                          className={`hidden md:p-1 md:rounded-full transition-all duration-200 cursor-pointer ${
                            likedSongs.has(song.id)
                              ? 'text-red-500 hover:bg-red-500/10'
                              : 'text-zinc-400 hover:bg-zinc-800'
                          }`}
                          aria-label={likedSongs.has(song.id) ? 'Unlike song' : 'Like song'}
                          title={likedSongs.has(song.id) ? 'Unlike song' : 'Like song'}
                        >
                          <Heart className={`w-3 h-3 ${likedSongs.has(song.id) ? 'fill-current' : ''}`} />
                        </button>

                        {/* More Options Button */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleMenu(song.id)
                            }}
                            className="p-1 rounded-full transition-all duration-200 cursor-pointer text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                            aria-label="More options"
                            title="More options"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === song.id && (
                            <div
                              className="absolute right-0 top-full mt-1 w-40 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                <button
                                  className="w-full px-4 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                                  onClick={() => {
                                    console.log('Add to playlist:', song.id)
                                    setOpenMenuId(null)
                                  }}
                                >
                                  Add to playlist
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                                  onClick={() => {
                                    console.log('Add to queue:', song.id)
                                    setOpenMenuId(null)
                                  }}
                                >
                                  Add to queue
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                                  onClick={() => {
                                    console.log('Download:', song.id)
                                    setOpenMenuId(null)
                                  }}
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
