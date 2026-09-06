import { smtpPrefill } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec } = sdk

const inputSpec = InputSpec.of({
  smtp: sdk.inputSpecConstants.smtpInputSpec,
})

export const manageSmtp = sdk.Action.withInput(
  'manage-smtp',

  async () => ({
    name: i18n('Configure SMTP'),
    description: i18n(
      'Let Stirling PDF send email through the StartOS system SMTP settings or a server of your own, which also lets admins invite users by email.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async () => ({
    smtp: smtpPrefill(await storeJson.read((s) => s.smtp).once()),
  }),

  async ({ effects, input }) => storeJson.merge(effects, { smtp: input.smtp }),
)
