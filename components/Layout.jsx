const React = require('react');

function Layout({ children, title = 'AWS API Explorer' }) {
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
      
      // Custom styles
      React.createElement('style', { key: 'custom-styles' }, `
        .required-field { border-left: 4px solid #ef4444; }
        .optional-field { border-left: 4px solid #10b981; }
        .tree-item { cursor: pointer; }
        .tree-item:hover { background-color: #f3f4f6; }
      `)
    ]),
    
    React.createElement('body', { key: 'body', className: 'bg-gray-50 min-h-screen' }, [
      React.createElement('div', { 
        key: 'container',
        className: 'flex h-screen'
      }, [
        // Sidebar
        React.createElement('div', {
          key: 'sidebar',
          className: 'w-1/3 bg-white border-r border-gray-200 flex flex-col'
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
              id: 'filter-section'
            }, 'Filter will go here')
          ]),
          React.createElement('div', {
            key: 'tree-container',
            className: 'flex-1 overflow-y-auto p-4',
            id: 'services-tree'
          }, 'Services tree will go here')
        ]),
        
        // Main content
        React.createElement('div', {
          key: 'main',
          className: 'flex-1 flex flex-col'
        }, [
          // Request section
          React.createElement('div', {
            key: 'request-section',
            className: 'flex-1 p-4 border-b border-gray-200'
          }, [
            React.createElement('div', {
              key: 'credentials',
              id: 'credentials-section',
              className: 'mb-4'
            }, 'Credentials selector will go here'),
            React.createElement('div', {
              key: 'request-form',
              id: 'request-form',
              className: 'h-full'
            }, 'Request form will go here')
          ]),
          
          // Response/Log section
          React.createElement('div', {
            key: 'response-section',
            className: 'h-1/3 p-4 bg-gray-50',
            id: 'response-log'
          }, 'Response log will go here')
        ])
      ]),
      
      // Initialize Prism highlighting after HTMX updates
      React.createElement('script', { key: 'init-script' }, `
        document.addEventListener('htmx:afterSwap', function() {
          if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
          }
        });
        
        // Initial highlighting
        document.addEventListener('DOMContentLoaded', function() {
          if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
          }
        });
      `)
    ])
  ]);
}

module.exports = Layout;
