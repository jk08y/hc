// src/components/common/ConfirmationModal.jsx
import React from 'react';
import { useUI } from '../../hooks/useUI';
import Modal from './Modal';
import Button from './Button';

const ConfirmationModal = () => {
  const { confirmation, closeConfirmation } = useUI();

  const handleConfirm = () => {
    if (confirmation.onConfirm) {
      confirmation.onConfirm();
    }
    closeConfirmation();
  };

  return (
    <Modal
      isOpen={confirmation.isOpen}
      onClose={closeConfirmation}
      title={confirmation.title}
      size="sm"
    >
      <div className="p-2">
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {confirmation.message}
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={closeConfirmation}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;