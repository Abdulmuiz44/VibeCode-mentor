'use client';

import { useState, useRef, useEffect } from 'react';
import { Project, ChatMessage } from '@/types/project';

interface ChatInterfaceProps {
  project: Project;
  onFileUpdate: (fileId: string, content: string) => void;
  onBuild: () => void;
  isPro: boolean;
  user?: any;
}

export default function ChatInterface({ project, onFileUpdate, onBuild, isPro, user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your AI coding assistant. I can help you build your ${project.name} project. What would you like to work on?`,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/projects/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          projectId: project.id,
          files: project.files,
          techStack: project.techStack,
          userId: user?.id || 'anonymous'
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse.content,
          timestamp: new Date(),
          type: aiResponse.type || 'text',
          metadata: aiResponse.metadata
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Handle AI actions
        if (aiResponse.type === 'code' && aiResponse.metadata?.fileId) {
          onFileUpdate(aiResponse.metadata.fileId, aiResponse.metadata.code || '');
        } else if (aiResponse.type === 'build') {
          onBuild();
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: ChatMessage) => {
    return (
      <div
        key={message.id}
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 ${
            message.role === 'user'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-100'
          }`}
        >
          {message.type === 'code' && message.metadata?.code && (
            <div className="mb-2">
              <div className="text-xs text-gray-400 mb-1">
                📝 {message.metadata.fileName}
              </div>
              <pre className="bg-gray-900 p-2 rounded text-sm overflow-x-auto">
                <code>{message.metadata.code}</code>
              </pre>
            </div>
          )}
          <div className="text-sm">{message.content}</div>
          <div className="text-xs text-gray-400 mt-1">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  const quickActions = [
    { icon: '⚡', label: 'Add Component', prompt: 'Add a new React component' },
    { icon: '🎨', label: 'Style Page', prompt: 'Add CSS styling to make it look modern' },
    { icon: '📱', label: 'Make Responsive', prompt: 'Make the design mobile-responsive' },
    { icon: '🔧', label: 'Add Feature', prompt: 'Add a new feature to the app' },
    { icon: '🚀', label: 'Build & Deploy', prompt: 'Build and deploy the application' }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
        <p className="text-sm text-gray-400">Powered by Mistral & Gemini</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setInput(action.prompt)}
              className="flex flex-col items-center p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs"
              disabled={!isPro}
              title={!isPro ? 'Pro feature' : ''}
            >
              <span className="text-lg mb-1">{action.icon}</span>
              <span className="text-gray-300">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isPro ? "Ask me to build anything..." : "Upgrade to Pro to use AI assistant"}
            disabled={!isPro || isLoading}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!isPro || !input.trim() || isLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            Send
          </button>
        </div>

        {!isPro && (
          <div className="mt-2 text-xs text-gray-400 text-center">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openUpgradeModal', { detail: { source: 'Project Builder Chat' } }))}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Upgrade to Pro
            </button>
            {' '}to unlock AI coding assistant
          </div>
        )}
      </div>
    </div>
  );
}
