import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.2.10:0',
  releaseNotes: {
    en_US:
      'Updates Maloja to 3.2.10, a rebuild with an updated certificate bundle. No configuration changes required.',
    es_ES:
      'Actualiza Maloja a 3.2.10, una recompilación con un paquete de certificados actualizado. No es necesario cambiar la configuración.',
    de_DE:
      'Aktualisiert Maloja auf 3.2.10, einen Rebuild mit aktualisiertem Zertifikatspaket. Keine Konfigurationsänderungen erforderlich.',
    pl_PL:
      'Aktualizuje Maloję do wersji 3.2.10, przebudowanej z zaktualizowanym pakietem certyfikatów. Nie trzeba zmieniać konfiguracji.',
    fr_FR:
      'Met à jour Maloja vers la 3.2.10, une reconstruction avec un lot de certificats mis à jour. Aucune modification de configuration nécessaire.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
