import Player from './components/Player';

const sources = [
  {
    label: 'FLV',
    type: 'flv',
    url: import.meta.env.VITE_FLV_URL,
  },
  {
    label: 'HLS',
    type: 'm3u8',
    url: import.meta.env.VITE_HLS_URL,
  },
].filter((source) => source.url);

function App() {
  return <Player sources={sources} className="artplayer-container" />;
}

export default App;
