import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const store = await storeJson.read().const(effects)
  if (!store?.adminUsername || !store.adminPassword) {
    throw new Error('Admin credentials have not been set')
  }

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'stirling' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: 'configs',
        mountpoint: '/configs',
        readonly: false,
      })
      .mountVolume({
        volumeId: 'main',
        subpath: 'tessdata',
        mountpoint: '/usr/share/tessdata',
        readonly: false,
      })
      .mountVolume({
        volumeId: 'main',
        subpath: 'pipeline',
        mountpoint: '/pipeline',
        readonly: false,
      })
      .mountVolume({
        volumeId: 'main',
        subpath: 'logs',
        mountpoint: '/logs',
        readonly: false,
      })
      .mountVolume({
        volumeId: 'main',
        subpath: 'customFiles',
        mountpoint: '/customFiles',
        readonly: false,
      }),
    'stirling-pdf',
  )

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer,
    exec: {
      command: ['tini', '--', '/scripts/init.sh'],
      env: {
        DISABLE_ADDITIONAL_FEATURES: 'false',
        SECURITY_ENABLELOGIN: 'true',
        SECURITY_INITIALLOGIN_USERNAME: store.adminUsername,
        SECURITY_INITIALLOGIN_PASSWORD: store.adminPassword,
        SYSTEM_GOOGLEVISIBILITY: 'false',
        SYSTEM_ENABLEANALYTICS: 'false',
        SHOW_SURVEY: 'false',
        METRICS_ENABLED: 'true',
        SPRINGDOC_API_DOCS_ENABLED: 'false',
        SPRINGDOC_SWAGGER_UI_ENABLED: 'false',
        MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE: 'health',
        MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS: 'never',
      },
    },
    ready: {
      display: i18n('Web Interface'),
      gracePeriod: 180000,
      // Probed with exec rather than runHealthScript: that helper logs the
      // command, its result and an Error on every failed poll, which buries a
      // Spring Boot cold start in its own log.
      fn: async () => {
        const { exitCode, stdout } = await subcontainer.exec([
          'curl',
          '-fsS',
          `http://localhost:${uiPort}/api/v1/info/status`,
        ])
        if (exitCode === 0 && stdout.toString().includes('"status":"UP"')) {
          return {
            result: 'success' as const,
            message: i18n('The web interface is ready'),
          }
        }
        return {
          result: 'failure' as const,
          message: i18n('The web interface is not ready'),
        }
      },
    },
    requires: [],
  })
})
