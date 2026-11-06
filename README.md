<p align="center">
  <img src="icon.svg" alt="Maloja Logo" width="21%">
</p>

# Maloja on StartOS

> Everything not listed in this document should behave the same as upstream
> Maloja. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Maloja](https://github.com/krateng/maloja) is a self-hosted music scrobble database that
turns your listening history into personal charts and statistics.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The upstream `krateng/maloja` image is used unmodified, for `x86_64` and `aarch64`.

It is built on `lsiobase/alpine` — linuxserver.io's s6-overlay base — whose `/init`
entrypoint must run as PID 1, so the daemon execs the image's own entrypoint rather than
the application directly. The single subcontainer is named `maloja-sub`; attach to it to
inspect the database or read Maloja's own logs.

Two temporary subcontainers, `maloja-import` and `maloja-wipe`, are created on demand by
the actions of the same name and torn down when the action returns. Neither is running
between action invocations.

## Volume and Data Layout

One volume holds everything, and Maloja lays the rest of its tree out beneath it.

| Volume | Mount point | Contents                                                    |
| ------ | ----------- | ----------------------------------------------------------- |
| `main` | `/data`     | Maloja's entire data directory, plus StartOS's `store.json` |

`MALOJA_DATA_DIRECTORY=/data` collapses Maloja's config, state, cache, and log roots onto
that one path. Within it:

| Path                | What it holds                                        |
| ------------------- | ---------------------------------------------------- |
| `malojadb.sqlite`   | every scrobble, track, artist, and album             |
| `auth/auth.sqlite`  | the admin login                                      |
| `apikeys.yml`       | the API keys scrobble clients authenticate with      |
| `settings.ini`      | Maloja's own settings, editable from its web UI      |
| `rules/`, `images/` | scrobble rules and custom artwork                    |
| `cache/`, `logs/`   | image cache and Maloja's logs                        |
| `store.json`        | StartOS-side state — see [File Models](#file-models) |

The scrobble database and the login database are separate files, which is what lets
**Wipe Scrobble Database** clear listening history without disturbing credentials.

## File Models

One model, and it holds StartOS state rather than upstream configuration.

`store.json`, at `/data/store.json`, holds a single key: `adminPassword`, the password
**Set Admin Password** generates. Nothing seeds it at install — it stays absent until that
action runs, which is what the critical task in [Tasks](#tasks) is waiting on. Only that
action writes it; nothing rewrites it on start, so the value survives restarts, upgrades,
and restores untouched.

Maloja reads none of this file. The daemon takes the password as `MALOJA_FORCE_PASSWORD`,
which Maloja re-applies to `auth/auth.sqlite` on **every** start, not just the first. That
is the one key StartOS owns and re-asserts: a password changed inside Maloja's own web UI
is overwritten the next time the service starts. Rotate it with the action instead.

Maloja's own `settings.ini` has no model and is never written by this package. Every
setting in it belongs to the user, and a hand edit — or a change made through Maloja's
settings UI — survives indefinitely. The optional Last.fm and TheAudioDB keys Maloja logs
as missing on every start live there: they fetch artist and album artwork, nothing more,
and they are the user's own accounts with those services. No action offers them, because
an action would mean StartOS re-asserting `settings.ini` over whatever the user set in
Maloja's own settings page.

## Dependencies

None.

## Network Access and Interfaces

A single web interface serves both the dashboard and Maloja's REST API.

| Interface     | Id   | Type | Port  | Protocol | Purpose                                                               |
| ------------- | ---- | ---- | ----- | -------- | --------------------------------------------------------------------- |
| Web Interface | `ui` | ui   | 42010 | HTTP     | charts, statistics, admin panel, and the API scrobble clients post to |

Maloja itself only ever speaks plain HTTP on 42010; TLS is terminated by StartOS in front
of it. Scrobble clients authenticate with an API key generated from Maloja's own Admin
Panel, which is unrelated to the StartOS-managed admin password.

**Only the admin pages are behind the password.** Maloja routes every page whose name
begins with `admin` through its login check and serves everything else — the dashboard,
the charts, the artist and album pages, the scrobble list — to anyone who asks. The read
half of the API is ungated the same way, so `GET /apis/mlj_1/scrobbles` returns the full
listening history without credentials, while the mutating endpoints answer `403`. That is
upstream's design and this package does not narrow it, but it decides which addresses are
safe to enable: anyone who can reach this interface can read what you have listened to.

## Installation and First-Run Flow

Setup differs from upstream in one way: the interactive first-run wizard never appears.

The image sets `MALOJA_SKIP_SETUP`, so Maloja starts non-interactively and would otherwise
come up with its built-in default password. This package holds the service on a critical
task instead until **Set Admin Password** has generated one — see [Tasks](#tasks). No other
setting is pre-configured, and nothing is written into Maloja's own config.

## Actions

Three actions: one credential, one migration, one destructive reset.

- **Set Admin Password** (`set-admin-password`) — run it once on install, when the critical
  task asks for it, and again whenever you want to rotate the password. Writes only
  `adminPassword` in `store.json`; the new value reaches Maloja on the next start, so the
  daemon restarts to apply it. Returns the generated password, which is the only time it is
  displayed — StartOS does not store a second copy you can read back. Safe to re-run, but
  each run invalidates the previous password, so once a password exists the action asks for
  confirmation before running; the first run, from the install task, does not.

- **Import Scrobbles** (`import-scrobbles`) — run it when migrating from another Maloja
  instance. Takes the pasted contents of that instance's export file, stages it in a
  temporary subcontainer sharing the `main` volume, and runs Maloja's own `import` against
  it, returning the importer's console report — ending with the counts of scrobbles imported
  and skipped — as a copyable text block with its ANSI colour codes stripped. Duration scales
  with the export; a small library is seconds, a large one minutes. Maloja de-duplicates on import, so re-running with
  the same export adds nothing — but the action accepts only Maloja's own export format, not
  Last.fm, Spotify, ListenBrainz, or Rockbox exports, which upstream detects by their original
  filename and which pasted text therefore cannot carry.

- **Wipe Scrobble Database** (`wipe-scrobbles`) — run it to start over with an empty
  library. Deletes `malojadb.sqlite` and its write-ahead sidecars from the `main` volume, in
  a temporary subcontainer, then leaves Maloja to recreate an empty database on the next
  start. Instant, irreversible, and there is no confirmation beyond the action's own warning.
  The admin password, API keys, scrobble rules, and custom artwork are untouched.

## Tasks

One task, raised on install and cleared by setting a password.

- **Set Admin Password** — `critical`. Raised whenever `store.json` carries no
  `adminPassword`, which on a fresh install is immediately. Because it is critical, the
  service is held from starting and the ordinary Start/Stop controls are replaced by the
  task itself until it is satisfied. Running the action clears it. It can return: it is
  re-evaluated on every init, so wiping the volume or restoring a backup taken before the
  password was set raises it again.

## Health Checks

One check, on the daemon.

- **`maloja`** — succeeds once port 42010 accepts a connection. Maloja opens its listener
  after its database migrations and start-up cleanup have run, so on a large library the
  check can sit in its grace period for a while before turning green; that is a slow start,
  not a fault. A check that stays red past that means the process never bound the port —
  read the subcontainer's logs for a database or permissions error rather than looking at
  the network.

## Backups and Restore

The whole of the `main` volume is copied wholesale — `sdk.Backups.ofVolumes`, no database
dump involved — so the scrobble database, the login database, `settings.ini`, rules,
artwork, and `store.json` all travel together, byte for byte.

Nothing is deliberately excluded, and a restored instance needs no further setup: because
`store.json` comes back with it, the admin password is re-applied on the first start and
the credential you already have keeps working.

## Limitations and Differences

1. The admin password is generated by StartOS and re-applied on every start. Changing it
   inside Maloja's own web UI does not stick — use **Set Admin Password**.
2. **Import Scrobbles** takes pasted text rather than an uploaded file, so an export beyond
   roughly a few tens of megabytes is impractical to submit. A library of hundreds of
   thousands of scrobbles falls in that range.
3. A scrobble client running outside StartOS reaches the web interface over a
   StartOS-issued certificate its trust store does not recognise, and most non-browser HTTP
   libraries refuse the connection rather than prompting. `instructions.md` covers adding
   the certificate to such a client. Clients running as StartOS services are unaffected —
   they reach Maloja over the internal bridge, with no TLS in the path.

---

## Quick Reference for AI Consumers

```yaml
package_id: maloja
image: krateng/maloja
architectures: [x86_64, aarch64]
subcontainers: [maloja-sub, maloja-import, maloja-wipe]
volumes:
  main: /data
file_models:
  - store.json
startos_managed_env_vars:
  - MALOJA_DATA_DIRECTORY
  - MALOJA_FORCE_PASSWORD
dependencies: none
interfaces:
  ui: { type: ui, port: 42010 }
actions:
  - set-admin-password
  - import-scrobbles
  - wipe-scrobbles
tasks:
  - { action: set-admin-password, severity: critical }
health_checks:
  - maloja
```
