import React from 'react';

interface FilterBarProps {
  searchTerm?: string;
}

export function FilterBar({ searchTerm = '' }: FilterBarProps): React.ReactElement {
  return <div>
    <input type="text"
      placeholder="Search services and operations..."
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      defaultValue={searchTerm}
      hx-post="/tree/filter"
      hx-target="#services-tree"
      hx-trigger='keyup changed delay:300ms'
      hx-include='this'
      name='search'
    ></input>
  </div>;
}