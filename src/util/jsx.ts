import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Helper function to render JSX
export function renderJSX(component: React.ReactElement): string;
export function renderJSX(component: React.ComponentType<any>, props?: any): string;
export function renderJSX(component: React.ComponentType<any> | React.ReactElement, props: any = {}): string {
  if (React.isValidElement(component)) {
    // If component is already a React element, just render it
    return renderToStaticMarkup(component);
  }

  return renderToStaticMarkup(React.createElement(component, props));
}
