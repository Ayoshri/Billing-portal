import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiBriefcase, FiUser, FiZap, FiLoader } from 'react-icons/fi';

const Login = () => {
  const { login, register, seedAcmeCorp, error, setError } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await register(name, email, password, orgName);
      } else {
        await login(email, password);
      }
    } catch (err) {
      // Handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeedLoading(true);
    setError(null);
    setSeedSuccessMsg(null);
    try {
      const msg = await seedAcmeCorp();
      setSeedSuccessMsg(msg);
    } catch (err) {
      // Handled by context
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        padding: '20px', 
        background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%)' 
      }}
    >
      <div 
        className="card animate-fade-in" 
        style={{ 
          width: '100%', 
          maxWidth: '460px', 
          boxShadow: 'var(--shadow-premium)', 
          padding: '40px',
          backgroundColor: 'white'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, var(--accent-primary), #818cf8)', 
              borderRadius: '12px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
            }}
          >
            <FiZap size={24} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>
            {isRegister ? 'Create your workspace' : 'Welcome back'}
          </h1>
          <p style={{ color: 'var(--text-sub)' }}>
            {isRegister ? 'Get started with ChargeUp SaaS billing' : 'Access your role-based billing dashboard'}
          </p>
        </div>

        {error && (
          <div 
            style={{ 
              padding: '12px 16px', 
              backgroundColor: 'var(--danger-light)', 
              color: 'var(--danger)', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '13px', 
              fontWeight: 500,
              marginBottom: '20px',
              border: '1px solid rgba(239,68,68,0.1)'
            }}
          >
            {error}
          </div>
        )}

        {seedSuccessMsg && (
          <div 
            style={{ 
              padding: '12px 16px', 
              backgroundColor: 'var(--success-light)', 
              color: 'var(--success)', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '13px', 
              fontWeight: 500,
              marginBottom: '20px',
              border: '1px solid rgba(16,185,129,0.1)'
            }}
          >
            {seedSuccessMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <FiUser style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alice Smith"
                    className="input-control"
                    style={{ paddingLeft: '44px', width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Company / Organization</label>
                <div style={{ position: 'relative' }}>
                  <FiBriefcase style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Acme Corp"
                    className="input-control"
                    style={{ paddingLeft: '44px', width: '100%' }}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-control"
                style={{ paddingLeft: '44px', width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-control"
                style={{ paddingLeft: '44px', width: '100%' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? <FiLoader className="animate-spin" /> : (isRegister ? 'Register' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>

        <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-light)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>OR TESTING</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-light)' }} />
        </div>

        {/* Seeding & Instant Demo button */}
        <button
          onClick={handleSeed}
          className="btn btn-secondary"
          style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            borderColor: 'var(--accent-light)',
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--accent-primary)'
          }}
          disabled={seedLoading}
        >
          {seedLoading ? <FiLoader className="animate-spin" /> : <FiZap size={16} />}
          <span>Quick Demo: Seed & Auto-Login as Owner</span>
        </button>
        <p style={{ fontSize: '11px', textAlign: 'center', color: 'var(--text-muted)', marginTop: '8px' }}>
          Instantly populates user accounts (Owner, Billing Admin, Member) and sets up a mock organization.
        </p>
      </div>
    </div>
  );
};

export default Login;
