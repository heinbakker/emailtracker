import React, { ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  height?: number;
  children: ReactNode;
}

export const ChartContainer = ({ title, height = 300, children }: ChartContainerProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">{title}</h2>
      <div style={{ height }} className="w-full">
        {children}
      </div>
    </div>
  );
};