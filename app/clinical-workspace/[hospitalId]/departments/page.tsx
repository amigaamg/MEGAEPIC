'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useFirebaseDepartmentStats } from '@/src/hooks/useFirebaseDepartmentStats';
import DepartmentList from '@/src/components/departments/department-list';

const CATEGORIES = ['medical', 'surgical', 'paediatric', 'obstetric', 'emergency', 'psychiatric', 'diagnostic', 'dermatology'];

export default function DepartmentsPage() {
  const params = useParams();
  const hospitalId = params?.hospitalId as string;
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { departments, loading } = useFirebaseDepartmentStats();

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>
          All Departments
        </h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>
          {departments.length} departments · {loading ? 'Loading...' : 'Live data from Firestore'} · Browse by category or search
        </p>
      </div>

      <DepartmentList
        departments={departments}
        hospitalId={hospitalId}
        search={search}
        onSearchChange={setSearch}
        categories={CATEGORIES}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
      />
    </div>
  );
}
