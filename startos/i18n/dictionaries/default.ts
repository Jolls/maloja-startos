export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts, interfaces.ts
  'Web Interface': 0,
  'The web interface is ready': 1,
  'The web interface is not ready': 2,
  // interfaces.ts
  'The Maloja web interface': 3,
  // actions/setAdminPassword.ts
  'Set Admin Password': 4,
  'Generate a new random password for the Maloja web backend. Replaces any existing password.': 5,
  'Login Credentials': 6,
  'Use this password to sign in to the Maloja web backend.': 7,
  Password: 8,
  // init/watchCredentials.ts
  'Set the admin password before signing in to Maloja': 9,
  // actions/importScrobbles.ts
  'Maloja Export JSON': 10,
  'The full contents of a maloja_export_*.json file from another Maloja instance (Admin Panel → Export). Open the file and paste its entire contents here.': 11,
  'Import Scrobbles': 12,
  'Import scrobble history from another Maloja instance’s export file.': 13,
  'Stop the service first. Existing scrobbles are not duplicated, but a large import may take a while. Very large libraries (hundreds of thousands of scrobbles) may be too large to paste — see the README for the current file-size limitation.': 14,
  'Import Complete': 15,
  // actions/wipeScrobbles.ts
  'Wipe Scrobble Database': 16,
  'Permanently delete all scrobble history, tracks, artists, and albums.': 17,
  'This permanently deletes ALL scrobble history — every scrobble, track, artist, and album — and cannot be undone. Your admin password, API keys, scrobble rules, and custom images are not affected. Consider using the Export button in Maloja’s Admin Panel to back up your data first.': 18,
  'Scrobble Database Wiped': 19,
  'All scrobble history has been deleted. Start the service to generate a fresh, empty database.': 20,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
