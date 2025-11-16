'use client';

import React from 'react';

interface Screen {
  id: number;
  name: string;
  route: string;
  description: string;
  components: string[];
  wireframe?: string;
}

interface ComponentDef {
  name: string;
  description: string;
  props: string[];
  tailwindJSX: string;
}

interface UIGeneratorPreviewProps {
  screens: Screen[];
  componentDefs: ComponentDef[];
  colorPalette?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  onCopyComponent?: (component: ComponentDef) => void;
}

export default function UIGeneratorPreview({
  screens,
  componentDefs,
  colorPalette,
  onCopyComponent,
}: UIGeneratorPreviewProps) {
  const [selectedComponent, setSelectedComponent] = React.useState<ComponentDef | null>(null);
  const [copiedComponent, setCopiedComponent] = React.useState<string | null>(null);

  const handleCopyComponent = (component: ComponentDef) => {
    navigator.clipboard.writeText(component.tailwindJSX);
    setCopiedComponent(component.name);
    setTimeout(() => setCopiedComponent(null), 2000);
    if (onCopyComponent) {
      onCopyComponent(component);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">UI Preview</h3>
        {colorPalette && (
          <div className="flex gap-2">
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-200"
              style={{ backgroundColor: colorPalette.primary }}
              title={`Primary: ${colorPalette.primary}`}
            />
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-200"
              style={{ backgroundColor: colorPalette.secondary }}
              title={`Secondary: ${colorPalette.secondary}`}
            />
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-200"
              style={{ backgroundColor: colorPalette.accent }}
              title={`Accent: ${colorPalette.accent}`}
            />
          </div>
        )}
      </div>

      {/* Screens Section */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Screens</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {screens.map((screen) => (
            <div key={screen.id} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-900">{screen.name}</h5>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{screen.route}</code>
              </div>
              <p className="text-sm text-gray-600 mb-3">{screen.description}</p>
              <div className="flex flex-wrap gap-1">
                {screen.components.map((comp, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded cursor-pointer hover:bg-purple-200"
                    onClick={() => {
                      const componentDef = componentDefs.find(c => c.name === comp);
                      if (componentDef) setSelectedComponent(componentDef);
                    }}
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Components Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Components Library</h4>
        <div className="space-y-4">
          {componentDefs.map((component, index) => (
            <div 
              key={index} 
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer"
              onClick={() => setSelectedComponent(component)}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">{component.name}</h5>
                  <p className="text-sm text-gray-600 mb-2">{component.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {component.props.map((prop, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {prop}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyComponent(component);
                  }}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    copiedComponent === component.name
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {copiedComponent === component.name ? '✓ Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Component Detail Modal */}
      {selectedComponent && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedComponent(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedComponent.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedComponent.description}</p>
                </div>
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Props:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedComponent.props.map((prop, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {prop}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Code:</h4>
                  <button
                    onClick={() => handleCopyComponent(selectedComponent)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      copiedComponent === selectedComponent.name
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {copiedComponent === selectedComponent.name ? '✓ Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{selectedComponent.tailwindJSX}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
