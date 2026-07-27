import { sdk } from '../sdk'
import { setAdminPassword } from './setAdminPassword'
import { importScrobbles } from './importScrobbles'
import { wipeScrobbles } from './wipeScrobbles'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(importScrobbles)
  .addAction(wipeScrobbles)
