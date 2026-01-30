'use client';

import React, { useState } from 'react';
import { FileTreeItem, ProjectFile } from '@/types/files';
import { Folder, FileCode, ChevronRight, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface FileExplorerProps {
  items: FileTreeItem[];
  onSelectFile: (path: string) => void;
  selectedPath?: string;
  level?: number;
}

export default function FileExplorer({ items, onSelectFile, selectedPath, level = 0 }: FileExplorerProps) {
  // Sort: Folders first, then files, both alphabetical
  const sortedItems = [...items].sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });

  return (
    <div className="w-full text-sm">
      {sortedItems.map((item) => (
        <FileTreeItemNode
          key={item.id}
          item={item}
          level={level}
          onSelectFile={onSelectFile}
          selectedPath={selectedPath}
        />
      ))}
    </div>
  );
}

function FileTreeItemNode({ 
  item, 
  level, 
  onSelectFile, 
  selectedPath 
}: { 
  item: FileTreeItem; 
  level: number; 
  onSelectFile: (path: string) => void; 
  selectedPath?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = item.path === selectedPath;

  const handleClick = () => {
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(item.path);
    }
  };

  return (
    <div>
      <div
        className={clsx(
          "flex items-center py-1 px-2 cursor-pointer hover:bg-zinc-800/50 transition-colors select-none",
          isSelected && "bg-blue-900/30 text-blue-400 border-l-2 border-blue-500"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <span className="mr-1.5 opacity-70">
          {item.type === 'folder' ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : <span className="w-3.5 inline-block" />}
        </span>
        
        <span className="mr-2 text-zinc-400">
          {item.type === 'folder' ? <Folder size={14} /> : <FileCode size={14} />}
        </span>
        
        <span className="truncate">{item.name}</span>
      </div>

      {item.type === 'folder' && isOpen && item.children && (
        <FileExplorer
          items={item.children}
          onSelectFile={onSelectFile}
          selectedPath={selectedPath}
          level={level + 1}
        />
      )}
    </div>
  );
}