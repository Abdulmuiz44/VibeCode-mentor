
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/lib/authOptions";

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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'abdulmuizzadeyemo@gmail.com';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch all projects, perhaps with user info (join usually tricky with auth.users, better to just list)
        // We'll trust the user_id exists in auth.users
        const { data: projects, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50); // Pagination later

        if (error) throw error;

        return NextResponse.json(projects);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
