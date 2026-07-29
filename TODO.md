# TODO — bring Maloja from template to release-ready

## Identity & metadata

- [x] `startos/manifest/index.ts`: `packageRepo` set to github.com/Jolls/maloja-startos.

## Build, test, ship

- [x] First test build: `npm run build` + `start-cli s9pk pack` — clean, no `tsc`/pack errors.
- [x] Installed on 192.168.121.132 and verified: critical task blocked start until **Set Admin Password**
      was run; daemon health check passes ("The web interface is ready"); web UI serves the real Maloja
      dashboard on its bound port; the generated password authenticates via `/auth/authenticate` and reaches
      `/admin_overview`; password survives a full `package restart` (confirms `MALOJA_FORCE_PASSWORD`
      re-application on every start, not just first run).
- [ ] Backup / restore sanity check (not yet run — requires a configured backup target on the test box).
- [ ] Review the README and instructions one more time against actual behavior.
- [x] **Import Scrobbles verified end-to-end.** `Value.file` (real file upload) does not work on this
      OS build — confirmed via both drag-and-drop and the native file picker in the actual StartOS web UI,
      both submitting an empty `{}` for the field (RPC validation error on `file.path`/`file.commitment`).
      Write-up for a bug report is in the scratchpad, not yet filed pending review. Switched the action to a
      `Value.textarea` paste field instead. Verified via `start-cli package action get-input`/`run` (piping
      JSON to stdin): a real export fetched from the running instance round-trips correctly (0 scrobbles,
      since the test instance is fresh), and a synthetic 2-scrobble export imported successfully and was
      confirmed present via `/apis/mlj_1/scrobbles` after restarting the service — then cleaned up via
      `/apis/mlj_1/delete_scrobble`. One bug caught and fixed in this process: the staged filename
      `maloja_export_import.json` did **not** match Maloja's own `maloja_export[_0-9]*\.json` detection regex
      (letters aren't allowed after `maloja_export`, only digits/underscores) — renamed to `maloja_export.json`.
      **Known limitation:** paste-based input doesn't scale to very large libraries (hundreds of thousands of
      scrobbles can be 100+ MB of pretty-printed JSON). Revisit once the `Value.file` upload bug is fixed
      upstream — see README's Import Scrobbles entry.
