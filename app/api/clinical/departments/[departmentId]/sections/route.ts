import { NextRequest, NextResponse } from 'next/server';
import { DISEASE_CATALOGUE } from '@/lib/diseases';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  const { departmentId } = await params;
  const deptKey = departmentId.toUpperCase();

  const allSections = Object.entries(DISEASE_CATALOGUE).map(([slug, diseases]) => ({
    slug,
    label: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    diseaseCount: diseases.length,
  }));

  const sections = allSections.filter(s =>
    DISEASE_CATALOGUE[s.slug]?.some(d => d.departmentKey === deptKey)
  );

  return NextResponse.json({ departmentId, sections });
}
