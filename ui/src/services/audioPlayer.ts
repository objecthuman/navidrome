import { Howl } from 'howler'
import { subsonicService } from './subsonic'

class AudioPlayerService {
  private howl: Howl | null = null
  private isPlaying: boolean = false
  private currentTime: number = 0
  private duration: number = 0
  private volume: number = 0.75
  private isMuted: boolean = false
  private progressUpdateInterval: number | null = null

  play(songId: string) {
    // Stop any currently playing sound
    if (this.howl) {
      this.howl.stop()
      this.howl.unload()
    }

    // Get stream URL from Subsonic API
    const streamUrl = subsonicService.getStreamUrl(songId)

    // Create new Howl instance
    this.howl = new Howl({
      src: [streamUrl],
      html5: true, // Force HTML5 Audio for better streaming support
      format: ['mp3'],
      volume: this.isMuted ? 0 : this.volume / 100, // Convert to 0.0-1.0 range
      onplay: () => {
        this.isPlaying = true
        this.startProgressUpdate()
      },
      onpause: () => {
        this.isPlaying = false
        this.stopProgressUpdate()
      },
      onend: () => {
        this.isPlaying = false
        this.stopProgressUpdate()
        this.currentTime = 0
      },
      onstop: () => {
        this.isPlaying = false
        this.stopProgressUpdate()
        this.currentTime = 0
      },
      onload: () => {
        this.duration = this.howl?.duration() || 0
      },
      onloaderror: (id, error) => {
        console.error('Error loading audio:', error)
      },
      onplayerror: (id, error) => {
        console.error('Error playing audio:', error)
      },
    })

    // Start playing
    this.howl.play()
  }

  pause() {
    if (this.howl) {
      this.howl.pause()
    }
  }

  togglePlay(songId?: string) {
    if (!this.howl && songId) {
      this.play(songId)
    } else if (this.isPlaying) {
      this.pause()
    } else if (this.howl) {
      this.howl.play()
    }
  }

  seek(seconds: number) {
    if (this.howl) {
      this.howl.seek(seconds)
      this.currentTime = seconds
    }
  }

  setVolume(volume: number) {
    // Convert from 0-100 to 0.0-1.0 for Howler
    const normalizedVolume = volume / 100
    this.volume = volume
    if (this.howl && !this.isMuted) {
      this.howl.volume(normalizedVolume)
    }

    // Unmute if volume is set above 0
    if (volume > 0 && this.isMuted) {
      this.isMuted = false
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    if (this.howl) {
      this.howl.volume(this.isMuted ? 0 : this.volume / 100)
    }
    return this.isMuted
  }

  stop() {
    if (this.howl) {
      this.howl.stop()
      this.howl.unload()
      this.howl = null
    }
    this.isPlaying = false
    this.stopProgressUpdate()
  }

  private startProgressUpdate() {
    this.stopProgressUpdate() // Clear any existing interval

    this.progressUpdateInterval = window.setInterval(() => {
      if (this.howl && this.isPlaying) {
        this.currentTime = this.howl.seek() as number
        // Emit progress event or update state here
        this.onProgressUpdate?.(this.currentTime, this.duration)
      }
    }, 100) // Update every 100ms
  }

  private stopProgressUpdate() {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval)
      this.progressUpdateInterval = null
    }
  }

  // Optional: Callback for progress updates
  onProgressUpdate?: (currentTime: number, duration: number) => void

  // Getters
  getIsPlaying(): boolean {
    return this.isPlaying
  }

  getCurrentTime(): number {
    return this.currentTime
  }

  getDuration(): number {
    return this.duration
  }

  getVolume(): number {
    return this.volume
  }

  getIsMuted(): boolean {
    return this.isMuted
  }
}

export const audioPlayer = new AudioPlayerService()
