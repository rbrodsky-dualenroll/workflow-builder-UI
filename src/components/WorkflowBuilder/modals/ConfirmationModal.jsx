import React from 'react';
import Modal from './Modal';

/**
 * Generic confirmation modal for actions that need user confirmation
 */
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="px-6 pb-6">
        <div className="mb-6">
          <p className="text-gray-600">{message}</p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            data-testid="confirmation-cancel-button"
          >
            {cancelButtonText}
          </button>
          <button 
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 ${confirmButtonClass} text-white rounded-md`}
            data-testid="confirmation-confirm-button"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
