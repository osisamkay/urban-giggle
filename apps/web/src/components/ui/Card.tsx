import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Card({ title, children, footer, className = '' }: CardProps) {
  return (
    <div className={`bg-white overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {title && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-display font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
      {footer && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}
