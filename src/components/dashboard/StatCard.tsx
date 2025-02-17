import React, { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string;
}

export const StatCard = ({ icon, title, value }: StatCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};