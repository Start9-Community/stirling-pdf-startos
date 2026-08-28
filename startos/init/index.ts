import { actions } from '../actions'
import { restoreInit } from '../backups'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { createDirectories } from './createDirectories'
import { watchCredentials } from './watchCredentials'
import { sdk } from '../sdk'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  createDirectories,
  setInterfaces,
  setDependencies,
  actions,
  watchCredentials,
)

export const uninit = sdk.setupUninit(versionGraph)
