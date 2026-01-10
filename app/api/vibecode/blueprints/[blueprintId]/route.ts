import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ blueprintId: string }> }
) {
    try {
        const { blueprintId } = await params;

        const { data, error } = await supabase
            .from('blueprints')
            .select('*')
            .eq('id', blueprintId)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
