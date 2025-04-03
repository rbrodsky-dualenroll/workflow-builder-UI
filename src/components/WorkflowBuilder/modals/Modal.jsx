import React, { useEffect } from 'react';

/**
 * Reusable modal component
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title = 'Modal Title', 
  children,
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  hideCloseButton = false
}) => {
  if (!isOpen) return null;

  // Handle backdrop click to close the modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      onClose();
    }
  };
  
  // Determine the width based on size prop
  const getWidth = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-2xl';
      case 'lg': return 'max-w-4xl';
      case 'xl': return 'max-w-6xl';
      default: return 'max-w-2xl';
    }
  };
  
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" 
      onClick={handleBackdropClick}
      data-testid="modal-backdrop"
      data-modal-size={size}
      style={{ zIndex: 1000 }} // Ensure a high z-index
    >
      <div 
        className={`bg-white rounded-lg ${getWidth()} w-5/6 max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
        data-testid="modal-content"
        data-title={title}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 p-6 pb-4">
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          {!hideCloseButton && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className=""
              aria-label="Close modal"
              data-testid="modal-close-button"
              data-action="close-modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default Modal;
