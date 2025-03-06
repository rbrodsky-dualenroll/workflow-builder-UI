import React from 'react';

/**
 * Reusable card component
 */
const Card = ({ 
  title,
  children,
  className = '',
  titleClassName = '',
  bodyClassName = '',
  footer,
  footerClassName = '',
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-md ${className}`}>
      {title && (
        <div className={`text-md font-medium text-gray-800 mb-3 p-4 border-b border-gray-200 ${titleClassName}`}>
          {title}
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className={`p-4 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
