import sanitizeHtml from 'sanitize-html';

// Decode residual HTML entities that sanitize-html re-encodes in text output.
// sanitize-html uses htmlparser2 (which decodes entities) then re-encodes
// & < > " — so we decode once to get back the actual characters.
function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#0*39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

/**
 * Convert CMS HTML to plain text.
 * Use for titles, card titles, and excerpts that must not render HTML.
 * Returns a decoded string safe for normal Astro {interpolation}.
 * Do NOT pass the result to set:html.
 */
export function toPlainText(html = '') {
  if (!html) return '';
  const stripped = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  return decodeEntities(stripped).replace(/\s+/g, ' ').trim();
}

function isAllowedHref(href) {
  if (!href) return false;
  if ((href.startsWith('/') && !href.startsWith('//')) || href.startsWith('#')) return true;
  try {
    const { protocol } = new URL(href);
    return protocol === 'https:' || protocol === 'http:' || protocol === 'mailto:';
  } catch {
    return false;
  }
}

function isAllowedSrc(src) {
  if (!src) return false;
  if (src.startsWith('/') && !src.startsWith('//')) return true; // root-relative proxy URLs
  try {
    const { protocol } = new URL(src);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Allowlist-sanitize CMS rich HTML for safe set:html use.
 * Call AFTER rewriteContentImages so proxy URLs are already in place.
 * Removes script/style/iframe/object/embed/form and all on* handlers.
 * Rejects javascript: and data: URLs.
 * Adds rel="noopener noreferrer" to target="_blank" links.
 */
export function sanitizeRichHtml(html = '') {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'figure', 'figcaption',
      'strong', 'b', 'em', 'i',
      'blockquote', 'br', 'hr',
      'code', 'pre',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      figure: ['class'],
      figcaption: ['class'],
    },
    allowedClasses: {
      figure: ['alignleft', 'alignright', 'aligncenter', 'alignwide', 'alignfull', 'wp-block-image'],
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowedSchemesByTag: {},
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    transformTags: {
      a(tagName, attribs) {
        const href = (attribs.href ?? '').trim();
        if (/^javascript:/i.test(href) || /^data:/i.test(href)) {
          return { tagName: 'span', attribs: {} };
        }
        if (!isAllowedHref(href)) {
          return { tagName: 'span', attribs: {} };
        }
        const out = { ...attribs };
        if (out.target === '_blank') {
          out.rel = 'noopener noreferrer';
        }
        return { tagName, attribs: out };
      },
      img(tagName, attribs) {
        const src = (attribs.src ?? '').trim();
        // Block data: and javascript: and any non-http/https/root-relative URLs
        if (/^javascript:/i.test(src) || /^data:/i.test(src)) {
          return false;
        }
        if (!isAllowedSrc(src)) {
          return false;
        }
        return { tagName, attribs };
      },
    },
  });
}
