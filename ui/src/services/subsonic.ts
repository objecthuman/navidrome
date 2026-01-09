import config from '../config/api'
import { authService } from './auth'

export interface SubsonicAlbum {
  id: string
  name: string
  artist: string
  artistId: string
  coverArt: string
  songCount: number
  duration: number
  playCount?: number
  year?: number
  genre?: string
  isDir?: boolean
}

export interface SubsonicResponse<T> {
  'subsonic-response': {
    status: 'ok' | 'failed'
    version: string
    error?: {
      code: number
      message: string
    }
    [key: string]: T | any
  }
}

const SUBSONIC_API_VERSION = '1.16.1'
const CLIENT_NAME = 'navidrome-ui'

class SubsonicService {
  private getAuthParams(): URLSearchParams {
    const user = authService.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const params = new URLSearchParams({
      u: user.username,
      t: user.subsonicToken,
      s: user.subsonicSalt,
      v: SUBSONIC_API_VERSION,
      c: CLIENT_NAME,
      f: 'json',
    })

    return params
  }

  private async request<T>(endpoint: string, params?: URLSearchParams): Promise<T> {
    const authParams = this.getAuthParams()
    const url = new URL(`${config.apiURL}/rest/${endpoint}`)

    // Add auth params
    authParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    // Add additional params
    if (params) {
      params.forEach((value, key) => {
        url.searchParams.append(key, value)
      })
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: SubsonicResponse<T> = await response.json()
    const subsonicResponse = data['subsonic-response']

    if (subsonicResponse.status === 'failed') {
      throw new Error(subsonicResponse.error?.message || 'API request failed')
    }

    return subsonicResponse as T
  }

  /**
   * Get a list of albums
   * @param type - Type of list (random, newest, frequent, recent, starred, alphabeticalByName, alphabeticalByArtist)
   * @param size - Number of albums to return (max 500)
   * @param offset - List offset for pagination
   */
  async getAlbumList2(
    type: 'random' | 'newest' | 'frequent' | 'recent' | 'starred' | 'alphabeticalByName' | 'alphabeticalByArtist' = 'random',
    size: number = 20,
    offset: number = 0
  ): Promise<SubsonicAlbum[]> {
    const params = new URLSearchParams({
      type,
      size: size.toString(),
      offset: offset.toString(),
    })

    const response = await this.request<{ albumList2: { album: SubsonicAlbum[] } }>(
      'getAlbumList2.view',
      params
    )

    return response.albumList2.album
  }

  /**
   * Get album details
   */
  async getAlbum(id: string): Promise<SubsonicAlbum & { song: any[] }> {
    const params = new URLSearchParams({
      id,
    })

    const response = await this.request<{ album: SubsonicAlbum & { song: any[] } }>(
      'getAlbum.view',
      params
    )

    return response.album
  }

  /**
   * Get cover art URL
   */
  getCoverArtUrl(coverArtId: string, size?: number): string {
    const authParams = this.getAuthParams()
    const url = new URL(`${config.apiURL}/rest/getCoverArt.view`)

    authParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    url.searchParams.append('id', coverArtId)

    if (size) {
      url.searchParams.append('size', size.toString())
    }

    return url.toString()
  }

  /**
   * Get stream URL for a song
   */
  getStreamUrl(songId: string, maxBitRate?: number): string {
    const authParams = this.getAuthParams()
    const url = new URL(`${config.apiURL}/rest/stream.view`)

    authParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    url.searchParams.append('id', songId)

    if (maxBitRate) {
      url.searchParams.append('maxBitRate', maxBitRate.toString())
    }

    return url.toString()
  }
}

export const subsonicService = new SubsonicService()
