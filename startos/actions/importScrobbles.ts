import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  exportJson: Value.textarea({
    name: i18n('Maloja Export JSON'),
    description: i18n(
      'The full contents of a maloja_export_*.json file from another Maloja instance (Admin Panel → Export). Open the file and paste its entire contents here.',
    ),
    warning: null,
    footnote: null,
    default: null,
    required: true,
    minLength: 1,
    maxLength: null,
    minRows: 10,
    maxRows: 20,
    placeholder: '{"maloja":{"export_time":...},"scrobbles":[...]}',
  }),
})

export const importScrobbles = sdk.Action.withInput(
  'import-scrobbles',
  async () => ({
    name: i18n('Import Scrobbles'),
    description: i18n('Import scrobble history from another Maloja instance’s export file.'),
    warning: i18n(
      'Stop the service first. Existing scrobbles are not duplicated, but a large import may take a while. Very large libraries (hundreds of thousands of scrobbles) may be too large to paste — see the README for the current file-size limitation.',
    ),
    allowedStatuses: 'only-stopped',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async () => ({}),
  async ({ effects, input }) => {
    // Must match Maloja's own maloja_export[_0-9]*.json detection regex exactly
    // — only digits/underscores are allowed after "maloja_export", so no
    // descriptive suffix (e.g. "_import") can go here.
    const stagedName = 'maloja_export.json'

    const { stdout } = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'maloja' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      }),
      'maloja-import',
      async sub => {
        await sub.writeFile(`/tmp/${stagedName}`, input.exportJson)
        return sub.execFail(['/venv/bin/python', '-m', 'maloja', 'import', `/tmp/${stagedName}`], {
          env: { MALOJA_DATA_DIRECTORY: '/data' },
        })
      },
    )

    return {
      version: '1',
      title: i18n('Import Complete'),
      message: stdout.toString(),
      result: null,
    }
  },
)
