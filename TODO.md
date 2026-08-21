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
- [x] `tsc --noEmit`, `npm run build`, and `start-cli s9pk pack` all re-verified clean on 2026-08-21.
- [x] README and instructions reviewed against `main.ts`/`interfaces.ts`/`backups.ts`/`utils.ts` on 2026-08-21 — accurate, no drift.
- [x] **Uninstall / reinstall teardown check (2026-08-21).** The real `maloja` install on 192.168.121.132
      carries production data, so this was run against a disposable `maloja-test` sideload instead: manifest
      `id` temporarily changed to `maloja-test`, packed, `start-cli package install --sideload`ed alongside
      the production `maloja`, driven through **Set Admin Password**, confirmed the daemon health check
      passed and the web UI served — then `start-cli package uninstall maloja-test` removed it cleanly
      (verified gone from `package list`), reinstalled cleanly from the same sideload, then uninstalled again
      for final cleanup. Production `maloja` was never touched. Manifest `id` reverted to `maloja` afterward;
      `startos/manifest/index.ts` diff is clean.
- [x] **Backup / restore sanity check (2026-08-21).** Run by the user via the StartOS GUI against the disposable
      `maloja-test` sideload (installed alongside production `maloja`, which was never touched) and the
      existing `cifs-1` backup target. Restore went `restoring` → Validating Headers → Unpacking → Restoring →
      `installed` with no errors. Post-restore startup logs confirmed a clean round-trip: no migration errors,
      `Password has been set.` (confirms the restored `store.json` admin password was reapplied via
      `MALOJA_FORCE_PASSWORD`), the daemon health check passed, and Maloja's own DB cleanup ran without
      complaint. `maloja-test` uninstalled afterward for final cleanup.
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
