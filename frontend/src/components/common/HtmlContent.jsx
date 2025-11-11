import React from 'react';
import sanitizeHtml from '../../utils/sanitizeHtml';

// Simple reusable component to render sanitized HTML content
const HtmlContent = ({ html, className, style }) => {
  const safe = sanitizeHtml(html);
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
};

export default HtmlContent;
