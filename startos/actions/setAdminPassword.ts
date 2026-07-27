import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const setAdminPassword = sdk.Action.withoutInput(
  'set-admin-password',
  async () => ({
    name: i18n('Set Admin Password'),
    description: i18n('Generate a new random password for the Maloja web backend. Replaces any existing password.'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const adminPassword = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })
    await storeJson.merge(effects, { adminPassword })

    return {
      version: '1',
      title: i18n('Login Credentials'),
      message: i18n('Use this password to sign in to the Maloja web backend.'),
      result: {
        type: 'single',
        name: i18n('Password'),
        description: null,
        value: adminPassword,
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
