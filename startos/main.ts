import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const adminPassword = await storeJson.read(s => s.adminPassword).const(effects)

  return sdk.Daemons.of(effects).addDaemon('maloja', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'maloja' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      }),
      'maloja-sub',
    ),
    exec: {
      // The image (lsiobase/alpine, i.e. linuxserver.io's s6-overlay base)
      // bundles s6-overlay as its entrypoint, which must run as PID 1.
      command: sdk.useEntrypoint(),
      runAsInit: true,
      env: {
        MALOJA_DATA_DIRECTORY: '/data',
        // Re-applied by Maloja on every startup (not just first run) — this is
        // how the setAdminPassword action's stored value takes effect.
        ...(adminPassword ? { MALOJA_FORCE_PASSWORD: adminPassword } : {}),
      },
    },
    ready: {
      display: i18n('Web Interface'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: i18n('The web interface is ready'),
          errorMessage: i18n('The web interface is not ready'),
        }),
    },
    requires: [],
  })
})
