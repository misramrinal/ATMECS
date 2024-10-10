import React from 'react';

const Button = ({ children, onClick, className, variant = 'default' }) => {
  const baseStyle = `px-4 py-2 rounded-lg font-semibold transition-colors duration-300 ${className}`;
  
  const styles = {
    default: `bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500`,
    outline: `bg-transparent border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white`
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${styles[variant]}`}>
      {children}
    </button>
  );
};

export default Button;