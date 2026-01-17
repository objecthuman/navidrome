export function MobilePlayerBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-sm border-t-2 border-zinc-800 px-4 py-3 md:hidden">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-zinc-800"></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate retro">Now Playing</p>
          <p className="text-xs text-zinc-400 truncate retro">Artist</p>
        </div>
      </div>
    </div>
  );
}
