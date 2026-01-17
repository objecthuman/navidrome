import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Repeat1,
  Mic,
  ListMusic,
  Heart,
} from "../lib/icons";
import type { NavidromeQueueItem } from "../services/navidrome";
import { subsonicService } from "../services/subsonic";
import { Button } from "./ui/8bit/button";

interface DesktopMusicPlayerProps {
  className?: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: "off" | "all" | "one";
  isLiked: boolean;
  queue: NavidromeQueueItem[];
  currentSongId?: string;
  isQueueOpen: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleLike: () => void;
  onCycleRepeat: () => void;
  onProgressChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onPlaySong: (songId: string) => void;
  onToggleQueue: () => void;
  onNext: () => void;
  onPrevious: () => void;
  volume: number;
  currentSong?: {
    id: string;
    title: string;
    artist: string;
    album: string;
    coverArt: string;
  };
}


export function DesktopMusicPlayer({
  className = "",
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
  onNext,
  onPrevious,
  volume,
  currentSong,
}: DesktopMusicPlayerProps) {
  // Find current song from queue if not provided
  const displayedSong =
    currentSong || queue.find((item) => item.id === currentSongId);
  const hasCurrentSong = displayedSong && displayedSong.id !== "";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div
        className={`hidden md:block fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md border-t-4 border-foreground/30 dark:border-ring/30 h-20 transition-all duration-300 ease-in-out z-50 ${className}`}
      >
        <div className="relative flex items-center px-4 py-3 h-20">
          {/* Left Side - Cover Art, Song Info & Like */}
          <div className="flex items-center gap-3 flex-shrink-0 z-10">
            {/* Cover Art */}
            <div className="w-14 h-14 border-2 border-foreground/30 dark:border-ring/30 overflow-hidden bg-zinc-800">
              {displayedSong ? (
                <img
                  src={subsonicService.getCoverArtUrl(
                    displayedSong.coverArt,
                    200,
                  )}
                  alt={displayedSong.album}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-foreground/50 dark:border-ring/50"></div>
                </div>
              )}
            </div>

            {/* Song Info */}
            <div>
              <h4
                className="font-semibold text-sm text-white truncate max-w-[150px] sm:max-w-[200px] hover:text-violet-400 transition-colors cursor-pointer retro"
                onClick={() =>
                  displayedSong && console.log("Song clicked:", displayedSong)
                }
                title="View song details"
              >
                {displayedSong?.title || "No song playing"}
              </h4>
              <p
                className="text-xs text-zinc-400 truncate max-w-[150px] sm:max-w-[200px] hover:text-violet-400 transition-colors cursor-pointer retro"
                onClick={() =>
                  displayedSong &&
                  console.log("Artist clicked:", displayedSong.artist)
                }
                title="View artist details"
              >
                {displayedSong?.artist || ""}
              </p>
            </div>

            {/* Like Button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleLike}
              className={isLiked ? "text-red-500" : "text-zinc-400"}
              aria-label={isLiked ? "Unlike" : "Like"}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
          </div>

          {/* Center - Controls & Progress (vertically stacked, absolutely centered) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
            {/* Control Buttons Row */}
            <div className="flex items-center gap-2">
              {/* Shuffle Button */}
              <Button
                variant={isShuffle ? "default" : "ghost"}
                size="icon-sm"
                onClick={onToggleShuffle}
                className={isShuffle ? "bg-violet-500 text-white" : "text-zinc-400"}
                aria-label="Shuffle"
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </Button>

              {/* Previous Button */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onPrevious}
                disabled={!hasCurrentSong}
                className="text-zinc-400"
                aria-label="Previous track"
                title="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              {/* Play Button */}
              <Button
                variant="default"
                size="icon"
                onClick={onTogglePlay}
                disabled={!hasCurrentSong}
                className="bg-violet-500 hover:bg-violet-600 flex-shrink-0"
                aria-label={isPlaying ? "Pause" : "Play"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
              </Button>

              {/* Next Button */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onNext}
                disabled={!hasCurrentSong}
                className="text-zinc-400"
                aria-label="Next track"
                title="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              {/* Repeat Button */}
              <Button
                variant={repeatMode !== "off" ? "default" : "ghost"}
                size="icon-sm"
                onClick={onCycleRepeat}
                className={repeatMode !== "off" ? "bg-violet-500 text-white" : "text-zinc-400"}
                aria-label="Repeat"
                title={`Repeat ${repeatMode === "one" ? "one" : repeatMode === "all" ? "all" : "off"}`}
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Progress Bar with Times */}
            <div className="flex items-center gap-2 w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[450px]">
              <span className="text-xs text-zinc-500 flex-shrink-0 retro">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={(e) => onProgressChange(parseFloat(e.target.value))}
                className="flex-1 min-w-0 h-1 bg-zinc-700 border-2 border-foreground/20 dark:border-ring/20 appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-violet-500 [&::-webkit-slider-thumb]:bg-transparent
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:hover:border-violet-400"
              />
              <span className="text-xs text-zinc-500 flex-shrink-0 retro">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Side - Lyrics, Queue, Volume */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto z-10">
            {/* Lyrics Button */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-zinc-400"
              aria-label="Lyrics"
              title="Lyrics"
            >
              <Mic className="w-4 h-4" />
            </Button>

            {/* Queue Button */}
            <Button
              variant={isQueueOpen ? "default" : "ghost"}
              size="icon-sm"
              onClick={onToggleQueue}
              className={isQueueOpen ? "bg-violet-500 text-white" : "text-zinc-400"}
              aria-label="Queue"
              title="Toggle queue"
            >
              <ListMusic className="w-4 h-4" />
            </Button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggleMute}
                className="text-zinc-400 flex-shrink-0"
                aria-label={isMuted ? "Unmute" : "Mute"}
                title={isMuted ? "Unmute" : "Mute"}
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
              </Button>

              <div className="w-20 sm:w-24 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    onVolumeChange(newVolume);
                    if (newVolume > 0 && isMuted) {
                      onToggleMute();
                    }
                  }}
                  className="w-full h-1 bg-zinc-700 border-2 border-foreground/20 dark:border-ring/20 appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:bg-transparent
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:hover:border-violet-400"
                  title={`Volume: ${Math.round(isMuted ? 0 : volume)}%`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
