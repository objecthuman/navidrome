import React from 'react'
import { Route } from 'react-router-dom'
import Personal from './personal/Personal'
import AddSongsPage from './pages/AddSongsPage'

const routes = [
  <Route exact path="/personal" render={() => <Personal />} key={'personal'} />,
  <Route
    exact
    path="/add-songs"
    render={() => <AddSongsPage />}
    key={'add-songs'}
  />,
]

export default routes
