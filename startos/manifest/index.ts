import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'maloja',
  title: 'Maloja',
  license: 'GPL-3.0',
  packageRepo: 'https://github.com/Start9-Community/maloja-startos',
  upstreamRepo: 'https://github.com/krateng/maloja',
  marketingUrl: 'https://maloja.krateng.ch',
  donationUrl: 'https://patreon.com/krateng',
  description: { short, long },
  volumes: ['main'],
  images: {
    maloja: {
      source: { dockerTag: 'krateng/maloja:3.2.9' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
