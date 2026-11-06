import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.2.10:1',
  releaseNotes: {
    en_US:
      'Updates Maloja to 3.2.10, a rebuild with an updated certificate bundle, and rebuilds the package with start-sdk 4.0.0. Requires StartOS 0.4.1 or later. No configuration changes required.',
    es_ES:
      'Actualiza Maloja a 3.2.10, una recompilación con un paquete de certificados actualizado, y recompila el paquete con start-sdk 4.0.0. Requiere StartOS 0.4.1 o posterior. No es necesario cambiar la configuración.',
    de_DE:
      'Aktualisiert Maloja auf 3.2.10, einen Rebuild mit aktualisiertem Zertifikatspaket, und baut das Paket mit start-sdk 4.0.0 neu. Erfordert StartOS 0.4.1 oder neuer. Keine Konfigurationsänderungen erforderlich.',
    pl_PL:
      'Aktualizuje Maloję do wersji 3.2.10, przebudowanej z zaktualizowanym pakietem certyfikatów, i przebudowuje pakiet z start-sdk 4.0.0. Wymaga StartOS 0.4.1 lub nowszego. Nie trzeba zmieniać konfiguracji.',
    fr_FR:
      'Met à jour Maloja vers la 3.2.10, une reconstruction avec un lot de certificats mis à jour, et reconstruit le paquet avec start-sdk 4.0.0. Nécessite StartOS 0.4.1 ou version ultérieure. Aucune modification de configuration nécessaire.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
