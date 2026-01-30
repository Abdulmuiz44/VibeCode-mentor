'use client';

import { ProjectFile } from '@/types/files';

interface CodeViewerProps {
  file: ProjectFile | null;
  loading?: boolean;
}

export default function CodeViewer({ file, loading }: CodeViewerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        <div className="animate-pulse">Loading file content...</div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
        <p>Select a file to view its content</p>
        <p className="text-xs opacity-50">Or generate code if the project is empty</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-zinc-300 font-mono text-sm overflow-hidden">
      <div className="flex items-center px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400">
        <span>{file.path}</span>
        <span className="ml-auto opacity-50">{file.language}</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="whitespace-pre font-mono text-sm leading-relaxed">
          <code>{file.content}</code>
        </pre>
      </div>
    </div>
  );
}