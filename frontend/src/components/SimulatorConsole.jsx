import React, { useState } from 'react';
import { FiSliders, FiX, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const SimulatorConsole = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, login, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  if (!user) return null;

  const handleSimulateStatus = async (status) => {
    setLoading(true);
    setMsg(null);
    try {
      // Simulate status change
      const res = await api.post('/billing/simulate/status', { status });
      setMsg({ type: 'success', text: res.data.message });
      await refreshProfile();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to simulate status.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateUsage = async (storageAdd, apiCallsAdd) => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.post('/billing/simulate/usage', { storageAdd, apiCallsAdd });
      setMsg({ type: 'success', text: res.data.message });
      await refreshProfile();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to simulate usage.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleEmail) => {
    setLoading(true);
    setMsg(null);
    try {
      const password = roleEmail === 'owner@acme.com' ? 'alice123' : 'password123';
      await login(roleEmail, password);
      setMsg({ type: 'success', text: `Switched session to ${roleEmail}` });
    } catch (err) {
      setMsg({ type: 'error', text: 'Quick session switch failed. Seeding may be required.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="simulator-trigger" 
        title="Open Billing Simulator"
      >
        {isOpen ? <FiX size={20} /> : <FiSliders size={20} />}
      </button>

      {isOpen && (
        <div className="simulator-panel animate-fade-in">
          <div className="simulator-header">
            <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSliders size={16} />
              Billing Simulator
            </h3>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="simulator-body">
            {msg && (
              <div 
                style={{ 
                  padding: '10px', 
                  borderRadius: '6px', 
                  fontSize: '12px',
                  backgroundColor: msg.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                  color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)',
                  border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                }}
              >
                {msg.text}
              </div>
            )}

            {/* Section 1: Role Swapping */}
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Quick Session Switch
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                <button 
                  onClick={() => handleQuickLogin('owner@acme.com')}
                  className="simulator-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                  disabled={loading}
                >
                  <FiUser size={13} />
                  Switch to Owner (Alice)
                </button>
                <button 
                  onClick={() => handleQuickLogin('billing@acme.com')}
                  className="simulator-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                  disabled={loading}
                >
                  <FiUser size={13} />
                  Switch to Billing Admin (Bob)
                </button>
                <button 
                  onClick={() => handleQuickLogin('member@acme.com')}
                  className="simulator-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                  disabled={loading}
                >
                  <FiUser size={13} />
                  Switch to Member (Charlie)
                </button>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }} />

            {/* Section 2: Simulate Payment Failures */}
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Simulate Payment Failures
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button 
                  onClick={() => handleSimulateStatus('past_due')}
                  className="simulator-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flex: 1, color: 'var(--warning)', borderColor: 'var(--warning-light)' }}
                  disabled={loading || user.role !== 'Owner'}
                  title={user.role !== 'Owner' ? 'Requires Owner role' : ''}
                >
                  <FiAlertTriangle size={13} />
                  Fail Pay
                </button>
                <button 
                  onClick={() => handleSimulateStatus('active')}
                  className="simulator-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flex: 1, color: 'var(--success)', borderColor: 'var(--success-light)' }}
                  disabled={loading || user.role !== 'Owner'}
                  title={user.role !== 'Owner' ? 'Requires Owner role' : ''}
                >
                  <FiCheckCircle size={13} />
                  Recover
                </button>
              </div>
              {user.role !== 'Owner' && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  * Payment simulation requires Owner role.
                </span>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }} />

            {/* Section 3: Simulate Quota Growth */}
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Simulate Usage Quotas
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button 
                  onClick={() => handleSimulateUsage(1.5, 0)}
                  className="simulator-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flex: 1 }}
                  disabled={loading || user.role !== 'Owner'}
                >
                  <FiTrendingUp size={13} />
                  +1.5GB Storage
                </button>
                <button 
                  onClick={() => handleSimulateUsage(0, 2000)}
                  className="simulator-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flex: 1 }}
                  disabled={loading || user.role !== 'Owner'}
                >
                  <FiTrendingUp size={13} />
                  +2K API Calls
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SimulatorConsole;
