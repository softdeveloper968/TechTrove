import React, {
   Dispatch,
   ReactNode,
   SetStateAction,
   createContext,
   useContext,
   useState,
} from "react";
import { ICompanyItems } from "interfaces/all-users.interface";
import { IAccountingQueue, IFilingTransaction, UpdatePaymentResource } from "interfaces/filing-transaction.interface";
import AllUsersService from "services/all-users.service";
import FilingTransactionService from "services/filing-transaction.service";
import { CourtDecisionEnum, HttpStatusCode, OperationTypeEnum } from "utils/enum";
import { ICountyItems } from "interfaces/county.interface";
import CountyService from "services/county.service";
import { useAuth } from "context/AuthContext";

// Define the shape of the context data
type FilingTransactionContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   //  filingType: OperationTypeEnum;
   //  setFilingType: Dispatch<SetStateAction<OperationTypeEnum>>;
   filingType: string;
   setFilingType: Dispatch<SetStateAction<string>>;
   companyId: string;
   setCompanyId: Dispatch<SetStateAction<string>>;
   dateFiled: [Date | null, Date | null];
   datePaid: [Date | null, Date | null];
   setDateFiled: Dispatch<SetStateAction<[Date | null, Date | null]>>;
   setDatePaid: Dispatch<SetStateAction<[Date | null, Date | null]>>;
   filingTransactions: IFilingTransaction;
   setFilingTransactions: Dispatch<SetStateAction<IFilingTransaction>>;
   aosFilingTransactions: IFilingTransaction;
   setAOSFilingTransactions: Dispatch<SetStateAction<IFilingTransaction>>;
   dismissalsFilingTransactions: IFilingTransaction;
   setDismissalsFilingTransactions: Dispatch<SetStateAction<IFilingTransaction>>;
   writsFilingTransactions: IFilingTransaction;
   setWritsFilingTransactions: Dispatch<SetStateAction<IFilingTransaction>>;
   amendmentsFilingTransactions: IFilingTransaction;
   setAmendmentsFilingTransactions: Dispatch<SetStateAction<IFilingTransaction>>;
   getFilingTransactions: (pageNumber: number, pageSize: number, searchParam?: string | null, type?: string | null, companyId?: string, fromDate?: Date | null,
      toDate?: Date | null , datePaidFromDate?: Date | null, datePaidToDate?: Date | null, blankOption?: string[], nonBlankOption?: string[], county?: string) => void;
      accountingQueue: IAccountingQueue;
   setAccountingQueue: Dispatch<SetStateAction<IAccountingQueue>>;
   getAccountingQueue: (pageNumber: number, pageSize: number, searchParam?: string | null, 
      datePaidFromDate?: Date | null, datePaidToDate?: Date | null, type?: string, 
      payrollFromDate?: Date | null, payrollToDate?: Date | null, 
      commissionFromDate?: Date | null, commissionToDate?: Date | null,
      blankOption?: string[], nonBlankOption?: string[], county?: string) => void;
   allCompanies: ICompanyItems[];
   getAllCompanies: () => void;
   setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
   selectedFilingTransactionId: string[];
   setSelectedFilingTransactionId: Dispatch<SetStateAction<string[]>>;
   bulkRecords: UpdatePaymentResource[];
   setBulkRecords: Dispatch<SetStateAction<UpdatePaymentResource[]>>;
   aosBulkRecords: UpdatePaymentResource[];
   setAOSBulkRecords: Dispatch<SetStateAction<UpdatePaymentResource[]>>;
   dismissalBulkRecords: UpdatePaymentResource[];
   setDismissalBulkRecords: Dispatch<SetStateAction<UpdatePaymentResource[]>>;
   writBulkRecords: UpdatePaymentResource[];
   setWritBulkRecords: Dispatch<SetStateAction<UpdatePaymentResource[]>>;
   amendmentBulkRecords: UpdatePaymentResource[];
   setAmendmentBulkRecords: Dispatch<SetStateAction<UpdatePaymentResource[]>>;
   filteredRecords: UpdatePaymentResource[];
   setFilteredRecords: Dispatch<SetStateAction<UpdatePaymentResource[]>>;
   selectedFilteredFilingTransactionId: string[];
   setSelectedFilteredFilingTransactionId: Dispatch<SetStateAction<string[]>>;
   allCounties: ICountyItems[];
   getAllCounties: () => void;
   setAllCounties: Dispatch<SetStateAction<ICountyItems[]>>;
};

// Create a context with an initial value
const initialFilingTransactionContextValue: FilingTransactionContextType = {
   filingTransactions: {
      items: [],
      currentPage: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 0,
   },
   aosFilingTransactions: {
      items: [],
      currentPage: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 0,
   },
   dismissalsFilingTransactions: {
      items: [],
      currentPage: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 0,
   },
   writsFilingTransactions: {
      items: [],
      currentPage: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 0,
   },
   amendmentsFilingTransactions: {
      items: [],
      currentPage: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 0,
   },
   accountingQueue: {
      items: [],
      currentPage: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 0,
   },
   allCompanies: [],
   getAllCompanies: () => { },
   setAllCompanies: () => { },
   showSpinner: false,
   filingType: "Eviction",
   setFilingType: () => { },
   companyId: "",
   setCompanyId: () => { },
   dateFiled: [null,null],
   setDateFiled: () => { },
   datePaid: [null,null],
   setDatePaid: () => { },
   setShowSpinner: () => { },
   getFilingTransactions: () => { },
   setFilingTransactions: () => { },
   setAOSFilingTransactions: () => { },
   setDismissalsFilingTransactions: () => { },
   setWritsFilingTransactions: () => { },
   setAmendmentsFilingTransactions: () => { },
   getAccountingQueue: () => { },
   setAccountingQueue: () => { },
   selectedFilingTransactionId: [],
   setSelectedFilingTransactionId: () => { },
   bulkRecords: [],
   setBulkRecords: () => { },
   aosBulkRecords: [],
   setAOSBulkRecords: () => { },
   dismissalBulkRecords: [],
   setDismissalBulkRecords: () => { },
   writBulkRecords: [],
   setWritBulkRecords: () => { },
   amendmentBulkRecords: [],
   setAmendmentBulkRecords: () => { },
   filteredRecords: [],
   setFilteredRecords: () => { },
   selectedFilteredFilingTransactionId: [],
   setSelectedFilteredFilingTransactionId: () => { },
   getAllCounties: () => { },
   setAllCounties: () => { },
   allCounties: [
      {
         stateName: "",
         countyName: "",
         method: "",
         endPoint: "",
         isMultipleAOSPdf: false
      },
   ],
};

// Create a context with an initial value
const FilingTransactionContext = createContext<FilingTransactionContextType>(
   initialFilingTransactionContextValue
);

// Provide a component to wrap the application and make the context available
export const FilingTransactionProvider: React.FC<{ children: ReactNode }> = ({
   children,
}) => {

   const {selectedStateValue}=useAuth();
   // State to hold the spinner
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [filingTransactions, setFilingTransactions] = useState<IFilingTransaction>(
      initialFilingTransactionContextValue.filingTransactions
   );
   const [aosFilingTransactions, setAOSFilingTransactions] = useState<IFilingTransaction>(
      initialFilingTransactionContextValue.aosFilingTransactions
   );
   const [dismissalsFilingTransactions, setDismissalsFilingTransactions] = useState<IFilingTransaction>(
      initialFilingTransactionContextValue.dismissalsFilingTransactions
   );
   const [writsFilingTransactions, setWritsFilingTransactions] = useState<IFilingTransaction>(
      initialFilingTransactionContextValue.writsFilingTransactions
   );
   const [amendmentsFilingTransactions, setAmendmentsFilingTransactions] = useState<IFilingTransaction>(
      initialFilingTransactionContextValue.amendmentsFilingTransactions
   );
   const [accountingQueue, setAccountingQueue] = useState<IAccountingQueue>(
      initialFilingTransactionContextValue.accountingQueue
   );
   const [filingType, setFilingType] = useState<string>(
      initialFilingTransactionContextValue.filingType
   );
   const [companyId, setCompanyId] = useState<string>(
      initialFilingTransactionContextValue.companyId
   );
   const [dateFiled, setDateFiled] = useState<[Date | null, Date | null]>(
      initialFilingTransactionContextValue.dateFiled
   );
   const [datePaid, setDatePaid] = useState<[Date | null, Date | null]>(
      initialFilingTransactionContextValue.datePaid
   );
   const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
      initialFilingTransactionContextValue.allCompanies
   );
   const [selectedFilingTransactionId, setSelectedFilingTransactionId] = useState<string[]>(
      initialFilingTransactionContextValue.selectedFilingTransactionId
   );
   const [bulkRecords, setBulkRecords] = useState<UpdatePaymentResource[]>([]);
   const [aosBulkRecords, setAOSBulkRecords] = useState<UpdatePaymentResource[]>([]);
   const [dismissalBulkRecords, setDismissalBulkRecords] = useState<UpdatePaymentResource[]>([]);
   const [writBulkRecords, setWritBulkRecords] = useState<UpdatePaymentResource[]>([]);
   const [amendmentBulkRecords, setAmendmentBulkRecords] = useState<UpdatePaymentResource[]>([]);

   const [selectedFilteredFilingTransactionId, setSelectedFilteredFilingTransactionId] = useState<string[]>(
      initialFilingTransactionContextValue.selectedFilteredFilingTransactionId
   );
   const [allCounties, setAllCounties] = useState<ICountyItems[]>(
      initialFilingTransactionContextValue.allCounties
   );
   const [filteredRecords, setFilteredRecords] = useState<UpdatePaymentResource[]>([]);


   const getFilingTransactions = async (pageNumber: number, pageSize: number, searchParam?: string | null, type?: string | null, companyId?: string, fromDate?: Date | null,
      toDate?: Date | null , datePaidFromDate?: Date | null,datePaidToDate?: Date | null, blankOption?: string[], nonBlankOption?: string[], county?: string) => {
      try {
         
         setShowSpinner(true);
         const apiResponse = await FilingTransactionService.getFilingTransactions(pageNumber, pageSize, searchParam, type, companyId, fromDate,
            toDate, datePaidFromDate, datePaidToDate,blankOption,nonBlankOption,county,selectedStateValue);
         if (apiResponse.status === HttpStatusCode.OK) {
            switch (type) {
               case "Eviction":
                  setFilingTransactions((prev) => ({
                     ...prev,
                     items: apiResponse.data.items,
                     currentPage: apiResponse.data.currentPage,
                     totalCount: apiResponse.data.totalCount,
                     totalPages: apiResponse.data.totalPages,
                     pageSize: apiResponse.data.pageSize,
                     ...(searchParam ? { searchParam: searchParam } : {}),
                  }));
                  break;
               case "AOS":
                  setAOSFilingTransactions((prev) => ({
                     ...prev,
                     items: apiResponse.data.items,
                     currentPage: apiResponse.data.currentPage,
                     totalCount: apiResponse.data.totalCount,
                     totalPages: apiResponse.data.totalPages,
                     pageSize: apiResponse.data.pageSize,
                     ...(searchParam ? { searchParam: searchParam } : {}),
                  }));
                  break;
               case "Dismissal":
                  setDismissalsFilingTransactions((prev) => ({
                     ...prev,
                     items: apiResponse.data.items,
                     currentPage: apiResponse.data.currentPage,
                     totalCount: apiResponse.data.totalCount,
                     totalPages: apiResponse.data.totalPages,
                     pageSize: apiResponse.data.pageSize,
                     ...(searchParam ? { searchParam: searchParam } : {}),
                  }));
                  break;
               case "Writ":
                  setWritsFilingTransactions((prev) => ({
                     ...prev,
                     items: apiResponse.data.items,
                     currentPage: apiResponse.data.currentPage,
                     totalCount: apiResponse.data.totalCount,
                     totalPages: apiResponse.data.totalPages,
                     pageSize: apiResponse.data.pageSize,
                     ...(searchParam ? { searchParam: searchParam } : {}),
                  }));
                  break;
               case "Amendment":
                  setAmendmentsFilingTransactions((prev) => ({
                     ...prev,
                     items: apiResponse.data.items,
                     currentPage: apiResponse.data.currentPage,
                     totalCount: apiResponse.data.totalCount,
                     totalPages: apiResponse.data.totalPages,
                     pageSize: apiResponse.data.pageSize,
                     ...(searchParam ? { searchParam: searchParam } : {}),
                  }));
                  break;
               default:
            }

         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getAccountingQueue = async (pageNumber: number, pageSize: number, searchParam?: string | null
      , datePaidFromDate?: Date | null,datePaidToDate?: Date | null, type?: string, 
      payrollFromDate?: Date | null, payrollToDate?: Date | null, 
      commissionFromDate?: Date | null, commissionToDate?: Date | null,
      blankOption?: string[], nonBlankOption?: string[], county?: string) => {
      try {
         setShowSpinner(true);
         const apiResponse = await FilingTransactionService.getAccountingQueue(pageNumber, pageSize, searchParam
            , datePaidFromDate, datePaidToDate,type,payrollFromDate,payrollToDate,commissionFromDate,commissionToDate,blankOption,nonBlankOption,county,selectedStateValue);
         if (apiResponse.status === HttpStatusCode.OK) {
            setAccountingQueue((prev) => ({
               ...prev,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages,
               pageSize: apiResponse.data.pageSize,
               ...(searchParam ? { searchParam: searchParam } : {}),
            }));
         }
      } finally {
         setShowSpinner(false);
      }
   };
   const getAllCompanies = async () => {
      try {
         // setShowSpinner(true);
         // get late notices
         const apiResponse = await AllUsersService.getAllCompaniesList();
         if (apiResponse.status === HttpStatusCode.OK) {
            setAllCompanies(apiResponse.data);
         }
      } finally {
         // setShowSpinner(false);
      }
   };

   const getAllCounties = async () => {
      try {
         // setShowSpinner(true);
         const response = await CountyService.getCounties();
         if (response.status === HttpStatusCode.OK) {
            setAllCounties(response.data);
         }
      } catch (error) {
         console.log(error);
      } finally {
         // setShowSpinner(true);
      }
   };

   // Provide the context value to its children
   return (
      <FilingTransactionContext.Provider
         value={{
            showSpinner,
            setShowSpinner,
            filingType,
            setFilingType,
            companyId,
            setCompanyId,
            dateFiled,
            setDateFiled,
            datePaid,
            setDatePaid,
            filingTransactions,
            aosFilingTransactions,
            dismissalsFilingTransactions,
            writsFilingTransactions,
            amendmentsFilingTransactions,
            getFilingTransactions,
            setFilingTransactions,
            setAOSFilingTransactions,
            setDismissalsFilingTransactions,
            setWritsFilingTransactions,
            setAmendmentsFilingTransactions,
            accountingQueue,
            getAccountingQueue,
            setAccountingQueue,
            allCompanies,
            getAllCompanies,
            setAllCompanies,
            selectedFilingTransactionId,
            setSelectedFilingTransactionId,
            bulkRecords,
            setBulkRecords,
            aosBulkRecords,
            setAOSBulkRecords,
            dismissalBulkRecords,
            setDismissalBulkRecords,
            writBulkRecords,
            setWritBulkRecords,
            amendmentBulkRecords,
            setAmendmentBulkRecords,
            filteredRecords,
            setFilteredRecords,
            selectedFilteredFilingTransactionId,
            setSelectedFilteredFilingTransactionId,
            getAllCounties,
            setAllCounties,
            allCounties,
         }}
      >
         {children}
      </FilingTransactionContext.Provider>
   );
};

// Create a hook to easily access the context within components
export const useFilingTransactionContext = (): FilingTransactionContextType => {
   // Get the context value using useContext
   const context = useContext(FilingTransactionContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useFillingTransactionContext must be used within a FillingTransactionProvider"
      );
   }
   // Return the context value
   return context;
};
