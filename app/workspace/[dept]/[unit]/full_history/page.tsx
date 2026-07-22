'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { ThemeProvider, useTheme } from '@/src/ui/themes/ThemeProvider';
import { MainLayout } from '@/src/ui/layouts/MainLayout';
import { usePatientStore } from '@/src/state/patientStore';
import { ConstitutionalAssessment } from '@/components/clinical/ConstitutionalAssessment';

function useT() {
  const theme = useTheme();
  return { ...theme.colors, font: theme.typography.font, mono: theme.typography.mono, id: theme.id };
}

// ===== MAIN PAGE =====
export default function FullHistoryPage() {
  const raw = useParams();
  const params = raw || {};
  const deptKey = typeof params.dept === 'string' ? params.dept.toUpperCase() : '';
  const { form } = usePatientStore();
  const ageMonths = parseInt(form.biodata.ageMonths || '0');
  const sex = form.biodata.sex || 'Unknown';

  return (
    <ThemeProvider>
      <MainLayout>
        <ConstitutionalAssessment
          ageMonths={ageMonths}
          sex={sex}
          department={deptKey}
        />
      </MainLayout>
    </ThemeProvider>
  );
}
