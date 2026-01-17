import { useState, useEffect, useRef } from "react";
import { Play, Pause, Heart } from "../lib/icons";
import { Button } from "./ui/8bit/button";

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverArt: string;
}

interface MobileMusicPlayerProps {
  currentSong: Song;
  isPlaying: boolean;
  isLiked: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onToggleLike: () => void;
  onExpand: () => void;
}

// Extract dominant color from image
const extractDominantColor = (imgElement: HTMLImageElement): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "139, 92, 246"; // Default violet color

  // Scale down for performance
  const size = 50;
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(imgElement, 0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  let r = 0,
    g = 0,
    b = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    // Skip transparent pixels
    if (data[i + 3] < 128) continue;

    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  if (count === 0) return "139, 92, 246";

  r = Math.floor(r / count);
  g = Math.floor(g / count);
  b = Math.floor(b / count);

  return `${r}, ${g}, ${b}`;
};

export function MobileMusicPlayer({
  currentSong,
  isPlaying,
  isLiked,
  currentTime,
  duration,
  onTogglePlay,
  onToggleLike,
  onExpand,
}: MobileMusicPlayerProps) {
  const [dominantColor, setDominantColor] = useState("139, 92, 246"); // Default violet
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const color = extractDominantColor(img);
      setDominantColor(color);
    };
    img.onerror = () => {
      setDominantColor("139, 92, 246"); // Fallback to violet
    };
    img.src = `https://picsum.photos/seed/${currentSong.id}/300/300`;
  }, [currentSong.id]);

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-4 border-foreground/30 dark:border-ring/30 z-50">
      {/* Background Progress Bar */}
      <div
        className="absolute bottom-0 left-0 top-0 transition-all duration-300 ease-out"
        style={{
          width: `${progressPercent}%`,
          backgroundColor: `rgba(${dominantColor}, 0.3)`,
        }}
      />

      {/* Content */}
      <div className="relative flex items-center justify-between px-3 py-2 h-16">
        {/* Left - Like Button & Play/Pause */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleLike}
            className={isLiked ? "text-red-500" : "text-zinc-400"}
            aria-label={isLiked ? "Unlike" : "Like"}
            title={isLiked ? "Unlike" : "Like"}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          </Button>

          {/* Play/Pause Button */}
          <Button
            variant="default"
            size="icon"
            onClick={onTogglePlay}
            className="bg-violet-500 hover:bg-violet-600 flex-shrink-0"
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white" />
            )}
          </Button>
        </div>

        {/* Center - Song Info */}
        <div className="flex-1 min-w-0 mx-2 cursor-pointer" onClick={onExpand}>
          <p className="text-xs text-zinc-400 truncate retro">{currentSong.artist}</p>
          <h4 className="font-semibold text-sm text-white truncate retro">
            {currentSong.title}
          </h4>
        </div>

        {/* Right - Cover Art */}
        <div
          className="w-12 h-12 border-2 border-foreground/30 dark:border-ring/30 overflow-hidden bg-zinc-800 cursor-pointer"
          onClick={onExpand}
        >
          <img
            ref={imgRef}
            src={`https://picsum.photos/seed/${currentSong.id}/300/300`}
            alt={currentSong.album}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
