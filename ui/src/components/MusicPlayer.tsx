import { useState } from 'react'
import { MobileMusicPlayer } from './MobileMusicPlayer'
import { DesktopMusicPlayer } from './DesktopMusicPlayer'

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
  const [duration] = useState(333) // Sample duration in seconds
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off')
  const [isLiked, setIsLiked] = useState(false)

  // Mock current song
  const currentSong: Song = {
    id: 'demo',
    title: 'Euta Manchheko Maya',
    artist: 'Narayan Gopal',
    album: 'Geeti Yatra',
    coverArt: 'demo-cover',
    duration: 333,
  }

  const handleProgressChange = (value: number) => {
    setCurrentTime(value)
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
  }

  const togglePlay = () => setIsPlaying(!isPlaying)
  const toggleMute = () => setIsMuted(!isMuted)
  const toggleShuffle = () => setIsShuffle(!isShuffle)
  const toggleLike = () => setIsLiked(!isLiked)
  const cycleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all')
    else if (repeatMode === 'all') setRepeatMode('one')
    else setRepeatMode('off')
  }

  return (
    <>
      {/* Mobile Music Player */}
      <MobileMusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        isLiked={isLiked}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={togglePlay}
        onToggleLike={toggleLike}
        onExpand={() => {}}
      />

      {/* Desktop Music Player */}
      <DesktopMusicPlayer
        className={className}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        isMuted={isMuted}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        isLiked={isLiked}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
        onToggleShuffle={toggleShuffle}
        onToggleLike={toggleLike}
        onCycleRepeat={cycleRepeat}
        onProgressChange={handleProgressChange}
        onVolumeChange={handleVolumeChange}
        volume={volume}
      />
    </>
  )
}
