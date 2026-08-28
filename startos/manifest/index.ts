import { setupManifest } from '@start9labs/start-sdk'
import { alertInstall, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'stirling-pdf',
  title: 'Stirling PDF',
  license: 'MIT AND LicenseRef-Stirling-PDF-User-License',
  packageRepo: 'https://github.com/Start9-Community/stirling-pdf-startos',
  upstreamRepo: 'https://github.com/Stirling-Tools/Stirling-PDF',
  marketingUrl: 'https://stirlingpdf.com',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    stirling: {
      source: { dockerTag: 'stirlingtools/stirling-pdf:2.14.3' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: alertInstall,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
