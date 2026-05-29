import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { encounterId, patientId, chiefComplaint, findings, assessment } = body;

    const note = [
      `# Clinical Summary — Encounter ${encounterId || 'NEW'}`,
      '',
      `**Patient:** ${patientId || 'Unknown'}`,
      `**Date:** ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      `**CC:** ${chiefComplaint || 'Not specified'}`,
      '',
      '## History of Presenting Complaint',
      `${findings?.history || 'Patient presents for clinical evaluation.'}`,
      '',
      '## Examination Findings',
      `${findings?.exam || 'Vitals within normal limits. No significant findings on examination.'}`,
      '',
      '## Assessment',
      `${assessment || 'Awaiting assessment.'}`,
      '',
      '## Plan',
      '- Monitor clinical progress',
      '- Review investigations results',
      '- Follow-up as scheduled',
    ].join('\n');

    return NextResponse.json({
      note,
      wordCount: note.split(/\s+/).length,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Could not generate note' }, { status: 400 });
  }
}
