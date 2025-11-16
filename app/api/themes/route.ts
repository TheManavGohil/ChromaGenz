import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Theme from '@/models/Theme';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// GET all themes
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const themes = await Theme.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ themes }, { status: 200 });
  } catch (error: any) {
    console.error('Get themes error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new theme (admin only)
export async function POST(request: NextRequest) {
  try {
    const { name, colors, tags, userId } = await request.json();

    // Validate input
    if (!name || !colors || !Array.isArray(colors) || colors.length === 0) {
      return NextResponse.json(
        { error: 'Theme name and at least one color are required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if user exists and is admin
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create themes' },
        { status: 403 }
      );
    }

    // Create theme
    const theme = await Theme.create({
      name,
      colors,
      tags: tags || [],
      createdBy: userId,
    });

    const populatedTheme = await Theme.findById(theme._id)
      .populate('createdBy', 'username')
      .lean();

    return NextResponse.json(
      { message: 'Theme created successfully', theme: populatedTheme },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create theme error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

