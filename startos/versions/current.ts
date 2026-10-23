import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.2.9:0',
  releaseNotes: {
    en_US:
      'Updates Maloja to 3.2.9, which fixes XSS vulnerabilities in stored metadata and admin templates, allows an additional Last.fm domain, and fixes the display of settings and API keys. No configuration changes required.',
    es_ES:
      'Actualiza Maloja a 3.2.9, que corrige vulnerabilidades XSS en los metadatos almacenados y en las plantillas de administración, permite un dominio adicional de Last.fm y corrige la visualización de los ajustes y las claves de API. No es necesario cambiar la configuración.',
    de_DE:
      'Aktualisiert Maloja auf 3.2.9: behebt XSS-Schwachstellen in gespeicherten Metadaten und Admin-Templates, erlaubt eine zusätzliche Last.fm-Domain und korrigiert die Anzeige von Einstellungen und API-Schlüsseln. Keine Konfigurationsänderungen erforderlich.',
    pl_PL:
      'Aktualizuje Maloję do wersji 3.2.9, która naprawia luki XSS w zapisanych metadanych i szablonach administracyjnych, dopuszcza dodatkową domenę Last.fm oraz naprawia wyświetlanie ustawień i kluczy API. Nie trzeba zmieniać konfiguracji.',
    fr_FR:
      'Met à jour Maloja vers la 3.2.9, qui corrige des failles XSS dans les métadonnées stockées et les modèles d’administration, autorise un domaine Last.fm supplémentaire et corrige l’affichage des paramètres et des clés d’API. Aucune modification de configuration nécessaire.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
