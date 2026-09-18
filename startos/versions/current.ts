import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.14.3:3',
  releaseNotes: {
    en_US: `- OCR languages can now be added from the Advanced settings inside Stirling PDF. Downloads were refused before; they now work and survive restarts, updates and restores.
- Backups no longer include the memory dumps Stirling PDF writes if it runs out of memory, which can be several gigabytes each.
- Finished converter processes are now cleaned up properly, which removes a warning from the start of the logs.
- The instructions now list the OCR languages that are included, and mention the five-user limit of the free tier and that invited users sign in with their email address.`,
    es_ES: `- Ahora se pueden añadir idiomas de OCR desde los ajustes avanzados de Stirling PDF. Antes las descargas se rechazaban; ahora funcionan y sobreviven a reinicios, actualizaciones y restauraciones.
- Las copias de seguridad ya no incluyen los volcados de memoria que Stirling PDF escribe si se queda sin memoria, que pueden ocupar varios gigabytes cada uno.
- Los procesos de conversión terminados ahora se limpian correctamente, lo que elimina una advertencia al inicio de los registros.
- Las instrucciones ahora enumeran los idiomas de OCR incluidos y mencionan el límite de cinco usuarios del nivel gratuito y que los usuarios invitados inician sesión con su dirección de correo.`,
    de_DE: `- OCR-Sprachen lassen sich jetzt in den erweiterten Einstellungen von Stirling PDF hinzufügen. Downloads wurden bisher abgelehnt; jetzt funktionieren sie und überstehen Neustarts, Updates und Wiederherstellungen.
- Backups enthalten nicht mehr die Speicherabbilder, die Stirling PDF schreibt, wenn ihm der Arbeitsspeicher ausgeht, und die jeweils mehrere Gigabyte groß sein können.
- Beendete Konvertierungsprozesse werden jetzt korrekt aufgeräumt, wodurch eine Warnung am Anfang der Protokolle entfällt.
- Die Anleitung nennt jetzt die enthaltenen OCR-Sprachen und erwähnt das Limit von fünf Benutzern in der kostenlosen Stufe sowie dass sich eingeladene Benutzer mit ihrer E-Mail-Adresse anmelden.`,
    pl_PL: `- Języki OCR można teraz dodawać w ustawieniach zaawansowanych Stirling PDF. Wcześniej pobieranie było odrzucane; teraz działa, a pobrane języki przetrwają restarty, aktualizacje i przywracanie.
- Kopie zapasowe nie zawierają już zrzutów pamięci, które Stirling PDF zapisuje, gdy zabraknie mu pamięci, a które mogą zajmować po kilka gigabajtów.
- Zakończone procesy konwersji są teraz poprawnie sprzątane, co usuwa ostrzeżenie z początku logów.
- Instrukcja wymienia teraz dołączone języki OCR oraz wspomina o limicie pięciu użytkowników w darmowym planie i o tym, że zaproszeni użytkownicy logują się swoim adresem e-mail.`,
    fr_FR: `- Les langues d’OCR peuvent désormais être ajoutées depuis les paramètres avancés de Stirling PDF. Les téléchargements étaient refusés auparavant ; ils fonctionnent maintenant et survivent aux redémarrages, mises à jour et restaurations.
- Les sauvegardes n’incluent plus les vidages mémoire que Stirling PDF écrit lorsqu’il manque de mémoire, et qui peuvent peser plusieurs gigaoctets chacun.
- Les processus de conversion terminés sont désormais correctement nettoyés, ce qui supprime un avertissement au début des journaux.
- Les instructions énumèrent désormais les langues d’OCR incluses et mentionnent la limite de cinq utilisateurs de l’offre gratuite ainsi que le fait que les utilisateurs invités se connectent avec leur adresse e-mail.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
