import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.14.3:2',
  releaseNotes: {
    en_US:
      'Adds the Configure SMTP action. Stirling PDF can send email through the StartOS system SMTP settings or a server of your own, and admins can invite users by email.',
    es_ES:
      'Añade la acción Configurar SMTP. Stirling PDF puede enviar correo a través de la configuración SMTP del sistema StartOS o de un servidor propio, y los administradores pueden invitar usuarios por correo.',
    de_DE:
      'Fügt die Aktion SMTP konfigurieren hinzu. Stirling PDF kann E-Mails über die SMTP-Einstellungen des StartOS-Systems oder einen eigenen Server senden, und Administratoren können Benutzer per E-Mail einladen.',
    pl_PL:
      'Dodaje akcję Skonfiguruj SMTP. Stirling PDF może wysyłać pocztę przez systemowe ustawienia SMTP StartOS lub własny serwer, a administratorzy mogą zapraszać użytkowników e-mailem.',
    fr_FR:
      'Ajoute l’action Configurer SMTP. Stirling PDF peut envoyer des e-mails via les réglages SMTP du système StartOS ou un serveur personnalisé, et les administrateurs peuvent inviter des utilisateurs par e-mail.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
