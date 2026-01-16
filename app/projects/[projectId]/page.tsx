'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ProjectRecord, ProjectGenerationStep } from '@/lib/db/projects';
import ReactMarkdown from 'react-markdown';
import { LivePreview } from '@/components/LivePreview';
import { Deployment } from '@/lib/db/deployments';
import { BlueprintRecord } from '@/lib/db/projects'; // Import BlueprintRecord
import { CheckCircle, XCircle, Clock, ExternalLink, RotateCcw, FileCode, History, Terminal } from 'lucide-react'; // Added Terminal icon
import { BuildLogRecord } from '@/lib/sandbox/database'; // Import Log type
import { DatabaseTab } from './DatabaseTab';


// New Component for Readme
function ProjectDocumentation({ content }: { content: string }) {
    if (!content) return <div className="text-gray-500 italic">No documentation available.</div>;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 overflow-auto max-h-[600px]">
            <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        </div>
    );
}

// New Component for Environment Variables
function EnvVarHelper({ content }: { content: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!content) return null;

    return (
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Environment Variables</h3>
                <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors flex items-center gap-2"
                >
                    {copied ? 'Copied!' : 'Copy .env.example'}
                </button>
            </div>
            <pre className="bg-black p-4 rounded text-xs text-green-400 font-mono overflow-x-auto">
                {content}
            </pre>
            <p className="text-xs text-gray-500 mt-2">
                Copy these variables to a <code>.env.local</code> file in your project root.
            </p>
        </div>
    );
}

// New Component for Vercel Deploy & GitHub Sync
function DeployButton({ projectId, githubUrl }: { projectId: string, githubUrl: string | null }) {
    const [isDeploying, setIsDeploying] = useState(false);
    const [currentUrl, setCurrentUrl] = useState<string | null>(githubUrl);
    const router = useRouter();

    const handleDeploy = async () => {
        setIsDeploying(true);
        try {
            // 1. Sync Code to GitHub
            const res = await fetch('/api/vibecode/deploy/sync-github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId })
            });

            if (res.status === 401) {
                // Not connected to GitHub
                // Redirect to auth flow
                const width = 600;
                const height = 700;
                const left = window.screen.width / 2 - width / 2;
                const top = window.screen.height / 2 - height / 2;
                window.open('/api/auth/github', 'Connect GitHub', `width=${width},height=${height},left=${left},top=${top}`);

                // Poll for connection? Or just reload logic?
                // For MVP, ask user to reload or we reload page after some time
                alert("Please connect your GitHub account in the popup, then click Deploy again.");
                setIsDeploying(false);
                return;
            }

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Sync failed');
            }

            const data = await res.json();
            const syncedUrl = data.github_url;
            setCurrentUrl(syncedUrl);

            // 2. Open Vercel Import with the synced Repo URL
            const deployUrl = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(syncedUrl)}`;
            window.open(deployUrl, '_blank');

        } catch (error) {
            console.error("Deploy failed:", error);
            alert("Deployment failed: " + (error instanceof Error ? error.message : "Unknown Error"));
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="flex items-center justify-center gap-2 w-full py-2 bg-black hover:bg-gray-900 text-white rounded-lg text-sm font-semibold border border-gray-700 transition-all mt-3 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
            {isDeploying ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Syncing...
                </>
            ) : (
                <>
                    <svg className="w-4 h-4 group-hover:text-white transition-colors" viewBox="0 0 1155 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M577.344 0L1154.69 1000H0L577.344 0Z" fill="white" />
                    </svg>
                    Deploy to Vercel
                </>
            )}
        </button>
    );
}

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

    const [activeTab, setActiveTab] = useState<'chat' | 'preview' | 'docs' | 'deployments' | 'history' | 'logs' | 'database'>('chat');
    const [readmeContent, setReadmeContent] = useState('');
    const [envContent, setEnvContent] = useState('');
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [versions, setVersions] = useState<BlueprintRecord[]>([]);
    const [logs, setLogs] = useState<BuildLogRecord[]>([]); // Logs state
    const [isRestoring, setIsRestoring] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user?.id) {
            fetchProject();
            fetchMessages();
        }
    }, [session, projectId]);

    useEffect(() => {
        scrollToBottom();
        if (activeTab === 'deployments') {
            fetchDeployments();
        } else if (activeTab === 'history') {
            fetchVersions();
        } else if (activeTab === 'logs') {
            fetchLogs();
            // Start polling logs
            const interval = setInterval(fetchLogs, 2000);
            return () => clearInterval(interval);
        }
    }, [messages, activeTab]);

    const scrollToBottom = () => {
        if (activeTab === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else if (activeTab === 'logs') {
            // Optional: auto-scroll logs? contentRef.current...
        }
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

                // Extract files
                const files = data.generated_files?.files || [];
                const readme = files.find((f: any) => f.path === 'README.md')?.content || '';
                const env = files.find((f: any) => f.path === '.env.example')?.content || '';

                setReadmeContent(readme);
                setEnvContent(env);
            }
        } catch (error) {
            console.error('Failed to fetch project:', error);
        }
    };

    const fetchDeployments = async () => {
        try {
            const res = await fetch(`/api/vibecode/projects/${projectId}/deployments`);
            if (res.ok) {
                const data = await res.json();
                setDeployments(data);
            }
        } catch (error) {
            console.error('Failed to fetch deployments:', error);
        }
    };

    const fetchVersions = async () => {
        try {
            const res = await fetch(`/api/vibecode/projects/${projectId}/versions`);
            if (res.ok) {
                const data = await res.json();
                setVersions(data);
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        }
    };

    const handleRestore = async (versionId: string) => {
        if (!confirm('Are you sure you want to restore this version? This will create a new version on top of the current state.')) return;

        setIsRestoring(versionId);
        try {
            const res = await fetch(`/api/vibecode/projects/${projectId}/versions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionId })
            });

            if (res.ok) {
                alert('Version restored successfully!');
                fetchProject(); // Reload project state
                fetchVersions(); // Reload versions list (new one added)
                setActiveTab('chat'); // Go back to chat
            } else {
                throw new Error('Failed to restore');
            }
        } catch (error) {
            console.error('Restore failed:', error);
            alert('Failed to restore version');
        } finally {
            setIsRestoring(null);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch(`/api/vibecode/projects/${projectId}/logs`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
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
            <div className="w-80 border-r border-gray-800 p-6 overflow-y-auto hidden md:block">
                <h2 className="text-xl font-bold mb-4">{project?.name || 'Loading Project...'}</h2>
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Status</h3>
                    <span className={`px-2 py-1 rounded text-xs ${project?.status === 'completed' ? 'bg-green-900 text-green-300' : 'bg-purple-900 text-purple-300'}`}>
                        {project?.status?.toUpperCase()}
                    </span>
                </div>

                {/* Task List / Plan */}
                <div className="mb-8">
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

                {/* Actions */}
                <div className="border-t border-gray-800 pt-6">
                    {steps.some(s => s.status === 'pending') && (
                        <div className="mb-4">
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
                        <div className="space-y-2">
                            <a
                                href={project.github_url}
                                target="_blank"
                                className="flex items-center justify-center gap-2 w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold border border-gray-700 transition-all"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                                View Repository
                            </a>
                            <DeployButton projectId={projectId} githubUrl={project.github_url} />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative h-full">
                {/* Header Tabs */}
                <div className="h-14 border-b border-gray-800 bg-gray-900/50 flex items-center px-6 gap-6">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`h-full text-sm font-medium border-b-2 transition-colors ${activeTab === 'chat' ? 'border-purple-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                    >
                        Architect Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`h-full text-sm font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-purple-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                    >
                        Live Preview
                    </button>
                    <button
                        onClick={() => setActiveTab('docs')}
                        className={`h-full text-sm font-medium border-b-2 transition-colors ${activeTab === 'docs' ? 'border-purple-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                    >
                        Project Docs
                    </button>
                    <button
                        onClick={() => setActiveTab('deployments')}
                        className={`h-full text-sm font-medium border-b-2 transition-colors ${activeTab === 'deployments' ? 'border-purple-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                    >
                        Deployments
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`h-full text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-purple-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                    >
                        History
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`h-full text-sm font-medium border-b-2 transition-colors ${activeTab === 'logs' ? 'border-purple-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                    >
                        Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('database')}
                        className={`h-full text-sm font-medium border-b-2 transition-colors ${activeTab === 'database' ? 'border-purple-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                    >
                        Database
                    </button>
                </div>

                {/* Generation Progress Overlay */}
                {project?.status === 'generating' && (
                    <div className="absolute top-14 inset-x-0 z-10 p-2 bg-purple-900/20 backdrop-blur-md border-b border-purple-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-3 px-4">
                            <div className="relative">
                                <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                            </div>
                            <div>
                                <p className="text-xs text-purple-200">
                                    {isExecuting ? `Executing: ${steps.find(s => s.status === 'in-progress')?.step_name || 'Tasks'}` : 'Next tasks queued...'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content based on Tab */}
                {activeTab === 'chat' ? (
                    <>
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
                    </>
                ) : activeTab === 'preview' ? (
                    <div className="flex-1 bg-black p-4">
                        <LivePreview
                            projectId={projectId}
                            className="h-full border-gray-800"
                            onElementSelect={(payload: any) => {
                                const prompt = `I want to modify the element "${payload.tagName}${payload.id ? '#' + payload.id : ''}${payload.className ? '.' + payload.className.split(' ').join('.') : ''}" which contains text "${payload.textContent}". \n\nChange it to: `;
                                setInput(prompt);
                                setActiveTab('chat');
                            }}
                        />
                    </div>
                ) : activeTab === 'deployments' ? (
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Deployment History</h2>

                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
                                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {project?.github_url && (
                                        <DeployButton projectId={projectId} githubUrl={project.github_url} />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {deployments.length === 0 ? (
                                    <div className="text-gray-500 text-center py-8 bg-gray-900/50 rounded-lg border border-gray-800">
                                        No deployments found. Sync to GitHub to see history.
                                    </div>
                                ) : (
                                    deployments.map((deploy) => (
                                        <div key={deploy.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between group hover:border-purple-500/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                {deploy.status === 'success' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                ) : deploy.status === 'failed' ? (
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                ) : (
                                                    <Clock className="w-5 h-5 text-yellow-500" />
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-white capitalize">{deploy.provider} Sync</span>
                                                        <span className="text-xs text-gray-500">• {new Date(deploy.deployed_at).toLocaleString()}</span>
                                                    </div>
                                                    <a href={deploy.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                                                        {deploy.url} <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${deploy.status === 'success' ? 'bg-green-500/10 text-green-400' :
                                                    deploy.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                                                    }`}>
                                                    {deploy.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'history' ? (
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Version History</h2>
                            <div className="space-y-4">
                                {versions.length === 0 ? (
                                    <div className="text-gray-500 text-center py-8 bg-gray-900/50 rounded-lg border border-gray-800">
                                        No history available.
                                    </div>
                                ) : (
                                    versions.map((ver) => (
                                        <div key={ver.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between group hover:border-purple-500/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">
                                                    v{ver.version}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-white">{ver.title || 'Update'}</span>
                                                        <span className="text-xs text-gray-500">• {new Date(ver.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-400">{ver.description || 'No description'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRestore(ver.id)}
                                                disabled={isRestoring === ver.id}
                                                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isRestoring === ver.id ? (
                                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <RotateCcw className="w-3 h-3" />
                                                )}
                                                Restore
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'logs' ? (
                    <div className="flex-1 overflow-hidden bg-black p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h2 className="text-sm font-mono text-gray-400">Terminal Output</h2>
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Live
                            </span>
                        </div>
                        <div className="flex-1 bg-[#0f1319] border border-gray-800 rounded-lg p-4 font-mono text-xs overflow-y-auto">
                            {logs.length === 0 ? (
                                <div className="text-gray-600 italic">Waiting for logs...</div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log.id} className="mb-1 break-all">
                                        <span className="text-gray-600 select-none mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                        <span className={
                                            log.level === 'error' ? 'text-red-400' :
                                                log.level === 'warn' ? 'text-yellow-400' :
                                                    log.message.includes('Completing') || log.message.includes('Success') ? 'text-green-400' :
                                                        'text-gray-300'
                                        }>
                                            {log.step ? `[${log.step}] ` : ''}{log.message}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : activeTab === 'database' ? (
                    <DatabaseTab projectId={projectId} />
                ) : (
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Mobile Deployment Section */}
                            <div className="md:hidden space-y-4 mb-8 p-4 bg-gray-900 border border-gray-800 rounded-lg">
                                <h2 className="text-xl font-bold text-white">Deployment</h2>
                                {project?.github_url && (
                                    <>
                                        <a
                                            href={project.github_url}
                                            target="_blank"
                                            className="flex items-center justify-center gap-2 w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold border border-gray-700 transition-all"
                                        >
                                            View Repository
                                        </a>
                                        <DeployButton projectId={projectId} githubUrl={project.github_url} />
                                    </>
                                )}
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">Project Documentation</h2>
                                <ProjectDocumentation content={readmeContent} />
                            </div>

                            <EnvVarHelper content={envContent} />
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}


