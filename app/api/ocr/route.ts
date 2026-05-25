import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imageUrl);
    await worker.terminate();

    return NextResponse.json({ text: text.trim() });
  } catch (e: any) {
    console.error('OCR failed:', e);
    return NextResponse.json({ error: e.message || 'OCR processing failed' }, { status: 500 });
  }
}
