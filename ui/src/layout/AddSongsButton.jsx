import React, { useState } from 'react'
import { IconButton, Tooltip, makeStyles } from '@material-ui/core'
import { useTranslate } from 'react-admin'
import { MdAddCircleOutline } from 'react-icons/md'
import AddSongsDialog from '../dialogs/AddSongsDialog'

const useStyles = makeStyles((theme) => ({
  button: {
    color: 'inherit',
  },
}))

const AddSongsButton = () => {
  const classes = useStyles()
  const translate = useTranslate()
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Tooltip title={translate('menu.addSongsToServer')}>
        <IconButton
          className={classes.button}
          onClick={handleOpen}
          aria-label={translate('menu.addSongsToServer')}
          size="small"
        >
          <MdAddCircleOutline size={20} />
        </IconButton>
      </Tooltip>
      <AddSongsDialog open={open} onClose={handleClose} />
    </>
  )
}

export default AddSongsButton

