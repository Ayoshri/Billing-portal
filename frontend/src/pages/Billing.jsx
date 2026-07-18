import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FiCheck, FiPrinter, FiX, FiLock, FiCreditCard, FiActivity, FiArrowRight } from 'react-icons/fi';

const Billing = () => {
  const { user, organization, refreshProfile } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Checkout Modal State
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cardName, setCardName] = useState('Acme Corp');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Invoice Receipt Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const fetchInvoices = async () => {
    if (user.role === 'Member') return; // Members don't have access to invoices
    setLoading(true);
    try {
      const res = await api.get('/billing/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error('Fetch invoices failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [organization?.subscriptionStatus]);

  const plans = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for small side projects and evaluation.',
      features: ['5 User seats limit', '2 GB storage capacity', '1,000 API calls / mo', 'Community support'],
    },
    {
      name: 'Starter',
      price: 29,
      description: 'Ideal for growing teams and startups.',
      features: ['15 User seats limit', '10 GB storage capacity', '10,000 API calls / mo', 'Email support', 'Billing admin role access'],
    },
    {
      name: 'Pro',
      price: 99,
      description: 'Advanced capabilities for larger deployments.',
      features: ['50 User seats limit', '50 GB storage capacity', '100,000 API calls / mo', 'Priority 24/7 support', 'Custom invoice billing'],
    },
    {
      name: 'Enterprise',
      price: 499,
      description: 'Mission-critical scaling and compliance.',
      features: ['1,000 User seats limit', '500 GB storage capacity', '1,000,000 API calls / mo', 'Dedicated Account Manager', 'SLA agreements'],
    },
  ];

  const handleCheckoutInit = (plan) => {
    setCheckoutPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setCheckoutLoading(true);
    setError(null);
    try {
      const res = await api.post('/billing/subscribe', { plan: checkoutPlan.name });
      await refreshProfile();
      setIsCheckoutOpen(false);
      // alert success
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      await api.post(`/billing/simulate/pay-invoice/${invoiceId}`);
      await refreshProfile();
      fetchInvoices();
    } catch (err) {
      console.error('Pay invoice failed:', err);
    }
  };

  const openInvoiceReceipt = (invoice) => {
    setSelectedInvoice(invoice);
    setIsReceiptOpen(true);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 1. Members see Access Denied View
  if (user.role === 'Member') {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', height: '80vh' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
          <FiLock size={48} style={{ color: 'var(--danger)', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Billing Access Restricted</h2>
          <p style={{ color: 'var(--text-sub)', marginTop: '8px', fontSize: '15px' }}>
            You are currently logged in as a <strong>Member</strong>. Billing statistics, subscription settings, and invoice payment receipts are restricted to <strong>Workspace Owners</strong> and <strong>Billing Admins</strong>.
          </p>
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', textAlign: 'left', fontSize: '13px' }}>
            <strong>Need to make billing changes?</strong> Contact your workspace administrators:
            <ul style={{ marginTop: '8px', paddingLeft: '20px', color: 'var(--text-sub)' }}>
              <li>Alice Smith (owner@acme.com) — Owner</li>
              <li>Bob Jones (billing@acme.com) — Billing Admin</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1>Subscription Plans & Billing</h1>
        <p>Change tiers, manage workspace seat boundaries, and review invoice statements.</p>
      </div>

      {/* Grid of pricing cards */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Select Workspace Tier</h2>
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px', 
          marginBottom: '40px' 
        }}
      >
        {plans.map((p) => {
          const isCurrent = organization.plan === p.name;
          return (
            <div 
              key={p.name} 
              className="card"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                borderColor: isCurrent ? 'var(--accent-primary)' : 'var(--border-light)',
                borderWidth: isCurrent ? '2px' : '1px',
                position: 'relative'
              }}
            >
              {isCurrent && (
                <span 
                  className="badge badge-success"
                  style={{ 
                    position: 'absolute', 
                    top: '-12px', 
                    left: '20px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  Current Plan
                </span>
              )}

              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{p.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{p.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '20px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)' }}>${p.price}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '4px' }}>/ month</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', marginBottom: '20px' }} />

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {p.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-sub)' }}>
                      <FiCheck size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={() => handleCheckoutInit(p)}
                  disabled={isCurrent}
                  className={`btn ${isCurrent ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%' }}
                >
                  {isCurrent ? 'Current Plan' : 'Subscribe'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Section */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '16px' }}>
          Billing History
        </h2>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '24px' }}>Loading invoicing entries...</p>
        ) : invoices.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No billing history found for this organization.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Bill Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                    <td>{formatDate(inv.date)}</td>
                    <td>{inv.billingReason}</td>
                    <td style={{ fontWeight: 600 }}>${inv.amount.toFixed(2)} USD</td>
                    <td>
                      {inv.status === 'paid' ? (
                        <span className="badge badge-success">Paid</span>
                      ) : (
                        <span className="badge badge-danger">Unpaid</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {inv.status === 'open' && (
                          <button
                            onClick={() => handlePayInvoice(inv._id)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Pay Invoice
                          </button>
                        )}
                        <button
                          onClick={() => openInvoiceReceipt(inv)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FiPrinter size={12} />
                          Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stripe Checkout Mock Modal */}
      {isCheckoutOpen && checkoutPlan && (
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
              maxWidth: '500px', 
              padding: '32px', 
              backgroundColor: 'white',
              boxShadow: 'var(--shadow-premium)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCreditCard style={{ color: 'var(--accent-primary)' }} />
                Simulated Stripe Checkout
              </h3>
              <button 
                onClick={() => setIsCheckoutOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <FiX size={20} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '10px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PLAN SELECTED</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <strong style={{ fontSize: '16px' }}>{checkoutPlan.name} Tier</strong>
                  <strong style={{ fontSize: '16px', color: 'var(--accent-primary)' }}>${checkoutPlan.price}.00/mo</strong>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="input-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Credit Card Info</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="input-control"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="12/28"
                    className="input-control"
                    style={{ width: '80px', textAlign: 'center' }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="CVV"
                    className="input-control"
                    style={{ width: '70px', textAlign: 'center' }}
                  />
                </div>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                * Checkout is secure and simulated. You can use standard Stripe test credit cards. Downgrade safety filters are active.
              </p>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Processing mock payment...' : `Authorize Charge: $${checkoutPlan.price}.00`}
                <FiArrowRight />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice printable Receipt overlay */}
      {isReceiptOpen && selectedInvoice && (
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
              maxWidth: '600px', 
              padding: '40px', 
              backgroundColor: 'white',
              boxShadow: 'var(--shadow-premium)',
              fontFamily: 'Courier New, monospace' // Give it a receipt feeling or classic typography
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', fontFamily: 'var(--font-sans)' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Receipt from ChargeUp Inc.</span>
                <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 0 0' }}>{selectedInvoice.invoiceNumber}</h1>
              </div>
              <button 
                onClick={() => setIsReceiptOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div style={{ fontSize: '14px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Receipt Header details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed var(--border-medium)', paddingBottom: '20px' }}>
                <div>
                  <strong>Billed To:</strong>
                  <br />
                  {organization.name}
                  <br />
                  Workspace Billing Representative
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Date:</strong> {formatDate(selectedInvoice.date)}
                  <br />
                  <strong>Status:</strong> {selectedInvoice.status.toUpperCase()}
                  <br />
                  <strong>Currency:</strong> USD
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderBottom: '1px solid var(--border-medium)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span>Description</span>
                  <span style={{ textAlign: 'right' }}>Amount</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px' }}>
                  <span>{selectedInvoice.billingReason}</span>
                  <span style={{ fontWeight: 600 }}>${selectedInvoice.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Total Calculation */}
              <div style={{ borderTop: '2px dashed var(--border-medium)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '30px', fontSize: '14px' }}>
                  <span>Subtotal:</span>
                  <span>${selectedInvoice.amount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', gap: '30px', fontSize: '14px' }}>
                  <span>Tax (0%):</span>
                  <span>$0.00</span>
                </div>
                <div style={{ display: 'flex', gap: '30px', fontSize: '18px', fontWeight: 700 }}>
                  <span>Total Paid:</span>
                  <span style={{ color: selectedInvoice.status === 'paid' ? 'var(--success)' : 'var(--danger)' }}>
                    ${selectedInvoice.amount.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* PAID STAMP */}
              {selectedInvoice.status === 'paid' && (
                <div 
                  style={{ 
                    border: '3px solid var(--success)', 
                    color: 'var(--success)', 
                    padding: '8px 24px', 
                    borderRadius: '8px', 
                    fontSize: '24px', 
                    fontWeight: 800, 
                    transform: 'rotate(-12deg)', 
                    width: 'fit-content',
                    margin: '20px auto 0 auto',
                    opacity: 0.8,
                    textAlign: 'center',
                    fontFamily: 'var(--font-sans)'
                  }}
                >
                  PAID
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '40px', textAlign: 'center', display: 'block' }}>
              <button 
                onClick={() => window.print()} 
                className="btn btn-secondary" 
                style={{ fontFamily: 'var(--font-sans)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <FiPrinter /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
