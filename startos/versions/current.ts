import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.2.6:4',
  releaseNotes: {
    en_US:
      'Updated StartOS integration dependencies. No configuration changes required.',
    es_ES:
      'Se actualizaron las dependencias de integración con StartOS. No es necesario cambiar la configuración.',
    de_DE:
      'Abhängigkeiten der StartOS-Integration aktualisiert. Keine Konfigurationsänderungen erforderlich.',
    pl_PL:
      'Zaktualizowano zależności integracji ze StartOS. Nie trzeba zmieniać konfiguracji.',
    fr_FR:
      'Mise à jour des dépendances d’intégration à StartOS. Aucune modification de configuration nécessaire.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
