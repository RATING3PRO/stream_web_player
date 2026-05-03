import React from 'react';
import Player from './components/Player';
import { Tv } from 'lucide-react';

function App() {
  const url = import.meta.env.VITE_HLS_PROXY_URL || '/api/stream';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 font-sans">
      <header className="w-full max-w-5xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Live Stream
        </h1>

        <div className="flex gap-1 bg-gray-900/80 p-1.5 rounded-xl border border-gray-800 backdrop-blur-sm">
          {!url && (
            <div className="px-4 py-2 text-gray-500 text-sm">No HLS proxy configured</div>
          )}
        </div>
      </header>

      <main className="w-full max-w-5xl aspect-video relative group rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-black">
        {url ? (
          <Player
            url={url}
            className="w-full h-full"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-900/50">
            <div className="p-4 rounded-full bg-gray-800 mb-4">
              <Tv className="w-12 h-12 text-gray-600" />
            </div>
            <p className="text-lg font-medium">Stream Offline or Not Configured</p>
            <p className="text-sm mt-2 opacity-60">Please check HLS_ORIGIN_URL in Cloudflare Pages</p>
          </div>
        )}
      </main>

      <footer className="mt-8 text-gray-600 text-sm flex gap-4">
        <span>Cloudflare Pages</span>
        <span>-</span>
        <span>Edge Proxy</span>
        <span>-</span>
        <span>Artplayer</span>
      </footer>
    </div>
  );
}

export default App;
