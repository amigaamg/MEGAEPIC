import { useState } from 'react';
import PrintModal from './PrintModal';

export default function PrintButton({ patientId }: { patientId: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{ marginTop: 16, width: '100%', padding: 8, background: '#6c757d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700 }}
      >
        🖨️ Print / Export
      </button>
      {showModal && <PrintModal patientId={patientId} onClose={() => setShowModal(false)} />}
    </>
  );
}