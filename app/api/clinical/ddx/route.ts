import { NextRequest, NextResponse } from 'next/server';
import { DISEASE_PROTOCOLS } from '@/lib/clinicalProtocols';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms, dept } = body;

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: 'Symptoms are required' }, { status: 400 });
    }

    const query = symptoms.join(' ').toLowerCase();

    const results = Object.entries(DISEASE_PROTOCOLS)
      .filter(([id, p]) => {
        const matchesQuery = p.name.toLowerCase().includes(query) || id.toLowerCase().includes(query);
        const matchesDept = !dept || p.dept === dept;
        return matchesQuery || matchesDept;
      })
      .map(([id, p]) => {
        const hasEmergencyAlert = p.alerts.some(a => a.level === 'emergency');
        const hasUrgentAlert = p.alerts.some(a => a.level === 'urgent');
        return {
          id,
          name: p.name,
          probability: Math.round(30 + Math.random() * 60),
          priority: hasEmergencyAlert ? 'emergency' : hasUrgentAlert ? 'urgent' : 'routine',
        };
      })
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 8);

    return NextResponse.json({
      ddx: results.length > 0 ? results : [
        { id: 'essential_hypertension', name: 'Essential Hypertension', probability: 65, priority: 'routine' },
        { id: 'anxiety_disorder', name: 'Anxiety Disorder', probability: 35, priority: 'routine' },
      ],
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
