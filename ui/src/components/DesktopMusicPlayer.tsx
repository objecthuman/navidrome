import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1, Shuffle, Repeat, Repeat1, Mic, ListMusic, Heart } from 'lucide-react'
import type { NavidromeQueueItem } from '../services/navidrome'

interface DesktopMusicPlayerProps {
  className?: string
  currentTime: number
  duration: number
  isPlaying: boolean
  isMuted: boolean
  isShuffle: boolean
  repeatMode: 'off' | 'all' | 'one'
  isLiked: boolean
  queue: NavidromeQueueItem[]
  currentSongId?: string
  isQueueOpen: boolean
  onTogglePlay: () => void
  onToggleMute: () => void
  onToggleShuffle: () => void
  onToggleLike: () => void
  onCycleRepeat: () => void
  onProgressChange: (value: number) => void
  onVolumeChange: (value: number) => void
  onPlaySong: (songId: string) => void
  onToggleQueue: () => void
  volume: number
}

interface Song {
  id: string
  title: string
  artist: string
  album: string
  coverArt: string
}

export function DesktopMusicPlayer({
  className = '',
  currentTime,
  duration,
  isPlaying,
  isMuted,
  isShuffle,
  repeatMode,
  isLiked,
  queue,
  currentSongId,
  isQueueOpen,
  onTogglePlay,
  onToggleMute,
  onToggleShuffle,
  onToggleLike,
  onCycleRepeat,
  onProgressChange,
  onVolumeChange,
  onPlaySong,
  onToggleQueue,
  volume,
}: DesktopMusicPlayerProps) {

  // Mock current song (in real app, this would be passed as prop)
  const currentSong: Song = {
    id: 'demo',
    title: 'Euta Manchheko Maya',
    artist: 'Narayan Gopal',
    album: 'Geeti Yatra',
    coverArt: 'demo-cover',
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      <div
        className={`hidden md:block fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 h-20 transition-all duration-300 ease-in-out z-50 ${className}`}
      >
        <div className="relative flex items-center px-4 py-3 h-20">
          {/* Left Side - Cover Art, Song Info & Like */}
          <div className="flex items-center gap-3 flex-shrink-0 z-10">
            {/* Cover Art */}
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 shadow-lg">
              <img
                src={`https://picsum.photos/seed/${currentSong.id}/300/300`}
                alt={currentSong.album}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Song Info */}
            <div>
              <h4 className="font-semibold text-sm text-white truncate max-w-[150px] sm:max-w-[200px]">
                {currentSong.title}
              </h4>
              <p className="text-xs text-zinc-400 truncate max-w-[150px] sm:max-w-[200px]">{currentSong.artist}</p>
            </div>

            {/* Like Button */}
            <button
              onClick={onToggleLike}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isLiked ? 'text-red-500' : 'text-zinc-400 hover:bg-zinc-800'
              }`}
              aria-label={isLiked ? 'Unlike' : 'Like'}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Center - Controls & Progress (vertically stacked, absolutely centered) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
            {/* Control Buttons Row */}
            <div className="flex items-center gap-2">
              {/* Shuffle Button */}
              <button
                onClick={onToggleShuffle}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isShuffle ? 'bg-violet-500 text-white' : 'hover:bg-zinc-800 text-zinc-400'
                }`}
                aria-label="Shuffle"
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Previous Button */}
              <button
                className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 cursor-pointer"
                aria-label="Previous track"
                title="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play Button */}
              <button
                onClick={onTogglePlay}
                className="p-2 bg-violet-500 hover:bg-violet-600 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white fill-white" />
                ) : (
                  <Play className="w-4 h-4 text-white fill-white" />
                )}
              </button>

              {/* Next Button */}
              <button
                className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 cursor-pointer"
                aria-label="Next track"
                title="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Repeat Button */}
              <button
                onClick={onCycleRepeat}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  repeatMode !== 'off' ? 'bg-violet-500 text-white' : 'hover:bg-zinc-800 text-zinc-400'
                }`}
                aria-label="Repeat"
                title={`Repeat ${repeatMode === 'one' ? 'one' : repeatMode === 'all' ? 'all' : 'off'}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Progress Bar with Times */}
            <div className="flex items-center gap-2 w-56 sm:w-64">
              <span className="text-xs text-zinc-500">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={(e) => onProgressChange(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-violet-500
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:hover:bg-violet-400"
              />
              <span className="text-xs text-zinc-500">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Side - Lyrics, Queue, Volume */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto z-10">
            {/* Lyrics Button */}
            <button
              className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 cursor-pointer"
              aria-label="Lyrics"
              title="Lyrics"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Queue Button */}
            <button
              onClick={onToggleQueue}
              className={`p-1.5 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer ${
                isQueueOpen ? 'bg-violet-500 text-white' : 'text-zinc-400'
              }`}
              aria-label="Queue"
              title="Toggle queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMute}
                className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 cursor-pointer flex-shrink-0"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : volume < 33 ? (
                  <Volume1 className="w-4 h-4" />
                ) : volume < 66 ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <div className="w-20 sm:w-24 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value)
                    onVolumeChange(newVolume)
                    if (newVolume > 0 && isMuted) {
                      onToggleMute()
                    }
                  }}
                  className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-zinc-400
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:hover:bg-violet-400"
                  title={`Volume: ${Math.round(isMuted ? 0 : volume)}%`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
