import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const slot = await prisma.slot.findUnique({
      where: {
        id: params.id,
      },
    });
    
    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(slot, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch slot' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    
    if (!data.title || !data.startTime || !data.endTime || !data.testLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const updatedSlot = await prisma.slot.update({
      where: {
        id: params.id,
      },
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        testLink: data.testLink,
        linkEnabled: data.linkEnabled || false,
        departments: data.departments || [],
        years: data.years || [],
        description: data.description || null,
      },
    });
    
    return NextResponse.json(updatedSlot, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update slot' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.slot.delete({
      where: {
        id: params.id,
      },
    });
    
    return NextResponse.json({ message: 'Slot deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete slot' },
      { status: 500 }
    );
  }
}