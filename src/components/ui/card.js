import React from 'react';

const Card = ({ children, className }) => {
  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-lg border border-emerald-700 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => {
  return (
    <div className={`mb-4 border-b border-emerald-700 pb-3 text-emerald-400 font-semibold ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className }) => {
  return (
    <div className={`text-gray-300 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className }) => {
  return (
    <div className={`flex items-center p-4 border-t border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export default Card;