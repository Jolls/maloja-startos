import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.2.6:0',
  releaseNotes: {
    en_US: 'Updates Maloja to 3.2.6, which fixes a replay-attack vulnerability, adds domain validation to external artwork fetchers, and fixes file permissions after the first-run local file copy. No config changes.',
    es_ES: 'Actualiza Maloja a 3.2.6, que corrige una vulnerabilidad de ataque de repetición, añade validación de dominio a los buscadores de portadas externas y corrige los permisos de archivo tras la copia inicial de archivos locales. Sin cambios de configuración.',
    de_DE: 'Aktualisiert Maloja auf 3.2.6: behebt eine Replay-Attack-Schwachstelle, fügt eine Domänenvalidierung für externe Cover-Abrufe hinzu und korrigiert Dateiberechtigungen nach dem erstmaligen Kopieren lokaler Dateien. Keine Konfigurationsänderungen.',
    pl_PL: 'Aktualizuje Maloję do wersji 3.2.6, która naprawia lukę typu replay attack, dodaje walidację domeny dla zewnętrznych pobierań okładek oraz naprawia uprawnienia plików po pierwszym kopiowaniu plików lokalnych. Brak zmian w konfiguracji.',
    fr_FR: "Met à jour Maloja vers la 3.2.6, qui corrige une vulnérabilité de type replay attack, ajoute une validation de domaine pour les récupérateurs de pochettes externes, et corrige les permissions de fichiers après la copie initiale des fichiers locaux. Aucun changement de configuration.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
