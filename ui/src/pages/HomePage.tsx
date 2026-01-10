import { AlbumSlideshow } from '../components/AlbumSlideshow'
import { MostPlayed } from '../components/MostPlayed'
import { RecentlyPlayed } from '../components/RecentlyPlayed'
import { useApp } from '../contexts/AppContext'
import { useEffect } from 'react'

export function HomePage() {
  const { onNavigateToAlbum } = useApp()

  // Scroll to top when home page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Album Slideshow */}
      <AlbumSlideshow />

      {/* Most Played */}
      <MostPlayed onAlbumClick={onNavigateToAlbum} />

      {/* Recently Played */}
      <RecentlyPlayed onAlbumClick={onNavigateToAlbum} />
    </div>
  )
}
