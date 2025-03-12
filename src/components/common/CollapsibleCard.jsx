import React, { useState } from 'react';

/**
 * Collapsible card component with improved toggle aesthetics
 */
const CollapsibleCard = ({ 
  title,
  children,
  className = '',
  titleClassName = '',
  bodyClassName = '',
  footer,
  footerClassName = '',
  defaultCollapsed = true,
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
          className="focus:outline-none"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand section" : "Collapse section"}
        >
          {/* Simple arrow that changes direction based on collapsed state */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`transform transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
          >
            <polyline points="9 18 15 12 9 6"></polyline>
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
