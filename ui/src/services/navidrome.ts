import config from '../config/api'
import { authService } from './auth'

export interface NavidromeSong {
  id: string
  title: string
  album: string
  artist: string
  albumId: string
  artistId: string
  coverArt: string
  duration: number
  trackNumber: number
  year: number
  genre: string
  path: string
  bitRate: number
  size: number
}

export interface NavidromeQueueItem {
  id: string
  bookmarkPosition: number
  title: string
  album: string
  artist: string
  albumId: string
  artistId: string
  hasCoverArt: boolean
  trackNumber: number
  year: number
  duration: number
  size: number
}

export interface NavidromeQueue {
  id: string
  userId: string
  current: number
  position: number
  changedBy: string
  items: NavidromeQueueItem[]
}


class NavidromeService {
  private getHeaders(): HeadersInit {
    const user = authService.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    return {
      'x-nd-authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Get songs by album ID using Navidrome API
   * @param albumId - The album ID to fetch songs for
   */
  async getSongsByAlbum(albumId: string): Promise<NavidromeSong[]> {
    const params = new URLSearchParams({
      _end: '-1',
      _order: 'ASC',
      _sort: 'album',
      _start: '0',
      album_id: albumId,
    })

    const url = new URL(`${config.apiURL}/api/song`)
    url.search = params.toString()

    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: NavidromeSong[] = await response.json()
    return data
  }

  /**
   * Get stream URL for a song (uses Subsonic endpoint)
   */
  getStreamUrl(songId: string): string {
    const user = authService.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const params = new URLSearchParams({
      u: user.username,
      t: user.subsonicToken,
      s: user.subsonicSalt,
      v: '1.16.1',
      c: 'navidrome-ui',
      f: 'json',
      id: songId,
    })

    const url = new URL(`${config.apiURL}/rest/stream.view`)
    url.search = params.toString()

    return url.toString()
  }

  /**
   * Get the current play queue from Navidrome API
   */
  async getQueue(): Promise<NavidromeQueue> {
    const url = `${config.apiURL}/api/queue`

    const response = await fetch(url, {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: NavidromeQueue = await response.json()
    return data
  }

  /**
   * Clear the play queue using Navidrome API
   */
  async clearQueue(): Promise<void> {
    const url = `${config.apiURL}/api/queue`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }

  /**
   * Get cover art URL (uses Subsonic endpoint)
   */
  getCoverArtUrl(coverArtId: string, size?: number): string {
    const user = authService.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const params = new URLSearchParams({
      u: user.username,
      t: user.subsonicToken,
      s: user.subsonicSalt,
      v: '1.16.1',
      c: 'navidrome-ui',
      f: 'json',
      id: coverArtId,
    })

    if (size) {
      params.append('size', size.toString())
    }

    const url = new URL(`${config.apiURL}/rest/getCoverArt.view`)
    url.search = params.toString()

    return url.toString()
  }
}

export const navidromeService = new NavidromeService()
