import { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import mpegts from 'mpegts.js';
import Hls from 'hls.js';

export default function Player({ url, type, className, ...rest }) {
  const artRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const art = new Artplayer({
      container: artRef.current,
      url: url,
      type: type, // 'flv' or 'm3u8'
      isLive: true,
      muted: false,
      autoplay: true,
      pip: true,
      autoSize: true,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: true,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      theme: '#23ade5',
      lang: 'zh-cn',
      moreVideoAttr: {
        crossOrigin: 'anonymous',
      },
      customType: {
        flv: function (video, url, art) {
            if (mpegts.getIsSupported()) {
                const flvPlayer = mpegts.createPlayer({
                    type: 'flv',
                    url: url,
                    isLive: true,
                    cors: true,
                });
                flvPlayer.attachMediaElement(video);
                flvPlayer.load();
                art.flv = flvPlayer;
                
                // Error handling and auto-reconnect
                flvPlayer.on(mpegts.Events.ERROR, (errorType, errorDetail, errorInfo) => {
                    console.error('FLV Error:', errorType, errorDetail, errorInfo);
                    if (errorType === mpegts.ErrorTypes.NETWORK_ERROR) {
                         art.notice.show = 'Network error, reconnecting...';
                         setTimeout(() => {
                             flvPlayer.load();
                             flvPlayer.play();
                         }, 3000);
                    }
                });

                art.on('destroy', () => {
                    if (art.flv) {
                        art.flv.destroy();
                        art.flv = null;
                    }
                });
            } else {
                art.notice.show = 'Does not support playback of flv';
            }
        },
        m3u8: function (video, url, art) {
            if (Hls.isSupported()) {
                if (art.hls) art.hls.destroy();
                const hls = new Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
                art.hls = hls;
                
                hls.on(Hls.Events.ERROR, function (event, data) {
                     if (data.fatal) {
                        switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            // try to recover network error
                            console.log('fatal network error encountered, try to recover');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('fatal media error encountered, try to recover');
                            hls.recoverMediaError();
                            break;
                        default:
                            // cannot recover
                            hls.destroy();
                            break;
                        }
                    }
                });

                art.on('destroy', () => hls.destroy());
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else {
                art.notice.show = 'Does not support playback of m3u8';
            }
        },
      },
    });
    
    playerRef.current = art;

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy(false);
      }
    };
  }, [url, type]); // Re-initialize when url or type changes

  return <div ref={artRef} className={className} {...rest}></div>;
}
