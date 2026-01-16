'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, ExternalLink, RefreshCw, XCircle, MousePointer2 } from 'lucide-react';

export interface InspectPayload {
    tagName: string;
    id: string;
    className: string;
    innerHTML: string;
    textContent: string;
    selector: string;
}

interface LivePreviewProps {
    projectId: string;
    className?: string;
    autoRefresh?: boolean;
    onElementSelect?: (payload: InspectPayload) => void;
}

export function LivePreview({ projectId, className, autoRefresh = true, onElementSelect }: LivePreviewProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unavailable'>('loading');
    const [key, setKey] = useState(0); // For forcing iframe refresh
    const [isInspecting, setIsInspecting] = useState(false);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const fetchPreviewUrl = useCallback(async () => {
        try {
            // Fetch active sandbox for this project
            const response = await fetch(`/api/vibecode/projects/${projectId}/sandbox`);

            if (!response.ok) throw new Error('Failed to load sandbox');

            const data = await response.json();

            if (data.status === 'running' || data.status === 'ready') {
                if (data.previewUrl) {
                    setPreviewUrl(data.previewUrl);
                    setStatus('ready');
                    return true;
                } else {
                    setStatus('loading'); // Sandbox ready but no URL yet (server starting)
                    return false;
                }
            } else if (data.status === 'creating') {
                setStatus('loading');
                return false;
            } else {
                setStatus('unavailable');
                return false;
            }
        } catch (error) {
            console.error('Error fetching preview:', error);
            setStatus('error');
            return false;
        }
    }, [projectId]);

    useEffect(() => {
        if (autoRefresh) {
            fetchPreviewUrl();
            pollIntervalRef.current = setInterval(fetchPreviewUrl, 5000);
        }
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [projectId, autoRefresh, fetchPreviewUrl]);

    // Message listener for VibeDevTools
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'VIBE_ELEMENT_CLICKED' && onElementSelect) {
                // Determine if this message came from our iframe
                // Note: Security check could be stricter here
                onElementSelect(event.data.payload);
                setIsInspecting(false); // Turn off inspection after click? Or keep it on? Let's turn off for better UX
                toggleInspector(false);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onElementSelect]);

    const toggleInspector = (active: boolean) => {
        setIsInspecting(active);
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'VIBE_TOGGLE_INSPECTOR',
                active: active
            }, '*');
        }
    };

    return (
        <div className={`flex flex-col h-full w-full bg-background border border-gray-800 rounded-lg overflow-hidden ${className}`}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'ready' ? 'bg-green-500' :
                        status === 'loading' ? 'bg-yellow-500' :
                            'bg-red-500'
                        }`} />
                    <span className="text-sm font-medium text-gray-200">
                        {status === 'ready' ? 'Live Preview' :
                            status === 'loading' ? 'Starting Dev Server...' :
                                status === 'unavailable' ? 'Not Running' : 'Error'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className={`p-1.5 rounded-md transition-colors flex items-center gap-2 text-xs font-semibold ${isInspecting ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        onClick={() => toggleInspector(!isInspecting)}
                        disabled={status !== 'ready'}
                        title="Select element to fix"
                    >
                        <MousePointer2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Fix UI</span>
                    </button>

                    <div className="w-px h-4 bg-gray-700 mx-1" />

                    <button
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
                        onClick={() => {
                            setKey(k => k + 1);
                            setIsInspecting(false); // Reset inspection on refresh
                        }}
                        disabled={status !== 'ready'}
                        title="Refresh Preview"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>

                    {previewUrl && (
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in New Tab"
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                </div>
            </div>

            <div className="flex-1 relative bg-white dark:bg-zinc-950">
                {status === 'loading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-gray-950">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                        <p className="text-sm text-gray-400">Waiting for sandbox...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-gray-950">
                        <XCircle className="h-8 w-8 text-red-500" />
                        <p className="text-sm text-gray-400">Failed to load preview</p>
                        <button
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
                            onClick={fetchPreviewUrl}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {status === 'unavailable' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-center p-6 bg-gray-950">
                        <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-2">
                            <Loader2 className="h-8 w-8 text-gray-500" />
                        </div>
                        <h3 className="font-medium text-white">App Not Running</h3>
                        <p className="text-sm text-gray-400 max-w-xs">
                            The development server hasn't started yet. Run a build to see the preview.
                        </p>
                    </div>
                )}

                {previewUrl && (
                    <iframe
                        ref={iframeRef}
                        key={key}
                        src={previewUrl}
                        className="w-full h-full border-0 bg-white"
                        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write"
                        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                    />
                )}
            </div>
        </div>
    );
}
