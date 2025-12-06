/**
 * Centralized Pro Status Hook
 * Fetches Pro status from Supabase database for logged-in users
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function useProStatus() {
    const { data: session } = useSession();
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProStatus() {
            setLoading(true);

            if (!session?.user?.id) {
                // Not logged in - definitely not Pro
                setIsPro(false);
                setLoading(false);
                return;
            }

            try {
                // Check Supabase database
                const { getProStatusFromCloud } = await import('@/lib/supabaseDB');
                const cloudProStatus = await getProStatusFromCloud(session.user.id);
                setIsPro(cloudProStatus);
            } catch (error) {
                console.error('Error fetching Pro status:', error);
                setIsPro(false);
            }

            setLoading(false);
        }

        fetchProStatus();
    }, [session?.user?.id]);

    return { isPro, loading };
}
