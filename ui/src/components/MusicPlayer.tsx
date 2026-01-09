import { useState } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react'

interface MusicPlayerProps {
  className?: string
}

interface Song {
  id: string
  title: string
  artist: string
  album: string
  coverArt: string
  duration: number
}

export function MusicPlayer({ className = '' }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(75)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(333) // Sample duration in seconds
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off')
  const [isExpanded, setIsExpanded] = useState(false)

  // Mock current song
  const currentSong: Song = {
    id: 'demo',
    title: 'Euta Manchheko Maya',
    artist: 'Narayan Gopal',
    album: 'Geeti Yatra',
    coverArt: 'demo-cover',
    duration: 333,
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseFloat(e.target.value))
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value))
    if (parseFloat(e.target.value) > 0) {
      setIsMuted(false)
    }
  }

  const togglePlay = () => setIsPlaying(!isPlaying)
  const toggleMute = () => setIsMuted(!isMuted)
  const toggleShuffle = () => setIsShuffle(!isShuffle)
  const cycleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all')
    else if (repeatMode === 'all') setRepeatMode('one')
    else setRepeatMode('off')
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800
        ${isExpanded ? 'h-auto' : 'h-20'}
        transition-all duration-300 ease-in-out z-50 ${className}`}
    >
      {/* Expanded View */}
      {isExpanded && (
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-zinc-800 shadow-xl">
                <img
                  src={`https://picsum.photos/seed/${currentSong.id}/300/300`}
                  alt={currentSong.album}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {currentSong.title}
                </h3>
                <p className="text-sm text-zinc-400">{currentSong.artist}</p>
                <p className="text-xs text-zinc-500 mt-1">{currentSong.album}</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              aria-label="Collapse player"
            >
              <Minimize2 className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Progress Bar - Expanded */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-violet-500
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:hover:bg-violet-400"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls - Expanded */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-colors ${
                  isShuffle ? 'bg-violet-500 text-white' : 'hover:bg-zinc-800 text-zinc-400'
                }`}
                aria-label="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>
              <button
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
                aria-label="Previous track"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={togglePlay}
                className="p-4 bg-violet-500 hover:bg-violet-600 rounded-full transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white fill-white" />
                ) : (
                  <Play className="w-8 h-8 text-white fill-white" />
                )}
              </button>
              <button
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
                aria-label="Next track"
              >
                <SkipForward className="w-6 h-6" />
              </button>
              <button
                onClick={cycleRepeat}
                className={`p-2 rounded-full transition-colors relative ${
                  repeatMode !== 'off' ? 'bg-violet-500 text-white' : 'hover:bg-zinc-800 text-zinc-400'
                }`}
                aria-label="Repeat"
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Volume Control - Expanded */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <div className="w-32">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-zinc-400
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:hover:bg-zinc-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed View - Default */}
      {!isExpanded && (
        <div className="flex items-center gap-4 px-4 py-3 h-20">
          {/* Cover Art */}
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 shadow-lg flex-shrink-0 cursor-pointer"
               onClick={() => setIsExpanded(true)}>
            <img
              src={`https://picsum.photos/seed/${currentSong.id}/300/300`}
              alt={currentSong.album}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Time Display */}
          <div className="text-xs text-zinc-500 hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Song Info & Progress */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsExpanded(true)}>
            <h4 className="font-semibold text-sm text-white truncate">
              {currentSong.title}
            </h4>
            <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
            <div className="mt-2">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-violet-500
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:hover:bg-violet-400"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <button
              onClick={togglePlay}
              className="p-3 bg-violet-500 hover:bg-violet-600 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white" />
              )}
            </button>
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors sm:hidden"
              aria-label="Expand player"
            >
              <Maximize2 className="w-5 h-5 text-zinc-400" />
            </button>
            <button
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors hidden sm:block"
              onClick={() => setIsExpanded(true)}
              aria-label="Expand player"
            >
              <Maximize2 className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
