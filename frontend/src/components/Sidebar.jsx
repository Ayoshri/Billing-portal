import React from 'react';
import { FiGrid, FiCreditCard, FiUsers, FiLogOut, FiZap } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, organization, logout } = useAuth();

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiGrid size={18} /> },
    { id: 'billing', label: 'Billing & Plans', icon: <FiCreditCard size={18} /> },
    { id: 'team', label: 'Team Members', icon: <FiUsers size={18} /> },
  ];

  return (
    <div className="sidebar animate-fade-in">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <FiZap size={18} />
        </div>
        <span>ChargeUp</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name" title={user.name}>{user.name}</span>
            <span className="user-role-tag">{user.role}</span>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="sidebar-link" 
          style={{ marginTop: '16px', color: 'var(--danger)', width: '100%' }}
        >
          <FiLogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
