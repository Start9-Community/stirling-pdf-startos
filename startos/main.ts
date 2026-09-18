import { T } from '@start9labs/start-sdk'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { tessdataDir, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const store = await storeJson.read().const(effects)
  if (!store?.adminUsername || !store.adminPassword) {
    throw new Error('Admin credentials have not been set')
  }

  let mail: T.SmtpValue | null = null
  if (store.smtp?.selection === 'system') {
    mail = await sdk.getSystemSmtp(effects).const()
    if (mail && store.smtp.value.customFrom) {
      mail.from = store.smtp.value.customFrom
    }
  } else if (store.smtp?.selection === 'custom') {
    const { host, from, username, password, security } =
      store.smtp.value.provider.value
    mail = {
      host,
      port: Number(security.value.port),
      from,
      username,
      password: password ?? null,
      security: security.selection,
    }
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
        mountpoint: tessdataDir,
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
      })
      .mountVolume({
        volumeId: 'main',
        subpath: 'storage',
        mountpoint: '/storage',
        readonly: false,
      }),
    'stirling-pdf',
  )

  // Tesseract reads only tessdataDir, so the volume is mounted over it to keep
  // the languages added from the UI. That hides the ones the image ships, so
  // this subcontainer sees both and copies them across before each start,
  // leaving alone any file that is newer on the volume.
  const tessdataSeed = sdk.SubContainer.of(
    effects,
    { imageId: 'stirling' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: 'tessdata',
      mountpoint: '/mnt/tessdata',
      readonly: false,
    }),
    'tessdata-seed',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('tessdata-seed', {
      subcontainer: tessdataSeed,
      exec: {
        command: [
          'sh',
          '-c',
          // PUID/PGID are the image's own: the ids init.sh runs Stirling PDF as
          `cp -au ${tessdataDir}/. /mnt/tessdata/ && chown -R "\${PUID:-1000}:\${PGID:-1000}" /mnt/tessdata`,
        ],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer,
      exec: {
        command: ['tini', '--', '/scripts/init.sh'],
        env: {
          // StartOS runs its own PID 1 in the subcontainer, so tini must
          // register as a subreaper to reap the converters Stirling PDF spawns.
          TINI_SUBREAPER: '1',
          // StartOS sets no memory limit, so upstream's init would size the heap
          // from the whole host: half its RAM. This is about what it picks for
          // the 4 GB container its docs recommend for a small team.
          JAVA_CUSTOM_OPTS: '-Xms512m -Xmx3g',
          DISABLE_ADDITIONAL_FEATURES: 'false',
          SECURITY_ENABLELOGIN: 'true',
          SECURITY_INITIALLOGIN_USERNAME: store.adminUsername,
          SECURITY_INITIALLOGIN_PASSWORD: store.adminPassword,
          STORAGE_ENABLED: String(store.serverFileStorage),
          SYSTEM_GOOGLEVISIBILITY: 'false',
          SYSTEM_ENABLEANALYTICS: 'false',
          SHOW_SURVEY: 'false',
          METRICS_ENABLED: 'true',
          SPRINGDOC_API_DOCS_ENABLED: 'false',
          SPRINGDOC_SWAGGER_UI_ENABLED: 'false',
          MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE: 'health',
          MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS: 'never',
          ...(mail && {
            MAIL_ENABLED: 'true',
            MAIL_ENABLEINVITES: 'true',
            MAIL_HOST: mail.host,
            MAIL_PORT: String(mail.port),
            MAIL_USERNAME: mail.username,
            MAIL_PASSWORD: mail.password ?? '',
            MAIL_FROM: mail.from,
            MAIL_STARTTLSENABLE: String(mail.security === 'starttls'),
            MAIL_STARTTLSREQUIRED: String(mail.security === 'starttls'),
            MAIL_SSLENABLE: String(mail.security === 'tls'),
          }),
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
      requires: ['tessdata-seed'],
    })
})
