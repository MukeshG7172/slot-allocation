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

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.title || !data.startTime || !data.endTime || !data.testLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const slot = await prisma.slot.create({
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        testLink: data.testLink,
        description: data.description || null,
      },
    });
    
    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create slot' },
      { status: 500 }
    );
  }
}