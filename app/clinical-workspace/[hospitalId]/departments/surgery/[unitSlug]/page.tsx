'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { UnitDashboard } from '@/src/components/surgery/UnitDashboard';

export default function SurgeryUnitPage() {
  const params = useParams();
  const hospitalId = params?.hospitalId as string;
  const unitSlug = params?.unitSlug as string;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 capitalize">
          {unitSlug?.replace(/-/g, ' ')}
        </h1>
        <p className="text-sm text-gray-500">Surgery Unit — Clinical Reasoning Dashboard</p>
      </div>

      <UnitDashboard
        hospitalId={hospitalId}
        departmentSlug="surgery"
        unitSlug={unitSlug}
      />
    </div>
  );
}
