// Simple JSX implementation for server-side rendering
// Replaces React with a minimal JSX-to-HTML renderer

export interface JSXElement {
  type: string | Function;
  props: Record<string, any>;
  children: any[];
}

// JSX factory function
export function jsx(
  type: string | Function,
  props: Record<string, any> | null = null,
  ...children: any[]
): JSXElement {
  return {
    type,
    props: props || {},
    children: children.flat()
  };
}

// Fragment support
export const Fragment = Symbol('Fragment');

// Render JSX element to HTML string
export function renderToString(element: any): string {
  if (element === null || element === undefined) {
    return '';
  }

  if (typeof element === 'string' || typeof element === 'number') {
    return escapeHtml(String(element));
  }

  if (Array.isArray(element)) {
    return element.map(renderToString).join('');
  }

  if (typeof element === 'object' && element.type) {
    const { type, props, children } = element;

    // Handle Fragment
    if (type === Fragment) {
      return children.map(renderToString).join('');
    }

    // Handle function components
    if (typeof type === 'function') {
      const componentProps = { ...props };
      if (children.length > 0) {
        componentProps.children = children.length === 1 ? children[0] : children;
      }
      return renderToString(type(componentProps));
    }

    // Handle HTML elements
    if (typeof type === 'string') {
      return renderHtmlElement(type, props, children);
    }
  }

  return '';
}

// Render HTML element
function renderHtmlElement(tag: string, props: Record<string, any>, children: any[]): string {
  // Handle dangerouslySetInnerHTML
  if (props.dangerouslySetInnerHTML && props.dangerouslySetInnerHTML.__html) {
    const attributes = renderAttributes({ ...props, dangerouslySetInnerHTML: undefined });
    return `<${tag}${attributes}>${props.dangerouslySetInnerHTML.__html}</${tag}>`;
  }

  const attributes = renderAttributes(props);
  const childrenHtml = children.map(renderToString).join('');

  // Self-closing tags
  const selfClosingTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  if (selfClosingTags.has(tag)) {
    return `<${tag}${attributes} />`;
  }

  return `<${tag}${attributes}>${childrenHtml}</${tag}>`;
}

// Render HTML attributes
function renderAttributes(props: Record<string, any>): string {
  const attributes: string[] = [];

  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) {
      continue;
    }

    // Handle special props
    if (key === 'children' || key === 'dangerouslySetInnerHTML') {
      continue;
    }

    if (key === 'className') {
      attributes.push(`class="${escapeHtml(String(value))}"`);
      continue;
    }

    if (key === 'htmlFor') {
      attributes.push(`for="${escapeHtml(String(value))}"`);
      continue;
    }

    if (key === 'charSet') {
      attributes.push(`charset="${escapeHtml(String(value))}"`);
      continue;
    }

    // Handle boolean attributes
    if (value === true) {
      attributes.push(key);
      continue;
    }

    // Handle data and aria attributes
    if (key.startsWith('data-') || key.startsWith('aria-')) {
      attributes.push(`${key}="${escapeHtml(String(value))}"`);
      continue;
    }

    // Handle HTMX attributes
    if (key.startsWith('hx-')) {
      attributes.push(`${key}="${escapeHtml(String(value))}"`);
      continue;
    }

    // Handle standard attributes
    const attrName = key.toLowerCase();
    attributes.push(`${attrName}="${escapeHtml(String(value))}"`);
  }

  return attributes.length > 0 ? ' ' + attributes.join(' ') : '';
}

// Escape HTML special characters
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
  };

  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match] || match);
}
