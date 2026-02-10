'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';

interface LivePreviewProps {
  project: Project;
  previewUrl: string;
  onBuild: () => void;
  isBuilding: boolean;
}

export default function LivePreview({ project, previewUrl, onBuild, isBuilding }: LivePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPreviewDimensions = () => {
    switch (previewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    if (previewUrl) {
      // Force iframe reload
      const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
      }
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const handleCopyUrl = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
      // Show toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = 'URL copied to clipboard!';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
          
          {/* Device Preview Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                previewMode === 'desktop'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                previewMode === 'tablet'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tablet
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                previewMode === 'mobile'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mobile
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading || isBuilding}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            title="Refresh Preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {previewUrl && (
            <>
              <button
                onClick={handleOpenInNewTab}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Open in New Tab"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              
              <button
                onClick={handleCopyUrl}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Copy URL"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-gray-100">
        {!previewUrl ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Preview Available</h3>
            <p className="text-gray-600 mb-4">Build your project to see the live preview</p>
            <button
              onClick={onBuild}
              disabled={isBuilding}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {isBuilding ? 'Building...' : 'Build Project'}
            </button>
          </div>
        ) : (
          <div 
            className="bg-white shadow-lg rounded-lg overflow-hidden"
            style={getPreviewDimensions()}
          >
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <span className="text-gray-600">Loading preview...</span>
                </div>
              </div>
            )}
            
            {error ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-900 mb-2">Preview Error</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <iframe
                id="preview-frame"
                src={previewUrl}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError('Failed to load preview');
                  setIsLoading(false);
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Build Progress */}
      {isBuilding && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Building your project...</div>
              <div className="text-xs text-gray-600">This may take a few moments</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
