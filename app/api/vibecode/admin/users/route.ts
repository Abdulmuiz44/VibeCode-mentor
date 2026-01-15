
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
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) throw error;

        // Enhance user data with project counts if needed (skip for now for speed)
        const simplifiedUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in: u.last_sign_in_at,
            provider: u.app_metadata.provider || 'email',
        }));

        return NextResponse.json(simplifiedUsers);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
