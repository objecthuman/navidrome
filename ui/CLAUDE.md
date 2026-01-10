# Navidrome UI - Project Documentation

## Overview

A modern, mobile-first web music player interface for Navidrome music server. Built with React, TypeScript, and Tailwind CSS v4, featuring a dark-themed, lightweight UI optimized for mobile devices.

---

## Tech Stack

### Core Framework
- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.2.4** - Build tool and dev server
- **React Router DOM 6.28+** - Client-side routing

### Styling
- **Tailwind CSS 4.1.18** - Utility-first CSS framework (using `@tailwindcss/vite` plugin)
- **CSS Features**:
  - Dark theme by default (zinc color palette)
  - Violet/fuchsia accent colors
  - Mobile-first responsive design
  - Smooth transitions and animations

### Icons
- **Lucide React 0.562.0** - Icon library

### Audio
- **Howler.js 2.2.4** - Audio player library (for future music playback)

### Code Quality
- **ESLint 9.39.1** - Code linting
- **typescript-eslint 8.46.4** - TypeScript linting rules

---

## Project Structure

```
ui/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.tsx           # Fixed navigation bar
│   │   ├── Sidebar.tsx          # Collapsible sidebar navigation
│   │   ├── MusicPlayer.tsx      # Music player wrapper (mobile/desktop)
│   │   ├── MobileMusicPlayer.tsx   # Mobile-optimized music player
│   │   ├── DesktopMusicPlayer.tsx  # Desktop music player with controls
│   │   ├── QueueSidebar.tsx     # Slide-out queue panel
│   │   ├── AlbumSlideshow.tsx   # Discover section with colored cards
│   │   ├── MostPlayed.tsx       # Most played albums slideshow
│   │   └── RecentlyPlayed.tsx    # Recently played albums slideshow
│   ├── contexts/          # React Context for global state
│   │   └── AppContext.tsx    # Shared app state (queue, playback, etc.)
│   ├── config/            # Configuration files
│   │   └── api.ts         # API configuration (environment variables)
│   ├── pages/             # Page-level components
│   │   ├── LoginPage.tsx   # Login form
│   │   ├── SignupPage.tsx  # Signup form
│   │   ├── HomePage.tsx    # Home page with album carousels
│   │   └── AlbumPage.tsx   # Album detail page with tracklist
│   ├── services/          # Business logic & API calls
│   │   ├── auth.ts        # Authentication service
│   │   ├── audioPlayer.ts # Audio playback (Howler.js wrapper)
│   │   ├── navidrome.ts   # Navidrome API service (/api/*)
│   │   └── subsonic.ts    # Subsonic API service (/rest/*)
│   ├── router.tsx         # React Router v6 configuration
│   ├── App.tsx            # Main app layout component
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Global styles (Tailwind + animations)
│   └── vite-env.d.ts      # TypeScript definitions for Vite env vars
├── .env                   # Environment variables (gitignored)
├── .env.example           # Environment variable template
├── .gitignore             # Git ignore rules
├── CLAUDE.md              # This documentation file
├── eslint.config.js       # ESLint configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json      # App-specific TypeScript config
├── tsconfig.node.json     # Node-specific TypeScript config
└── vite.config.ts         # Vite build configuration
```

---

## New Files & Components

### Routing & Context
- **`src/router.tsx`** - React Router configuration with protected/public routes
- **`src/contexts/AppContext.tsx`** - Global app state (queue, playback, navigation)

### Pages
- **`src/pages/HomePage.tsx`** - Home page with album carousels (MostPlayed, RecentlyPlayed, AlbumSlideshow)
- **`src/pages/AlbumPage.tsx`** - Album detail page with tracklist, metadata, and like buttons

### Components
- **`src/components/QueueSidebar.tsx`** - Right sidebar showing current queue with clear button
- **`src/components/MobileMusicPlayer.tsx`** - Mobile-optimized bottom music player bar
- **`src/components/DesktopMusicPlayer.tsx`** - Desktop music player with full controls

### Services
- **`src/services/audioPlayer.ts`** - Howler.js wrapper for audio playback, queue management, scrobbling

---

## Conventions

### File Naming
- **Components**: PascalCase (e.g., `Navbar.tsx`, `LoginPage.tsx`)
- **Services**: camelCase (e.g., `auth.ts`)
- **Config**: camelCase (e.g., `api.ts`)

### Component Structure
```typescript
// 1. Imports (external libs first, then internal)
import { useState } from 'react'
import { SomeIcon } from 'lucide-react'
import { Navbar } from './components/Navbar'

// 2. Interface definitions (if any)
interface Props {
  // props
}

// 3. Component function
export function ComponentName({ props }: Props) {
  // 4. Hooks
  const [state, setState] = useState()

  // 5. Event handlers
  const handleClick = () => {}

  // 6. Effects
  useEffect(() => {}, [])

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### TypeScript
- Always define interfaces for props
- Use strict mode (enabled in tsconfig)
- Prefer explicit return types for functions
- Use type inference where appropriate

### Styling Conventions
- **Color Palette**:
  - Background: `zinc-950` (main), `zinc-900` (components)
  - Text: `white`, `zinc-300`, `zinc-400`
  - Accents: `violet-500`, `fuchsia-500`
  - Borders: `zinc-800`
- **Spacing**: Use Tailwind's scale (4px base unit)
- **Responsive breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
- **Mobile-first**: Write styles for mobile, use `md:`+ for desktop

### State Management
- Use React hooks for local state
- Keep component state local when possible
- Use localStorage for persistence (auth data)

---

## Component Architecture

### Routing (React Router v6)
The app uses React Router for URL-based routing configured in `src/router.tsx`.

**Route Structure:**
- `/` → Redirects based on auth
- `/login` → Standalone login page
- `/signup` → Standalone signup page
- `/home` → Home page (inside App layout)
- `/album/:albumId` → Album detail page (inside App layout)

**Protected Routes:**
- Routes inside App layout (`/home`, `/album/*`) require authentication
- Auth pages render standalone without App layout

### Component Hierarchy
```
App (main layout wrapper - persistent)
├── Navbar (fixed top)
├── Sidebar (collapsible)
├── QueueSidebar (slide-out panel)
├── MusicPlayer (wrapper)
│   ├── MobileMusicPlayer (mobile only)
│   └── DesktopMusicPlayer (desktop only)
└── <Outlet /> (renders child routes)
    ├── HomePage
    │   ├── AlbumSlideshow
    │   ├── MostPlayed
    │   └── RecentlyPlayed
    └── AlbumPage
```

### Data Flow
- **Context API** (`AppContext`): Global state (queue, currentSongId, isPlaying, etc.)
- **Props down, events up**: Parent passes data via props, child calls callback functions
- **Authentication**: Auth service manages localStorage, components consume via authService methods

---

## Environment Variables

### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_NAVIDROME_API_URL` | Navidrome server API base URL | `http://localhost:4533` | `https://neerajlamsal.com.np` |

### Usage
1. Copy `.env.example` to `.env`
2. Set your API URL
3. Restart dev server (required for changes to take effect)

### Accessing in Code
```typescript
import config from './config/api'
const apiUrl = config.apiURL
```

---

## API Usage Guide

### API Systems

Navidrome exposes two API systems with different authentication methods:

**Navidrome API** (`/api/*`)
- Uses Bearer token (JWT) in HTTP headers
- Navidrome-specific endpoints
- Used for songs, search, and advanced features

**Subsonic API** (`/rest/*`)
- Uses salt/token authentication via query parameters
- Subsonic-compatible endpoints
- Used for albums, streaming, cover art, and library browsing

---

### Service Files

#### `src/services/navidrome.ts`
Contains API calls for Navidrome-specific endpoints (`/api/*`).

Use this file when working with:
- Song data
- Navidrome-specific features
- Advanced search

---

#### `src/services/subsonic.ts`
Contains API calls for Subsonic-compatible endpoints (`/rest/*`).

Use this file when working with:
- Albums (browsing, lists)
- Audio streaming
- Cover art images
- Library browsing

---

#### `src/services/auth.ts`
Contains authentication and session management logic.

Use this file for:
- User login/logout
- Getting auth tokens
- Managing user session

---

## Authentication Flow

### Login Process
1. User enters credentials on `LoginPage`
2. Form submits to `authService.login({ username, password })`
3. Service makes POST request to `/auth/login`
4. On success, saves response to localStorage:
   ```typescript
   {
     id: string
     isAdmin: boolean
     name: string
     subsonicSalt: string
     subsonicToken: string
     token: string (JWT)
     username: string
   }
   ```
5. App redirects to home page

### Auth State Management
- **Storage Key**: `navidrome_auth` in localStorage
- **Auto-login**: On app load, checks localStorage for valid token
- **Manual methods**:
  - `authService.isAuthenticated()` - Check if logged in
  - `authService.getToken()` - Get JWT token
  - `authService.getUser()` - Get full user data
  - `authService.logout()` - Clear auth data

### API Requests
Use the token for authenticated requests:
```typescript
const token = authService.getToken()
fetch(`${config.apiURL}/api/endpoint`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Key Features Implemented

### Current Features
1. **Authentication**
   - Login page with username/password
   - Signup page with password confirmation
   - JWT-based authentication
   - localStorage persistence
   - Auto-redirect based on auth status

2. **Navigation** (React Router v6)
   - URL-based routing with browser history support
   - Bookmarkable and shareable album URLs
   - Routes: `/`, `/login`, `/signup`, `/home`, `/album/:albumId`
   - Protected routes wrapped in App layout

3. **Music Player**
   - **Desktop**: Play/pause, next/previous, progress bar, volume, shuffle, repeat
   - **Mobile**: Compact bottom bar with essential controls
   - Now playing display with cover art
   - Like button for current song

4. **Audio Playback** (Howler.js)
   - Stream audio from Navidrome server
   - Play/pause/seek/volume controls
   - Queue-based auto-advance
   - Shuffle and repeat support (off/all/one)
   - Scrobbling (now playing + final submission)

5. **Queue Management**
   - Queue sidebar with song list
   - Visual playing indicator (animated equalizer)
   - Clear queue functionality
   - Click any song to play

6. **Album Pages**
   - Album details (cover, title, artist, metadata)
   - Album description from Last.fm
   - Full tracklist with durations
   - Like buttons on each song
   - Click track to play

7. **Keyboard Shortcuts**
   - Spacebar: Toggle play/pause

8. **UI/UX**
   - Dark theme
   - Responsive design
   - Smooth animations
   - Loading/error states

---

## Design Principles

1. **Mobile-First**: Design for mobile screens first, enhance for desktop
2. **Lightweight**: Minimal dependencies, fast load times
3. **Dark Theme**: Default dark mode with zinc color palette
4. **Touch-Friendly**: Large tap targets (min 44px)
5. **Smooth Animations**: All transitions use ease-in-out, 200-300ms
6. **Accessible**: Proper ARIA labels, semantic HTML
7. **Type-Safe**: Full TypeScript coverage

---

## Common Patterns

### Fetching Data
```typescript
import config from './config/api'
import { authService } from './services/auth'

const fetchData = async () => {
  const response = await fetch(`${config.apiURL}/api/endpoint`, {
    headers: {
      'Authorization': `Bearer ${authService.getToken()}`,
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) throw new Error('Request failed')
  return response.json()
}
```

### Creating New Pages
1. Create component in `src/pages/`
2. Add page type to `type Page` union in `App.tsx`
3. Add rendering condition in `App.tsx`
4. Update navigation to call `setCurrentPage('newPage')`

### Creating New Components
1. Create in `src/components/` if reusable
2. Use props interface for type safety
3. Export named function (not default)
4. Import using named import: `import { Component } from './Component'`

---

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

---

## Performance Considerations

1. **Code Splitting**: Use React.lazy() for large components (future)
2. **Image Optimization**: Use WebP format, lazy loading
3. **Bundle Size**: Keep dependencies minimal
4. **CSS**: Tailwind purges unused styles automatically
5. **Audio**: Stream audio, don't load full files into memory

---

## Development Tips

1. **Hot Reload**: Vite provides instant HMR, no refresh needed
2. **Type Checking**: Run `tsc --noEmit` to check types without building
3. **Linting**: Run `npm run lint` before commits
4. **Env Changes**: Always restart dev server after changing .env
5. **Console**: Check browser console for API errors during auth

---

## Future Enhancements

### Short Term
- [ ] Complete music player controls
- [ ] Implement audio playback with Howler.js
- [ ] Add volume control
- [ ] Progress bar with seek
- [ ] Shuffle/repeat toggles

### Medium Term
- [ ] Album/Artist detail pages
- [ ] Playlist creation/management
- [ ] Search functionality
- [ ] Favorites system
- [ ] Download for offline

### Long Term
- [ ] Equalizer
- [ ] Lyrics display
- [ ] Scrobbling
- [ ] Multiple user support
- [ ] PWA support
- [ ] Background play on mobile

---

## Troubleshooting

### Tailwind Not Working
- Check that `index.css` has `@import "tailwindcss";`
- Restart dev server after installing dependencies
- Check console for CSS import errors

### Login Not Working
- Verify `VITE_NAVIDROME_API_URL` is correct in `.env`
- Check browser console for network errors
- Ensure API server is running and accessible
- Check CORS settings on API server

### Type Errors
- Run `npm install` to ensure all @types packages are installed
- Check `vite-env.d.ts` has correct ImportMetaEnv interface
- Restart TypeScript server in your IDE

---

## License

Part of the Navidrome project. See main project license.

---

## Contributing

When contributing:
1. Follow the established conventions
2. Add TypeScript types for all new code
3. Use Tailwind classes, avoid custom CSS
4. Test on mobile devices
5. Keep components small and focused
6. Update this documentation for significant changes
