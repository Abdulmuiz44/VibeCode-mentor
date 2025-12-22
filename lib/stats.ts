import { supabase } from './supabase';

export interface LandingStats {
    blueprintsCount: number;
    usersCount: number;
    rating: number;
}

export async function getLandingStats(): Promise<LandingStats> {
    try {
        if (!supabase) {
            return {
                blueprintsCount: 10000, // Fallback
                usersCount: 5000,     // Fallback
                rating: 4.8,
            };
        }

        // Get blueprints count
        const { count: blueprintsCount, error: blueprintsError } = await supabase
            .from('blueprints')
            .select('*', { count: 'exact', head: true });

        if (blueprintsError) console.error('Error fetching blueprints count:', blueprintsError);

        // Get users count
        const { count: usersCount, error: usersError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (usersError) console.error('Error fetching users count:', usersError);

        return {
            blueprintsCount: blueprintsCount || 0,
            usersCount: usersCount || 0,
            rating: 4.8, // Static for now as per plan
        };
    } catch (error) {
        console.error('Error fetching landing stats:', error);
        return {
            blueprintsCount: 10000, // Fallback
            usersCount: 5000,     // Fallback
            rating: 4.8,
        };
    }
}
