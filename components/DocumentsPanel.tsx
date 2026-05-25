import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function DocumentsPanel({ patientId }: { patientId: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'patientDocuments'),
      where('patientId', '==', patientId),
      orderBy('uploadedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [patientId]);

  // Replace with real Upload Care logic
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // Simulated upload – replace with actual Upload Care call
    const fakeUrl = URL.createObjectURL(file);
    await addDoc(collection(db, 'patientDocuments'), {
      patientId,
      url: fakeUrl,
      type: file.type,
      description: 'Uploaded by doctor',
      uploadedAt: serverTimestamp(),
    });
    setUploading(false);
  };

  return (
    <div style={{ marginTop: 24, background: '#fff', border: '1px solid #e2e9f3', borderRadius: 16, padding: 12 }}>
      <div style={{ fontWeight: 800, marginBottom: 12 }}>📄 Documents</div>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {uploading && <div>Uploading…</div>}
      <div style={{ marginTop: 8 }}>
        {docs.map(doc => (
          <div key={doc.id} style={{ marginBottom: 4 }}>
            <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.url}</a>
          </div>
        ))}
      </div>
    </div>
  );
}