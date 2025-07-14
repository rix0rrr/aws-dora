import React from 'react';
import { renderToString } from 'react-dom/server';

// Helper function to render JSX
export function renderJSX(component: React.ReactElement): string;
export function renderJSX(component: React.ComponentType<any>, props?: any): string;
export function renderJSX(component: React.ComponentType<any> | React.ReactElement, props: any = {}): string {
  if (React.isValidElement(component)) {
    // If component is already a React element, just render it
    return renderToString(component);
  }

  return renderToString(React.createElement(component, props));
}
