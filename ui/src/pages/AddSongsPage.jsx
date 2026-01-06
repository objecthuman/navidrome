import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@material-ui/core'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { useHistory } from 'react-router-dom'
import { useNotify, useTranslate } from 'react-admin'
import TransfersPanel from '../dialogs/TransfersPanel'
import soulseekApi from '../utils/soulseekApi'
import httpClient from '../dataProvider/httpClient'
import config from '../config'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
    margin: '0 auto',
    maxWidth: 1600,
    width: '100%',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  tabsContainer: {
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
  },
  tabPanel: {
    padding: theme.spacing(3, 0),
  },
  pageActions: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    '& > *': {
      minWidth: 140,
      textTransform: 'uppercase',
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
  searchForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
  },
  formRow: {
    display: 'flex',
    gap: theme.spacing(2),
    '& > *': {
      flex: 1,
    },
    flexWrap: 'wrap',
  },
  resultsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  headerActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'flex-end',
    '& > *': {
      textTransform: 'none',
    },
  },
  resultsList: {
    flex: 1,
    overflow: 'auto',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    maxHeight: '70vh',
    backgroundColor: theme.palette.background.default,
  },
  userHeader: {
    padding: theme.spacing(1),
    backgroundColor:
      theme.palette.type === 'dark'
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
  directoryHeader: {
    backgroundColor:
      theme.palette.type === 'dark'
        ? theme.palette.grey[800]
        : theme.palette.grey[200],
    color: theme.palette.text.primary,
    paddingLeft: theme.spacing(4),
  },
  directoryTitle: {
    display: 'flex',
    flexDirection: 'column',
  },
  directoryMeta: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  fileItem: {
    paddingLeft: theme.spacing(4),
    color: theme.palette.text.primary,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
  },
  emptyMessage: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}))

const AddSongsPage = () => {
  const classes = useStyles()
  const translate = useTranslate()
  const notify = useNotify()
  const history = useHistory()

  const [activeTab, setActiveTab] = useState(0)
  const [query, setQuery] = useState('')
  const [fileType, setFileType] = useState('')
  const [timeout, setTimeout] = useState(5)
  const [usersLimit, setUsersLimit] = useState(50)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [downloading, setDownloading] = useState(false)
  const [showTransfers, setShowTransfers] = useState(false)
  const [expandedDirectories, setExpandedDirectories] = useState(new Set())

  // YouTube download states
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeThumbnailUrl, setYoutubeThumbnailUrl] = useState('')
  const [youtubeAlbum, setYoutubeAlbum] = useState('')
  const [youtubeArtist, setYoutubeArtist] = useState('')
  const [youtubeAudioOnly, setYoutubeAudioOnly] = useState(true)
  const [youtubeFormat, setYoutubeFormat] = useState('mp3')
  const [youtubeDownloading, setYoutubeDownloading] = useState(false)
  const [albumSearchQuery, setAlbumSearchQuery] = useState('')
  const [albumSearchResults, setAlbumSearchResults] = useState([])
  const [albumSearching, setAlbumSearching] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [artistSearchQuery, setArtistSearchQuery] = useState('')
  const [artistSearchResults, setArtistSearchResults] = useState([])
  const [artistSearching, setArtistSearching] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState(null)

  const navigateBack = useCallback(() => {
    if (history.length > 1) {
      history.goBack()
    } else {
      history.push('/')
    }
  }, [history])

  const totalFilesAvailable = useMemo(() => {
    if (!results || !results.results) return 0
    let total = 0
    Object.values(results.results).forEach((userFiles) => {
      Object.values(userFiles.directories || {}).forEach((dir) => {
        total += dir.files.length
      })
    })
    return total
  }, [results])

  useEffect(() => {
    if (!results || !results.results) {
      setExpandedDirectories(new Set())
      return
    }
    const initial = new Set()
    Object.entries(results.results).forEach(([username, userFiles]) => {
      Object.keys(userFiles.directories || {}).forEach((path) => {
        initial.add(`${username}|${path}`)
      })
    })
    setExpandedDirectories(initial)
  }, [results])

  const toggleDirectory = (username, path) => {
    const key = `${username}|${path}`
    setExpandedDirectories((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const isDirectoryExpanded = (username, path) =>
    expandedDirectories.has(`${username}|${path}`)

  const getDirectoryFileKeys = (username, dirInfo) =>
    (dirInfo?.files || []).map((file) => `${username}:${file.filename}`)

  const getDirectorySelectionState = (username, dirInfo) => {
    const keys = getDirectoryFileKeys(username, dirInfo)
    if (keys.length === 0) {
      return { allSelected: false, partiallySelected: false }
    }
    const selectedCount = keys.filter((key) => selectedFiles.has(key)).length
    return {
      allSelected: selectedCount === keys.length,
      partiallySelected: selectedCount > 0 && selectedCount < keys.length,
    }
  }

  const toggleDirectorySelection = (username, dirInfo) => {
    const keys = getDirectoryFileKeys(username, dirInfo)
    if (keys.length === 0) return

    const { allSelected } = getDirectorySelectionState(username, dirInfo)
    setSelectedFiles((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        keys.forEach((key) => next.delete(key))
      } else {
        keys.forEach((key) => next.add(key))
      }
      return next
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  const resetState = () => {
    setQuery('')
    setFileType('')
    setTimeout(5)
    setUsersLimit(50)
    setResults(null)
    setSelectedFiles(new Set())
    setShowTransfers(false)
    setExpandedDirectories(new Set())
  }

  const handleFileToggle = (username, filename) => {
    const key = `${username}:${filename}`
    setSelectedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (!results || !results.results) return

    const allFiles = new Set()
    Object.entries(results.results).forEach(([username, userFiles]) => {
      Object.values(userFiles.directories || {}).forEach((dir) => {
        dir.files.forEach((file) => {
          allFiles.add(`${username}:${file.filename}`)
        })
      })
    })

    setSelectedFiles(allFiles)
  }

  const handleDeselectAll = () => {
    setSelectedFiles(new Set())
  }

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      notify('Please enter a search query', 'warning')
      return
    }

    setSearching(true)
    setResults(null)
    setSelectedFiles(new Set())

    try {
      const response = await soulseekApi.search({
        query: query.trim(),
        file_type: fileType || undefined,
        timeout,
        users_limit: usersLimit,
      })

      setResults(response.json)
    } catch (error) {
      notify(error.message || translate('menu.downloadError'), 'error')
    } finally {
      setSearching(false)
    }
  }, [query, fileType, timeout, usersLimit, notify, translate])

  const handleDownload = useCallback(async () => {
    if (selectedFiles.size === 0) {
      notify('Please select at least one file', 'warning')
      return
    }

    setDownloading(true)

    const downloadRequests = Array.from(selectedFiles).map((key) => {
      const [username, filename] = key.split(':')
      return { username, filename }
    })

    try {
      await soulseekApi.download(downloadRequests)
      notify(translate('menu.downloadSuccess'), 'success')
      setSelectedFiles(new Set())
      setShowTransfers(true)
    } catch (error) {
      notify(error.message || translate('menu.downloadError'), 'error')
    } finally {
      setDownloading(false)
    }
  }, [selectedFiles, notify, translate])

  // Album search functionality
  const handleAlbumSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setAlbumSearchResults([])
      return
    }

    setAlbumSearching(true)
    try {
      const response = await httpClient(
        `/api/album?_end=10&_order=ASC&_sort=name&_start=0&name=${encodeURIComponent(searchQuery)}`,
        { method: 'GET' }
      )
      setAlbumSearchResults(response.json || [])
    } catch (error) {
      notify('Failed to search albums', 'error')
      setAlbumSearchResults([])
    } finally {
      setAlbumSearching(false)
    }
  }, [notify])

  // Debounced album search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAlbumSearch(albumSearchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [albumSearchQuery, handleAlbumSearch])

  // Artist search functionality
  const handleArtistSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setArtistSearchResults([])
      return
    }

    setArtistSearching(true)
    try {
      const response = await httpClient(
        `/api/artist?_end=10&_order=ASC&_sort=name&_start=0&name=${encodeURIComponent(searchQuery)}`,
        { method: 'GET' }
      )
      setArtistSearchResults(response.json || [])
    } catch (error) {
      notify('Failed to search artists', 'error')
      setArtistSearchResults([])
    } finally {
      setArtistSearching(false)
    }
  }, [notify])

  // Debounced artist search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleArtistSearch(artistSearchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [artistSearchQuery, handleArtistSearch])

  // Handle YouTube download
  const handleYoutubeDownload = useCallback(async () => {
    if (!youtubeUrl.trim()) {
      notify('Please enter a YouTube URL', 'warning')
      return
    }

    if (!youtubeThumbnailUrl.trim()) {
      notify('Please enter a thumbnail URL', 'warning')
      return
    }

    // Use selected album name or the manually entered album name
    const albumName = selectedAlbum ? selectedAlbum.name : youtubeAlbum.trim()

    if (!albumName) {
      notify('Please enter or select an album', 'warning')
      return
    }

    // Use selected artist name or the manually entered artist name
    const artistName = selectedArtist ? selectedArtist.name : youtubeArtist.trim()

    if (!artistName) {
      notify('Please enter or select an artist', 'warning')
      return
    }

    setYoutubeDownloading(true)

    try {
      const response = await soulseekApi.youtubeDownload({
        url: youtubeUrl.trim(),
        thumbnail_url: youtubeThumbnailUrl.trim(),
        album: albumName,
        artist: artistName,
        audio_only: youtubeAudioOnly,
        format: youtubeFormat,
      })

      // Check if the response indicates an error
      const result = response.json
      if (result.status === 'error') {
        throw new Error(result.error || 'YouTube download failed')
      }

      notify('YouTube download started successfully', 'success')
      // Reset form
      setYoutubeUrl('')
      setYoutubeThumbnailUrl('')
      setYoutubeAlbum('')
      setYoutubeArtist('')
      setSelectedAlbum(null)
      setSelectedArtist(null)
      setAlbumSearchQuery('')
      setArtistSearchQuery('')
    } catch (error) {
      notify(error.message || 'Failed to start YouTube download', 'error')
    } finally {
      setYoutubeDownloading(false)
    }
  }, [youtubeUrl, youtubeThumbnailUrl, youtubeAlbum, youtubeArtist, selectedAlbum, selectedArtist, youtubeAudioOnly, youtubeFormat, notify])

  const renderResults = () => {
    if (searching) {
      return (
        <div className={classes.loadingContainer}>
          <CircularProgress />
          <Typography variant="body2" style={{ marginLeft: 16 }}>
            {translate('menu.searching')}
          </Typography>
        </div>
      )
    }

    if (!results || !results.results) {
      return (
        <div className={classes.emptyMessage}>
          <Typography variant="body2">{translate('menu.noResults')}</Typography>
        </div>
      )
    }

    const userEntries = Object.entries(results.results)

    if (userEntries.length === 0) {
      return (
        <div className={classes.emptyMessage}>
          <Typography variant="body2">{translate('menu.noResults')}</Typography>
        </div>
      )
    }

    return (
      <List className={classes.resultsList}>
        {userEntries.map(([username, userFiles]) => (
          <React.Fragment key={username}>
            <ListItem className={classes.userHeader} disableGutters>
              <ListItemText
                primary={`${username} (${userFiles.total_files} files)`}
              />
            </ListItem>
            {Object.entries(userFiles.directories || {}).map(
              ([path, dirInfo]) => {
                if (!dirInfo?.files?.length) {
                  return null
                }
                const directorySelection = getDirectorySelectionState(
                  username,
                  dirInfo,
                )
                return (
                  <React.Fragment key={`${username}-${path}`}>
                    <ListItem
                      button
                      onClick={() => toggleDirectory(username, path)}
                      className={classes.directoryHeader}
                    >
                      <ListItemIcon>
                        {isDirectoryExpanded(username, path) ? (
                          <ExpandLessIcon fontSize="small" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <div className={classes.directoryTitle}>
                            <span>{path || '/'}</span>
                            <span className={classes.directoryMeta}>
                              {dirInfo.files.length} files
                            </span>
                          </div>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Checkbox
                          edge="end"
                          onClick={(event) => {
                            event.stopPropagation()
                            toggleDirectorySelection(username, dirInfo)
                          }}
                          checked={directorySelection.allSelected}
                          indeterminate={directorySelection.partiallySelected}
                          inputProps={{
                            'aria-label': translate('menu.selectDirectory', {
                              _: 'Select Directory',
                            }),
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Collapse
                      in={isDirectoryExpanded(username, path)}
                      timeout="auto"
                      unmountOnExit
                    >
                      {dirInfo.files.map((file) => {
                        const key = `${username}:${file.filename}`
                        const isSelected = selectedFiles.has(key)
                        return (
                          <ListItem
                            key={key}
                            button
                            onClick={() =>
                              handleFileToggle(username, file.filename)
                            }
                            className={classes.fileItem}
                          >
                            <ListItemIcon>
                              <Checkbox
                                icon={
                                  <CheckBoxOutlineBlankIcon fontSize="small" />
                                }
                                checkedIcon={<CheckBoxIcon fontSize="small" />}
                                checked={isSelected}
                                tabIndex={-1}
                                disableRipple
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={file.clean_filename || file.filename}
                              secondary={`${formatFileSize(file.filesize)} • ${
                                file.extension?.toUpperCase() || 'Unknown'
                              }`}
                            />
                          </ListItem>
                        )
                      })}
                    </Collapse>
                  </React.Fragment>
                )
              },
            )}
            <Divider />
          </React.Fragment>
        ))}
      </List>
    )
  }

  return (
    <div className={classes.root}>
      <div className={classes.pageHeader}>
        <div>
          <Typography variant="h4">
            {translate('menu.addSongsToServer')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {translate('menu.searchSongs')}
          </Typography>
        </div>
        <div className={classes.pageActions}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              resetState()
              navigateBack()
            }}
          >
            {translate('ra.action.back', { _: 'Back' })}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowTransfers(true)}
          >
            {translate('menu.transfers')}
          </Button>
        </div>
      </div>
      <div className={classes.content}>
        {!showTransfers ? (
          <>
            <Paper className={classes.tabsContainer}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label="Soulseek" />
                <Tab label="YouTube" />
              </Tabs>
            </Paper>

            {activeTab === 0 && (
              <div className={classes.tabPanel}>
                <Paper className={classes.searchForm}>
              <TextField
                label={translate('menu.searchQuery')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !searching) {
                    handleSearch()
                  }
                }}
                fullWidth
                variant="outlined"
                disabled={searching}
              />
              <div className={classes.formRow}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>{translate('menu.fileType')}</InputLabel>
                  <Select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    label={translate('menu.fileType')}
                  >
                    <MenuItem value="">{translate('menu.allTypes')}</MenuItem>
                    <MenuItem value="mp3">MP3</MenuItem>
                    <MenuItem value="flac">FLAC</MenuItem>
                    <MenuItem value="m4a">M4A</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label={translate('menu.searchTimeout')}
                  type="number"
                  value={timeout}
                  onChange={(e) =>
                    setTimeout(
                      Math.max(1, Math.min(30, Number(e.target.value))),
                    )
                  }
                  inputProps={{ min: 1, max: 30 }}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label={translate('menu.usersLimit')}
                  type="number"
                  value={usersLimit}
                  onChange={(e) =>
                    setUsersLimit(
                      Math.max(1, Math.min(100, Number(e.target.value))),
                    )
                  }
                  inputProps={{ min: 1, max: 100 }}
                  variant="outlined"
                  fullWidth
                />
              </div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={searching || !query.trim()}
                fullWidth
              >
                {searching
                  ? translate('menu.searching')
                  : translate('menu.search')}
              </Button>
            </Paper>

            {results && (
              <Paper className={classes.resultsContainer}>
                <div className={classes.resultsHeader}>
                  <Typography variant="subtitle1">
                    {translate('menu.selectedFilesCount', {
                      count: selectedFiles.size,
                      _: `Select Files (${selectedFiles.size} selected)`,
                    })}
                  </Typography>
                  <Box className={classes.headerActions}>
                    <Button
                      size="small"
                      onClick={handleSelectAll}
                      disabled={totalFilesAvailable === 0}
                    >
                      {translate('menu.selectAll', { _: 'Select All' })}
                    </Button>
                    <Button
                      size="small"
                      onClick={handleDeselectAll}
                      disabled={selectedFiles.size === 0}
                    >
                      {translate('menu.unselectAll', { _: 'Clear Selection' })}
                    </Button>
                    <Button size="small" onClick={() => setShowTransfers(true)}>
                      {translate('menu.transfers')}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleDownload}
                      disabled={downloading || selectedFiles.size === 0}
                    >
                      {downloading
                        ? translate('menu.downloading')
                        : translate('menu.downloadSelected')}
                    </Button>
                  </Box>
                </div>
                {renderResults()}
              </Paper>
            )}
              </div>
            )}

            {activeTab === 1 && (
              <div className={classes.tabPanel}>
                <Paper className={classes.searchForm}>
                  <Typography variant="h6" gutterBottom>
                    YouTube Download
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Download music from YouTube and add it to your library
                  </Typography>

                  <TextField
                    label="YouTube URL"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    fullWidth
                    variant="outlined"
                    disabled={youtubeDownloading}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />

                  <TextField
                    label="Thumbnail URL"
                    value={youtubeThumbnailUrl}
                    onChange={(e) => setYoutubeThumbnailUrl(e.target.value)}
                    fullWidth
                    variant="outlined"
                    disabled={youtubeDownloading}
                    placeholder="https://i.ytimg.com/vi/..."
                  />

                  <Divider style={{ margin: '16px 0' }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Album Selection
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Search for an existing album or enter a new album name
                  </Typography>

                  <TextField
                    label="Search or Enter Album Name"
                    value={albumSearchQuery || youtubeAlbum}
                    onChange={(e) => {
                      const value = e.target.value
                      setAlbumSearchQuery(value)
                      setYoutubeAlbum(value)
                      setSelectedAlbum(null)
                    }}
                    fullWidth
                    variant="outlined"
                    disabled={youtubeDownloading}
                    placeholder="Type to search existing albums or enter new name"
                  />

                  {albumSearching && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" style={{ marginLeft: 8 }}>
                        Searching albums...
                      </Typography>
                    </Box>
                  )}

                  {!albumSearching && albumSearchResults.length > 0 && (
                    <List style={{ maxHeight: 200, overflow: 'auto', marginTop: 8 }}>
                      {albumSearchResults.map((album) => (
                        <ListItem
                          key={album.id}
                          button
                          selected={selectedAlbum?.id === album.id}
                          onClick={() => {
                            setSelectedAlbum(album)
                            setYoutubeAlbum(album.name)
                            setAlbumSearchQuery(album.name)
                            setAlbumSearchResults([])
                          }}
                        >
                          <ListItemText
                            primary={album.name}
                            secondary={`${album.artist || 'Unknown Artist'} • ${album.songCount || 0} songs`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}

                  {selectedAlbum && (
                    <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
                      <Typography variant="body2" color="primary">
                        Selected Album: <strong>{selectedAlbum.name}</strong>
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        by {selectedAlbum.artist || 'Unknown Artist'}
                      </Typography>
                    </Box>
                  )}

                  <Divider style={{ margin: '16px 0' }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Artist Selection
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Search for an existing artist or enter a new artist name
                  </Typography>

                  <TextField
                    label="Search or Enter Artist Name"
                    value={artistSearchQuery || youtubeArtist}
                    onChange={(e) => {
                      const value = e.target.value
                      setArtistSearchQuery(value)
                      setYoutubeArtist(value)
                      setSelectedArtist(null)
                    }}
                    fullWidth
                    variant="outlined"
                    disabled={youtubeDownloading}
                    placeholder="Type to search existing artists or enter new name"
                  />

                  {artistSearching && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" style={{ marginLeft: 8 }}>
                        Searching artists...
                      </Typography>
                    </Box>
                  )}

                  {!artistSearching && artistSearchResults.length > 0 && (
                    <List style={{ maxHeight: 200, overflow: 'auto', marginTop: 8 }}>
                      {artistSearchResults.map((artist) => (
                        <ListItem
                          key={artist.id}
                          button
                          selected={selectedArtist?.id === artist.id}
                          onClick={() => {
                            setSelectedArtist(artist)
                            setYoutubeArtist(artist.name)
                            setArtistSearchQuery(artist.name)
                            setArtistSearchResults([])
                          }}
                        >
                          <ListItemText
                            primary={artist.name}
                            secondary={`${artist.albumCount || 0} albums`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}

                  {selectedArtist && (
                    <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
                      <Typography variant="body2" color="primary">
                        Selected Artist: <strong>{selectedArtist.name}</strong>
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {selectedArtist.albumCount || 0} albums
                      </Typography>
                    </Box>
                  )}

                  <Divider style={{ margin: '16px 0' }} />

                  <div className={classes.formRow}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel>Format</InputLabel>
                      <Select
                        value={youtubeFormat}
                        onChange={(e) => setYoutubeFormat(e.target.value)}
                        label="Format"
                        disabled={youtubeDownloading}
                      >
                        <MenuItem value="mp3">MP3</MenuItem>
                        <MenuItem value="flac">FLAC</MenuItem>
                        <MenuItem value="m4a">M4A</MenuItem>
                        <MenuItem value="opus">OPUS</MenuItem>
                      </Select>
                    </FormControl>

                    <Box display="flex" alignItems="center" fullWidth>
                      <Checkbox
                        checked={youtubeAudioOnly}
                        onChange={(e) => setYoutubeAudioOnly(e.target.checked)}
                        disabled={youtubeDownloading}
                      />
                      <Typography variant="body2">Audio Only</Typography>
                    </Box>
                  </div>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleYoutubeDownload}
                    disabled={
                      youtubeDownloading ||
                      !youtubeUrl.trim() ||
                      !youtubeThumbnailUrl.trim() ||
                      (!selectedAlbum && !youtubeAlbum.trim()) ||
                      (!selectedArtist && !youtubeArtist.trim())
                    }
                    fullWidth
                  >
                    {youtubeDownloading ? 'Downloading...' : 'Download from YouTube'}
                  </Button>
                </Paper>
              </div>
            )}
          </>
        ) : (
          <Paper className={classes.resultsContainer}>
            <TransfersPanel onBack={() => setShowTransfers(false)} />
          </Paper>
        )}
      </div>
    </div>
  )
}

export default AddSongsPage
