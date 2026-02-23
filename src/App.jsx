import React, { useState, useEffect } from 'react';
import Player from './components/Player';
import { Tv, Radio } from 'lucide-react';

function App() {
  const [sourceType, setSourceType] = useState('hls'); // 'flv' or 'hls'
  const [url, setUrl] = useState('');
  
  // Get URLs from environment variables
  // In Cloudflare Pages, these should be set in the project settings
  const flvUrl = import.meta.env.VITE_FLV_URL;
  const hlsUrl = import.meta.env.VITE_HLS_URL;

  useEffect(() => {
    // Default to available source if one is missing
    if (sourceType === 'flv' && flvUrl) {
      setUrl(flvUrl);
    } else if (sourceType === 'hls' && hlsUrl) {
      setUrl(hlsUrl);
    } else if (!flvUrl && hlsUrl) {
        setSourceType('hls');
        setUrl(hlsUrl);
    } else if (flvUrl && !hlsUrl) {
        setSourceType('flv');
        setUrl(flvUrl);
    }
  }, [sourceType, flvUrl, hlsUrl]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 font-sans">
      <header className="w-full max-w-5xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Live Stream
        </h1>
        
        <div className="flex gap-1 bg-gray-900/80 p-1.5 rounded-xl border border-gray-800 backdrop-blur-sm">
          {flvUrl && (
            <button
              onClick={() => setSourceType('flv')}
              className={`px-5 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium text-sm ${
                sourceType === 'flv' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Radio className={`w-4 h-4 ${sourceType === 'flv' ? 'animate-pulse' : ''}`} /> 
              FLV Source
            </button>
          )}
          
          {hlsUrl && (
            <button
              onClick={() => setSourceType('hls')}
              className={`px-5 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium text-sm ${
                sourceType === 'hls' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Radio className={`w-4 h-4 ${sourceType === 'hls' ? 'animate-pulse' : ''}`} /> 
              HLS Source
            </button>
          )}

          {!flvUrl && !hlsUrl && (
             <div className="px-4 py-2 text-gray-500 text-sm">No sources configured</div>
          )}
        </div>
      </header>

      <main className="w-full max-w-5xl aspect-video relative group rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-black">
         {/* Player Container */}
         {url ? (
            <Player 
                key={sourceType} // Force remount on switch to ensure clean player instance
                url={url} 
                type={sourceType === 'flv' ? 'flv' : 'm3u8'} 
                className="w-full h-full"
            />
         ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-900/50">
                <div className="p-4 rounded-full bg-gray-800 mb-4">
                    <Tv className="w-12 h-12 text-gray-600" />
                </div>
                <p className="text-lg font-medium">Stream Offline or Not Configured</p>
                <p className="text-sm mt-2 opacity-60">Please check VITE_FLV_URL and VITE_HLS_URL environment variables</p>
            </div>
         )}
      </main>
      
      <footer className="mt-8 text-gray-600 text-sm flex gap-4">
        <span>Cloudflare Pages</span>
        <span>•</span>
        <span>Artplayer</span>
      </footer>
    </div>
  );
}

export default App;
