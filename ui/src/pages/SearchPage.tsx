import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { User, Disc, Music, Play, Pause } from 'lucide-react'
import { subsonicService } from '../services/subsonic'
import type { SubsonicArtist, SubsonicSong, SubsonicAlbum } from '../services/subsonic'
import { useApp } from '../contexts/AppContext'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { onNavigateToAlbum, onPlaySong, currentSongId, isPlaying, setIsPlaying, onQueueUpdate } = useApp()
  const query = searchParams.get('q') || ''

  const [artists, setArtists] = useState<SubsonicArtist[]>([])
  const [songs, setSongs] = useState<SubsonicSong[]>([])
  const [albums, setAlbums] = useState<SubsonicAlbum[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Handle play album
  const handlePlayAlbum = async (albumId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const albumData = await subsonicService.getAlbum(albumId)
      if (albumData.song && albumData.song.length > 0) {
        // Convert songs to queue items
        const queueItems = albumData.song.map((song: any) => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          duration: song.duration,
          coverArt: song.coverArt,
        }))

        // Update queue
        onQueueUpdate(queueItems, albumData.song[0].id, true)
      }
    } catch (error) {
      console.error('Failed to play album:', error)
    }
  }

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setArtists([])
        setSongs([])
        setAlbums([])
        return
      }

      setIsLoading(true)

      try {
        const results = await subsonicService.search3(query, 50, 50, 50)

        // Filter songs to only include matching ones
        const filteredSongs = results.song.filter(song => {
          const searchLower = query.toLowerCase()
          return (
            song.title?.toLowerCase().includes(searchLower)
          )
        })
		const filteredAlbum = results.album.filter(album => {
			const searchLower = query.toLowerCase()
			return (album.name.toLowerCase().includes(searchLower))
		})

        // Show only top 5 of each
        setArtists(results.artist.slice(0, 5))
        setSongs(filteredSongs.slice(0, 5))
        setAlbums(filteredAlbum.slice(0, 5))
      } catch (error) {
        console.error('Search failed:', error)
        setArtists([])
        setSongs([])
        setAlbums([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [query])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20 px-4 md:px-6 pb-32 md:pb-24">
      <div className="w-full">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
            <p className="text-zinc-400 mt-4">Searching...</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && query && artists.length === 0 && songs.length === 0 && albums.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400">No results found for "{query}"</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !query && (
          <div className="text-center py-12">
            <p className="text-zinc-400">Use the search bar above to find artists, songs, and albums</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && query && (artists.length > 0 || songs.length > 0 || albums.length > 0) && (
          <div className="space-y-8">
            {/* Artists */}
            {artists.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-400" />
                  Artists ({artists.length})
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {artists.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => navigate(`/artist/${artist.id}`)}
                      className="bg-zinc-900 rounded-lg p-3 hover:bg-zinc-800 transition-colors cursor-pointer group"
                    >
                      <div className="w-full aspect-square rounded bg-gradient-to-br from-violet-600 to-fuchsia-600 mb-2 flex items-center justify-center overflow-hidden">
                        {artist.coverArt ? (
                          <img
                            src={subsonicService.getCoverArtUrl(artist.coverArt, 200)}
                            alt={artist.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-white/30">{artist.name.charAt(0)}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                        {artist.name}
                      </h3>
                      <p className="text-xs text-zinc-500">{artist.albumCount} albums</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Songs */}
            {songs.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Music className="w-5 h-5 text-violet-400" />
                  Songs ({songs.length})
                </h2>
                <div className="bg-zinc-900 overflow-hidden border border-zinc-800">
                  {songs.map((song, index) => {
                    const isCurrentSong = currentSongId === song.id
                    const showPause = isCurrentSong && isPlaying

                    return (
                      <div
                        key={song.id}
                        className="flex items-center gap-4 p-4 hover:bg-zinc-800 transition-colors group border-b border-zinc-800 last:border-b-0"
                      >
                        {/* Album Art with Play/Pause Overlay */}
                        <div
                          className="w-12 h-12 flex-shrink-0 overflow-hidden relative cursor-pointer"
                          onClick={() => {
                            if (isCurrentSong && isPlaying) {
                              setIsPlaying(false)
                            } else {
                              onPlaySong(song.id)
                            }
                          }}
                        >
                          {song.coverArt ? (
                            <img
                              src={subsonicService.getCoverArtUrl(song.coverArt, 100)}
                              alt={song.album}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                              <Music className="w-6 h-6 text-white/30" />
                            </div>
                          )}
                          {/* Play/Pause Overlay */}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {showPause ? (
                              <Pause className="w-6 h-6 text-white fill-white" />
                            ) : (
                              <Play className="w-6 h-6 text-white fill-white" />
                            )}
                          </div>
                        </div>

                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => onPlaySong(song.id)}
                        >
                          <h4 className="text-zinc-100 truncate hover:text-violet-300 transition-colors">
                            {song.title}
                          </h4>
                          <p
                            className="text-sm text-zinc-500 truncate hover:text-violet-300 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/search?q=${encodeURIComponent(song.artist)}`)
                            }}
                          >
                            {song.artist}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-zinc-500">{formatTime(song.duration)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Albums */}
            {albums.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Disc className="w-5 h-5 text-violet-400" />
                  Albums ({albums.length})
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {albums.map((album) => (
                    <div
                      key={album.id}
                      className="bg-zinc-900 overflow-hidden hover:bg-zinc-800 transition-colors group border border-zinc-800"
                    >
                      <div
                        className="aspect-square relative overflow-hidden cursor-pointer"
                        onClick={() => onNavigateToAlbum(album.id)}
                      >
                        <img
                          src={subsonicService.getCoverArtUrl(album.coverArt, 300)}
                          alt={album.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handlePlayAlbum(album.id, e)}
                            className="p-2 bg-violet-500 hover:bg-violet-600 rounded-full shadow-lg transform transition-transform cursor-pointer"
                            aria-label="Play album"
                            title="Play album"
                          >
                            <Play className="w-4 h-4 text-white fill-white" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3" onClick={() => onNavigateToAlbum(album.id)}>
                        <h3 className="text-sm font-medium text-zinc-100 truncate hover:text-violet-300 transition-colors cursor-pointer">
                          {album.name}
                        </h3>
                        <p
                          className="text-xs text-zinc-500 truncate hover:text-violet-300 transition-colors cursor-pointer"
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
