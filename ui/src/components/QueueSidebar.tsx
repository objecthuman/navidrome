import { X, Play, Pause, Trash2 } from "lucide-react";
import { subsonicService } from "../services/subsonic";
import type { NavidromeQueueItem } from "../services/navidrome";
import { Button } from "./ui/8bit/button";

interface QueueSidebarProps {
  isOpen: boolean;
  queue: NavidromeQueueItem[];
  currentSongId?: string;
  isPlaying: boolean;
  onClose: () => void;
  onPlaySong: (songId: string) => void;
  onClearQueue: () => void;
}

export function QueueSidebar({
  isOpen,
  queue,
  currentSongId,
  isPlaying,
  onClose,
  onPlaySong,
  onClearQueue,
}: QueueSidebarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed top-20 bottom-20 right-0 w-80 bg-zinc-900/98 backdrop-blur-xl border-l-2 border-zinc-800 z-40
        transition-transform duration-300 ease-in-out translate-x-0 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b-2 border-zinc-800">
        <h2 className="text-xl font-bold text-white retro">Queue</h2>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearQueue}
              aria-label="Clear queue"
              title="Clear queue"
              className="hover:text-red-400"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close queue"
            title="Close queue"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Queue Info */}
      {queue.length > 0 && (
        <div className="px-6 py-3 border-b-2 border-zinc-800">
          <p className="text-sm text-zinc-400 retro">
            <span className="font-medium text-white">{queue.length}</span> songs
            in queue
          </p>
        </div>
      )}

      {/* Queue Items */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent overflow-x-hidden">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-zinc-800 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-zinc-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 retro">
              Queue is empty
            </h3>
            <p className="text-sm text-zinc-500 retro">
              Add songs to your queue to see them here
            </p>
          </div>
        ) : (
          <div className="p-2">
            {queue.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                onClick={() => onPlaySong(song.id)}
                className={`flex items-center gap-4 p-3 cursor-pointer transition-all duration-200 group retro
                  ${
                    song.id === currentSongId
                      ? "bg-violet-500/20 border-2 border-violet-500/50"
                      : "hover:bg-zinc-800/50 border-2 border-transparent"
                  }`}
              >
                {/* Song Number / Playing Indicator */}
                <div className="flex-shrink-0 w-8 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (song.id === currentSongId && isPlaying) {
                        window.dispatchEvent(new CustomEvent("toggle-play"));
                      } else {
                        onPlaySong(song.id);
                      }
                    }}
                    aria-label={
                      song.id === currentSongId && isPlaying ? "Pause" : "Play"
                    }
                    title={
                      song.id === currentSongId && isPlaying ? "Pause" : "Play"
                    }
                    className="w-full h-full"
                  >
                    {song.id === currentSongId && isPlaying ? (
                      <div className="flex items-center gap-0.5 h-4">
                        <span
                          className="w-1 bg-violet-400 animate-equalizer-1"
                          style={{ animationDelay: "0ms" }}
                        ></span>
                        <span
                          className="w-1 bg-violet-400 animate-equalizer-2"
                          style={{ animationDelay: "150ms" }}
                        ></span>
                        <span
                          className="w-1 bg-violet-400 animate-equalizer-3"
                          style={{ animationDelay: "300ms" }}
                        ></span>
                        <span
                          className="w-1 bg-violet-400 animate-equalizer-2"
                          style={{ animationDelay: "450ms" }}
                        ></span>
                      </div>
                    ) : (
                      <Play className="w-4 h-4 text-zinc-500 hover:text-violet-400 transition-colors" />
                    )}
                  </Button>
                </div>

                {/* Cover Art */}
                <div className="w-14 h-14 overflow-hidden bg-zinc-800 flex-shrink-0 shadow-lg relative">
                  <img
                    src={subsonicService.getCoverArtUrl(song.albumId, 200)}
                    alt={song.album}
                    className="w-full h-full object-cover"
                  />
                  {/* Play button overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      variant="default"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (song.id === currentSongId && isPlaying) {
                          window.dispatchEvent(new CustomEvent("toggle-play"));
                        } else {
                          onPlaySong(song.id);
                        }
                      }}
                      aria-label={
                        song.id === currentSongId && isPlaying
                          ? "Pause song"
                          : "Play song"
                      }
                      title={
                        song.id === currentSongId && isPlaying
                          ? "Pause song"
                          : "Play song"
                      }
                      className="transform scale-0 group-hover:scale-100 transition-transform duration-300"
                    >
                      {song.id === currentSongId && isPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white fill-white" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-medium truncate mb-0.5 retro ${
                      song.id === currentSongId
                        ? "text-violet-400"
                        : "text-white group-hover:text-violet-300"
                    } transition-colors`}
                  >
                    {song.title}
                  </h4>
                  <p className="text-sm text-zinc-400 truncate retro">
                    {song.artist}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5 retro">
                    {song.album}
                  </p>
                </div>

                {/* Duration */}
                <div className="flex-shrink-0 text-sm text-zinc-500 font-medium retro">
                  {formatTime(song.duration)}
                </div>
              </div>
            ))}
          </div>
                    ) : (
                      <Play className="w-4 h-4 text-zinc-500 hover:text-violet-400 transition-colors" />
                    )}
                  </button>
                </div>

                {/* Cover Art */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 shadow-lg relative">
                  <img
                    src={subsonicService.getCoverArtUrl(song.albumId, 200)}
                    alt={song.album}
                    className="w-full h-full object-cover"
                  />
                  {/* Play button overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (song.id === currentSongId && isPlaying) {
                          // Pause the current song
                          window.dispatchEvent(new CustomEvent("toggle-play"));
                        } else {
                          // Play this song
                          onPlaySong(song.id);
                        }
                      }}
                      className="p-2 bg-violet-500 hover:bg-violet-600 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300 cursor-pointer"
                      aria-label={
                        song.id === currentSongId && isPlaying
                          ? "Pause song"
                          : "Play song"
                      }
                      title={
                        song.id === currentSongId && isPlaying
                          ? "Pause song"
                          : "Play song"
                      }
                    >
                      {song.id === currentSongId && isPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white fill-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-medium truncate mb-0.5 ${
                      song.id === currentSongId
                        ? "text-violet-400"
                        : "text-white group-hover:text-violet-300"
                    } transition-colors`}
                  >
                    {song.title}
                  </h4>
                  <p className="text-sm text-zinc-400 truncate">
                    {song.artist}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {song.album}
                  </p>
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
  );
}
