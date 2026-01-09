import { X } from 'lucide-react'
import { subsonicService } from '../services/subsonic'
import type { SubsonicQueueEntry } from '../services/subsonic'

interface QueueSidebarProps {
  isOpen: boolean
  queue: SubsonicQueueEntry[]
  currentSongId?: string
  isPlaying: boolean
  onClose: () => void
  onPlaySong: (songId: string) => void
}

export function QueueSidebar({
  isOpen,
  queue,
  currentSongId,
  isPlaying,
  onClose,
  onPlaySong,
}: QueueSidebarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={`fixed top-20 bottom-20 right-0 w-80 bg-zinc-900/98 backdrop-blur-xl border-l border-zinc-800 z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-800">
        <h2 className="text-xl font-bold text-white">Queue</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
          aria-label="Close queue"
          title="Close queue"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* Queue Info */}
      {queue.length > 0 && (
        <div className="px-6 py-3 border-b border-zinc-800">
          <p className="text-sm text-zinc-400">
            <span className="font-medium text-white">{queue.length}</span> songs in queue
          </p>
        </div>
      )}

      {/* Queue Items */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Queue is empty</h3>
            <p className="text-sm text-zinc-500">Add songs to your queue to see them here</p>
          </div>
        ) : (
          <div className="p-2">
            {queue.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                onClick={() => onPlaySong(song.id)}
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 group
                  ${song.id === currentSongId
                    ? 'bg-violet-500/20 border border-violet-500/50'
                    : 'hover:bg-zinc-800/50 border border-transparent'
                  }`}
              >
                {/* Song Number / Playing Indicator */}
                <div className="flex-shrink-0 w-8 text-center">
                  {song.id === currentSongId && isPlaying ? (
                    <div className="flex items-center justify-center gap-0.5">
                      <span className="w-0.5 h-3 bg-violet-500 animate-pulse" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-0.5 h-4 bg-violet-500 animate-pulse" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-0.5 h-3 bg-violet-500 animate-pulse" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  ) : (
                    <span className={`text-sm font-medium ${
                      song.id === currentSongId ? 'text-violet-400' : 'text-zinc-500'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Cover Art */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 shadow-lg">
                  <img
                    src={subsonicService.getCoverArtUrl(song.coverArt, 200)}
                    alt={song.album}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium truncate mb-0.5 ${
                    song.id === currentSongId
                      ? 'text-violet-400'
                      : 'text-white group-hover:text-violet-300'
                  } transition-colors`}>
                    {song.title}
                  </h4>
                  <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">{song.album}</p>
                </div>

                {/* Duration */}
                <div className="flex-shrink-0 text-sm text-zinc-500 font-medium">
                  {formatTime(song.duration)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
