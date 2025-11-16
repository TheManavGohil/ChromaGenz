import { NextResponse } from 'next/server';

export async function POST() {
  // Since we're using client-side storage, logout is handled on the client
  // This endpoint exists for consistency and future server-side session management
  return NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );
}


