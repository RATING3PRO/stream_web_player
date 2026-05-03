# Live Stream Player for Cloudflare Pages

A modern, responsive live stream player frontend built with React, Vite, Tailwind CSS, Artplayer, and Cloudflare Pages Functions. HLS manifests and media segments are proxied through Cloudflare's edge before reaching the user's browser.

## Features

- **HLS Support**: Optimized for HLS (m3u8) streams.
- **Cloudflare Edge Proxy**: The browser requests `/api/stream`; Cloudflare Pages Functions fetch the upstream manifest and segments.
- **Manifest Rewriting**: Variant playlists, media segments, encryption keys, and init maps are rewritten to keep playback on the edge proxy path.
- **Auto-Reconnect**: Automatically attempts to reconnect on network errors.
- **Modern UI**: Clean, responsive interface built with Tailwind CSS.
- **Environment Configurable**: Configure upstream stream URLs through Cloudflare environment variables.

## Request Flow

```text
User browser -> Cloudflare Pages static app
User browser -> /api/stream
Cloudflare edge -> HLS_ORIGIN_URL
Cloudflare edge -> rewrites m3u8 URIs to /api/stream?url=...
User browser -> /api/stream?url=... for child playlists, segments, keys, and init maps
Cloudflare edge -> upstream HLS assets
```

## Deployment on Cloudflare Pages

1.  **Fork/Clone** this repository to your GitHub/GitLab account.
2.  Log in to the **Cloudflare Dashboard** and navigate to **Pages**.
3.  Click **Create a project** > **Connect to Git**.
4.  Select your repository.
5.  Configure the build settings:
    -   **Framework preset**: Vite
    -   **Build command**: `npm run build`
    -   **Build output directory**: `dist`
6.  **Environment Variables**:
    Add the following environment variables in the **Settings** > **Environment variables** section of your Cloudflare Pages project:

    | Variable Name | Description | Example |
    | :--- | :--- | :--- |
    | `HLS_ORIGIN_URL` | Server-side URL for the upstream HLS (m3u8) stream source | `https://example.com/live.m3u8` |
    | `HLS_ALLOWED_HOSTS` | Comma-separated upstream hostnames the proxy may fetch. Include CDN segment hosts if they differ from the manifest host. Defaults to the `HLS_ORIGIN_URL` hostname. | `example.com,cdn.example.com` |
    | `VITE_HLS_PROXY_URL` | Optional frontend playback URL. Defaults to `/api/stream`. | `/api/stream` |

7.  Click **Save and Deploy**.

## Local Development

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on `.env.example` and set your stream URL.
    ```bash
    cp .env.example .env
    ```
4.  Start the Vite development server:
    ```bash
    npm run dev
    ```

For local testing of the Cloudflare Pages Function itself, run the built app with Cloudflare's Pages development server and provide `HLS_ORIGIN_URL` through Cloudflare-compatible local environment configuration.

## Technology Stack

-   **Frontend Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Player**: [Artplayer](https://artplayer.org/)
-   **Edge Runtime**: [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
-   **Streaming Protocols**:
    -   HLS: [hls.js](https://github.com/video-dev/hls.js)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## License

AGPL-3.0
