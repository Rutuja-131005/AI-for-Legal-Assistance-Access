import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function RiskBadge({ tag }) {
  const getBadgeClass = (t) => {
    switch (t) {
      case 'HIGH RISK': return 'badge-high-risk';
      case 'OBLIGATION': return 'badge-obligation';
      case 'FAVORABLE': return 'badge-favorable';
      default: return 'badge-standard';
    }
  };

  const getTagIcon = (t) => {
    switch (t) {
      case 'HIGH RISK': return <ShieldAlert size={14} aria-hidden="true" />;
      case 'OBLIGATION': return <AlertTriangle size={14} aria-hidden="true" />;
      case 'FAVORABLE': return <CheckCircle size={14} aria-hidden="true" />;
      default: return <Info size={14} aria-hidden="true" />;
    }
  };

  return (
    <span className={`badge ${getBadgeClass(tag)}`} role="status" aria-label={`Risk Tag: ${tag}`}>
      {getTagIcon(tag)}
      <span>{tag}</span>
    </span>
  );
}
