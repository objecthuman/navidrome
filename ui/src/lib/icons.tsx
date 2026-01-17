/**
 * Pixel Icons wrapper
 * Uses HackerNoon pixel icon library via CSS classes (font-based)
 *
 * Available icons from: https://github.com/hackernoon/pixel-icon-library
 *
 * Usage:
 *   <IconName className="w-5 h-5" />
 *   <IconName style={{ fontSize: 24, color: 'red' }} />
 * Renders: <span class="hn hn-icon-name"><i></i></span>
 */

// Base available icons from library
const createIcon = (iconName: string) => {
  return function Icon(props: React.HTMLAttributes<HTMLSpanElement>) {
    return <span className={`hn hn-${iconName}`}><i {...props} /></span>;
  };
};

// Media Control Icons
export const Play = createIcon("play");
export const Pause = createIcon("pause");

// Navigation Icons
export const ChevronLeft = createIcon("angle-left");
export const ChevronRight = createIcon("angle-right");
export const ArrowLeft = createIcon("arrow-left");
export const ArrowRight = createIcon("arrow-right");

// Volume Icons
export const Volume = createIcon("sound-on");
export const VolumeX = createIcon("sound-mute");
export const Volume1 = createIcon("sound-on");
export const Volume2 = createIcon("sound-on");

// Action Icons
export const Search = createIcon("search");
export const Plus = createIcon("plus");
export const X = createIcon("times");
export const Check = createIcon("check");

// User & Account Icons
export const User = createIcon("user");
export const Lock = createIcon("lock");
export const LockOpen = createIcon("lock-open");

// Content Icons
export const Home = createIcon("home");
export const Heart = createIcon("heart");
export const Music = createIcon("music");
export const Folder = createIcon("folder");
export const FolderOpen = createIcon("folder-open");
export const Library = createIcon("folder");
export const Disc = createIcon("file-import");

// List & Layout Icons
export const ListMusic = createIcon("playlist");
export const CheckList = createIcon("check-list");
export const BulletList = createIcon("bullet-list");
export const NumberedList = createIcon("numbered-list");

// Time Icons
export const Clock = createIcon("clock");

// Media Control Extra
export const Shuffle = createIcon("shuffle");
export const SkipBack = createIcon("angle-left");
export const SkipForward = createIcon("angle-right");

// Note: Repeat icon not available, using refresh as alternative
export const Repeat = createIcon("refresh");
export const Repeat1 = createIcon("refresh");

// Note: Chevron up/down only, using angles
export const ChevronUp = createIcon("angle-up");
export const ChevronDown = createIcon("angle-down");

// Note: More vertical not available, using ellipses
export const MoreVertical = createIcon("ellipses-vertical");
export const MoreHorizontal = createIcon("ellipses-horizontal");

// Note: Mic not available, using headphones
export const Mic = createIcon("headphones");

// Note: Activity not available, using analytics
export const Activity = createIcon("analytics");

// Trash icons
export const Trash = createIcon("trash");
export const TrashAlt = createIcon("trash-alt");
export const Trash2 = TrashAlt;

// All icons exported directly, no aliases needed
