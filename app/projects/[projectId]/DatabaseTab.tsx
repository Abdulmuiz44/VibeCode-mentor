
import { useState } from 'react';
import { Database, Lock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface DatabaseTabProps {
    projectId: string;
    currentConfig?: any; // To show existing config if any
}

export function DatabaseTab({ projectId, currentConfig }: DatabaseTabProps) {
    const [pat, setPat] = useState('');
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [credentials, setCredentials] = useState<{ dbUrl: string; dbPass: string; projectRef: string } | null>(null);

    const handleProvision = async () => {
        if (!pat) return;
        setIsProvisioning(true);
        setStatus('idle');
        setStatusMessage('');
        setCredentials(null);

        try {
            const res = await fetch('/api/vibecode/provision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, supabasePat: pat })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Provisioning failed');
            }

            setStatus('success');
            setStatusMessage(`Database provisioned successfully! Project Ref: ${data.projectRef}`);
            setCredentials({
                dbUrl: data.dbUrl,
                dbPass: data.dbPass,
                projectRef: data.projectRef
            });
            setPat(''); // Clear PAT for security
        } catch (err: any) {
            console.error('Provisioning error:', err);
            setStatus('error');
            setStatusMessage(err.message || 'Failed to provision database');
        } finally {
            setIsProvisioning(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-green-500/10 p-3 rounded-lg">
                        <Database className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Supabase Provisioning</h2>
                        <p className="text-gray-400">One-click backend setup for your generated app</p>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
                    {/* ... (previous inputs) ... */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4 text-sm text-blue-200">
                        <p className="flex items-start gap-2">
                            <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                            We use your Supabase Personal Access Token (PAT) to create a new project and apply the schema securely. We do not store your PAT.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-300">Supabase Access Token</span>
                            <span className="block text-xs text-gray-500 mb-2">Get it from Supabase Dashboard {'>'} Account {'>'} Access Tokens</span>
                            <input
                                type="password"
                                value={pat}
                                onChange={(e) => setPat(e.target.value)}
                                placeholder="sbp_..."
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                            />
                        </label>

                        <button
                            onClick={handleProvision}
                            disabled={!pat || isProvisioning}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {isProvisioning ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Provisioning Database...
                                </>
                            ) : (
                                <>
                                    <Database className="w-5 h-5" />
                                    Provision Backend
                                </>
                            )}
                        </button>
                    </div>

                    {status === 'success' && credentials && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded p-6 space-y-4">
                            <div className="flex items-center gap-3 text-green-300 mb-2">
                                <CheckCircle className="w-5 h-5 shrink-0" />
                                <div className="font-semibold">{statusMessage}</div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs text-gray-400 uppercase font-semibold">Database URL</p>
                                <div className="bg-black/50 p-3 rounded text-sm font-mono text-green-400 break-all select-all">
                                    {credentials.dbUrl}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs text-gray-400 uppercase font-semibold">Database Password</p>
                                <div className="bg-black/50 p-3 rounded text-sm font-mono text-green-400 select-all">
                                    {credentials.dbPass}
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                ⚠️ Save these credentials now! We do not store them. Add them to your local <code>.env</code> file.
                                The project is currently provisioning and will be ready in a few minutes.
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded p-4 flex items-center gap-3 text-red-300">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <div>{statusMessage}</div>
                        </div>
                    )}
                </div>


                <div className="border-t border-gray-800 pt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">What happens next?</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li className="flex gap-2">
                            <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5" />
                            Creates a new Supabase Project in your organization
                        </li>
                        <li className="flex gap-2">
                            <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5" />
                            Configures connection strings automatically
                        </li>
                        <li className="flex gap-2">
                            <CheckCircle className="w-4 h-4 text-gray-600 mt-0.5" />
                            Applies the generated database schema (tables & policies)
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
