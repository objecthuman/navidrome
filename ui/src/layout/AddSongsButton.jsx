import React from 'react'
import { IconButton, Tooltip, makeStyles } from '@material-ui/core'
import { useTranslate } from 'react-admin'
import { MdAddCircleOutline } from 'react-icons/md'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
  button: {
    color: 'inherit',
  },
}))

const AddSongsButton = () => {
  const classes = useStyles()
  const translate = useTranslate()
  const history = useHistory()

  return (
    <Tooltip title={translate('menu.addSongsToServer')}>
      <IconButton
        className={classes.button}
        onClick={() => history.push('/add-songs')}
        aria-label={translate('menu.addSongsToServer')}
        size="small"
      >
        <MdAddCircleOutline size={20} />
      </IconButton>
    </Tooltip>
  )
}

export default AddSongsButton

