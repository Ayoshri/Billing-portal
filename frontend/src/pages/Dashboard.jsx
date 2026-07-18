import React from 'react';
import { useAuth } from '../context/AuthContext';
import UsageProgress from '../components/UsageProgress';
import { FiBriefcase, FiCalendar, FiCreditCard, FiShield, FiAlertTriangle } from 'react-icons/fi';

const Dashboard = ({ setActiveTab }) => {
  const { user, organization } = useAuth();

  if (!user || !organization) return null;

  // Formatting date nicely
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'past_due':
        return <span className="badge badge-warning">Past Due</span>;
      case 'canceled':
        return <span className="badge badge-danger">Canceled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p style={{ fontSize: '15px' }}>
          Manage your workspace, usage quotas, and subscription details.
        </p>
      </div>

      {/* Subscription Warning Banners */}
      {organization.subscriptionStatus === 'past_due' && (
        <div className="alert-banner alert-banner-warning">
          <FiAlertTriangle size={24} style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Action Required: Unpaid Balance</h4>
            <p style={{ color: 'inherit', margin: '4px 0 0 0', fontSize: '13px' }}>
              Your workspace payment was declined. Please resolve the outstanding invoices in the{' '}
              <button 
                onClick={() => setActiveTab('billing')} 
                style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Billing
              </button>{' '}
              tab to avoid account suspension.
            </p>
          </div>
        </div>
      )}

      {organization.subscriptionStatus === 'canceled' && (
        <div className="alert-banner alert-banner-danger">
          <FiAlertTriangle size={24} style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Workspace Suspended</h4>
            <p style={{ color: 'inherit', margin: '4px 0 0 0', fontSize: '13px' }}>
              Your subscription is canceled. Premium limits have been locked. Please go to the{' '}
              <button 
                onClick={() => setActiveTab('billing')} 
                style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Billing
              </button>{' '}
              tab to re-subscribe and reactivate your dashboard.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Organization Info Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiBriefcase style={{ color: 'var(--accent-primary)' }} />
                {organization.name}
              </h2>
              {getStatusBadge(organization.subscriptionStatus)}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiCreditCard style={{ color: 'var(--text-muted)' }} />
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Active Plan</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{organization.plan} Plan</span>
                </div>
              </div>

              {organization.plan !== 'Free' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiCalendar style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Next Billing Date</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{formatDate(organization.billingCycleEnd)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiShield style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
              Your Access Role:{' '}
              <strong style={{ color: 'var(--accent-primary)', textTransform: 'capitalize' }}>
                {user.role}
              </strong>
            </span>
          </div>
        </div>

        {/* Plan Upgrade Banner Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, #ffffff 0%, var(--bg-hover) 100%)' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              {organization.plan === 'Free' ? 'Unlock Premium Quotas' : 'Running out of limits?'}
            </h2>
            <p style={{ color: 'var(--text-sub)', marginBottom: '16px', fontSize: '13px' }}>
              {organization.plan === 'Free' 
                ? 'Scale your workspace with more seats, storage, and API quotas starting at just $29/mo.'
                : 'Upgrade your subscription for higher caps on seats, storage volume, and monthly integrations.'}
            </p>
          </div>

          <div>
            {['Owner', 'Billing Admin'].includes(user.role) ? (
              <button 
                onClick={() => setActiveTab('billing')} 
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {organization.plan === 'Free' ? 'View Premium Plans' : 'Manage Subscription'}
              </button>
            ) : (
              <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px', color: 'var(--text-muted)' }}>
                * Upgrades are restricted to Owner and Billing Admin roles. Contact Alice (owner) for changes.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quota Usage Meters */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', fontSize: '18px', fontWeight: 700 }}>
          Resource Usage & Quotas
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '16px' }}>
          <UsageProgress 
            label="User Seats Assigned" 
            used={organization.seatsUsed} 
            limit={organization.seatLimit} 
            unit="seats" 
          />

          <UsageProgress 
            label="Workspace Storage Used" 
            used={organization.storageUsed} 
            limit={organization.storageLimit} 
            unit="GB" 
          />

          <UsageProgress 
            label="API Queries Processed" 
            used={organization.apiCallsUsed} 
            limit={organization.apiCallsLimit} 
            unit="calls" 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
