import { sdk } from '../sdk'
import { manageSmtp } from './manageSmtp'
import { serverFileStorage } from './serverFileStorage'
import { setAdminPassword } from './setAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(manageSmtp)
  .addAction(serverFileStorage)
