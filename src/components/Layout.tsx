import React from 'react';
import { ServicesTree } from './ServicesTree';
import { AWSServiceList } from '../types/model';
import { AwsServiceModelView } from '../services/aws-service-model-view';
import { FilterBar } from './FilterBar';

interface ExtendedLayoutProps {
  serviceModel: AwsServiceModelView;
  title?: string;
  treeContent?: string;
  filterContent?: string;
  requestFormContent?: string;
  credentialsContent?: string;
  loggerContent?: string;
}

function Layout({
  serviceModel,
  title = 'AWS API Explorer',
  treeContent = '',
  requestFormContent = '',
  credentialsContent = '',
  loggerContent = ''
}: ExtendedLayoutProps): React.ReactElement {
  return React.createElement('html', { lang: 'en' }, [
    React.createElement('head', { key: 'head' }, [
      React.createElement('meta', { key: 'charset', charSet: 'UTF-8' }),
      React.createElement('meta', {
        key: 'viewport',
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0'
      }),
      React.createElement('title', { key: 'title' }, title),

      // HTMX
      React.createElement('script', {
        key: 'htmx',
        src: 'https://unpkg.com/htmx.org@1.9.10'
      }),

      // Tailwind CSS
      React.createElement('script', {
        key: 'tailwind',
        src: 'https://cdn.tailwindcss.com'
      }),

      // Font awesome
      React.createElement('link', { rel: 'stylesheet', href: '/fontawesome/css/fontawesome.min.css' }),
      React.createElement('link', { rel: 'stylesheet', href: '/fontawesome/css/solid.min.css' }),

      // Prism.js for syntax highlighting
      React.createElement('link', {
        key: 'prism-css',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css',
        rel: 'stylesheet'
      }),
      React.createElement('script', {
        key: 'prism-core',
        src: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js'
      }),
      React.createElement('script', {
        key: 'prism-json',
        src: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js'
      }),

      // Custom JavaScript
      React.createElement('script', {
        key: 'custom-js',
        src: '/app.js'
      }),

      // Custom styles
      React.createElement('style', { key: 'custom-styles' }, `
        .required-field { border-left: 4px solid #ef4444; }
        .optional-field { border-left: 4px solid #10b981; }
        .tree-item { cursor: pointer; transition: background-color 0.2s; }
        .tree-item:hover { background-color: #f3f4f6; }
        .loading { opacity: 0.6; pointer-events: none; }

        /* Scrollbar styling */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }

        /* HTMX loading indicators */
        .htmx-indicator { opacity: 0; transition: opacity 0.3s; }
        .htmx-request .htmx-indicator { opacity: 1; }
        .htmx-request.htmx-indicator { opacity: 1; }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .flex-container { flex-direction: column; }
          .sidebar { width: 100%; height: 40vh; }
          .main-content { height: 60vh; }
        }
      `)
    ]),

    React.createElement('body', { key: 'body', className: 'bg-gray-50 min-h-screen' }, [
      React.createElement('div', {
        key: 'container',
        className: 'flex h-screen flex-container'
      }, [
        // Sidebar
        React.createElement('div', {
          key: 'sidebar',
          className: 'w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col sidebar'
        }, [
          React.createElement('div', {
            key: 'sidebar-header',
            className: 'p-4 border-b border-gray-200'
          }, [
            React.createElement('h1', {
              key: 'title',
              className: 'text-xl font-bold text-gray-800'
            }, 'AWS API Explorer'),
            React.createElement('div', {
              key: 'filter',
              id: 'filter-section',
            }, FilterBar({ searchTerm: serviceModel.currentFilter })),
          ]),
          React.createElement('div', {
            key: 'tree-container',
            className: 'flex-1 overflow-y-auto p-4',
            id: 'services-tree',
          }, ServicesTree({ serviceModel })),
        ]),

        // Main content
        React.createElement('div', {
          key: 'main',
          className: 'flex-1 flex flex-col main-content'
        }, [
          // Request section
          React.createElement('div', {
            key: 'request-section',
            className: 'flex-1 p-4 border-b border-gray-200'
          }, [
            React.createElement('div', {
              key: 'credentials',
              id: 'credentials-section',
              className: 'mb-4',
              dangerouslySetInnerHTML: { __html: credentialsContent }
            }),
            React.createElement('div', {
              key: 'request-form',
              id: 'request-form',
              className: 'h-full',
              dangerouslySetInnerHTML: { __html: requestFormContent }
            })
          ]),

          // Response/Log section
          React.createElement('div', {
            key: 'response-section',
            className: 'h-1/3 bg-gray-50',
            id: 'response-log',
            dangerouslySetInnerHTML: { __html: loggerContent }
          })
        ])
      ]),
    ])
  ]);
}

export default Layout;
