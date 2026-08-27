import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { adminUsername, uiPort } from '../utils'

const api = `http://127.0.0.1:${uiPort}/api/v1`

// Stirling PDF's admin endpoint refuses to change the caller's own password, so
// rotation goes through the self-service one, which demands the current password.
async function rotate(current: string, next: string) {
  const login = await fetch(`${api}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: adminUsername, password: current }),
  })
  if (!login.ok) {
    throw new Error(
      i18n(
        'Stirling PDF rejected the saved password, so it cannot be changed from here. Change it from your account page inside Stirling PDF instead.',
      ),
    )
  }
  const { session } = await login.json()

  const changed = await fetch(`${api}/user/change-password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ currentPassword: current, newPassword: next }),
  })
  if (!changed.ok) {
    throw new Error(i18n('Stirling PDF refused the new password.'))
  }
}

export const setAdminPassword = sdk.Action.withoutInput(
  'set-admin-password',

  async ({ effects }) => {
    const saved = await storeJson.read().const(effects)
    const first = !saved?.adminPassword
    return {
      name: i18n('Set Admin Password'),
      description: first
        ? i18n(
            'Generate the password for the Stirling PDF admin account. Stirling PDF creates the account with it on its first start.',
          )
        : i18n(
            'Generate a new password for the Stirling PDF admin account and apply it.',
          ),
      warning: first
        ? null
        : i18n('Every signed-in Stirling PDF session ends immediately.'),
      allowedStatuses: first ? 'only-stopped' : 'only-running',
      group: null,
      visibility: 'enabled',
    }
  },

  async ({ effects }) => {
    const saved = await storeJson.read().once()
    const adminPassword = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })

    if (saved?.adminPassword) await rotate(saved.adminPassword, adminPassword)
    await storeJson.merge(effects, { adminUsername, adminPassword })

    return {
      version: '1',
      title: i18n('Stirling PDF Admin Password'),
      message: i18n(
        'Save this password — it is shown once, and running this action again replaces it.',
      ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: adminUsername,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: adminPassword,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
