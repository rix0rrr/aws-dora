const React = require('react');

function ServicesTree({ services, expandedServices = [] }) {
  return React.createElement('div', { className: 'space-y-2' }, 
    Object.keys(services).map(category => 
      React.createElement('div', { key: category, className: 'mb-4' }, [
        // Category header
        React.createElement('h3', {
          key: 'header',
          className: 'text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2'
        }, category),
        
        // Services in category
        React.createElement('div', { key: 'services', className: 'ml-2 space-y-1' },
          Object.keys(services[category]).map(service => {
            const isExpanded = expandedServices.includes(service);
            return React.createElement('div', { key: service }, [
              // Service name (clickable to expand)
              React.createElement('div', {
                key: 'service-header',
                className: 'tree-item p-2 rounded cursor-pointer flex items-center justify-between hover:bg-gray-100',
                'hx-get': `/services/${service}`,
                'hx-target': `#service-${service}-operations`,
                'hx-swap': 'innerHTML',
                'hx-indicator': `#loading-${service}`
              }, [
                React.createElement('span', {
                  key: 'name',
                  className: 'font-medium text-gray-800'
                }, service),
                React.createElement('div', {
                  key: 'icons',
                  className: 'flex items-center'
                }, [
                  React.createElement('span', {
                    key: 'loading',
                    id: `loading-${service}`,
                    className: 'htmx-indicator text-blue-500 mr-2'
                  }, '⟳'),
                  React.createElement('span', {
                    key: 'icon',
                    className: `text-gray-400 ${isExpanded ? 'rotate-90' : ''}`
                  }, '▶')
                ])
              ]),
              
              // Operations container (populated by HTMX)
              React.createElement('div', {
                key: 'operations',
                id: `service-${service}-operations`,
                className: 'ml-4 mt-1'
              }, isExpanded ? 
                services[category][service].operations.map(operation =>
                  React.createElement('div', {
                    key: operation,
                    className: 'tree-item p-2 text-sm text-gray-600 rounded cursor-pointer hover:bg-blue-50 hover:text-blue-700',
                    'hx-get': `/api-template/${service}/${operation}`,
                    'hx-target': '#request-form',
                    'hx-swap': 'innerHTML'
                  }, operation)
                ) : null
              )
            ]);
          })
        )
      ])
    )
  );
}

function FilterBar({ searchTerm = '' }) {
  return React.createElement('div', { className: 'mb-4' }, [
    React.createElement('input', {
      key: 'search',
      type: 'text',
      placeholder: 'Search services and operations...',
      className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
      value: searchTerm,
      'hx-get': '/services/filter',
      'hx-target': '#services-tree',
      'hx-trigger': 'keyup changed delay:300ms',
      'hx-include': 'this',
      name: 'search'
    })
  ]);
}

module.exports = { ServicesTree, FilterBar };
