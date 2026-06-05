import React from 'react';
import './ModificationBadge.css';

const ModificationBadge = ({ modifiedAt, modifiedBy, adminName }) => {
  if (!modifiedAt) return null;

  const modifyDate = new Date(modifiedAt);
  const now = new Date();
  const diffMinutes = Math.floor((now - modifyDate) / 60000);
  
  let timeDisplay;
  if (diffMinutes < 1) {
    timeDisplay = 'À l\'instant';
  } else if (diffMinutes < 60) {
    timeDisplay = `Il y a ${diffMinutes}m`;
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    timeDisplay = `Il y a ${hours}h`;
  } else {
    const days = Math.floor(diffMinutes / 1440);
    timeDisplay = `Il y a ${days}j`;
  }

  return (
    <div className="modification-badge">
      <div className="modification-badge-indicator"></div>
      <div className="modification-badge-content">
        <p className="modification-badge-text">
          <strong>⚠️ Modifiée par l'admin</strong>
        </p>
        <p className="modification-badge-details">
          {adminName} • {timeDisplay}
        </p>
      </div>
    </div>
  );
};

export default ModificationBadge;
