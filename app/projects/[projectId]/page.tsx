'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ProjectRecord, ProjectGenerationStep } from '@/lib/db/projects';
import ReactMarkdown from 'react-markdown';

export default function ProjectChatPage({ params }: { params: Promise<{ projectId: string }> }) {
    // Unwrap params Promise using React.use() for Next.js 15
    const resolvedParams = use(params);
    const projectId = resolvedParams.projectId;

    const { data: session } = useSession();
    const router = useRouter();
    const [project, setProject] = useState<ProjectRecord | null>(null);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false); // Task-specific execution state
    const [steps, setSteps] = useState<ProjectGenerationStep[]>([]);
    const [isAutoExecuting, setIsAutoExecuting] = useState(true); // Default to true for "background" feel
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (session?.user?.id) {
            fetchProject();
            fetchMessages();
        }
    }, [session, projectId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/vibecode/projects/${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setProject(data);
                if (data.steps) {
                    setSteps(data.steps);
                }
            }
        } catch (error) {
            console.error('Failed to fetch project:', error);
        }
    };

    // Autonomous Background Execution Logic (Silent)
    useEffect(() => {
        let pollTimer: NodeJS.Timeout;

        const runBackgroundExecution = async () => {
            if (!isAutoExecuting || isExecuting || isLoading || project?.status !== 'generating') return;

            const nextPending = steps.find(s => s.status === 'pending');
            if (nextPending) {
                setIsExecuting(true);
                try {
                    const res = await fetch('/api/vibecode/agent/execute-next', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ projectId })
                    });

                    if (res.ok) {
                        // Success, the step status will update in DB
                        fetchProject(); // Refresh UI
                    }
                } catch (err) {
                    console.error("Background execution error:", err);
                } finally {
                    setIsExecuting(false);
                }
            } else if (steps.length > 0 && steps.every(s => s.status === 'completed')) {
                // Done - refresh to show completion
                fetchProject();
            }
        };

        if (isAutoExecuting && project?.status === 'generating') {
            // Check frequently during generation
            pollTimer = setInterval(runBackgroundExecution, 3000);
        }

        return () => {
            if (pollTimer) clearInterval(pollTimer);
        };
    }, [isAutoExecuting, isExecuting, isLoading, project?.status, steps, projectId]);

    const fetchMessages = async () => {
        // Placeholder: Implement dedicated message fetch endpoint
        // For now, initialized with a welcome message
        setMessages([
            { role: 'assistant', content: 'Hello! I am your VibeCode Architect. What feature would you like to build or modify today?' }
        ]);
    };

    const sendMessage = async (overrideMessage?: string) => {
        const messageToSend = overrideMessage || input;
        if (!messageToSend.trim()) return;

        const newMsg = { role: 'user' as const, content: messageToSend };
        setMessages(prev => [...prev, newMsg]);
        if (!overrideMessage) setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/vibecode/agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: projectId,
                    message: messageToSend
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
                // Refresh project and steps after each interaction
                fetchProject();
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!project && !messages.length) return <div className="text-white p-8">Loading...</div>;

    return (
        <div className="flex h-screen bg-black text-white">
            {/* Sidebar: Project Status & Plan */}
            <div className="w-80 border-r border-gray-800 p-6 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{project?.name || 'Loading Project...'}</h2>
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Status</h3>
                    <span className={`px-2 py-1 rounded text-xs ${project?.status === 'completed' ? 'bg-green-900 text-green-300' : 'bg-purple-900 text-purple-300'}`}>
                        {project?.status?.toUpperCase()}
                    </span>
                </div>

                {/* Task List / Plan */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Implementation Plan</h3>
                    <div className="space-y-3">
                        {steps.length === 0 && <p className="text-sm text-gray-600 italic">No tasks yet.</p>}
                        {steps.map((step) => (
                            <div key={step.id} className="flex items-center gap-2 text-sm group">
                                <div className={`w-2 h-2 rounded-full ${step.status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                                    step.status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                                        step.status === 'failed' ? 'bg-red-500' : 'bg-gray-600'
                                    }`} />
                                <span className={step.status === 'completed' ? 'text-gray-400' : 'text-gray-200'}>
                                    {step.step_name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {steps.some(s => s.status === 'pending') && (
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-gray-400">Auto-Build</span>
                            <button
                                onClick={() => setIsAutoExecuting(!isAutoExecuting)}
                                className={`w-10 h-5 rounded-full transition-all relative ${isAutoExecuting ? 'bg-purple-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAutoExecuting ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <button
                            onClick={() => sendMessage('Go ahead with the next step')}
                            disabled={isLoading}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-purple-900/20"
                        >
                            {isLoading ? 'Executing...' : 'Execute Next Step'}
                        </button>
                    </div>
                )}

                {project?.github_url && (
                    <div className="mt-4">
                        <a
                            href={project.github_url}
                            target="_blank"
                            className="flex items-center justify-center gap-2 w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold border border-gray-700 transition-all"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                            View Repository
                        </a>
                    </div>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative">
                {/* Generation Progress Overlay */}
                {project?.status === 'generating' && (
                    <div className="absolute top-0 inset-x-0 z-10 p-4 bg-purple-900/10 backdrop-blur-md border-b border-purple-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-purple-400">
                                    {Math.round((steps.filter(s => s.status === 'completed').length / (steps.length || 1)) * 100)}%
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">VibeCode Agent Building...</h4>
                                <p className="text-xs text-purple-300">
                                    {isExecuting ? `Executing: ${steps.find(s => s.status === 'in-progress')?.step_name || 'Tasks'}` : 'Next tasks queued'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-[10px] font-mono animate-pulse uppercase tracking-wider">
                                Autonomous Mode
                            </div>
                        </div>
                    </div>
                )}
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-3xl rounded-lg p-4 ${msg.role === 'user'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800 text-gray-200'
                                    }`}
                            >
                                <div className="prose prose-invert prose-sm">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800 rounded-lg p-4 flex gap-2 items-center text-gray-400">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75" />
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-gray-800 bg-black">
                    <div className="max-w-4xl mx-auto relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Tell me what to build or modify..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 pr-12 text-white focus:outline-none focus:border-purple-500 resize-none h-14 max-h-48"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 top-3 p-2 text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
