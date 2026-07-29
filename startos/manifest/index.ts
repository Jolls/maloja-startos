import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'maloja',
  title: 'Maloja',
  license: 'GPL-3.0',
  packageRepo: 'https://github.com/Jolls/maloja-startos',
  upstreamRepo: 'https://github.com/krateng/maloja',
  marketingUrl: 'https://maloja.krateng.ch',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    // Confirmed on Docker Hub 2026-07-25: krateng/maloja:3.2.4 ships both
    // amd64 and arm64. See UPDATING.md for how to re-check this on bump.
    maloja: {
      source: { dockerTag: 'krateng/maloja:3.2.4' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
