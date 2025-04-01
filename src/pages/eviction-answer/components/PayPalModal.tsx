
import React from 'react';
import Modal from 'components/common/popup/PopUp';

interface PayPalModalProps {
    show: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }
  
  const PayPalModal: React.FC<PayPalModalProps> = ({ show, onClose, children }) => {
    if (!show) {
      return null;
    }
  
    return (
      <Modal showModal={show} onClose={() => onClose()} width="max-w-md">
        <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
          <div className="sm:flex sm:items-start">
            <div className="text-center sm:text-left">
              <h3 className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5 -mt-2" id="modal-title">
              Confirm payment information below in order to file your answer.
              </h3>
            </div>
          </div>
          <div className='flex justify-between mb-3 mt-2'>
            <h3 className='text-lg'>Amount</h3>
            <h3 className='text-lg font-bold'>$20.00</h3>
          </div>
          <div>
            {children}
          </div>
        </div>
      </Modal>
    );
  };
  
  export default PayPalModal;