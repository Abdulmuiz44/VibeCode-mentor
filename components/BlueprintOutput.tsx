'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveBlueprint } from '@/utils/localStorage';
import { canSaveBlueprint, FREE_SAVE_LIMIT } from '@/utils/pro';
import { getSavedBlueprints } from '@/utils/localStorage';
import { useAuth } from '@/context/AuthContext';
import { saveBlueprintToCloud } from '@/lib/firebase';
import { exportToPDF, createGitHubRepo, downloadAsMarkdown } from '@/utils/exportHelpers';

interface BlueprintOutputProps {
  blueprint: string;
  projectIdea: string;
}

// Code block component with copy button
function CodeBlock({ className, children }: { className?: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const codeContent = String(children).replace(/\n$/, '');
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </>
        )}
      </button>
      <code className={`${className} block bg-black text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono`}>
        {children}
      </code>
    </div>
  );
}

export default function BlueprintOutput({ blueprint, projectIdea }: BlueprintOutputProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [repoName, setRepoName] = useState('');
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { user, isPro } = useAuth();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(blueprint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = async () => {
    try {
      const currentSaves = getSavedBlueprints();
      
      // Check if user can save (Pro users or within free limit)
      if (!isPro && !canSaveBlueprint(currentSaves.length)) {
        showToastMessage(`Free limit: ${FREE_SAVE_LIMIT} saves. Upgrade to Pro for unlimited!`);
        return;
      }

      // Save to local storage
      const savedBlueprint = saveBlueprint(projectIdea, blueprint);
      
      // Save to cloud if logged in
      if (user) {
        const cloudSaved = await saveBlueprintToCloud(user.uid, savedBlueprint);
        if (cloudSaved) {
          showToastMessage('Saved to cloud! View in History');
        } else {
          showToastMessage('Saved locally! (Cloud sync failed)');
        }
      } else {
        showToastMessage('Saved! Sign in to sync to cloud');
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save:', err);
      showToastMessage('Failed to save blueprint');
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleExportPDF = async () => {
    if (!isPro) {
      showToastMessage('PDF export is a Pro feature. Upgrade to unlock!');
      return;
    }

    try {
      const savedBlueprint = {
        id: Date.now(),
        vibe: projectIdea,
        blueprint,
        timestamp: Date.now(),
      };
      await exportToPDF(savedBlueprint);
      showToastMessage('Blueprint exported as PDF!');
    } catch (error) {
      console.error('PDF export error:', error);
      showToastMessage('Failed to export PDF');
    }
  };

  const handleDownloadMarkdown = () => {
    const savedBlueprint = {
      id: Date.now(),
      vibe: projectIdea,
      blueprint,
      timestamp: Date.now(),
    };
    downloadAsMarkdown(savedBlueprint);
    showToastMessage('Blueprint downloaded as Markdown!');
  };

  const handleCreateGitHubRepo = async () => {
    if (!isPro) {
      showToastMessage('GitHub repo creation is a Pro feature. Upgrade to unlock!');
      return;
    }

    if (!githubToken || !repoName) {
      showToastMessage('Please provide GitHub token and repository name');
      return;
    }

    setExporting(true);
    try {
      const savedBlueprint = {
        id: Date.now(),
        vibe: projectIdea,
        blueprint,
        timestamp: Date.now(),
      };

      const repoUrl = await createGitHubRepo(savedBlueprint, githubToken, repoName, isPrivateRepo);
      showToastMessage('GitHub repository created successfully!');
      setShowGitHubModal(false);
      setGithubToken('');
      setRepoName('');
      
      // Open repo in new tab
      window.open(repoUrl, '_blank');
    } catch (error: any) {
      console.error('GitHub repo creation error:', error);
      showToastMessage(error.message || 'Failed to create GitHub repository');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3">
        <button
          onClick={handleSave}
          className="px-4 md:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 border border-blue-500"
        >
          {saved ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span className="hidden sm:inline">Save Blueprint</span>
              <span className="sm:hidden">Save</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopy}
          className="px-4 md:px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 border border-gray-700"
        >
          {copied ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Copy Blueprint</span>
              <span className="sm:hidden">Copy</span>
            </>
          )}
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-4 md:px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 border border-purple-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Export</span>
            <svg className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Export Menu Dropdown */}
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
              <button
                onClick={() => {
                  handleExportPDF();
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="font-medium text-white">Export as PDF</div>
                  <div className="text-xs text-gray-400">
                    {isPro ? 'Download formatted PDF' : 'Pro feature'}
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  handleDownloadMarkdown();
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 border-t border-gray-700"
              >
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <div className="font-medium text-white">Download Markdown</div>
                  <div className="text-xs text-gray-400">Free for all users</div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (!isPro) {
                    showToastMessage('GitHub repo creation is a Pro feature. Upgrade to unlock!');
                    setShowExportMenu(false);
                    return;
                  }
                  setShowGitHubModal(true);
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 border-t border-gray-700"
              >
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <div>
                  <div className="font-medium text-white">Create GitHub Repo</div>
                  <div className="text-xs text-gray-400">
                    {isPro ? 'Push to GitHub' : 'Pro feature'}
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* GitHub Modal */}
      {showGitHubModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Create GitHub Repository
              </h3>
              <button
                onClick={() => {
                  setShowGitHubModal(false);
                  setGithubToken('');
                  setRepoName('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxx"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Need a token? <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">Create one here</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="my-awesome-project"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivateRepo}
                  onChange={(e) => setIsPrivateRepo(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isPrivate" className="text-sm text-gray-300">
                  Make repository private
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowGitHubModal(false);
                    setGithubToken('');
                    setRepoName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  disabled={exporting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGitHubRepo}
                  disabled={exporting || !githubToken || !repoName}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {exporting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Repository'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Markdown Output */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-3xl font-bold mt-8 mb-4 text-blue-400">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-2xl font-semibold mt-6 mb-3 text-purple-400">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-300 leading-relaxed mb-4">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-4">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-300 ml-4">
                {children}
              </li>
            ),
            code: ({ className, children }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-gray-800 text-pink-400 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              }
              return <CodeBlock className={className}>{children}</CodeBlock>;
            },
            pre: ({ children }) => (
              <pre className="bg-black border border-gray-800 rounded-lg p-4 overflow-x-auto mb-4">
                {children}
              </pre>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 my-4">
                {children}
              </blockquote>
            ),
            hr: () => (
              <hr className="border-gray-700 my-8" />
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-white">
                {children}
              </strong>
            ),
          }}
        >
          {blueprint}
        </ReactMarkdown>
      </div>
    </div>
  );
}
