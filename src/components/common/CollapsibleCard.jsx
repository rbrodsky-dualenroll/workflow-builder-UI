import React, { useState } from 'react';
import Card from './Card';

/**
 * Collapsible card component that extends the standard Card
 */
const CollapsibleCard = ({ 
  title,
  children,
  className = '',
  titleClassName = '',
  bodyClassName = '',
  footer,
  footerClassName = '',
  defaultCollapsed = false,
  id
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`bg-white border border-gray-200 rounded-md ${className}`}>
      <div 
        className={`flex justify-between items-center cursor-pointer ${titleClassName} text-md font-medium text-gray-800 p-4 border-b ${isCollapsed ? '' : 'border-gray-200'}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
        data-testid={id ? `${id}-header` : 'collapsible-header'}
      >
        <div>{title}</div>
        <button 
          type="button"
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand section" : "Collapse section"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {!isCollapsed && (
        <>
          <div className={`p-4 ${bodyClassName}`} data-testid={id ? `${id}-content` : 'collapsible-content'}>
            {children}
          </div>
          {footer && (
            <div className={`p-4 border-t border-gray-200 ${footerClassName}`}>
              {footer}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CollapsibleCard;
