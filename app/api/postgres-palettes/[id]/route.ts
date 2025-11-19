import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const palette = await prisma.palette.findUnique({
      where: { id: params.id },
    });

    if (!palette) {
      return NextResponse.json({ error: 'Palette not found' }, { status: 404 });
    }

    return NextResponse.json({ palette }, { status: 200 });
  } catch (error: any) {
    console.error('Postgres palettes GET by ID error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch palette',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { name, description, tags, colors } = body;

    const existing = await prisma.palette.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Palette not found' }, { status: 404 });
    }

    const data: {
      name?: string;
      description?: string | null;
      tags?: string[];
      colors?: string[];
    } = {};

    if (name) data.name = name.trim();
    if (description !== undefined) data.description = description?.trim() || null;
    if (Array.isArray(tags)) {
      data.tags = tags.map((tag: string) => tag.trim()).filter(Boolean);
    }
    if (Array.isArray(colors) && colors.length > 0) {
      data.colors = colors.map((color: string) => color.trim().toUpperCase());
    }

    const palette = await prisma.palette.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ palette }, { status: 200 });
  } catch (error: any) {
    console.error('Postgres palettes PUT error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update palette',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  try {
    await prisma.palette.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Palette deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('Postgres palettes DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete palette',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

