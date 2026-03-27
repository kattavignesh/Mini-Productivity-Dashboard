import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="page-center flex-col gap-6">
      <ShieldOff size={56} color="#f43f5e" />
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9' }}>Access Denied</h1>
      <p style={{ color: '#94a3b8', maxWidth: 360, textAlign: 'center' }}>
        You do not have the required permissions to view this page.
      </p>
      <button className="btn-primary" style={{ width: 'auto', gap: 8 }} onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>
    </div>
  );
}
