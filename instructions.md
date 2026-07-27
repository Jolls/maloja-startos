# Maloja

## Documentation

- [Maloja README](https://github.com/krateng/maloja#readme) — the upstream project overview, scrobbling setup, and configuration reference.

## What you get on StartOS

A running Maloja instance with its web interface exposed. All scrobble data, charts, and settings live on your StartOS server's storage.

## Getting set up

1. Run the **Set Admin Password** action (you'll see this prompted as a required task right after install) to generate your admin password.
2. Open the web interface and log in with username `admin` and the password from step 1.
3. Configure a scrobbler client to point at your Maloja server's web address to start tracking plays — see the upstream documentation's scrobbling section for supported clients.

## Using Maloja

### Web interface

Your listening charts, statistics, and admin settings all live here. Enable admin mode from the web interface to edit artist associations, upload custom images, and manage scrobble rules.

### Actions

- **Set Admin Password** — generates a new random admin password and displays it. Run this any time to rotate your password.
- **Import Scrobbles** — migrate your history from another Maloja instance. On the *other* instance, use its Admin Panel's Export button to download a `maloja_export_*.json` file, then open it in a text editor and copy its entire contents. Stop this service, run this action, and paste the contents in. Existing scrobbles won't be duplicated, so it's safe to re-run. This only accepts Maloja's own export format, not Last.fm/Spotify/other platform exports — and very large libraries (hundreds of thousands of scrobbles) may be too large to paste in.
- **Wipe Scrobble Database** — permanently deletes your entire scrobble history (every scrobble, track, artist, and album). This cannot be undone. Your admin password, API keys, scrobble rules, and custom images are untouched. Stop the service first. Consider using Maloja's own Admin Panel → Export button to back up your data before running this.

### Connecting external scrobbler clients (e.g. multi-scrobbler)

If you're pointing a scrobbler tool that runs *outside* StartOS — [multi-scrobbler](https://github.com/FoxxMD/multi-scrobbler), a script, a phone app, etc. — at this instance's LAN address, you may see a connection failure even with the correct URL and a valid Maloja API key (generated from Maloja's own Admin Panel → API Keys, not your StartOS admin password).

**Why:** StartOS terminates HTTPS on the LAN address using its own self-signed certificate. Browsers get an interactive "trust this certificate" prompt on first visit; headless/non-browser clients don't, and most HTTP libraries reject unrecognized certs outright rather than connecting anyway. This affects *every* StartOS package's LAN interface when accessed by a non-browser client — it isn't specific to Maloja.

**Fix — trust StartOS's root CA in the client:**

1. Download your StartOS server's root CA certificate:
   ```
   curl -k -o local-root-ca.crt "https://<your-startos-lan-address>/static/local-root-ca.crt"
   ```
2. If the client runs in its own Docker container (as multi-scrobbler typically does), mount the certificate into that container and point it at the cert. For a Node.js-based client like multi-scrobbler, add to its `docker-compose.yml`:
   ```yaml
   services:
     multi-scrobbler:
       volumes:
         - /path/to/local-root-ca.crt:/certs/startos-ca.crt:ro
       environment:
         - NODE_EXTRA_CA_CERTS=/certs/startos-ca.crt
   ```
   `docker compose up -d` to recreate the container (a plain `restart` won't pick up a new bind mount).
3. Use the `https://` address (not `http://` — StartOS redirects plain HTTP to HTTPS on the same port anyway, and a client that doesn't follow redirects will just see an empty `307` response).

Once the client's own trust store includes StartOS's root CA, the connection validates normally — no need to disable certificate checking.

(Trusting the certificate on your workstation's OS/browser, e.g. via StartOS's own "Trust your Root CA" prompt, does **not** extend into a separate Docker container's isolated filesystem — each container needs the CA installed into its own trust path.)
