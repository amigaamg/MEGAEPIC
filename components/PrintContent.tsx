import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function PrintContent({
  patientId,
  includeMonitoring,
  includeNotes,
  includePrescriptions,
  includeLabs,
  includeImaging,
  includeReferrals,
  dateRange
}: any) {

  const [data, setData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const results: any = {};

      if (includeNotes) {
        const q = query(
          collection(db, 'clinicalNotes'),
          where('patientId', '==', patientId),
          orderBy('createdAt', 'desc')
        );

        results.notes = (await getDocs(q)).docs.map(d => d.data());
      }

      // other collections here...

      setData(results);
    };

    fetchData();

  }, [
    patientId,
    includeMonitoring,
    includeNotes,
    includePrescriptions,
    includeLabs,
    includeImaging,
    includeReferrals,
    dateRange
  ]);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Patient Report</h1>

      {includeNotes && (
        <div>
          <h2>Clinical Notes</h2>
          {data.notes?.map((n: any, i: number) => (
            <div key={i}>{/* render note */}</div>
          ))}
        </div>
      )}

    </div>
  );
}