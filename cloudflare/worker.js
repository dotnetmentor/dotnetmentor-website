/**
 * Cloudflare Worker for Dotnet Mentor agent readiness.
 *
 * Deploy in front of GitHub Pages to add:
 * - Link response headers on the homepage (RFC 8288)
 * - Accept: text/markdown content negotiation
 *
 * Route: dotnetmentor.se/*
 * Origin: dotnetmentor.github.io (or your GitHub Pages origin)
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const originUrl = new URL(url.pathname + url.search, env.ORIGIN || 'https://dotnetmentor.se');

    const accept = request.headers.get('Accept') || '';
    const wantsMarkdown = accept.includes('text/markdown');

    if (wantsMarkdown) {
      const markdownPath = resolveMarkdownPath(url.pathname);
      if (markdownPath) {
        const mdUrl = new URL(markdownPath, env.ORIGIN || 'https://dotnetmentor.se');
        const mdResponse = await fetch(mdUrl.toString(), {
          headers: { 'Accept': 'text/markdown, text/plain, */*' }
        });

        if (mdResponse.ok) {
          const body = await mdResponse.text();
          const tokenCount = estimateTokens(body);
          const headers = new Headers({
            'Content-Type': 'text/markdown; charset=utf-8',
            'Vary': 'Accept',
            'Cache-Control': 'public, max-age=3600'
          });

          if (tokenCount !== null) {
            headers.set('x-markdown-tokens', String(tokenCount));
          }

          return new Response(body, { status: 200, headers });
        }
      }
    }

    const response = await fetch(originUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow'
    });

    if (url.pathname === '/' || url.pathname === '') {
      const headers = new Headers(response.headers);
      headers.set('Link', [
        '</.well-known/agent-skills/index.json>; rel="describedby"',
        '</content/index.md>; rel="alternate"; type="text/markdown"',
        '</content/services.md>; rel="service-doc"; type="text/markdown"',
        '</llms.txt>; rel="service-desc"'
      ].join(', '));
      headers.set('Vary', 'Accept');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    return response;
  }
};

function resolveMarkdownPath(pathname) {
  const map = {
    '/': '/content/index.md',
    '/services': '/content/services.md',
    '/about': '/content/about.md',
    '/contact': '/content/contact.md'
  };

  const normalized = pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  return map[normalized] || map[pathname] || null;
}

function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}
