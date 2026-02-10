'use client';

import { useState, useEffect, useRef } from 'react';
import { FileNode } from '@/types/project';

interface CodeEditorProps {
  file: FileNode;
  onUpdate: (content: string) => void;
}

export default function CodeEditor({ file, onUpdate }: CodeEditorProps) {
  const [content, setContent] = useState(file.content || '');
  const [language, setLanguage] = useState('javascript');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(file.content || '');
    setLanguage(getLanguageFromFileName(file.name));
  }, [file]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'fish': 'bash',
      'dockerfile': 'dockerfile',
      'gitignore': 'gitignore',
      'env': 'env'
    };
    return languageMap[extension || ''] || 'text';
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdate(newContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      onUpdate(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const getLineNumbers = () => {
    const lines = content.split('\n');
    return lines.map((_, index) => index + 1).join('\n');
  };

  const getSyntaxHighlighting = () => {
    // Basic syntax highlighting - in a real implementation, you'd use a library like Prism.js or Monaco Editor
    if (language === 'javascript' || language === 'typescript') {
      return content
        .replace(/\b(function|const|let|var|if|else|for|while|return|import|export|from|class|extends|new|this|super|try|catch|finally|throw|async|await)\b/g, '<span class="text-purple-400">$1</span>')
        .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-blue-400">$1</span>')
        .replace(/\/\/.*$/gm, '<span class="text-gray-500">$&</span>')
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500">$&</span>')
        .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-400">$&</span>')
        .replace(/\b\d+\b/g, '<span class="text-yellow-400">$&</span>');
    } else if (language === 'html') {
      return content
        .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)(.*?)(&gt;)/g, '<span class="text-red-400">$1</span><span class="text-blue-400">$2</span><span class="text-gray-400">$3</span><span class="text-red-400">$4</span>')
        .replace(/([a-zA-Z-]+)(=)(["'])(.*?)\3/g, '<span class="text-yellow-400">$1</span><span class="text-white">$2</span><span class="text-green-400">$3</span><span class="text-green-400">$4</span>');
    } else if (language === 'css') {
      return content
        .replace(/([.#]?[a-zA-Z][a-zA-Z0-9-]*)\s*{/g, '<span class="text-blue-400">$1</span> {')
        .replace(/([a-zA-Z-]+)(\s*:\s*)([^;]+)(;)/g, '<span class="text-yellow-400">$1</span>$2<span class="text-green-400">$3</span>$4');
    }
    return content;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-white">{file.name}</span>
          <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">
            {language}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors">
            Format Code
          </button>
          <button className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors">
            Copy
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="bg-gray-900 text-gray-500 text-sm font-mono px-3 py-4 select-none border-r border-gray-800">
          <pre className="leading-6">{getLineNumbers()}</pre>
        </div>

        {/* Code Area */}
        <div className="flex-1 relative">
          {/* Syntax Highlighted Background */}
          <div 
            className="absolute inset-0 font-mono text-sm leading-6 p-4 overflow-auto pointer-events-none whitespace-pre"
            dangerouslySetInnerHTML={{ 
              __html: getSyntaxHighlighting().replace(/\n/g, '<br>') 
            }}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 font-mono text-sm leading-6 p-4 bg-transparent text-white resize-none outline-none whitespace-pre overflow-auto caret-white"
            style={{ 
              color: 'transparent',
              caretColor: 'white'
            }}
            spellCheck={false}
            placeholder={`Start typing ${file.name}...`}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-t border-gray-800 text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Lines: {content.split('\n').length}</span>
          <span>Characters: {content.length}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>{language}</span>
          <span>LF</span>
        </div>
      </div>
    </div>
  );
}
