import React, { useCallback, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { useListContext } from 'react-admin'
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import AlbumIcon from '@material-ui/icons/Album'
import PersonIcon from '@material-ui/icons/Person'
import { setTrack } from '../actions'
import subsonic from '../subsonic'

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(2),
  },
  sectionHeader: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[800],
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  listItem: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  avatar: {
    width: 48,
    height: 48,
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}))

const SongItem = ({ song, onClick }) => {
  const classes = useStyles()
  // Pass album field so getCoverArtUrl knows it's a song (mediaFile)
  const coverUrl = subsonic.getCoverArtUrl(
    {
      id: song.id,
      album: song.album,
      updatedAt: song.createdAt,
    },
    48,
  )

  return (
    <ListItem className={classes.listItem} onClick={() => onClick(song)}>
      <ListItemAvatar>
        <Avatar src={coverUrl} variant="rounded" className={classes.avatar}>
          <MusicNoteIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={song.title}
        secondary={`${song.artist} • ${song.album}`}
      />
    </ListItem>
  )
}

const AlbumItem = ({ album, onClick }) => {
  const classes = useStyles()
  // Pass albumArtist field so getCoverArtUrl knows it's an album
  const coverUrl = subsonic.getCoverArtUrl(
    {
      id: album.albumId,
      albumArtist: album.artist,
      updatedAt: album.createdAt,
    },
    48,
  )

  return (
    <ListItem className={classes.listItem} onClick={() => onClick(album)}>
      <ListItemAvatar>
        <Avatar src={coverUrl} variant="rounded" className={classes.avatar}>
          <AlbumIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={album.name}
        secondary={`${album.artist} • ${album.songCount} songs`}
      />
    </ListItem>
  )
}

const ArtistItem = ({ artist, onClick }) => {
  const classes = useStyles()
  // For artists, just pass the original ID (getCoverArtUrl will add ar- prefix)
  const coverUrl = artist.coverArt
    ? subsonic.getCoverArtUrl({ id: artist.artistId }, 48)
    : null

  return (
    <ListItem className={classes.listItem} onClick={() => onClick(artist)}>
      <ListItemAvatar>
        <Avatar src={coverUrl} variant="circular" className={classes.avatar}>
          <PersonIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={artist.name}
        secondary={`${artist.albumCount} albums`}
      />
    </ListItem>
  )
}

export const UnifiedSearchResults = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { data } = useListContext()

  // Convert data object to array
  const dataArray = data ? Object.values(data) : []

  // Group results by type and limit to top 5
  const songs = dataArray.filter((item) => item._type === 'song').slice(0, 5)
  const albums = dataArray.filter((item) => item._type === 'album').slice(0, 5)
  const artists = dataArray
    .filter((item) => item._type === 'artist')
    .slice(0, 5)

  // Build sections in fixed order: Artists, Albums, Songs
  const sections = []
  artists.length > 0 && sections.push({ type: 'artists', items: artists })
  albums.length > 0 && sections.push({ type: 'albums', items: albums })
  songs.length > 0 && sections.push({ type: 'songs', items: songs })

  const handleSongClick = useCallback(
    (song) => {
      dispatch(setTrack(song))
    },
    [dispatch],
  )

  const handleAlbumClick = useCallback((album) => {
    window.location.href = `#/album/${album.albumId}/show`
  }, [])

  const handleArtistClick = useCallback((artist) => {
    window.location.href = `#/artist/${artist.artistId}/show`
  }, [])

  return (
    <Box>
      {sections.map((section, index) => (
        <Fragment key={section.type}>
          <Box className={classes.section}>
            <Typography className={classes.sectionHeader}>
              {section.type === 'artists' && <PersonIcon />}
              {section.type === 'albums' && <AlbumIcon />}
              {section.type === 'songs' && <MusicNoteIcon />}{' '}
              {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
            </Typography>
            <List>
              {section.type === 'artists' &&
                section.items.map((artist) => (
                  <ArtistItem
                    key={artist.id}
                    artist={artist}
                    onClick={handleArtistClick}
                  />
                ))}
              {section.type === 'albums' &&
                section.items.map((album) => (
                  <AlbumItem
                    key={album.id}
                    album={album}
                    onClick={handleAlbumClick}
                  />
                ))}
              {section.type === 'songs' &&
                section.items.map((song) => (
                  <SongItem
                    key={song.id}
                    song={song}
                    onClick={handleSongClick}
                  />
                ))}
            </List>
          </Box>
          {index < sections.length - 1 && (
            <Divider className={classes.divider} />
          )}
        </Fragment>
      ))}
    </Box>
  )
}
