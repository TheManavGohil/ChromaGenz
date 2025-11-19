import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const palettes = await prisma.palette.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ palettes }, { status: 200 });
  } catch (error: any) {
    console.error('Postgres palettes GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch palettes from PostgreSQL',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, tags = [], colors = [] } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Palette name is required' }, { status: 400 });
    }

    if (!Array.isArray(colors) || colors.length === 0) {
      return NextResponse.json(
        { error: 'At least one color hex is required' },
        { status: 400 }
      );
    }

    const sanitizedColors = colors.map((color: string) => color.trim().toUpperCase());

    const palette = await prisma.palette.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        tags: Array.isArray(tags)
          ? tags.map((tag: string) => tag.trim()).filter(Boolean)
          : [],
        colors: sanitizedColors,
      },
    });

    return NextResponse.json({ palette }, { status: 201 });
  } catch (error: any) {
    console.error('Postgres palettes POST error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create palette',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

