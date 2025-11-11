// Minimal HTML sanitizer for rendering rich text safely in the browser
// Notes:
// - Removes script/style/iframe/object/embed/link/meta tags entirely
// - Strips inline event handlers (on*) and javascript: URLs
// - Returns a safe HTML string suitable for dangerouslySetInnerHTML
// For stronger security, consider swapping to DOMPurify; this util keeps zero deps.

export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const blockedTags = ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'];
    blockedTags.forEach((tag) => {
      doc.querySelectorAll(tag).forEach((el) => el.remove());
    });

    // Remove event handlers and dangerous URLs
    doc.querySelectorAll('*').forEach((el) => {
      // Copy because NamedNodeMap is live
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = (attr.value || '').trim();

        // Remove on* handlers, e.g., onclick
        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          return;
        }

        // Remove javascript: from URLs
        if (['src', 'href', 'xlink:href'].includes(name) && /^javascript:/i.test(value)) {
          el.removeAttribute(attr.name);
          return;
        }
      });
    });

    return doc.body.innerHTML || '';
  } catch (e) {
    // Fallback to basic escaping prevention: if parsing fails, return empty
    return '';
  }
}

export default sanitizeHtml;
