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
  'Configure SMTP': 15,
  'Let Stirling PDF send email through the StartOS system SMTP settings or a server of your own, which also lets admins invite users by email.': 16,
  'Enable Server File Storage': 17,
  'Disable Server File Storage': 18,
  'Server file storage is off, so files in My Files stay in the browser they were added in. Run this action to let users keep files on the server and open them from any device. If it is running, Stirling PDF restarts.': 19,
  'Server file storage is on. Run this action to turn it off. If it is running, Stirling PDF restarts.': 20,
  'Stirling PDF still labels server file storage an alpha feature.': 21,
  'Users cannot open the files they keep on the server until it is enabled again. The files themselves are kept.': 22,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
