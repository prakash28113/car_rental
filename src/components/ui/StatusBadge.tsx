import React from 'react';

interface StatusBadgeProps {
  status: 'Idle' | 'On Rent' | 'Maintenance';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const baseClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs font-medium rounded-full'
    : 'px-3 py-1 text-sm font-medium rounded-full';

  const statusClasses = {
    'Idle': 'bg-green-100 text-green-800',
    'On Rent': 'bg-blue-100 text-blue-800',
    'Maintenance': 'bg-amber-100 text-amber-800',
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status]}`}>
      {status}
    </span>
  );
}