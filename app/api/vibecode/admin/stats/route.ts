
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/lib/authOptions";

// Initialize Supabase Admin client to access auth schema
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'abdulmuizzadeyemo@gmail.com'; // Fallback or strict

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Total Projects
        const { count: projectCount, error: projectError } = await supabaseAdmin
            .from('projects')
            .select('*', { count: 'exact', head: true });

        if (projectError) throw projectError;

        // 2. Total Users (from auth.users)
        // Note: listUsers is an admin function
        const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();

        if (userError) throw userError;

        // 3. Active Builds (Mock or query 'generating' status)
        const { count: activeBuilds, error: buildError } = await supabaseAdmin
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'generating');

        return NextResponse.json({
            totalUsers: users.length, // Pagination might be needed for huge apps, but fine for now
            totalProjects: projectCount,
            activeBuilds: activeBuilds || 0,
        });

    } catch (error: any) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
