'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBlueprintById, generateFilesFromBlueprint } from '@/lib/blueprints';
import ChatInterface from '@/components/project-builder/ChatInterface';
import CodeEditor from '@/components/project-builder/CodeEditor';
import LivePreview from '@/components/project-builder/LivePreview';
import FileManager from '@/components/project-builder/FileManager';
import ProjectHeader from '@/components/project-builder/ProjectHeader';
import { useProUpgradeModal } from '@/components/ProUpgradeModal';
import { Project, FileNode } from '@/types/project';

export default function ProjectBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { openUpgradeModal } = useProUpgradeModal();
  
  const [isPro, setIsPro] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'files'>('editor');
  const [user, setUser] = useState<any>(null);

  const projectId = params.id as string;

  useEffect(() => {
    const initializeProject = async () => {
      try {
        // Mock user for now - in production, this would come from auth
        const mockUser = { id: 'user-123', name: 'Demo User' };
        setUser(mockUser);

        // Check Pro status
        const proStatus = getProStatus();
        setIsPro(proStatus.isPro);

        // Load blueprint
        const blueprint = getBlueprintById(projectId);
        if (!blueprint) {
          router.push('/blueprints');
          return;
        }

        // Initialize project from blueprint
        const newProject: Project = {
          id: projectId,
          name: blueprint.title,
          description: blueprint.description,
          blueprintId: projectId,
          files: generateFilesFromBlueprint(blueprint),
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'draft',
          techStack: blueprint.techStack
        };

        setProject(newProject);
        setSelectedFile(newProject.files[0]);
      } catch (error) {
        console.error('Error initializing project:', error);
        router.push('/blueprints');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProject();
  }, [projectId, router]);

  const handleFileUpdate = async (fileId: string, content: string) => {
    if (!project) return;

    const updateFileInTree = (files: FileNode[]): FileNode[] => {
      return files.map(file => {
        if (file.id === fileId) {
          return { ...file, content };
        }
        if (file.children) {
          return { ...file, children: updateFileInTree(file.children) };
        }
        return file;
      });
    };

    const updatedProject = {
      ...project,
      files: updateFileInTree(project.files),
      updatedAt: new Date()
    };

    setProject(updatedProject);
  };

  const handleBuildProject = async () => {
    if (!isPro) {
      openUpgradeModal({ source: 'Project Builder' });
      return;
    }

    setIsBuilding(true);
    setBuildProgress(0);

    try {
      // Build project and deploy to preview
      const response = await fetch('/api/projects/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project?.id,
          files: project?.files,
          userId: user?.id || 'anonymous'
        }),
      });

      if (response.ok) {
        const { previewUrl } = await response.json();
        setPreviewUrl(previewUrl);
        setActiveTab('preview');
      }
    } catch (error) {
      console.error('Build failed:', error);
    } finally {
      setIsBuilding(false);
      setBuildProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <button
            onClick={() => router.push('/blueprints')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            Back to Blueprints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Project Header */}
      <ProjectHeader
        project={project}
        onBuild={handleBuildProject}
        isBuilding={isBuilding}
        buildProgress={buildProgress}
        isPro={isPro}
        onUpgrade={() => openUpgradeModal({ source: 'Project Builder' })}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <div className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('editor')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'editor'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Code Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Live Preview
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'files'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            File Manager
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar - Chat Interface */}
        <div className="w-80 border-r border-gray-800 flex flex-col">
          <ChatInterface
            project={project}
            onFileUpdate={handleFileUpdate}
            onBuild={handleBuildProject}
            isPro={isPro}
            user={user}
          />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'editor' && selectedFile && (
            <CodeEditor
              file={selectedFile}
              onUpdate={(content) => handleFileUpdate(selectedFile.id, content)}
            />
          )}
          
          {activeTab === 'preview' && (
            <LivePreview
              project={project}
              previewUrl={previewUrl}
              onBuild={handleBuildProject}
              isBuilding={isBuilding}
            />
          )}
          
          {activeTab === 'files' && (
            <FileManager
              files={project.files}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onFileUpdate={handleFileUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
