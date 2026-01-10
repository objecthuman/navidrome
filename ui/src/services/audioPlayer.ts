import { Howl } from "howler";
import { subsonicService } from "./subsonic";
import type { NavidromeQueueItem } from "./navidrome";

interface QueueInfo {
  items: NavidromeQueueItem[];
  currentIndex: number;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
}

class AudioPlayerService {
  private howl: Howl | null = null;
  private currentSongId: string | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private duration: number = 0;
  private volume: number = 75;
  private isMuted: boolean = false;
  private progressUpdateInterval: number | null = null;
  private scrobbleSent: boolean = false;
  private readonly VOLUME_STORAGE_KEY = "navidrome_volume";
  private queue: QueueInfo | null = null;
  private onSongChange?: (songId: string) => void;

  constructor() {
    // Load volume from localStorage on initialization
    this.loadVolume();
  }

  private loadVolume() {
    try {
      const savedVolume = localStorage.getItem(this.VOLUME_STORAGE_KEY);
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
      }
    } catch (error) {
      console.error("Failed to load volume from localStorage:", error);
    }
  }

  private saveVolume() {
    try {
      localStorage.setItem(this.VOLUME_STORAGE_KEY, this.volume.toString());
    } catch (error) {
      console.error("Failed to save volume to localStorage:", error);
    }
  }

  private createHowlInstance(songId: string, autoplay: boolean = true): Howl {
    // Store current song ID
    this.currentSongId = songId;

    // Get stream URL from Subsonic API
    const streamUrl = subsonicService.getStreamUrl(songId);

    // Create new Howl instance
    const howl = new Howl({
      src: [streamUrl],
      html5: true, // Force HTML5 Audio for better streaming support
      format: ["mp3"],
      volume: this.isMuted ? 0 : this.volume / 100, // Convert to 0.0-1.0 range
      autoplay: autoplay,
      onplay: () => {
        this.isPlaying = true;
        this.startProgressUpdate();

        // Scrobble "now playing" after a short delay to ensure audio is actually playing
        if (!this.scrobbleSent && this.currentSongId) {
          setTimeout(() => {
            if (this.isPlaying && this.currentSongId) {
              subsonicService.scrobble(this.currentSongId, false);
              this.scrobbleSent = true;
            }
          }, 500); // Wait 500 ms to ensure audio is playing
        }
      },
      onpause: () => {
        this.isPlaying = false;
        this.stopProgressUpdate();
      },
      onend: () => {
        // Submit final scrobble when song ends
        if (this.currentSongId) {
          subsonicService.scrobble(this.currentSongId, true);
        }

        // Handle auto-play next song
        this.playNextSong();

        this.isPlaying = false;
        this.stopProgressUpdate();
        this.currentTime = 0;
        this.scrobbleSent = false;
      },
      onstop: () => {
        this.isPlaying = false;
        this.stopProgressUpdate();
        this.currentTime = 0;
        this.scrobbleSent = false;
      },
      onload: () => {
        this.duration = this.howl?.duration() || 0;
        // Notify that duration is loaded
        this.onProgressUpdate?.(this.currentTime, this.duration);
      },
      onloaderror: (id, error) => {
        console.error("Error loading audio:", error);
      },
      onplayerror: (id, error) => {
        console.error("Error playing audio:", error);
      },
    });

    return howl;
  }

  play(songId: string) {
    // Stop any currently playing sound
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
    }

    // Reset scrobble flag
    this.scrobbleSent = false;

    // Create Howl instance and play
    this.howl = this.createHowlInstance(songId, true);

    // Notify that song is changing (for UI updates)
    this.onSongChange?.(songId);
  }

  preload(songId: string) {
    // Only preload if it's a different song
    if (this.currentSongId === songId && this.howl) {
      return;
    }

    // Stop any currently playing sound
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
    }

    // Create Howl instance without autoplay
    this.howl = this.createHowlInstance(songId, false);
  }

  setQueue(queue: QueueInfo) {
    this.queue = queue;
  }

  setOnSongChange(callback: (songId: string) => void) {
    this.onSongChange = callback;
  }

  private playNextSong() {
    if (!this.queue || !this.currentSongId || this.queue.items.length === 0) {
      return;
    }

    const { items, shuffle, repeat } = this.queue;

    // Find current song index
    const currentIndex = items.findIndex(
      (item) => item.id === this.currentSongId,
    );
    if (currentIndex === -1) {
      return;
    }

    let nextIndex = currentIndex;

    // Handle repeat modes
    if (repeat === "one") {
      // Repeat current song
      nextIndex = currentIndex;
    } else if (shuffle) {
      // Random next song
      nextIndex = Math.floor(Math.random() * items.length);
    } else {
      // Next song in queue
      nextIndex = currentIndex + 1;

      // Check if we need to loop back to start
      if (nextIndex >= items.length) {
        if (repeat === "all") {
          nextIndex = 0; // Loop back to first song
        } else {
          return; // No more songs to play
        }
      }
    }

    // Play the next song
    const nextSong = items[nextIndex];
    if (nextSong) {
      // Small delay before playing next song
      setTimeout(() => {
        this.play(nextSong.id);
        this.onSongChange?.(nextSong.id);
      }, 500);
    }
  }

  playNext() {
    if (!this.queue || !this.currentSongId || this.queue.items.length === 0) {
      return;
    }

    const { items, shuffle, repeat } = this.queue;

    // Find current song index
    const currentIndex = items.findIndex(
      (item) => item.id === this.currentSongId,
    );
    if (currentIndex === -1) {
      return;
    }

    let nextIndex = currentIndex;

    // Handle repeat modes
    if (repeat === "one") {
      // Repeat current song
      nextIndex = currentIndex;
    } else if (shuffle) {
      // Random next song
      nextIndex = Math.floor(Math.random() * items.length);
    } else {
      // Next song in queue
      nextIndex = currentIndex + 1;

      // Check if we need to loop back to start
      if (nextIndex >= items.length) {
        if (repeat === "all") {
          nextIndex = 0; // Loop back to first song
        } else {
          return; // No more songs to play
        }
      }
    }

    // Play the next song immediately (no delay for manual button press)
    const nextSong = items[nextIndex];
    if (nextSong) {
      this.play(nextSong.id);
      this.onSongChange?.(nextSong.id);
    }
  }

  playPrevious() {
    if (!this.queue || !this.currentSongId || this.queue.items.length === 0) {
      return;
    }

    const { items, shuffle, repeat } = this.queue;

    // Find current song index
    const currentIndex = items.findIndex(
      (item) => item.id === this.currentSongId,
    );
    if (currentIndex === -1) {
      return;
    }

    let prevIndex = currentIndex;

    // If shuffle is on, play a random song
    if (shuffle) {
      prevIndex = Math.floor(Math.random() * items.length);
    } else {
      // Previous song in queue
      prevIndex = currentIndex - 1;

      // Check if we need to loop back to end
      if (prevIndex < 0) {
        if (repeat === "all") {
          prevIndex = items.length - 1; // Loop back to last song
        } else {
          prevIndex = 0; // Stay at first song
        }
      }
    }

    // Play the previous song
    const prevSong = items[prevIndex];
    if (prevSong) {
      this.play(prevSong.id);
      this.onSongChange?.(prevSong.id);
    }
  }

  pause() {
    if (this.howl) {
      this.howl.pause();
    }
  }

  togglePlay(songId?: string) {
    if (!this.howl && songId) {
      this.play(songId);
    } else if (this.isPlaying) {
      this.pause();
    } else if (this.howl) {
      this.howl.play();
    }
  }

  seek(seconds: number) {
    if (this.howl) {
      this.howl.seek(seconds);
      this.currentTime = seconds;
      // Immediately notify UI of the time change, even when paused
      this.onProgressUpdate?.(this.currentTime, this.duration);
    }
  }

  setVolume(volume: number) {
    // Convert from 0-100 to 0.0-1.0 for Howler
    const normalizedVolume = volume / 100;
    this.volume = volume;
    this.saveVolume(); // Save to localStorage

    if (this.howl && !this.isMuted) {
      this.howl.volume(normalizedVolume);
    }

    // Unmute if volume is set above 0
    if (volume > 0 && this.isMuted) {
      this.isMuted = false;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.howl) {
      this.howl.volume(this.isMuted ? 0 : this.volume / 100);
    }
    return this.isMuted;
  }

  stop() {
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
      this.howl = null;
    }
    this.isPlaying = false;
    this.stopProgressUpdate();
  }

  private startProgressUpdate() {
    this.stopProgressUpdate(); // Clear any existing interval

    this.progressUpdateInterval = window.setInterval(() => {
      if (this.howl && this.isPlaying) {
        this.currentTime = this.howl.seek() as number;
        // Emit progress event or update state here
        this.onProgressUpdate?.(this.currentTime, this.duration);
      }
    }, 100); // Update every 100ms
  }

  private stopProgressUpdate() {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
      this.progressUpdateInterval = null;
    }
  }

  // Optional: Callback for progress updates
  onProgressUpdate?: (currentTime: number, duration: number) => void;

  // Getters
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.duration;
  }

  getVolume(): number {
    return this.volume;
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const audioPlayer = new AudioPlayerService();
