import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const wipeScrobbles = sdk.Action.withoutInput(
  'wipe-scrobbles',
  async () => ({
    name: i18n('Wipe Scrobble Database'),
    description: i18n('Permanently delete all scrobble history, tracks, artists, and albums.'),
    warning: i18n(
      'This permanently deletes ALL scrobble history — every scrobble, track, artist, and album — and cannot be undone. Your admin password, API keys, scrobble rules, and custom images are not affected. Consider using the Export button in Maloja’s Admin Panel to back up your data first.',
    ),
    allowedStatuses: 'only-stopped',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    // Maloja keeps all scrobbles/tracks/artists/albums in a single SQLite file
    // (malojadb.sqlite) separate from auth (auth.sqlite), settings.ini, rules,
    // and images — so deleting just this file (and its WAL sidecars, if
    // present) wipes scrobble history without touching anything else. Maloja
    // recreates an empty database automatically on next start.
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'maloja' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      }),
      'maloja-wipe',
      async sub =>
        sub.execFail([
          'rm',
          '-f',
          '/data/malojadb.sqlite',
          '/data/malojadb.sqlite-wal',
          '/data/malojadb.sqlite-shm',
        ]),
    )

    return {
      version: '1',
      title: i18n('Scrobble Database Wiped'),
      message: i18n('All scrobble history has been deleted. Start the service to generate a fresh, empty database.'),
      result: null,
    }
  },
)
