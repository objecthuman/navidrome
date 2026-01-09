import { useState, useEffect } from 'react'
import { MobileMusicPlayer } from './MobileMusicPlayer'
import { DesktopMusicPlayer } from './DesktopMusicPlayer'
import { navidromeService } from '../services/navidrome'
import { subsonicService } from '../services/subsonic'
import type { NavidromeQueueItem } from '../services/navidrome'

interface MusicPlayerProps {
  className?: string
  isQueueOpen: boolean
  onToggleQueue: () => void
  onQueueUpdate: (queue: NavidromeQueueItem[], currentSongId: string, isPlaying: boolean) => void
}

interface Song {
  id: string
  title: string
  artist: string
  album: string
  coverArt: string
  duration: number
}

export function MusicPlayer({ className = '', isQueueOpen, onToggleQueue, onQueueUpdate }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(75)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(333) // Sample duration in seconds
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off')
  const [isLiked, setIsLiked] = useState(false)

  const [currentSong, setCurrentSong] = useState<Song>({
    id: 'demo',
    title: 'Euta Manchheko Maya',
    artist: 'Narayan Gopal',
    album: 'Geeti Yatra',
    coverArt: 'demo-cover',
    duration: 333,
  })

  const [queue, setQueue] = useState<NavidromeQueueItem[]>([])

  // Fetch the current queue on mount
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const queue = await navidromeService.getQueue()

        // Get current song from queue
        if (queue.items && queue.items.length > 0) {
          // Use current index if available and valid, otherwise use first song
          const currentIndex = queue.current !== undefined && queue.current >= 0 ? queue.current : 0
          const currentItem = queue.items[currentIndex]

          if (currentItem) {
            setCurrentSong({
              id: currentItem.id,
              title: currentItem.title,
              artist: currentItem.artist,
              album: currentItem.album,
              coverArt: currentItem.albumId, // Use albumId for cover art
              duration: currentItem.duration,
            })

            setDuration(currentItem.duration)

            // Set current position from queue (in seconds)
            if (queue.position) {
              setCurrentTime(queue.position / 1000) // Convert ms to seconds
            }

            // Set queue entries and notify parent
            setQueue(queue.items)
            onQueueUpdate(queue.items, currentItem.id, false)
          }
        } else {
          // Queue is empty, just set empty queue
          setQueue([])
        }

        console.log('Queue loaded:', queue)
      } catch (error) {
        console.error('Failed to fetch queue:', error)
        // Keep using mock data if queue fetch fails
        setQueue([])
      }
    }

    fetchQueue()
  }, [onQueueUpdate])

  const handleProgressChange = (value: number) => {
    setCurrentTime(value)
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
  }

  const handlePlaySong = (songId: string) => {
    console.log('Play song:', songId)
    setCurrentSong((prev) => ({ ...prev, id: songId }))
    // TODO: Implement actual song playback logic
  }

  const togglePlay = () => {
    const newPlayingState = !isPlaying
    setIsPlaying(newPlayingState)
    // Update parent about playing state change
    if (queue.length > 0) {
      onQueueUpdate(queue, currentSong.id, newPlayingState)
    }
  }

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
        queue={queue}
        currentSongId={currentSong.id}
        isQueueOpen={isQueueOpen}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
        onToggleShuffle={toggleShuffle}
        onToggleLike={toggleLike}
        onCycleRepeat={cycleRepeat}
        onProgressChange={handleProgressChange}
        onVolumeChange={handleVolumeChange}
        onPlaySong={handlePlaySong}
        onToggleQueue={onToggleQueue}
        volume={volume}
      />
    </>
  )
}
