'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getCollaborationComments, addCollaborationComment } from '@/lib/supabaseDB';
import { CollaborationComment } from '@/types/blueprint';

interface CommentsSectionProps {
    blueprintId: number;
}

export default function CommentsSection({ blueprintId }: CommentsSectionProps) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<CollaborationComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadComments = async () => {
            setLoading(true);
            const data = await getCollaborationComments(blueprintId);
            setComments(data);
            setLoading(false);
        };
        loadComments();
    }, [blueprintId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !session?.user?.name) return;

        setSubmitting(true);
        const comment = await addCollaborationComment(
            blueprintId,
            session.user.name,
            newComment.trim()
        );

        if (comment) {
            setComments([...comments, comment]);
            setNewComment('');
        }
        setSubmitting(false);
    };

    if (loading) {
        return <div className="text-center py-4 text-gray-400">Loading comments...</div>;
    }

    return (
        <div className="mt-8 border-t border-gray-800 pt-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                Team Comments
            </h3>

            <div className="space-y-4 mb-6">
                {comments.length === 0 ? (
                    <p className="text-gray-500 italic">No comments yet. Start the discussion!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-blue-400">{comment.author}</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(comment.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            {session ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-800/30 rounded-lg p-4 text-center text-gray-400">
                    Please sign in to join the discussion.
                </div>
            )}
        </div>
    );
}
