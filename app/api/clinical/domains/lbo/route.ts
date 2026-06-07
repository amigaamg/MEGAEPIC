import { NextRequest, NextResponse } from 'next/server';
import { runLboEngine } from '@/src/engine/domains/lbo/api/lbo-api';
import type { LboApiOutput } from '@/src/engine/domains/lbo/api/lbo-api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fullData = body._fullData;

    const result: LboApiOutput = runLboEngine(body, fullData);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
