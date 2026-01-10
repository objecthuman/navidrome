import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { subsonicService } from '../services/subsonic'
import type { SubsonicAlbum, SubsonicArtistInfo } from '../services/subsonic'
import { useApp } from '../contexts/AppContext'

export function ArtistPage() {
  const { artistId } = useParams<{ artistId: string }>()
  const navigate = useNavigate()
  const { onNavigateToAlbum } = useApp()
  const [artist, setArtist] = useState<any>(null)
  const [artistInfo, setArtistInfo] = useState<SubsonicArtistInfo | null>(null)
  const [albums, setAlbums] = useState<SubsonicAlbum[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!artistId) return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch artist details using getArtist method
        const artistData = await subsonicService.getArtist(artistId)
        setArtist(artistData)

        // Fetch artist info (biography, similar artists, etc.)
        try {
          const infoData = await subsonicService.getArtistInfo(artistId)
          setArtistInfo(infoData)
        } catch (infoErr) {
          console.warn('Failed to fetch artist info:', infoErr)
          // Continue without artist info
        }

        // Fetch albums by this artist using search3
        const response = await subsonicService.search3(artistData.name || '', 0, 100, 0)
        const artistAlbums = response.album.filter((album: SubsonicAlbum) =>
          album.artistId === artistId
        )
        setAlbums(artistAlbums.slice(0, 20))
      } catch (err) {
        console.error('Failed to fetch artist data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load artist')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtistData()
  }, [artistId])

  const handleBack = useCallback(() => {
    navigate('/home')
  }, [navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-zinc-400">Loading artist...</div>
      </div>
    )
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-red-400">{error || 'Artist not found'}</div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-950 text-white pb-32 md:pb-24">
      {/* Artist Info */}
      <div className="px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Cover Art */}
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl bg-zinc-800 flex-shrink-0">
            {artist.coverArt ? (
              <img
                src={subsonicService.getCoverArtUrl(artist.coverArt, 300)}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <span className="text-6xl font-bold text-white/30">{artist.name?.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Artist Details */}
          <div className="flex-1 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{artist.name}</h2>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  <span>{artist.albumCount || albums.length} albums</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Biography */}
      {artistInfo?.biography && (
        <div className="px-4 md:px-6 py-6 border-b border-zinc-800">
          <h3 className="text-lg font-semibold mb-3">About this artist</h3>
          <div
            className="prose prose-invert max-w-none text-zinc-400 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: artistInfo.biography,
            }}
          />
          {artistInfo.lastFmUrl && (
            <a
              href={artistInfo.lastFmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-violet-400 hover:text-violet-300 text-sm transition-colors"
            >
              Read more on Last.fm →
            </a>
          )}
        </div>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <div className="px-4 md:px-6 py-6">
          <h3 className="text-xl font-bold mb-4">Albums</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {albums.map((album) => (
              <div
                key={album.id}
                onClick={() => onNavigateToAlbum(album.id)}
                className="bg-zinc-900 rounded-xl overflow-hidden hover:bg-zinc-800 transition-colors cursor-pointer group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={subsonicService.getCoverArtUrl(album.coverArt, 300)}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Play album
                      }}
                      className="p-3 bg-violet-500 hover:bg-violet-600 rounded-full shadow-lg transform transition-transform cursor-pointer"
                      aria-label="Play album"
                      title="Play album"
                    >
                      <Play className="w-6 h-6 text-white fill-white" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                    {album.name}
                  </h4>
                  <p className="text-sm text-zinc-500 truncate">{album.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Artists */}
      {artistInfo?.similarArtist && artistInfo.similarArtist.length > 0 && (
        <div className="px-4 md:px-6 py-6">
          <h3 className="text-xl font-bold mb-4">Similar Artists</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {artistInfo.similarArtist.slice(0, 3).map((similarArtist) => (
              <div
                key={similarArtist.id}
                onClick={() => navigate(`/artist/${similarArtist.id}`)}
                className="bg-zinc-900 rounded-lg p-3 hover:bg-zinc-800 transition-colors cursor-pointer group"
              >
                <div className="w-full aspect-square rounded bg-gradient-to-br from-violet-600 to-fuchsia-600 mb-2 flex items-center justify-center overflow-hidden">
                  {similarArtist.coverArt ? (
                    <img
                      src={subsonicService.getCoverArtUrl(similarArtist.coverArt, 200)}
                      alt={similarArtist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white/30">{similarArtist.name.charAt(0)}</span>
                  )}
                </div>
                <h4 className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                  {similarArtist.name}
                </h4>
                <p className="text-xs text-zinc-500">{similarArtist.albumCount || 0} albums</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
