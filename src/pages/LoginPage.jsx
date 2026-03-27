import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/useAuth';
import Spinner from '../components/Spinner';
import { LogIn, Mail, Lock, Eye, EyeOff, Zap, ChevronDown } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Zia_manager', email: 'test.manager@zoiko.com', password: 'Test@1234', role: 'manager' },
  { label: 'Alice Johnson', email: 'test.emp.a@zoiko.com', password: 'Test@1234', role: 'employee' },
  { label: 'Bob Martinez', email: 'test.emp.b@zoiko.com', password: 'Test@1234', role: 'employee' },
];

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { error: loginError } = await signIn(email, password);
      if (loginError) throw loginError;

      // Wait a micro-task for context state to settle
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 0);
    } catch (err) {
      setError(err.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="login-page">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">
            <Zap size={28} color="#fff" />
          </div>
          <span className="logo-text">Zoiko.</span>
        </div>

        <h1 className="login-title">Login</h1>
        <p className="login-subtitle">View into your week's productivity and impact.</p>

        {/* Form */}
        <form onSubmit={handleLogin} className="login-form" noValidate>
          <div className="input-group">
            <span className="label-sm">Enter Your Email</span>
            <div className="input-wrap">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="email@zoiko.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <span className="label-sm">Enter Your Password</span>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowPass((s) => !s)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner size={20} /> : <><LogIn size={20} /> Enter Dashboard</>}
          </button>
        </form>

        {/* Demo quick-fill */}
        <div className="demo-section">
          <p className="label-sm" style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Demo Identities</p>
          <div className="demo-btns">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="demo-btn"
                onClick={() => fillDemo(acc)}
              >
                <div className={`avatar`} style={{ width: 32, height: 32, fontSize: 12 }}>{acc.label[0]}</div>
                <div style={{ flex: 1 }}>
                  <div className="body-md" style={{ fontWeight: 600 }}>{acc.label}</div>
                  <div className="label-sm" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{acc.role}</div>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
