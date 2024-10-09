import React from 'react';

const Carousel = ({ children }) => {
  return (
    <div className="flex space-x-4 overflow-x-auto">
      {children}
    </div>
  );
};

export default Carousel;
