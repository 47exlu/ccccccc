import React from "react";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

export function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-gray-600">
      <span className="font-medium">{label}:</span> {value}
    </p>
  );
}

export function Instructions({ items }: { items: { text: string; code?: string }[] }) {
  return (
    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
      {items.map((item, index) => (
        <li key={index}>
          {item.text}
          {item.code && (
            <span className="font-mono bg-gray-100 px-1 rounded ml-1">{item.code}</span>
          )}
        </li>
      ))}
    </ol>
  );
}
