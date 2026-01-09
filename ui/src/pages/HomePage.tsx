import { AlbumSlideshow } from '../components/AlbumSlideshow'
import { MostPlayed } from '../components/MostPlayed'
import { RecentlyPlayed } from '../components/RecentlyPlayed'
import { useApp } from '../contexts/AppContext'

export function HomePage() {
  const { onNavigateToAlbum } = useApp()

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
