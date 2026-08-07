# Live Stream Player for Cloudflare Pages

A fullscreen live stream player frontend built with React, Vite, and Artplayer. It supports FLV and HLS playback with automatic reconnection and in-player source switching.

## Features

- **FLV and HLS Support**: Play FLV and HLS (m3u8) live streams.
- **In-Player Switching**: Switch between configured FLV and HLS sources from the Artplayer controls.
- **Autoplay**: Attempt playback with sound when the page opens and show an alert when the browser blocks it.
- **Auto-Reconnect**: Automatically attempts to reconnect on network errors.
- **Fullscreen Player**: Artplayer fills the browser viewport without external chrome or borders.
- **Environment Configurable**: Easily configure stream URLs via environment variables.

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
    | `VITE_FLV_URL` | URL for the FLV stream source | `https://example.com/live.flv` |
    | `VITE_HLS_URL` | URL for the HLS (m3u8) stream source | `https://example.com/live.m3u8` |

    You can configure either source or both. The source selector appears in Artplayer when both URLs are available.

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
4.  Start the development server:
    ```bash
    npm run dev
    ```

## Technology Stack

-   **Frontend Framework**: [React](https://react.dev/) + [Vite](https://vite.dev/)
-   **Player**: [Artplayer](https://artplayer.org/)
-   **Streaming Protocols**:
    -   FLV: [mpegts.js](https://github.com/xqq/mpegts.js)
    -   HLS: [hls.js](https://github.com/video-dev/hls.js)

## License

AGPL-3.0
