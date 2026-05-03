const STREAM_ROUTE = '/api/stream';
const PLAYLIST_CONTENT_TYPES = [
  'application/vnd.apple.mpegurl',
  'application/x-mpegurl',
  'audio/mpegurl',
  'audio/x-mpegurl',
];

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: {
        ...corsHeaders(),
        allow: 'GET, HEAD, OPTIONS',
      },
    });
  }

  const originUrl = env.HLS_ORIGIN_URL || env.VITE_HLS_URL;
  if (!originUrl) {
    return new Response('HLS_ORIGIN_URL is not configured', {
      status: 500,
      headers: corsHeaders(),
    });
  }

  let upstreamUrl;
  try {
    upstreamUrl = resolveUpstreamUrl(request, originUrl, env);
  } catch (error) {
    return new Response(error.message, {
      status: 400,
      headers: corsHeaders(),
    });
  }

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers: upstreamRequestHeaders(request),
  });

  const headers = responseHeaders(upstreamResponse.headers);
  if (request.method === 'HEAD') {
    return new Response(null, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  }

  if (isPlaylist(upstreamUrl, upstreamResponse.headers)) {
    const playlist = await upstreamResponse.text();
    const rewritten = rewritePlaylist(playlist, upstreamUrl, new URL(request.url));

    headers.set('content-type', 'application/vnd.apple.mpegurl; charset=utf-8');
    headers.delete('content-length');
    if (!headers.has('cache-control')) {
      headers.set('cache-control', 'no-cache');
    }

    return new Response(rewritten, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });
}

function resolveUpstreamUrl(request, originUrl, env) {
  const requestUrl = new URL(request.url);
  const origin = new URL(originUrl);
  const proxiedUrl = requestUrl.searchParams.get('url');

  if (proxiedUrl) {
    const target = new URL(proxiedUrl);
    assertAllowedTarget(target, origin, env);
    return target.toString();
  }

  const routePath = requestUrl.pathname.slice(STREAM_ROUTE.length).replace(/^\/+/, '');
  const target = routePath ? new URL(routePath, origin) : origin;
  assertAllowedTarget(target, origin, env);
  return target.toString();
}

function assertAllowedTarget(target, origin, env) {
  const allowedHosts = (env.HLS_ALLOWED_HOSTS || origin.hostname)
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedHosts.includes(target.hostname.toLowerCase())) {
    throw new Error(`Host is not allowed: ${target.hostname}`);
  }
}

function upstreamRequestHeaders(request) {
  const headers = new Headers();
  const passthrough = ['accept', 'if-modified-since', 'if-none-match', 'range'];

  for (const name of passthrough) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  return headers;
}

function responseHeaders(upstreamHeaders) {
  const headers = new Headers(corsHeaders());
  const passthrough = [
    'accept-ranges',
    'cache-control',
    'content-length',
    'content-range',
    'content-type',
    'etag',
    'last-modified',
  ];

  for (const name of passthrough) {
    const value = upstreamHeaders.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  return headers;
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, HEAD, OPTIONS',
    'access-control-allow-headers': 'range, if-none-match, if-modified-since',
    'access-control-expose-headers': 'content-length, content-range, accept-ranges',
  };
}

function isPlaylist(url, headers) {
  const contentType = (headers.get('content-type') || '').toLowerCase();
  if (PLAYLIST_CONTENT_TYPES.some((type) => contentType.includes(type))) {
    return true;
  }

  return new URL(url).pathname.toLowerCase().endsWith('.m3u8');
}

function rewritePlaylist(playlist, playlistUrl, requestUrl) {
  return playlist
    .split('\n')
    .map((line) => rewritePlaylistLine(line, playlistUrl, requestUrl))
    .join('\n');
}

function rewritePlaylistLine(line, playlistUrl, requestUrl) {
  const trimmed = line.trim();
  if (!trimmed) {
    return line;
  }

  if (trimmed.startsWith('#')) {
    return rewriteUriAttributes(line, playlistUrl, requestUrl);
  }

  return rewriteUri(line, playlistUrl, requestUrl);
}

function rewriteUriAttributes(line, playlistUrl, requestUrl) {
  return line.replace(/URI=(?:"([^"]+)"|([^,]+))/g, (match, quotedUri, plainUri) => {
    const uri = quotedUri || plainUri;
    const rewritten = rewriteUri(uri, playlistUrl, requestUrl);
    return quotedUri ? `URI="${rewritten}"` : `URI=${rewritten}`;
  });
}

function rewriteUri(uri, playlistUrl, requestUrl) {
  if (/^(data|blob):/i.test(uri)) {
    return uri;
  }

  const target = new URL(uri, playlistUrl);
  const proxyUrl = new URL(requestUrl.origin);
  proxyUrl.pathname = STREAM_ROUTE;
  proxyUrl.searchParams.set('url', target.toString());

  return `${proxyUrl.pathname}${proxyUrl.search}`;
}
