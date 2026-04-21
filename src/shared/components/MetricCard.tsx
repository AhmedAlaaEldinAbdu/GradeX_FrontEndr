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
    <Card
      className={`flex gap-4 ${className} app-card-shadow rounded-3xl border border-[#E6E6E6] p-4`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
      >
        {icon}
      </div>
      <div className="flex flex-1 flex-col items-start gap-2">
        <div className="text-base font-normal text-[#3A3A3A]">{title}</div>
        <div className="text-dark-900 text-base font-medium">
          {value}
          {percentage ? '%' : ''}
        </div>
      </div>
    </Card>
  );
}
