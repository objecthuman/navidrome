import React, { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Paper,
  LinearProgress,
  makeStyles,
  Chip,
} from '@material-ui/core'
import { useTranslate, useNotify } from 'react-admin'
import { useInterval } from '../common'
import soulseekApi from '../utils/soulseekApi'

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 3),
  },
  transfersList: {
    flex: 1,
    overflow: 'auto',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius * 2,
    maxHeight: '70vh',
  },
  transferItem: {
    padding: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  transferHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  transferInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  progressBar: {
    marginTop: theme.spacing(1),
  },
  emptyMessage: {
    padding: theme.spacing(6),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(6),
  },
  statusChip: {
    marginLeft: theme.spacing(1),
  },
}))

const TransfersPanel = ({ onBack }) => {
  const classes = useStyles()
  const translate = useTranslate()
  const notify = useNotify()

  const [transfers, setTransfers] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchTransfers = useCallback(async () => {
    try {
      const response = await soulseekApi.getTransfers()
      setTransfers(response.json)
    } catch (error) {
      notify(
        error.message || 'Failed to fetch transfers',
        'error',
      )
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    fetchTransfers()
  }, [fetchTransfers])

  // Poll for updates every 2 seconds
  useInterval(() => {
    if (!loading) {
      fetchTransfers()
    }
  }, 2000)

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  const formatSpeed = (bytesPerSecond) => {
    if (!bytesPerSecond) return '0 B/s'
    return `${formatFileSize(bytesPerSecond)}/s`
  }

  const getStatusColor = (state) => {
    switch (state?.toLowerCase()) {
      case 'completed':
        return 'primary'
      case 'failed':
        return 'error'
      case 'queued':
      case 'transferring':
        return 'default'
      default:
        return 'default'
    }
  }

  const renderTransfers = (transferList, title) => {
    if (!transferList || transferList.length === 0) {
      return null
    }

    return (
      <Box marginBottom={4}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        {transferList.map((transfer, index) => {
          const progress =
            transfer.filesize && transfer.filesize > 0
              ? (transfer.bytes_transfered / transfer.filesize) * 100
              : 0

          return (
            <Paper
              key={index}
              className={classes.transferItem}
              elevation={3}
              square={false}
            >
              <div className={classes.transferHeader}>
                <div className={classes.transferInfo}>
                  <Typography variant="body1" component="div">
                    <strong>{transfer.filename}</strong>
                    <Chip
                      label={transfer.state}
                      size="small"
                      color={getStatusColor(transfer.state)}
                      className={classes.statusChip}
                    />
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {translate('menu.username')}: {transfer.username}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Filename: {(typeof transfer.remote_path === 'string' ? transfer.remote_path.replace("shared\\", '') : '')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {translate('menu.fileSize')}: {formatFileSize(transfer.filesize)}
                  </Typography>
                  {transfer.speed > 0 && (
                    <Typography variant="body2" color="textSecondary">
                      {translate('menu.speed')}: {formatSpeed(transfer.speed)}
                    </Typography>
                  )}
                  {transfer.place_in_queue !== null && (
                    <Typography variant="body2" color="textSecondary">
                      Queue position: {transfer.place_in_queue}
                    </Typography>
                  )}
                </div>
              </div>
              {(transfer.state === 'transferring' ||
                transfer.state === 'queued') && (
                <LinearProgress
                  variant="determinate"
                  value={Math.min(progress, 100)}
                  className={classes.progressBar}
                />
              )}
              {transfer.fail_reason && (
                <Typography variant="body2" color="error" style={{ marginTop: 8 }}>
                  Error: {transfer.fail_reason}
                </Typography>
              )}
              {transfer.abort_reason && (
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                  Aborted: {transfer.abort_reason}
                </Typography>
              )}
            </Paper>
          )
        })}
      </Box>
    )
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Typography variant="h6">{translate('menu.transfers')}</Typography>
        <Box>
          <Button onClick={fetchTransfers} disabled={loading} size="small">
            {translate('menu.refresh')}
          </Button>
          <Button onClick={onBack} size="small">
            Back
          </Button>
        </Box>
      </div>

      {loading && !transfers ? (
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      ) : (
        <div className={classes.transfersList}>
          {transfers && (
            <>
              {renderTransfers(
                transfers.downloads,
                translate('menu.downloads'),
              )}
              {renderTransfers(transfers.uploads, translate('menu.uploads'))}
              {(!transfers.downloads || transfers.downloads.length === 0) &&
                (!transfers.uploads || transfers.uploads.length === 0) && (
                  <div className={classes.emptyMessage}>
                    <Typography variant="body2">
                      {translate('menu.noActiveTransfers')}
                    </Typography>
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

TransfersPanel.propTypes = {
  onBack: PropTypes.func.isRequired,
}

export default TransfersPanel

