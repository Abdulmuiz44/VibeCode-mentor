import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { generateProjectCode } from '@/lib/hub/generator';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/lib/authOptions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch the project blueprint
    // Assuming 'projects' table has a 'blueprint' column or linked 'blueprints' table
    // For Phase 1 schema, we check 'projects' or 'blueprints'
    const { data: project, error } = await supabase
      .from('projects')
      .select('blueprint_id, blueprints(blueprint)') // Adjust based on exact schema relation
      .eq('id', params.id)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: 'Project or blueprint not found' }, { status: 404 });
    }

    // Extract blueprint content (handling potential nested structure)
    const blueprintContent = (project as any).blueprints?.blueprint || ""; 

    // 2. Run the generator
    const result = await generateProjectCode(session.user.id, params.id, blueprintContent);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}