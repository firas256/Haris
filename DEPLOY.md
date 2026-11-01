# Deploying the Haris-1 backend

The dashboard page (`public/index.html`) is **unchanged**. This adds three backend addresses that nothing on the page uses yet, so visitors see no difference.

| Address | Who uses it | What it does |
|---|---|---|
| `POST /api/telemetry` | CubeSat ESP32 | Stores the latest reading (needs the secret key) |
| `POST /api/groundstation` | Ground-station ESP32 | Stores received radio packets (needs the secret key) |
| `GET /api/latest` | Dashboard (later), you | Returns the newest reading, recent events and radio packets |

Drag-and-drop deploys can't run backend functions, so the site has to deploy from GitHub from now on. One-time setup:

## 1. Put the files on GitHub
1. On github.com, create a new **private** repository, e.g. `haris-mission`.
2. On the repository page click **uploading an existing file** and drag in everything in this folder: `public`, `netlify`, `netlify.toml`, `package.json` (not this DEPLOY.md if you don't want it). Click **Commit changes**.

## 2. Create the secret key on Netlify
1. Netlify → your **haris-mission** project → **Project configuration → Environment variables → Add a variable**.
2. Key: `HARIS_API_KEY`. Value: a long random password (20+ letters and numbers; a password generator is fine). Scope must include **Functions**.
3. Keep the value private: it goes into the ESP32 code, never on the website or GitHub.

## 3. Connect the repository
1. Netlify → **haris-mission** → **Project configuration → Build & deploy → Continuous deployment → Link repository**, choose GitHub and the `haris-mission` repository.
2. Leave the build command **empty**. Publish directory and functions directory come from `netlify.toml` automatically.
3. Netlify builds and publishes. Check **Deploys** shows "Published", and the **Functions** tab lists `telemetry`, `groundstation` and `latest`.

From then on, every change committed to GitHub is deployed automatically.

## 4. Test it
Open https://haris-mission.netlify.app/api/latest in a browser. Before the CubeSat sends anything you should see:
```
{"online":false,"age_s":null,"latest":null,"events":[],"radio":[]}
```
The dashboard itself should look exactly as before.

## 5. Connect the ESP32
In `Haris1_Flight.ino`, set `WIFI_SSID`, `WIFI_PASS` and `API_KEY` (the same value as `HARIS_API_KEY`). `API_URL` is already filled in. Upload, then reload `/api/latest`: `online` becomes `true` and `latest` shows the CubeSat's readings, updated every second.

Use a phone hotspot or a normal password WiFi: the ESP32 can't log in to networks with a login page or username (most university WiFi).
