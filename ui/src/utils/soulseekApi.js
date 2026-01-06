import { fetchUtils } from 'react-admin'
import config from '../config'

const SOULSEEK_BASE_URL = config.soulseekServerUrl || 'http://localhost:8000'

const soulseekApi = {
  /**
   * Search for files
   * @param {Object} params - Search parameters
   * @param {string} params.query - Search query
   * @param {string} [params.file_type] - File type filter (mp3|flac|m4a)
   * @param {number} [params.timeout] - Search timeout in seconds (1-30, default: 5)
   * @param {number} [params.users_limit] - Maximum number of users (1-100, default: 50)
   * @returns {Promise} Search response
   */
  search: (params) => {
    const { query, file_type, timeout, users_limit } = params
    const searchParams = new URLSearchParams()
    searchParams.append('query', query)
    if (file_type) searchParams.append('file_type', file_type)
    if (timeout) searchParams.append('timeout', timeout.toString())
    if (users_limit) searchParams.append('users_limit', users_limit.toString())

    const url = `${SOULSEEK_BASE_URL}/search?${searchParams.toString()}`
    return fetchUtils.fetchJson(url, {
      method: 'GET',
      headers: new Headers({ Accept: 'application/json' }),
    })
  },

  /**
   * Download files
   * @param {Array<Object>} requests - Array of download requests
   * @param {string} requests[].username - Username
   * @param {string} requests[].filename - Filename
   * @returns {Promise} Download response
   */
  download: (requests) => {
    const url = `${SOULSEEK_BASE_URL}/download`
    return fetchUtils.fetchJson(url, {
      method: 'POST',
      body: JSON.stringify(requests),
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    })
  },

  /**
   * Get transfer status
   * @returns {Promise} Transfers response
   */
  getTransfers: () => {
    const url = `${SOULSEEK_BASE_URL}/transfers`
    return fetchUtils.fetchJson(url, {
      method: 'GET',
      headers: new Headers({ Accept: 'application/json' }),
    })
  },

  /**
   * Download from YouTube
   * @param {Object} params - Download parameters
   * @param {string} params.url - YouTube URL
   * @param {string} params.thumbnail_url - Thumbnail URL
   * @param {string} params.album - Album name
   * @param {string} params.artist - Artist name
   * @param {boolean} [params.audio_only=true] - Audio only flag
   * @param {string|null} [params.format] - Output format
   * @returns {Promise} Download response
   */
  youtubeDownload: (params) => {
    const {
      url,
      thumbnail_url,
      album,
      artist,
      audio_only = true,
      format,
    } = params
    const apiUrl = `${SOULSEEK_BASE_URL}/youtube/download`
    return fetchUtils.fetchJson(apiUrl, {
      method: 'POST',
      body: JSON.stringify({
        url,
        thumbnail_url,
        album,
        artist,
        audio_only,
        format,
      }),
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    })
  },
}

export default soulseekApi
