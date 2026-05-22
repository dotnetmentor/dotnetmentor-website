/**
 * Cloudflare Worker for Dotnet Mentor agent readiness.
 *
 * Deploy in front of GitHub Pages to add:
 * - Link response headers on the homepage (RFC 8288)
 * - Accept: text/markdown content negotiation
 *
 * Route: dotnetmentor.se/*
 * Set ORIGIN to your GitHub Pages origin (e.g. https://dotnetmentor.github.io).
 */
import discovery from './agent-discovery.json';

const DEFAULT_ORIGIN = 'https://dotnetmentor.github.io';

const MARKDOWN_PAGES = {
  '/': '/content/index.md',
  '/services': '/content/services.md',
  '/about': '/content/about.md',
  '/contact': '/content/contact.md'
};

function buildLinkHeader() {
  return discovery.linkHeader;
}

function resolveMarkdownPath(pathname) {
  const normalized = pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  return MARKDOWN_PAGES[normalized] || null;
}

function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export default {
  async fetch(request, env) {
    const origin = env.ORIGIN || DEFAULT_ORIGIN;
    const url = new URL(request.url);
    const originUrl = new URL(url.pathname + url.search, origin);

    const accept = request.headers.get('Accept') || '';
    const wantsMarkdown = accept.includes('text/markdown');

    if (wantsMarkdown) {
      const markdownPath = resolveMarkdownPath(url.pathname);
      if (markdownPath) {
        const mdUrl = new URL(markdownPath, origin);
        const mdResponse = await fetch(mdUrl.toString(), {
          headers: { Accept: 'text/markdown, text/plain, */*' }
        });

        if (mdResponse.ok) {
          const body = await mdResponse.text();
          const tokenCount = estimateTokens(body);
          const headers = new Headers({
            'Content-Type': 'text/markdown; charset=utf-8',
            Vary: 'Accept',
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
      headers.set('Link', buildLinkHeader());
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
