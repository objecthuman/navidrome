import React, { useState, useCallback, useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Dialog,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Divider,
  Paper,
  Collapse,
  makeStyles,
} from '@material-ui/core'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useTranslate, useNotify } from 'react-admin'
import { DialogTitle } from './DialogTitle'
import { DialogContent } from './DialogContent'
import soulseekApi from '../utils/soulseekApi'
import TransfersPanel from './TransfersPanel'

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    height: '80vh',
    maxHeight: '80vh',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  searchForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
  },
  formRow: {
    display: 'flex',
    gap: theme.spacing(2),
    '& > *': {
      flex: 1,
    },
  },
  resultsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    backgroundColor: theme.palette.background.paper,
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
  },
  resultsList: {
    flex: 1,
    overflow: 'auto',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    maxHeight: '400px',
    backgroundColor: theme.palette.background.default,
  },
  userSection: {
    marginTop: theme.spacing(2),
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
  emptyMessage: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
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
}))

const AddSongsDialog = ({ open, onClose }) => {
  const classes = useStyles()
  const translate = useTranslate()
  const notify = useNotify()

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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
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
      notify(
        error.message || translate('menu.downloadError'),
        'error',
      )
    } finally {
      setSearching(false)
    }
  }, [query, fileType, timeout, usersLimit, notify, translate])

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
      notify(
        error.message || translate('menu.downloadError'),
        'error',
      )
    } finally {
      setDownloading(false)
    }
  }, [selectedFiles, notify, translate])

  const handleClose = () => {
    setQuery('')
    setFileType('')
    setTimeout(5)
    setUsersLimit(50)
    setResults(null)
    setSelectedFiles(new Set())
    setShowTransfers(false)
    onClose()
  }

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
          <Typography variant="body2">
            {translate('menu.noResults')}
          </Typography>
        </div>
      )
    }

    const userEntries = Object.entries(results.results)

    if (userEntries.length === 0) {
      return (
        <div className={classes.emptyMessage}>
          <Typography variant="body2">
            {translate('menu.noResults')}
          </Typography>
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
              ([path, dirInfo]) =>
                dirInfo?.files?.length ? (
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
                ) : null,
            )}
            <Divider />
          </React.Fragment>
        ))}
      </List>
    )
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="add-songs-dialog-title"
      open={open}
      fullWidth={true}
      maxWidth="md"
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle id="add-songs-dialog-title" onClose={handleClose}>
        {translate('menu.addSongsToServer')}
      </DialogTitle>
      <DialogContent dividers>
        <div className={classes.content}>
          {!showTransfers ? (
            <>
              <Paper className={classes.searchForm}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  gridGap={16}
                >
                  <Typography variant="h6">
                    {translate('menu.searchSongs')}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setShowTransfers(true)}
                  >
                    {translate('menu.transfers')}
                  </Button>
                </Box>
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
                      <MenuItem value="">
                        {translate('menu.allTypes')}
                      </MenuItem>
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
                      setTimeout(Math.max(1, Math.min(30, Number(e.target.value))))
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
                      setUsersLimit(Math.max(1, Math.min(100, Number(e.target.value))))
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
                      <Button
                        size="small"
                        onClick={() => setShowTransfers(true)}
                      >
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
            </>
          ) : (
            <TransfersPanel
              onBack={() => setShowTransfers(false)}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

AddSongsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default AddSongsDialog
