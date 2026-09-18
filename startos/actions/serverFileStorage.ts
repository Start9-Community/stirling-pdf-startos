import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const serverFileStorage = sdk.Action.withoutInput(
  'server-file-storage',

  async ({ effects }) => {
    const enabled = await storeJson
      .read((s) => s.serverFileStorage)
      .const(effects)

    return {
      name: enabled
        ? i18n('Disable Server File Storage')
        : i18n('Enable Server File Storage'),
      description: enabled
        ? i18n(
            'Server file storage is on. Run this action to turn it off. If it is running, Stirling PDF restarts.',
          )
        : i18n(
            'Server file storage is off, so files in My Files stay in the browser they were added in. Run this action to let users keep files on the server and open them from any device. If it is running, Stirling PDF restarts.',
          ),
      warning: enabled
        ? i18n(
            'Users cannot open the files they keep on the server until it is enabled again. The files themselves are kept.',
          )
        : i18n(
            'Stirling PDF still labels server file storage an alpha feature.',
          ),
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },

  async ({ effects }) => {
    const enabled = await storeJson.read((s) => s.serverFileStorage).once()
    await storeJson.merge(effects, { serverFileStorage: !enabled })
  },
)
