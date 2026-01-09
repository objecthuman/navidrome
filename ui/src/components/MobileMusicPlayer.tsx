import { useState } from 'react'
import { Play, Pause, Heart } from 'lucide-react'

interface Song {
  id: string
  title: string
  artist: string
  album: string
  coverArt: string
}

interface MobileMusicPlayerProps {
  currentSong: Song
  isPlaying: boolean
  isLiked: boolean
  onTogglePlay: () => void
  onToggleLike: () => void
  onExpand: () => void
}

export function MobileMusicPlayer({
  currentSong,
  isPlaying,
  isLiked,
  onTogglePlay,
  onToggleLike,
  onExpand,
}: MobileMusicPlayerProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 z-50">
      <div className="flex items-center justify-between px-3 py-2 h-16">
        {/* Left - Like Button & Play/Pause */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Like Button */}
          <button
            onClick={onToggleLike}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isLiked ? 'text-red-500' : 'text-zinc-400 hover:bg-zinc-800'
            }`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="p-2 bg-violet-500 hover:bg-violet-600 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white fill-white" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white" />
            )}
          </button>
        </div>

        {/* Center - Song Info */}
        <div className="flex-1 min-w-0 mx-2 cursor-pointer" onClick={onExpand}>
          <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
          <h4 className="font-semibold text-sm text-white truncate">{currentSong.title}</h4>
        </div>

        {/* Right - Cover Art */}
        <div
          className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shadow-lg cursor-pointer"
          onClick={onExpand}
        >
          <img
            src={`https://picsum.photos/seed/${currentSong.id}/300/300`}
            alt={currentSong.album}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
