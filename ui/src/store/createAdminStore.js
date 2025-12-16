import {
  applyMiddleware,
  combineReducers,
  compose,
  legacy_createStore as createStore,
} from 'redux'
import { routerMiddleware, connectRouter } from 'connected-react-router'
import createSagaMiddleware from 'redux-saga'
import { all, fork } from 'redux-saga/effects'
import { adminReducer, adminSaga, USER_LOGOUT } from 'react-admin'
import throttle from 'lodash.throttle'
import { loadState, saveState } from './persistState'

const createAdminStore = ({
  authProvider,
  dataProvider,
  history,
  customReducers = {},
}) => {
  const reducer = combineReducers({
    admin: adminReducer,
    router: connectRouter(history),
    ...customReducers,
  })
  const resettableAppReducer = (state, action) =>
    reducer(action.type !== USER_LOGOUT ? state : undefined, action)

  const saga = function* rootSaga() {
    yield all([adminSaga(dataProvider, authProvider)].map(fork))
  }
  const sagaMiddleware = createSagaMiddleware()

  const composeEnhancers =
    (process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        trace: true,
        traceLimit: 25,
      })) ||
    compose

  const persistedState = loadState()
  // Don't restore queue or playIndex from localStorage - they will be loaded from the API
  if (persistedState?.player) {
    persistedState.player.queue = []
    delete persistedState.player.playIndex
    delete persistedState.player.savedPlayIndex
  }
  const store = createStore(
    resettableAppReducer,
    persistedState,
    composeEnhancers(
      applyMiddleware(sagaMiddleware, routerMiddleware(history)),
    ),
  )
  // TODO: fix this hack and remove queue from persisted state
  let queue = []

  store.subscribe(
    throttle(() => {
      const state = store.getState()
      saveState({
        theme: state.theme,
        library: state.library,
        player: (({ queue, volume, savedPlayIndex }) => ({
          volume,
          savedPlayIndex,
        }))(state.player),
        albumView: state.albumView,
        settings: state.settings,
      })
    }),
    1000,
  )

  sagaMiddleware.run(saga)
  return store
}

export default createAdminStore
