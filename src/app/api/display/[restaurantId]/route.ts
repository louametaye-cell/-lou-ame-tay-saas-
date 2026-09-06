import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() { return NextResponse.json({ success: true, data: [] }); }
export async function POST() { return NextResponse.json({ success: true }); }
export async function PATCH() { return NextResponse.json({ success: true }); }