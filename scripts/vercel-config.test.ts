// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  headersForAllPaths,
  parseContentSecurityPolicy,
  readVercelConfig,
} from './vercel-config.ts';

const config = readVercelConfig();
const headers = headersForAllPaths(config);
const csp = parseContentSecurityPolicy(headers['Content-Security-Policy'] ?? '');

describe('vercel.json security headers (docs/ARCHITECTURE.md §9)', () => {
  it('only allows the app itself to run scripts, styles and workers', () => {
    expect(csp.get('default-src')).toEqual(["'self'"]);
    expect(csp.get('script-src')).toEqual(["'self'"]);
    expect(csp.get('style-src')).toEqual(["'self'"]);
    expect(csp.get('worker-src')).toEqual(["'self'"]);
    expect(csp.get('manifest-src')).toEqual(["'self'"]);
  });

  it('never allows inline or evaluated code', () => {
    const everySource = [...csp.values()].flat();
    expect(everySource).not.toContain("'unsafe-inline'");
    expect(everySource).not.toContain("'unsafe-eval'");
    expect(everySource).not.toContain('*');
  });

  it('limits network access to the app (Supabase is added in phase 2)', () => {
    expect(csp.get('connect-src')).toEqual(["'self'"]);
  });

  it('forbids plugins, framing and base changes', () => {
    expect(csp.get('object-src')).toEqual(["'none'"]);
    expect(csp.get('frame-ancestors')).toEqual(["'none'"]);
    expect(csp.get('base-uri')).toEqual(["'self'"]);
    expect(csp.get('form-action')).toEqual(["'self'"]);
    expect(headers['X-Frame-Options']).toBe('DENY');
  });

  it('allows the microphone for the app only, and nothing else sensitive', () => {
    const permissions = headers['Permissions-Policy'] ?? '';
    expect(permissions).toContain('microphone=(self)');
    expect(permissions).toContain('camera=()');
    expect(permissions).toContain('geolocation=()');
  });

  it('sends no referrer and no MIME sniffing', () => {
    expect(headers['Referrer-Policy']).toBe('no-referrer');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Strict-Transport-Security']).toMatch(/^max-age=\d+/);
  });

  it('serves the app for in-app addresses, but never for a missing asset', () => {
    const [rewrite] = config.rewrites;
    expect(rewrite?.destination).toBe('/index.html');
    const source = new RegExp(`^${(rewrite?.source ?? '').replace('/(', '/(?:')}$`);
    expect(source.test('/reglages')).toBe(true);
    expect(source.test('/')).toBe(true);
    expect(source.test('/assets/index-abc123.js')).toBe(false);
  });

  it('never lets the service worker be cached, and caches hashed assets for good', () => {
    const cacheControl = (path: string) =>
      config.headers
        .find((rule) => rule.source === path)
        ?.headers.find((header) => header.key === 'Cache-Control')?.value;
    expect(cacheControl('/sw.js')).toBe('public, max-age=0, must-revalidate');
    expect(cacheControl('/assets/(.*)')).toContain('immutable');
  });
});

describe('parseContentSecurityPolicy', () => {
  it('splits directives and sources', () => {
    expect(parseContentSecurityPolicy("default-src 'self'; img-src 'self' data: ;")).toEqual(
      new Map([
        ['default-src', ["'self'"]],
        ['img-src', ["'self'", 'data:']],
      ]),
    );
  });
});
