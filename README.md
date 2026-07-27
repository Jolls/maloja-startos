<p align="center">
  <img src="icon.svg" alt="Maloja Logo" width="21%">
</p>

# Maloja on StartOS

> **Upstream docs:** <https://github.com/krateng/maloja#readme>
>
> Everything not listed in this document should behave the same as upstream
> Maloja. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable.

[Maloja](https://github.com/krateng/maloja) is a self-hosted music scrobble database that turns your listening history into personal charts and statistics.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Upstream `krateng/maloja` image, unmodified. Architectures: x86_64, aarch64.

The image is built on `lsiobase/alpine` (linuxserver.io's s6-overlay base), so `startos/main.ts` runs the image's own entrypoint (`sdk.useEntrypoint()`) with `runAsInit: true` — s6-overlay must be PID 1.

## Volume and Data Layout

- Volume `main`, mounted at `/data` (`MALOJA_DATA_DIRECTORY=/data`). Holds all Maloja config, database, and image cache.
- `store.json` on the `main` volume holds the StartOS-generated `adminPassword` (not read by Maloja directly — see below).

## Installation and First-Run Flow

`MALOJA_SKIP_SETUP` is already the image default, so Maloja's interactive first-run wizard never triggers. No admin password is set until the user runs the **Set Admin Password** action; a critical task prompts for this on install.

## Configuration Management

| StartOS-Managed                         | Upstream-Managed                                     |
| ---------------------------------------- | ------------------------------------------------------ |
| Admin password (`Set Admin Password` action) | Everything else — scrobble rules, associated artists, custom images, `settings.ini` under `/data`, configurable via Maloja's own web UI/API |

The admin password is applied via `MALOJA_FORCE_PASSWORD`, which Maloja's own `setup()` routine re-applies (via its internal `auth.change_pw()`) on **every** container start when the env var is set — not just first run. `startos/main.ts` reads the stored password reactively (`storeJson.read(s => s.adminPassword).const(effects)`) and restarts the daemon when it changes, so rotating the password via the action takes effect automatically.

## Network Access and Interfaces

| Interface | Port  | Protocol | Purpose               |
| --------- | ----- | -------- | ---------------------- |
| `ui`      | 42010 | HTTP     | Maloja web interface   |

`interfaces.ts` declares `protocol: 'http'`, but the SDK's `MultiHost.bindPort` auto-upgrades any protocol with a `withSsl` variant (`http` → `https`) unless `noAddSsl`/`addSsl: null` is explicitly passed — so StartOS still wraps the LAN address in HTTPS with its own self-signed cert. Maloja itself never terminates TLS; it only ever speaks plain HTTP (waitress) on 42010.

This is invisible to browser users (StartOS's login flow walks them through trusting its root CA), but it breaks headless, non-browser clients that connect directly — e.g. [multi-scrobbler](https://github.com/FoxxMD/multi-scrobbler) or any other scrobbling client run outside StartOS. Such a client needs StartOS's root CA (`https://<lan-address>/static/local-root-ca.crt`) added to its own trust store — see `instructions.md`'s "Connecting external scrobbler clients" section for the concrete steps (a Node client, for example, needs the cert mounted in *and* `NODE_EXTRA_CA_CERTS` set — trusting the cert on the host OS doesn't extend into an isolated Docker container). This is a StartOS platform behavior affecting every package's LAN interface, not something specific to this package's config.

A StartOS-native package for a scrobbler client wouldn't hit this at all: same-instance dependencies resolve each other's internal (non-TLS, non-proxied) address via `effects.getServiceInterface`/`effects.getHostInfo` rather than the public LAN interface, so there's no cert involved for that path.

## Actions (StartOS UI)

- **Set Admin Password** (`set-admin-password`) — generates a new random password, stores it, and returns it. Available any time (`allowedStatuses: 'any'`); also surfaced as a critical install task until first set.
- **Import Scrobbles** (`import-scrobbles`) — takes the pasted contents of a `maloja_export_*.json` file (from another Maloja instance's Admin Panel → Export) and runs the upstream `maloja import` CLI against it in a temporary subcontainer sharing the `main` volume. Requires the service to be stopped (`allowedStatuses: 'only-stopped'`), since Maloja's own web UI has no file-upload import path — only identifier-based third-party auto-import and the CLI support importing an export file.
  - **Paste, not upload:** the SDK's `Value.file` action-input type (proper file upload) does not currently complete its upload handshake in the StartOS web UI as of `osVersion 0.4.0-beta.10` / `sdkVersion 2.0.1` — confirmed via both drag-and-drop and the native file picker, both submitting an empty `{}` for the field. Filed as a bug candidate upstream; this action uses a `Value.textarea` paste field as a workaround.
  - **Size limitation:** because the whole file must be pasted as text, this does not scale to very large libraries (a few hundred thousand scrobbles can be well over 100 MB of pretty-printed JSON) — browsers and the RPC layer may struggle with pastes that large. Switch this action back to `Value.file` once the upstream upload bug is fixed.
  - The staged copy is always named `maloja_export_import.json` to match Maloja's own `maloja_export[_0-9]*.json` filename-based format detection. This scopes the action to Maloja-native exports only — Last.fm/Spotify/ListenBrainz/Rockbox imports, which upstream also detects by original filename, are not reachable through pasted content (no filename to detect from) and are not supported through this action.
- **Wipe Scrobble Database** (`wipe-scrobbles`) — deletes `malojadb.sqlite` (plus any `-wal`/`-shm` sidecar files) from the `main` volume in a temporary subcontainer, the same pattern as Import Scrobbles. Maloja keeps all scrobbles, tracks, artists, and albums in this single SQLite file, separate from `auth.sqlite` (admin login), `settings.ini`, scrobble rules, and custom images — so this wipes listening history without touching credentials or configuration. Maloja recreates an empty database automatically on next start. Requires the service to be stopped (`allowedStatuses: 'only-stopped'`) to avoid deleting a file Maloja has open. No confirmation input beyond the action's `warning` text (matching this package's existing destructive-action pattern) — there is no undo, so the warning points users at Maloja's own Export button first.

## Backups and Restore

The `main` volume (all Maloja data, including `store.json`) is backed up in full. Restoring reapplies the stored admin password on next start.

## Health Checks

Daemon readiness checks that port 42010 is listening (`sdk.healthCheck.checkPortListening`). No standalone health checks.

## Dependencies

None.

## Limitations and Differences

1. The admin password is generated and managed by StartOS via the **Set Admin Password** action rather than Maloja's interactive first-run prompt.

## What Is Unchanged from Upstream

Everything else — scrobbling, charts, associated artists, custom images, proxy scrobbling, the API, and all `settings.ini` options — behaves exactly as documented upstream.

## Contributing

See [AGENTS.md](./AGENTS.md).

---

## Quick Reference for AI Consumers

```yaml
package_id: maloja
architectures: [x86_64, aarch64]
volumes:
  main: /data
ports:
  ui: 42010
dependencies: none
startos_managed_env_vars:
  - MALOJA_DATA_DIRECTORY
  - MALOJA_FORCE_PASSWORD
actions:
  - set-admin-password
  - import-scrobbles
  - wipe-scrobbles
```
