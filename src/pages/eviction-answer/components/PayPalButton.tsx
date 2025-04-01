import React, { useEffect, useRef } from 'react';
import { HttpStatusCode } from 'axios';
import { toast } from 'react-toastify';
import EvictionAnswerService from 'services/eviction-answer.service';
import { useEvictionAnswerContext } from '../EvictionAnswerContext';

interface PayPalButtonProps {
  amount: number;
  currency: string;
  clientId: string;
  handleCancel: () => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ amount, currency, clientId,handleCancel }) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const {evictionAnswerFormInfo, evictionAnswerCase} = useEvictionAnswerContext();

  useEffect(() => {
    const loadPayPalScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (document.getElementById('paypal-script')) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.id = 'paypal-script';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('PayPal SDK could not be loaded.'));
        document.body.appendChild(script);
      });
    };

    if(isMounted.current) {
        loadPayPalScript()
        .then(() => {
          if (paypalRef.current) {
            window.paypal.Buttons({
              createOrder: (data: any, actions: any) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: amount.toString()
                    }
                  }]
                });
              },
              onApprove: (data: any, actions: any) => {
                return actions.order.capture().then(async (details: any) => {
                  try {
                    alert(`Transaction completed by ${details.payer.name.given_name}`);
                    const paymentDetails = {
                      PayerId: details.payer.payer_id,
                      TransactionId: details.purchase_units[0].payments.captures[0].id,
                      MerchantId: details.purchase_units[0].payee.merchant_id,
                      Amount: details.purchase_units[0].amount.value,
                      Currency: details.purchase_units[0].amount.currency_code,
                      Status: details.status,
                      PayerEmail: details.payer.email_address,
                      PayerName: details.payer.name.given_name,
                      CreatedDate: details.create_time,
                      UpdatedDate: details.update_time,
                      AttorneyEmail: evictionAnswerCase.attorneyEmail,
                      DefendantEmail: evictionAnswerFormInfo.email,
                      DefendantName: evictionAnswerFormInfo.defendantName,
                      CaseNumber: evictionAnswerFormInfo.caseNo
                    };
                    const evictionResponse = await EvictionAnswerService.addEvictionAnswerFormDetails(evictionAnswerFormInfo);
                    if (evictionResponse.status === HttpStatusCode.Ok) {
                      const paymentResponse = await EvictionAnswerService.addPaymentDetails(paymentDetails);
                      if (paymentResponse.status === HttpStatusCode.Ok) {
                        toast.success("Data successfully saved", {
                          position: toast.POSITION.TOP_RIGHT,
                        });
                        handleCancel();
                      } else {
                        toast.error("Payment unsuccessful", {
                          position: toast.POSITION.TOP_RIGHT,
                        });
                        handleCancel();
                      }
                    } else {
                      toast.error("Not saved error found.", {
                        position: toast.POSITION.TOP_RIGHT,
                      });
                      handleCancel();
                    }                    
                  } catch (error) {
                    toast.error("An error occurred during the transaction.", {
                      position: toast.POSITION.TOP_RIGHT,
                    });
                    handleCancel();
                  }
                });
              },              
              onError: (err: any) => {
                console.error('PayPal Checkout onError', err);
                alert('An error occurred during the transaction');
              }
            }).render(paypalRef.current);
          }
        })
        .catch(error => {
          console.error('Failed to load PayPal SDK:', error);
        });

        isMounted.current = false;
    }
    


  }, [amount, currency, clientId]);

  return <div ref={paypalRef}></div>;
};

export default PayPalButton;