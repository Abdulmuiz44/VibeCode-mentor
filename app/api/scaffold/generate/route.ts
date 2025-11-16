import { NextRequest, NextResponse } from 'next/server';
import { generateScaffoldZip } from '@/lib/scaffold';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blueprint } = body;

    if (!blueprint) {
      return NextResponse.json(
        { error: 'Blueprint data is required' },
        { status: 400 }
      );
    }

    // Generate the ZIP file
    const zipBuffer = await generateScaffoldZip(blueprint);

    // Return as downloadable file
    return new NextResponse(zipBuffer as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${blueprint.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-scaffold.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating scaffold:', error);
    return NextResponse.json(
      { error: 'Failed to generate scaffold' },
      { status: 500 }
    );
  }
}
