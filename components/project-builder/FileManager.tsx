'use client';

import { useState } from 'react';
import { FileNode } from '@/types/project';

interface FileManagerProps {
  files: FileNode[];
  selectedFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
  onFileUpdate: (fileId: string, content: string) => void;
}

export default function FileManager({ files, selectedFile, onFileSelect, onFileUpdate }: FileManagerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1', '2', '5'])); // Expand root folders by default
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileNode } | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [parentFolder, setParentFolder] = useState<FileNode | null>(null);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName: string, type: string) => {
    if (type === 'folder') {
      return '📁';
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'js': '🟨',
      'jsx': '🟨',
      'ts': '🔷',
      'tsx': '🔷',
      'html': '🌐',
      'css': '🎨',
      'scss': '🎨',
      'sass': '🎨',
      'json': '📋',
      'md': '📝',
      'txt': '📄',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'svg': '🖼️',
      'pdf': '📕',
      'zip': '📦',
      'gitignore': '🚫',
      'env': '🔐',
      'dockerfile': '🐳'
    };
    
    return iconMap[extension || ''] || '📄';
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleCreateFile = (parent: FileNode) => {
    setParentFolder(parent);
    setShowNewFileModal(true);
    setNewFileName('');
    closeContextMenu();
  };

  const handleCreateFolder = (parent: FileNode) => {
    const folderName = prompt('Enter folder name:');
    if (folderName && parent.children) {
      const newFolder: FileNode = {
        id: Date.now().toString(),
        name: folderName,
        type: 'folder',
        children: [],
        path: `${parent.path}/${folderName}`
      };
      
      const updatedChildren = [...parent.children, newFolder];
      // Update parent folder - this would need to be handled by the parent component
      onFileUpdate(parent.id, JSON.stringify(updatedChildren));
    }
    closeContextMenu();
  };

  const handleDelete = (file: FileNode) => {
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      // This would need to be handled by the parent component
      console.log('Delete file:', file);
    }
    closeContextMenu();
  };

  const handleRename = (file: FileNode) => {
    const newName = prompt('Enter new name:', file.name);
    if (newName && newName !== file.name) {
      // This would need to be handled by the parent component
      console.log('Rename file:', file, 'to:', newName);
    }
    closeContextMenu();
  };

  const handleCreateNewFile = () => {
    if (newFileName && parentFolder && parentFolder.children) {
      const newFile: FileNode = {
        id: Date.now().toString(),
        name: newFileName,
        type: 'file',
        content: '',
        path: `${parentFolder.path}/${newFileName}`
      };
      
      const updatedChildren = [...parentFolder.children, newFile];
      onFileUpdate(parentFolder.id, JSON.stringify(updatedChildren));
      
      setShowNewFileModal(false);
      setNewFileName('');
      setParentFolder(null);
    }
  };

  const renderFileTree = (files: FileNode[], level = 0) => {
    return files.map(file => (
      <div key={file.id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-800 cursor-pointer rounded group ${
            selectedFile?.id === file.id ? 'bg-gray-800' : ''
          }`}
          onClick={() => file.type === 'file' ? onFileSelect(file) : toggleFolder(file.id)}
          onContextMenu={(e) => handleContextMenu(e, file)}
        >
          <span className="mr-2">
            {file.type === 'folder' ? (
              expandedFolders.has(file.id) ? '📂' : '📁'
            ) : (
              getFileIcon(file.name, file.type)
            )}
          </span>
          
          <span className="flex-1 text-sm text-gray-300">{file.name}</span>
          
          <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
            {file.type === 'folder' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateFile(file);
                }}
                className="p-1 hover:bg-gray-700 rounded"
                title="New File"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {file.type === 'folder' && file.children && expandedFolders.has(file.id) && (
          <div>
            {renderFileTree(file.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <h3 className="text-sm font-medium text-white">File Manager</h3>
        <button
          onClick={() => handleCreateFile({ id: 'root', name: '', type: 'folder', children: files, path: '/' })}
          className="p-1 hover:bg-gray-700 rounded"
          title="New File"
        >
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {renderFileTree(files)}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={closeContextMenu}
        >
          {contextMenu.file.type === 'folder' && (
            <>
              <button
                onClick={() => handleCreateFile(contextMenu.file)}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
              >
                <span className="mr-2">📄</span> New File
              </button>
              <button
                onClick={() => handleCreateFolder(contextMenu.file)}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
              >
                <span className="mr-2">📁</span> New Folder
              </button>
              <div className="border-t border-gray-700 my-1"></div>
            </>
          )}
          
          <button
            onClick={() => handleRename(contextMenu.file)}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
          >
            <span className="mr-2">✏️</span> Rename
          </button>
          
          <button
            onClick={() => handleDelete(contextMenu.file)}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center"
          >
            <span className="mr-2">🗑️</span> Delete
          </button>
        </div>
      )}

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-white mb-4">Create New File</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter file name (e.g., component.js)"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowNewFileModal(false);
                  setNewFileName('');
                  setParentFolder(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFile}
                disabled={!newFileName.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
