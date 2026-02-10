'use client';

import { Project } from '@/types/project';

interface ProjectHeaderProps {
  project: Project;
  onBuild: () => void;
  isBuilding: boolean;
  buildProgress: number;
  isPro: boolean;
  onUpgrade: () => void;
}

export default function ProjectHeader({ project, onBuild, isBuilding, buildProgress, isPro, onUpgrade }: ProjectHeaderProps) {
  const handleSave = () => {
    // Save project logic would go here
    console.log('Saving project:', project.id);
  };

  const handleExport = () => {
    // Export project logic would go here
    console.log('Exporting project:', project.id);
  };

  const handleShare = () => {
    // Share project logic would go here
    const shareUrl = `${window.location.origin}/projects/${project.id}`;
    navigator.clipboard.writeText(shareUrl);
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = 'Project URL copied to clipboard!';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Project Info */}
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold text-white">{project.name}</h1>
              <p className="text-sm text-gray-400">{project.description}</p>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                project.status === 'ready' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : project.status === 'building'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
              }`}>
                {project.status === 'ready' ? '🟢 Ready' : 
                 project.status === 'building' ? '🟡 Building' : '⚪ Draft'}
              </span>
              
              {isPro && (
                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/50 rounded-full">
                  ⚡ Pro
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Build Button */}
            <button
              onClick={onBuild}
              disabled={isBuilding || !isPro}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              {isBuilding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Building...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>Build</span>
                </>
              )}
            </button>

            {/* Deploy Button */}
            {project.status === 'ready' && (
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Deploy</span>
              </button>
            )}

            {/* More Actions */}
            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={handleSave}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                  </svg>
                  Save Project
                </button>
                
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Code
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Project
                </button>
                
                {!isPro && (
                  <>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button
                      onClick={onUpgrade}
                      className="w-full px-4 py-2 text-left text-sm text-purple-400 hover:bg-gray-700 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Upgrade to Pro
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Build Progress */}
        {isBuilding && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Building project...</span>
              <span className="text-sm text-gray-400">{buildProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${buildProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Tech Stack */}
        <div className="mt-4 flex items-center space-x-2">
          <span className="text-sm text-gray-400">Tech Stack:</span>
          {project.techStack.slice(0, 5).map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 5 && (
            <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
              +{project.techStack.length - 5} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
