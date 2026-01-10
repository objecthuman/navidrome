import { useState, useEffect, useCallback } from "react";
import { MobileMusicPlayer } from "./MobileMusicPlayer";
import { DesktopMusicPlayer } from "./DesktopMusicPlayer";
import { subsonicService } from "../services/subsonic";
import { audioPlayer } from "../services/audioPlayer";
import type { NavidromeQueueItem } from "../services/navidrome";

interface MusicPlayerProps {
  className?: string;
  isQueueOpen: boolean;
  onToggleQueue: () => void;
  onQueueUpdate: (
    queue: NavidromeQueueItem[],
    currentSongId: string,
    isPlaying: boolean,
  ) => void;
  queue: NavidromeQueueItem[];
  currentSongId: string;
  isPlaying: boolean;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverArt: string;
  duration: number;
}

export function MusicPlayer({
  className = "",
  isQueueOpen,
  onToggleQueue,
  onQueueUpdate,
  queue,
  currentSongId: propCurrentSongId,
  isPlaying: propIsPlaying,
}: MusicPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(() => audioPlayer.getVolume());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [isLiked, setIsLiked] = useState(false);

  const [currentSong, setCurrentSong] = useState<Song>({
    id: "",
    title: "",
    artist: "",
    album: "",
    coverArt: "",
    duration: 0,
  });

  // Set up progress update callback
  useEffect(() => {
    audioPlayer.onProgressUpdate = (currentTime: number, duration: number) => {
      setCurrentTime(currentTime);
      setDuration(duration);
    };
  }, []);

  // Set up song change callback
  useEffect(() => {
    audioPlayer.setOnSongChange((songId: string) => {
      const song = queue.find((item) => item.id === songId);
      if (song) {
        setCurrentSong({
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          coverArt: song.albumId,
          duration: song.duration,
        });
        setDuration(song.duration);
        onQueueUpdate(queue, songId, true);
      }
    });
  }, [queue, onQueueUpdate]);

  // Update queue info in audio player when queue or shuffle/repeat changes
  useEffect(() => {
    const currentSongIndex = queue.findIndex(
      (item) => item.id === propCurrentSongId,
    );
    audioPlayer.setQueue({
      items: queue,
      currentIndex: currentSongIndex >= 0 ? currentSongIndex : 0,
      shuffle: isShuffle,
      repeat: repeatMode,
    });
  }, [queue, propCurrentSongId, isShuffle, repeatMode]);

  // Update current song when prop changes
  useEffect(() => {
    if (propCurrentSongId) {
      const song = queue.find((item) => item.id === propCurrentSongId);
      if (song && song.id !== currentSong.id) {
        setCurrentSong({
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          coverArt: song.albumId,
          duration: song.duration,
        });
        setDuration(song.duration);
      }
    } else {
      // Reset to empty state when no song is playing
      setCurrentSong({
        id: "",
        title: "",
        artist: "",
        album: "",
        coverArt: "",
        duration: 0,
      });
      setDuration(0);
    }
  }, [propCurrentSongId, queue, currentSong.id]);

  const handleProgressChange = useCallback((value: number) => {
    setCurrentTime(value);
    audioPlayer.seek(value);
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    setVolume(value);
    audioPlayer.setVolume(value);
  }, []);

  const handlePlaySong = useCallback(
    (songId: string) => {
      // Find the song in queue
      const song = queue.find((item) => item.id === songId);
      if (song) {
        audioPlayer.play(songId);
      }
    },
    [queue],
  );

  const togglePlay = useCallback(() => {
    if (!propCurrentSongId) return;

    audioPlayer.togglePlay(propCurrentSongId);
    const newPlayingState = !audioPlayer.getIsPlaying();
    onQueueUpdate(queue, propCurrentSongId, newPlayingState);
  }, [propCurrentSongId, queue, onQueueUpdate]);

  // Listen for toggle-play event from queue sidebar
  useEffect(() => {
    const handleTogglePlay = () => {
      togglePlay();
    };

    window.addEventListener("toggle-play", handleTogglePlay);
    return () => {
      window.removeEventListener("toggle-play", handleTogglePlay);
    };
  }, [togglePlay]);

  // Keyboard shortcut for spacebar to play/pause
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if:
      // 1. Space key is pressed
      // 2. Not typing in an input field, textarea, or contenteditable element
      // 3. There is a current song loaded
      if (
        event.code === "Space" &&
        !(
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          (event.target instanceof HTMLElement &&
            event.target.isContentEditable)
        ) &&
        propCurrentSongId
      ) {
        event.preventDefault(); // Prevent page scrolling
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlay, propCurrentSongId]);

  const toggleMute = useCallback(() => {
    const newMutedState = audioPlayer.toggleMute();
    setIsMuted(newMutedState);
  }, []);

  const handleNext = useCallback(() => {
    audioPlayer.playNext();
  }, []);

  const handlePrevious = useCallback(() => {
    audioPlayer.playPrevious();
  }, []);

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleLike = () => setIsLiked(!isLiked);
  const cycleRepeat = () => {
    if (repeatMode === "off") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("off");
  };

  return (
    <>
      {/* Mobile Music Player */}
      <MobileMusicPlayer
        currentSong={currentSong}
        isPlaying={propIsPlaying}
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
        isPlaying={propIsPlaying}
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
        onNext={handleNext}
        onPrevious={handlePrevious}
        volume={volume}
        currentSong={{
          id: currentSong.id,
          title: currentSong.title,
          artist: currentSong.artist,
          album: currentSong.album,
          coverArt: currentSong.coverArt,
        }}
      />
    </>
  );
}
