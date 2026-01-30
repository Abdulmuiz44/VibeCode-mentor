'use client';

import React, { useState, useEffect } from 'react';
import { FileTreeItem, ProjectFile } from '@/types/files';
import FileExplorer from './FileExplorer';
import CodeViewer from './CodeViewer';
import { RefreshCw, Play, Download } from 'lucide-react';

interface ProjectIDEProps {
  projectId: string;
}

export default function ProjectIDE({ projectId }: ProjectIDEProps) {
  const [files, setFiles] = useState<FileTreeItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [loadingTree, setLoadingTree] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Fetch file tree on mount
  useEffect(() => {
    fetchFileTree();
  }, [projectId]);

  const fetchFileTree = async () => {
    try {
      setLoadingTree(true);
      const res = await fetch(`/api/hub/projects/${projectId}/files`);
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Failed to fetch file tree:', error);
    } finally {
      setLoadingTree(false);
    }
  };

  const handleSelectFile = async (path: string) => {
    setSelectedPath(path);
    setLoadingFile(true);
    try {
      const fileId = findFileIdByPath(files, path);
      if (!fileId) return;

      const res = await fetch(`/api/hub/projects/${projectId}/files/${fileId}`);
      if (!res.ok) throw new Error('Failed to fetch file content');
      
      const data = await res.json();
      if (data.file) {
        setSelectedFile(data.file);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setSelectedFile(null);
    } finally {
      setLoadingFile(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/hub/projects/${projectId}/generate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchFileTree(); // Refresh tree
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Trigger download by navigating to the API route
      // Using window.location.href or creating a temporary link is standard for file downloads
      window.location.href = `/api/hub/projects/${projectId}/download`;
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      // Small delay to reset state since download is handled by browser
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  // Helper to find ID in tree
  const findFileIdByPath = (items: FileTreeItem[], path: string): string | undefined => {
    for (const item of items) {
      if (item.path === path) return item.id;
      if (item.children) {
        const found = findFileIdByPath(item.children, path);
        if (found) return found;
      }
    }
    return undefined;
  };

  return (
    <div className="flex h-[calc(100vh-200px)] border border-zinc-800 rounded-lg overflow-hidden bg-[#0d0d0d]">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 flex flex-col bg-[#111]">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Explorer</span>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="text-zinc-500 hover:text-zinc-300" title="Download Project">
              {downloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            </button>
            <button onClick={fetchFileTree} className="text-zinc-500 hover:text-zinc-300" title="Refresh Tree">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {loadingTree ? (
            <div className="px-4 text-xs text-zinc-500">Loading tree...</div>
          ) : files.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-zinc-500 mb-3">No files found.</p>
              <button 
                onClick={handleGenerate}
                disabled={generating}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center justify-center w-full gap-2 transition-colors"
              >
                {generating ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                Generate Code
              </button>
            </div>
          ) : (
            <FileExplorer 
              items={files} 
              onSelectFile={handleSelectFile} 
              selectedPath={selectedPath} 
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <CodeViewer file={selectedFile} loading={loadingFile} />
      </div>
    </div>
  );
}