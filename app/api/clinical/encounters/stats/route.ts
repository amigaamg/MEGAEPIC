import { NextResponse } from 'next/server';
import { db } from '@/lib/amexan/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await db.getDashboardStats();
    return NextResponse.json(stats);
  } catch (e) {
    console.error('[API stats]', e);
    return NextResponse.json({
      activeEncounters: 0, totalPatients: 0, totalClinicians: 0, todayEncounters: 0,
    });
  }
}
