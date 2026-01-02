'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import ChatBubble from '@/components/ChatBubble';

interface ProjectData {
  id: string;
  project_name: string;
  description: string;
  status: 'generating' | 'completed' | 'failed';
  github_url: string | null;
  total_files: number;
  technologies: string[];
  api_endpoints: number;
  components: number;
  generated_files: {
    name: string;
    files: Array<{
      path: string;
      content: string;
    }>;
  };
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const { data: session } = useSession();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');

  useEffect(() => {
    if (!session?.user?.id) {
      router.replace('/auth/signin');
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [session, projectId, router]);

  const handleFileSelect = (path: string) => {
    setSelectedFile(path);
    const file = project?.generated_files?.files.find(f => f.path === path);
    if (file) {
      setFileContent(file.content);
    }
  };

  const downloadProject = async () => {
    if (!project?.generated_files?.files) return;

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      project.generated_files.files.forEach(file => {
        zip.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.project_name.replace(/\s+/g, '-')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-300 mb-2">Error</h2>
            <p className="text-red-200">{error || 'Project not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {project.project_name}
            </h1>
            <div className="flex gap-2">
              {project.status === 'completed' && (
                <span className="px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-sm font-semibold">
                  ✓ Complete
                </span>
              )}
              {project.status === 'generating' && (
                <span className="px-4 py-2 bg-purple-500/20 border border-purple-500 rounded-lg text-purple-300 text-sm font-semibold animate-pulse">
                  ⟳ Generating
                </span>
              )}
              {project.status === 'failed' && (
                <span className="px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm font-semibold">
                  ✗ Failed
                </span>
              )}
            </div>
          </div>
          <p className="text-gray-400 text-lg">{project.description}</p>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{project.total_files}</div>
            <div className="text-sm text-gray-400 mt-1">Files Generated</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{project.components}</div>
            <div className="text-sm text-gray-400 mt-1">Components</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{project.api_endpoints}</div>
            <div className="text-sm text-gray-400 mt-1">API Endpoints</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-lg font-bold text-pink-400">{project.technologies.length}</div>
            <div className="text-sm text-gray-400 mt-1">Technologies</div>
          </div>
        </div>

        {/* Technologies */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map(tech => (
              <span
                key={tech}
                className="px-3 py-1 bg-purple-500/20 border border-purple-500 rounded-full text-sm text-purple-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* GitHub Link */}
        {project.github_url && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-green-300 mb-3">📦 GitHub Repository</h3>
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
            >
              Open on GitHub →
            </a>
          </div>
        )}

        {/* Files Explorer */}
        {project.generated_files?.files && project.generated_files.files.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* File List */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Files ({project.generated_files.files.length})</h3>
                  <button
                    onClick={downloadProject}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-all"
                    title="Download as ZIP"
                  >
                    ⬇
                  </button>
                </div>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {project.generated_files.files.map(file => (
                    <button
                      key={file.path}
                      onClick={() => handleFileSelect(file.path)}
                      className={`w-full text-left px-3 py-2 rounded text-sm truncate transition-all ${
                        selectedFile === file.path
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                      title={file.path}
                    >
                      {file.path.split('/').pop()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* File Content */}
            <div className="lg:col-span-3">
              {selectedFile ? (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="mb-3 pb-3 border-b border-gray-700">
                    <p className="text-sm text-gray-400 break-all">{selectedFile}</p>
                  </div>
                  <pre className="bg-black rounded p-4 overflow-x-auto max-h-96 overflow-y-auto">
                    <code className="text-green-400 text-xs font-mono">{fileContent}</code>
                  </pre>
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 flex items-center justify-center min-h-96">
                  <p className="text-gray-400">Select a file to view its contents</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/build')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
          >
            Generate Another
          </button>
        </div>
      </div>

      <ChatBubble />
    </div>
  );
}
