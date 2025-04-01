import React from "react";
import { PaymentProvider } from "./PaymentContext";
import PaymentGrid from "./components/PaymentGrid";
import Payment_SearchBar from "./components/SinglePaymentActions/Payment_SearchBar";
// Single Payment component serves as the main entry point for the payment page

const Payment = () => {

  return (
    <>
      {/* 
        Additional layout or components for the Payment page can be added here.
        These could include headers, navigation, or any other page-specific elements.
      */}
      <PaymentProvider>
      <div className="relative flex flex-wrap items-center md:mb-2">
              <Payment_SearchBar />
            </div>
        {/* 
          PaymentContainer contains the main logic and UI for the Payment page.
          It is wrapped with PaymentProvider to provide the necessary context to its children.
        */}
        <div className="single_payment_grid">
        <PaymentGrid />
        </div>
            

      </PaymentProvider>
    </>
  );
};

export default Payment;
