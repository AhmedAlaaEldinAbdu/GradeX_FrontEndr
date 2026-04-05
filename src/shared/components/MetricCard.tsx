import React from 'react';

import Card from '@/shared/components/Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  percentage?: boolean;
  icon: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

export default function MetricCard({
  title,
  value,
  percentage,
  icon,
  className = '',
  iconClassName = 'bg-gray-50 text-gray-600',
}: MetricCardProps) {
  return (
    <Card className={`flex items-center justify-between gap-4 ${className} app-card-shadow p-4`}>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="text-lg font-medium text-gray-700">{title}</div>
        <div className="text-2xl font-semibold text-gray-900">
          {value}
          {percentage ? '%' : ''}
        </div>
      </div>

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
      >
        {icon}
      </div>
    </Card>
  );
}
