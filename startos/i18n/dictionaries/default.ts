export const DEFAULT_LANG = 'en_US'

const dict = {
  'Web Interface': 0,
  'The Stirling PDF web interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,
  'Set Admin Password': 4,
  'Generate the password for the Stirling PDF admin account. Stirling PDF creates the account with it on its first start.': 5,
  'Generate a new password for the Stirling PDF admin account and apply it.': 6,
  'Every signed-in Stirling PDF session ends immediately.': 7,
  'Stirling PDF Admin Password': 8,
  'Save this password — it is shown once, and running this action again replaces it.': 9,
  Username: 10,
  Password: 11,
  'Set the admin password before starting Stirling PDF.': 12,
  'Stirling PDF rejected the saved password, so it cannot be changed from here. Change it from your account page inside Stirling PDF instead.': 13,
  'Stirling PDF refused the new password.': 14,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
