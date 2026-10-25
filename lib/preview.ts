
import type { ProjectSession } from '@/lib/types';

export interface PreviewDocument {
  html: string;
  revoke: () => void;
}

function normalizePath(path: string): string {
  const parts: string[] = [];

  for (const part of path.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;

    if (part === '..') {
      parts.pop();
      continue;
    }

    parts.push(part);
  }

  return parts.join('/');
}

function resolveProjectPath(
  reference: string,
  sourceFile: string,
): string | null {
  const value = reference.trim();

  if (
    !value ||
    value.startsWith('#') ||
    value.startsWith('//') ||
    /^(?:[a-z][a-z\d+.-]*:)/i.test(value) ||
    value.startsWith('data:')
  ) {
    return null;
  }

  const cleanReference = value.split(/[?#]/, 1)[0];

  if (!cleanReference) return null;

  const base = cleanReference.startsWith('/')
    ? ''
    : sourceFile.includes('/')
      ? sourceFile.slice(0, sourceFile.lastIndexOf('/') + 1)
      : '';

  return normalizePath(`${base}${cleanReference}`);
}

function asBlob(
  content: string | Uint8Array,
  mimeType: string,
): Blob {
  if (typeof content === 'string') {
    return new Blob([content], { type: mimeType });
  }

  return new Blob([new Uint8Array(content)], { type: mimeType });
}

/**
 * Build a browser preview for a static HTML/CSS/JS project.
 *
 * Call this in the browser, not during server-side rendering.
 * Revoke the returned document's URLs when the preview is replaced
 * or the component using it is unmounted.
 */
export function createPreviewDocument(
  project: ProjectSession,
): PreviewDocument {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    throw new Error('Preview documents can only be created in the browser.');
  }

  const entryPath = project.entryHtml;
  const entryFile = project.files[entryPath];

  if (!entryFile || typeof entryFile.content !== 'string') {
    throw new Error('The project HTML entry file could not be read.');
  }

  const objectUrls: string[] = [];
  const resourceUrls = new Map<string, string>();
  const files = Object.values(project.files);

  function getResourceUrl(path: string): string | null {
    const normalized = normalizePath(path);
    const file = project.files[normalized];

    if (!file || file.kind !== 'file') return null;

    const existingUrl = resourceUrls.get(normalized);

    if (existingUrl) return existingUrl;

    const url = URL.createObjectURL(
      asBlob(file.content, file.mimeType),
    );

    objectUrls.push(url);
    resourceUrls.set(normalized, url);

    return url;
  }

  function resolveUrl(
    reference: string,
    sourcePath: string,
  ): string {
    const path = resolveProjectPath(reference, sourcePath);

    if (!path) return reference;

    return getResourceUrl(path) ?? reference;
  }

  function rewriteCss(
    css: string,
    cssPath: string,
  ): string {
    return css.replace(
      /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi,
      (match, doubleQuoted, singleQuoted, unquoted) => {
        const reference = String(
          doubleQuoted ?? singleQuoted ?? unquoted ?? '',
        ).trim();

        const rewritten = resolveUrl(reference, cssPath);

        if (rewritten === reference) return match;

        return `url("${rewritten.replace(/"/g, '\\"')}")`;
      },
    );
  }

  try {
    // Prepare CSS resources before rewriting HTML references.
    for (const file of files) {
      if (
        file.kind === 'file' &&
        /\.css$/i.test(file.path) &&
        typeof file.content === 'string'
      ) {
        const rewrittenCss = rewriteCss(file.content, file.path);

        const url = URL.createObjectURL(
          new Blob([rewrittenCss], {
            type: 'text/css;charset=utf-8',
          }),
        );

        objectUrls.push(url);
        resourceUrls.set(file.path, url);
      }
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(
      entryFile.content,
      'text/html',
    );

    // Resolve local HTML attributes such as image sources and links.
    const resourceAttributes = [
      ['img', 'src'],
      ['script', 'src'],
      ['source', 'src'],
      ['video', 'src'],
      ['video', 'poster'],
      ['audio', 'src'],
      ['track', 'src'],
      ['input', 'src'],
      ['embed', 'src'],
      ['object', 'data'],
      ['iframe', 'src'],
    ] as const;

    for (const [selector, attribute] of resourceAttributes) {
      for (const element of document.querySelectorAll(selector)) {
        const reference = element.getAttribute(attribute);

        if (reference) {
          element.setAttribute(
            attribute,
            resolveUrl(reference, entryPath),
          );
        }
      }
    }

    for (const element of document.querySelectorAll('[srcset]')) {
      const srcset = element.getAttribute('srcset');

      if (!srcset) continue;

      const rewritten = srcset
        .split(',')
        .map((candidate) => {
          const parts = candidate.trim().split(/\s+/);
          const reference = parts.shift();

          if (!reference) return candidate;

          const resolved = resolveUrl(reference, entryPath);

          return [resolved, ...parts].join(' ');
        })
        .join(', ');

      element.setAttribute('srcset', rewritten);
    }

    // Rewrite stylesheet and other link references.
    for (const element of document.querySelectorAll('link[href]')) {
      const href = element.getAttribute('href');

      if (href) {
        element.setAttribute('href', resolveUrl(href, entryPath));
      }
    }

    // Rewrite local CSS inside style elements and style attributes.
    for (const style of document.querySelectorAll('style')) {
      style.textContent = rewriteCss(
        style.textContent ?? '',
        entryPath,
      );
    }

    for (const element of document.querySelectorAll('[style]')) {
      const style = element.getAttribute('style');

      if (style) {
        element.setAttribute(
          'style',
          rewriteCss(style, entryPath),
        );
      }
    }

    // Give relative resources a predictable project-root base.
    // Local references have already been rewritten where supported.
    const base = document.createElement('base');
    base.href = window.location.origin + '/';
    document.head.prepend(base);

    return {
      html: '<!DOCTYPE html>\n' + document.documentElement.outerHTML,
      revoke: () => {
        for (const url of objectUrls) {
          URL.revokeObjectURL(url);
        }

        objectUrls.length = 0;
      },
    };
  } catch (error) {
    for (const url of objectUrls) {
      URL.revokeObjectURL(url);
    }

    throw error;
  }
}
