//WritsOfPossessionContext.tsx
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { HttpStatusCode } from "axios";
import { ISinglePayment } from "interfaces/single-payment.interface";
import SinglePaymentService from "services/single-payment.service";
  
  // Define the shape of the context data
  type PaymentContextType = {
    showSpinner: boolean;
    setShowSpinner: Dispatch<SetStateAction<boolean>>;
    paymentRecords: ISinglePayment; // The type of Payment data
    setAllPaymentRecords: Dispatch<SetStateAction<ISinglePayment>>; // A function to update Payment Records
    getAllPaymentRecords: (currentPage: number, pageSize: number, search?: string) => void;
  };
  
  // Create a context with an initial value
  const initialPaymentContextValue: PaymentContextType = {
    showSpinner: false,
    setShowSpinner: () => {},
    paymentRecords: {
        items: [
          {
            payerName: "",
            transactionId: "",
            type: "",
            amount: null,
            createdDate: null,
          },
        ],
        currentPage: 1,
        pageSize: 100,
        totalCount: 0,
        totalPages: 1,
        searchParam: "",
      },
      setAllPaymentRecords: () => {},
      getAllPaymentRecords: () => {},
  };
  
  // Create a context with an initial value
  const PaymentContext = createContext<PaymentContextType>(
    initialPaymentContextValue
  );
  
  // Provide a component to wrap the application and make the context available
  export const PaymentProvider: React.FC<{ children: ReactNode }> = ({
    children,
  }) => {
 
     // State to hold the payment data
  const [paymentRecords, setAllPaymentRecords] = useState<ISinglePayment>(
    initialPaymentContextValue.paymentRecords
  );
    // State to hold the payment spinner
    const [showSpinner, setShowSpinner] = useState<boolean>(false);

    const getAllPaymentRecords = async (
        currentPage: number,
        pageSize: number,
        search?: string,
      ) => {
        try {
          setShowSpinner(true);
          // get All payments
          const apiResponse = await SinglePaymentService.getAllPayments(
            currentPage,
            pageSize,
            search,
          );
          if (apiResponse.status === HttpStatusCode.Ok) {
     setAllPaymentRecords((prevAllCases) => ({
              ...prevAllCases,
              items: apiResponse.data.items,
              currentPage: apiResponse.data.currentPage,
              totalCount: apiResponse.data.totalCount,
              totalPages: apiResponse.data.totalPages,
              pageSize: apiResponse.data.pageSize,
              ...(search ? { searchParam: search } : {}),
            }));
          }
        } finally {
          setShowSpinner(false);
        }
      };
  
    // Provide the context value to its children
    return (
      <PaymentContext.Provider
        value={{
          showSpinner,
          setShowSpinner,
          paymentRecords,
          setAllPaymentRecords,
          getAllPaymentRecords,
        }}
      >
        {children}
      </PaymentContext.Provider>
    );
  };
  
  // Create a hook to easily access the Payment context within components
  export const usePaymentContext = (): PaymentContextType => {
    // Get the context value using useContext
    const context = useContext(PaymentContext);
    // If the context is not found, throw an error
    if (!context) {
      throw new Error(
        "usePaymentContext must be used within a PaymentProvider"
      );
    }
    // Return the context value
    return context;
  };
  