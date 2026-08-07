import { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import mpegts from 'mpegts.js';

const RECONNECT_DELAY = 3000;

function destroyPlayback(art, video) {
  if (art.flvReconnectTimer) {
    window.clearTimeout(art.flvReconnectTimer);
    art.flvReconnectTimer = null;
  }

  if (art.flv) {
    art.flv.destroy();
    art.flv = null;
  }

  if (art.hls) {
    art.hls.destroy();
    art.hls = null;
  }

  video.pause();
  video.removeAttribute('src');
  video.load();
}

function playFlv(video, url, art) {
  destroyPlayback(art, video);

  if (!mpegts.isSupported()) {
    art.notice.show = '当前浏览器不支持 FLV 播放';
    return;
  }

  const flv = mpegts.createPlayer(
    {
      type: 'flv',
      url,
      isLive: true,
      cors: true,
    },
    {
      enableStashBuffer: false,
      isLive: true,
      lazyLoad: false,
      deferLoadAfterSourceOpen: false,
      autoCleanupSourceBuffer: true,
      fixAudioTimestampGap: false,
    },
  );

  art.flv = flv;
  flv.attachMediaElement(video);
  flv.load();

  flv.on(mpegts.Events.ERROR, (errorType) => {
    if (errorType !== mpegts.ErrorTypes.NETWORK_ERROR || art.flv !== flv) {
      return;
    }

    art.notice.show = 'FLV 网络异常，正在重连';
    window.clearTimeout(art.flvReconnectTimer);
    art.flvReconnectTimer = window.setTimeout(() => {
      if (art.isDestroy || art.flv !== flv) return;

      const shouldResume = art.playing;
      flv.unload();
      flv.load();

      if (shouldResume) {
        flv.play().catch(() => {
          art.notice.show = '请点击播放';
        });
      }
    }, RECONNECT_DELAY);
  });
}

function playHls(video, url, art) {
  destroyPlayback(art, video);

  if (Hls.isSupported()) {
    const hls = new Hls();
    art.hls = hls;
    hls.loadSource(url);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal || art.hls !== hls) return;

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        art.notice.show = 'HLS 网络异常，正在重连';
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        art.notice.show = 'HLS 媒体异常，正在恢复';
        hls.recoverMediaError();
      } else {
        art.notice.show = 'HLS 播放失败';
        hls.destroy();
        art.hls = null;
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else {
    art.notice.show = '当前浏览器不支持 HLS 播放';
  }
}

function createSourceControl(sources, initialSource) {
  if (sources.length < 2) return [];

  return [
    {
      name: 'stream-source',
      position: 'right',
      html: initialSource.label,
      tooltip: '切换播放协议',
      selector: sources.map((source) => ({
        ...source,
        html: source.label,
        default: source.type === initialSource.type,
      })),
      onSelect: async function (source) {
        if (this.type !== source.type || this.option.url !== source.url) {
          this.type = source.type;
          await this.switchUrl(source.url);
        }

        return source.html;
      },
    },
  ];
}

export default function Player({ sources, className, ...rest }) {
  const containerRef = useRef(null);
  const autoplayAlertShownRef = useRef(false);

  useEffect(() => {
    const initialSource =
      sources.find((source) => source.type === 'm3u8') ?? sources[0];

    const art = new Artplayer(
      {
        container: containerRef.current,
        url: initialSource?.url ?? '',
        type: initialSource?.type ?? '',
        isLive: true,
        autoplay: false,
        muted: false,
        pip: true,
        screenshot: true,
        setting: true,
        flip: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        mutex: true,
        backdrop: true,
        playsInline: true,
        airplay: true,
        theme: '#23ade5',
        lang: 'zh-cn',
        controls: createSourceControl(sources, initialSource),
        moreVideoAttr: {
          crossOrigin: 'anonymous',
        },
        customType: {
          flv: playFlv,
          m3u8: playHls,
        },
      },
      (player) => {
        if (!initialSource) {
          player.notice.show = '请配置 VITE_FLV_URL 或 VITE_HLS_URL';
          return;
        }

        player.muted = false;
        player.play().catch((error) => {
          if (
            error?.name !== 'NotAllowedError' ||
            autoplayAlertShownRef.current
          ) {
            return;
          }

          autoplayAlertShownRef.current = true;
          player.notice.show = '请点击播放器开始播放';
          window.alert('浏览器阻止了有声自动播放，请点击播放器开始播放。');
        });
      },
    );

    return () => {
      destroyPlayback(art, art.video);
      art.destroy();
    };
  }, [sources]);

  return <div ref={containerRef} className={className} {...rest} />;
}
