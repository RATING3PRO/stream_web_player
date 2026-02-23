# Live Stream Player for Cloudflare Pages

A modern, responsive live stream player frontend built with React, Vite, Tailwind CSS, and Artplayer. It supports HLS playback with automatic reconnection.

## Features

- **HLS Support**: Optimized for HLS (m3u8) streams.
- **Auto-Reconnect**: Automatically attempts to reconnect on network errors.
- **Modern UI**: Clean, responsive interface built with Tailwind CSS.
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
    | `VITE_HLS_URL` | URL for the HLS (m3u8) stream source | `https://example.com/live.m3u8` |

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

-   **Frontend Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Player**: [Artplayer](https://artplayer.org/)
-   **Streaming Protocols**:
    -   HLS: [hls.js](https://github.com/video-dev/hls.js)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## License

AGPL-3.0
