/**
 * Centralized Pro Status Hook
 * Fetches Pro status and admin status from Supabase database for logged-in users
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function useProStatus() {
    const { data: session } = useSession();
    const [isPro, setIsPro] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProStatus() {
            setLoading(true);

            if (!session?.user?.id) {
                // Not logged in - definitely not Pro or Admin
                setIsPro(false);
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                // Check admin status first via API
                const adminResponse = await fetch('/api/admin/status');
                if (adminResponse.ok) {
                    const adminData = await adminResponse.json();
                    setIsAdmin(adminData.isAdmin || false);
                    setIsPro(adminData.isPro || false);
                } else {
                    // Fallback to Supabase check
                    const { getProStatusFromCloud } = await import('@/lib/supabaseDB');
                    const cloudProStatus = await getProStatusFromCloud(session.user.id);
                    setIsPro(cloudProStatus);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error('Error fetching Pro/Admin status:', error);
                setIsPro(false);
                setIsAdmin(false);
            }

            setLoading(false);
        }

        fetchProStatus();
    }, [session?.user?.id]);

    // Admin is automatically Pro
    const effectivelyPro = isPro || isAdmin;

    return { isPro: effectivelyPro, isAdmin, loading };
}
