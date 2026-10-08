import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.14.3:4',
  releaseNotes: {
    en_US: `StartOS package improvements.`,
    es_ES: `Mejoras en el paquete de StartOS.`,
    de_DE: `Verbesserungen am StartOS-Paket.`,
    pl_PL: `Ulepszenia pakietu StartOS.`,
    fr_FR: `Améliorations du paquet StartOS.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
