import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiUserPlus, FiTrash2, FiX, FiLock, FiLoader } from 'react-icons/fi';

const Team = () => {
  const { user, organization, refreshProfile } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  
  // Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/team');
      setMembers(res.data);
    } catch (err) {
      console.error('Fetch team failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [organization?.seatsUsed]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setError(null);
    try {
      await api.post('/team/invite', {
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });
      await refreshProfile();
      await fetchMembers();
      
      // Reset form
      setInviteName('');
      setInviteEmail('');
      setInviteRole('Member');
      setInviteOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite team member.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await api.put(`/team/${memberId}/role`, { role: newRole });
      await fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update member role.');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this team member? This will release one seat in your billing quota.')) {
      return;
    }
    
    try {
      await api.delete(`/team/${memberId}`);
      await refreshProfile();
      await fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const isOwner = user.role === 'Owner';

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Team Management</h1>
          <p>
            Manage active members and role access controls. Current Seat Allocation:{' '}
            <strong>{organization.seatsUsed}</strong> of <strong>{organization.seatLimit}</strong> seats assigned.
          </p>
        </div>

        {isOwner ? (
          <button 
            onClick={() => setInviteOpen(true)} 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiUserPlus />
            <span>Invite Team Member</span>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px', color: 'var(--text-sub)' }}>
            <FiLock size={14} />
            <span>Invites restricted to Workspace Owner</span>
          </div>
        )}
      </div>

      {/* Roster Table Card */}
      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '24px' }}>Loading team members...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>System Role</th>
                  {isOwner && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const isSelf = m._id === user.id;
                  return (
                    <tr key={m._id}>
                      <td style={{ fontWeight: 600 }}>
                        {m.name} {isSelf && <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '12px' }}>(You)</span>}
                      </td>
                      <td>{m.email}</td>
                      <td>
                        {isOwner && !isSelf ? (
                          <select
                            value={m.role}
                            onChange={(e) => handleRoleChange(m._id, e.target.value)}
                            className="input-control"
                            style={{ padding: '6px 12px', fontSize: '13px', width: '150px' }}
                          >
                            <option value="Owner">Owner</option>
                            <option value="Billing Admin">Billing Admin</option>
                            <option value="Member">Member</option>
                          </select>
                        ) : (
                          <span 
                            className="badge"
                            style={{ 
                              backgroundColor: m.role === 'Owner' ? 'var(--accent-light)' : 'var(--bg-hover)',
                              color: m.role === 'Owner' ? 'var(--accent-primary)' : 'var(--text-sub)',
                              textTransform: 'capitalize'
                            }}
                          >
                            {m.role}
                          </span>
                        )}
                      </td>
                      {isOwner && (
                        <td style={{ textAlign: 'right' }}>
                          {!isSelf && m.role !== 'Owner' ? (
                            <button
                              onClick={() => handleRemoveMember(m._id)}
                              className="btn btn-secondary"
                              style={{ 
                                padding: '6px 10px', 
                                color: 'var(--danger)', 
                                borderColor: 'var(--border-light)',
                                background: 'transparent'
                              }}
                              title="Remove user"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Protected</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Member Dialog Modal */}
      {inviteOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'rgba(15, 23, 42, 0.4)', 
            backdropFilter: 'blur(4px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="card animate-fade-in" 
            style={{ 
              width: '100%', 
              maxWidth: '480px', 
              padding: '32px', 
              backgroundColor: 'white',
              boxShadow: 'var(--shadow-premium)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiUserPlus style={{ color: 'var(--accent-primary)' }} />
                Invite Workspace Member
              </h3>
              <button 
                onClick={() => setInviteOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <FiX size={20} />
              </button>
            </div>

            {error && (
              <div 
                style={{ 
                  padding: '12px', 
                  backgroundColor: 'var(--danger-light)', 
                  color: 'var(--danger)', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  marginBottom: '16px',
                  border: '1px solid rgba(239,68,68,0.1)'
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Show Seat Alert within Modal */}
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px' }}>
                Seats Assigned: <strong>{organization.seatsUsed} / {organization.seatLimit}</strong> available.
                {organization.seatsUsed >= organization.seatLimit && (
                  <span style={{ color: 'var(--danger)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                    * Seat limit reached! You must upgrade your subscription first.
                  </span>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dave Wilson"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="input-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="dave@acme.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Assign Role Access</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="input-control"
                >
                  <option value="Member">Member (Read-only)</option>
                  <option value="Billing Admin">Billing Admin (Finance controls)</option>
                  <option value="Owner">Owner (Full access)</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', marginTop: '8px' }}
                disabled={inviteLoading || organization.seatsUsed >= organization.seatLimit}
              >
                {inviteLoading ? <FiLoader className="animate-spin" /> : 'Invite Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
