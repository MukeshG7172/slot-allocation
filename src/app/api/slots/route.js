import prisma from '../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const slots = await prisma.slot.findMany({
      orderBy: {
        startTime: 'asc',
      },
    });
    return NextResponse.json(slots, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}
