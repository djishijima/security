
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 ${className}`}>
      {children}
    </div>
  );
};

export default Card;