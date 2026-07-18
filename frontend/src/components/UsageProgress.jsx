import React from 'react';

const UsageProgress = ({ label, used, limit, unit = '' }) => {
  const percentage = Math.min(100, Math.round((used / limit) * 100));
  
  let fillClass = '';
  if (percentage >= 100) {
    fillClass = 'danger';
  } else if (percentage >= 80) {
    fillClass = 'warning';
  }

  // Format numbers nicely
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="progress-container">
      <div className="progress-header">
        <span>{label}</span>
        <span>
          <strong>{formatNumber(used)}</strong> / {formatNumber(limit)} {unit} ({percentage}%)
        </span>
      </div>
      <div className="progress-bar-bg">
        <div 
          className={`progress-bar-fill ${fillClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default UsageProgress;
