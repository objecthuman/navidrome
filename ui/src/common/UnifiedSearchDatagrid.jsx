import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import {
  Datagrid,
  TextField,
  FunctionField,
  useRecordContext,
} from 'react-admin'
import { makeStyles } from '@material-ui/core'
import { setTrack, playTracks } from '../actions'
import { DurationField, SongTitleField, ArtistLinkField } from '../common'
import subsonic from '../subsonic'

const useStyles = makeStyles({
  typeHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    padding: '8px 16px',
    borderBottom: '2px solid #ddd',
  },
  songRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
  },
  albumRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
  },
  artistRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
  },
})

const TypeField = () => {
  const record = useRecordContext()
  const classes = useStyles()

  if (!record) return null

  const typeLabels = {
    song: '🎵 Song',
    album: '💿 Album',
    artist: '🎤 Artist',
  }

  return <span>{typeLabels[record._type] || record._type}</span>
}

const NameField = () => {
  const record = useRecordContext()
  if (!record) return null

  if (record._type === 'song') {
    return <span>{record.title}</span>
  } else if (record._type === 'album') {
    return <span>{record.name}</span>
  } else if (record._type === 'artist') {
    return <span>{record.name}</span>
  }
  return null
}

const ArtistField = () => {
  const record = useRecordContext()
  if (!record) return null

  if (record._type === 'song' || record._type === 'album') {
    return <span>{record.artist}</span>
  }
  return <span>—</span>
}

const AlbumField = () => {
  const record = useRecordContext()
  if (!record) return null

  if (record._type === 'song') {
    return <span>{record.album}</span>
  } else if (record._type === 'album') {
    return <span>{record.songCount} songs</span>
  } else if (record._type === 'artist') {
    return <span>{record.albumCount} albums</span>
  }
  return null
}

export const UnifiedSearchDatagrid = (props) => {
  const dispatch = useDispatch()

  const handleRowClick = useCallback(
    (id, basePath, record) => {
      if (record._type === 'song') {
        // For songs, ID is already correct for playing
        dispatch(setTrack(record))
      } else if (record._type === 'album') {
        // Navigate to album page using stored albumId
        window.location.href = `#/album/${record.albumId}/show`
      } else if (record._type === 'artist') {
        // Navigate to artist page using stored artistId
        window.location.href = `#/artist/${record.artistId}/show`
      }
    },
    [dispatch],
  )

  return (
    <Datagrid {...props} rowClick={handleRowClick}>
      <FunctionField label="Type" render={() => <TypeField />} />
      <FunctionField label="Name" render={() => <NameField />} />
      <FunctionField label="Artist" render={() => <ArtistField />} />
      <FunctionField label="Album / Info" render={() => <AlbumField />} />
      <DurationField source="duration" />
    </Datagrid>
  )
}
