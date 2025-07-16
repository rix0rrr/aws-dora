import React from 'react';
import { ServicesTree } from './ServicesTree';
import { AWSServiceList } from '../types/model';
import { AwsServiceModelView } from '../services/aws-service-model-view';
import { FilterBar } from './FilterBar';

interface ExtendedLayoutProps {
  serviceModel: AwsServiceModelView;
  title?: string;
  filterContent?: string;
  requestForm: React.ReactElement;
  responseBox: React.ReactElement;
  credentialsContent: React.ReactElement;
  requestLog: React.ReactElement;
}

function Layout({
  serviceModel,
  title = 'AWS API Explorer',
  requestForm,
  responseBox,
  credentialsContent,
  requestLog,
}: ExtendedLayoutProps): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>

        {/* HTMX */}
        <script src="https://unpkg.com/htmx.org@1.9.10"></script>

        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>

        {/* Font awesome */}
        <link rel="stylesheet" href="/fontawesome/css/fontawesome.min.css" />
        <link rel="stylesheet" href="/fontawesome/css/solid.min.css" />

        {/* Prism.js for syntax highlighting */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css"
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>

        {/* Custom JavaScript */}
        <script src="/app.js"></script>

        {/* Custom styles */}
        <style>{`
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
        `}</style>
      </head>
      <body className="bg-gray-50 min-h-screen overscroll-none">
        <div className="h-screen w-screen flex flex-col overflow-hidden">
          {/* Header */}
          <div className="w-screen px-4 py-2 border-b border-gray-200 flex justify-between items-center flex-none">
            <h1 className="text-xl font-bold text-gray-800">AWS API Explorer</h1>
            <div id="credentials-section">{credentialsContent}</div>
          </div>
          <div className="w-screen flex flex-1 overflow-hidden">
            {/* Left sidebar (tree) */}
            <div className="w-full md:w-1/4 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div>
                  <FilterBar searchTerm={serviceModel.currentFilter} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4" id="services-tree">
                <ServicesTree serviceModel={serviceModel} />
              </div>
            </div>

            {/* Divider */}
            <div className='bg-white w-2 size-grip cursor-col-resize grid'>
              <i className="text-gray-400 fa-solid fa-grip-lines-vertical self-center"></i>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col main-content">
              {/* Request section */}
              <div className="flex-1 p-4 border-b border-gray-200">
                <div
                  id="request-form"
                  className="h-full"
                >{requestForm}</div>
              </div>

              {/* Response/Log section */}
              <div
                className="h-1/3 bg-gray-50 p-4"
                id="response"
              >{responseBox}</div>
            </div>

            {/* Divider */}
            <div className='bg-white w-2 size-grip cursor-col-resize grid' data-dir="right">
              <i className="text-gray-400 fa-solid fa-grip-lines-vertical self-center"></i>
            </div>

            {/* Right sidebar (logs) */}
            <div className="w-full md:w-1/4 bg-white border-l border-gray-200 flex flex-col">
              {requestLog}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

export default Layout;
