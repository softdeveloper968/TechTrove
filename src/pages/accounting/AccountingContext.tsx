import React, {
   Dispatch,
   ReactNode,
   SetStateAction,
   createContext,
   useContext,
   useState,
} from "react";
import Period from "./dashboard/Period";
import { CourtDecisionEnum, HttpStatusCode, OperationTypeEnum } from "utils/enum";
import C2CFeesService from "services/c2c-fees.service";
import EvictionCourtSheriffFeesService from "services/eviction-court-sheriff-fees.service";
import GarnishmentCourtSheriffFeesService from "services/garnishment-court-sheriff-fees.service";
import WalletService from "services/wallet.service";
import TransactionService from "services/transaction.service";
import AllUsersService from "services/all-users.service";
import AccountingService from "services/accounting.service";
import CustomerService from "services/customer.service";
import InvoicesService from "services/invoices.service";
import BillingService from "services/billing.service";
import { IC2CFee } from "interfaces/c2c-fees.interface";
import { IEvictionCourtShariffFee } from "interfaces/eviction-court-shariff-fees.interface";
import {
   IGarnishmentCourtSheriffFees
} from "interfaces/garnishment-court-sheriff-fees.interface";
import { IWalletItems, IWallet } from "interfaces/wallet.interface";
import { ICompanyItems } from "interfaces/all-users.interface";
import {
   ITransaction
} from "interfaces/transaction.interface";
import { ICompanyDetails, IAccounting } from "interfaces/accounting.interface";
import { ICustomer } from "interfaces/customer.interface";
import { IInvoice, InvoiceAnalytics, RecentInvoicesItems } from "interfaces/invoices.interface";
import { IBilling } from "interfaces/billing.interface";

// Define the shape of the context data
type AccountingContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   c2cFees: IC2CFee;
   accountingDetails: IAccounting;
   companyDetails: ICompanyDetails[];
   invoiceAnalytics: InvoiceAnalytics[];
   customerDetails: ICustomer;
   recentInvoicesDetails: RecentInvoicesItems[];
   evictionCourtShariffFees: IEvictionCourtShariffFee;
   garnishmentCourtSheriffFees: IGarnishmentCourtSheriffFees;
   setAllC2CFees: Dispatch<SetStateAction<IC2CFee>>;
   setAccountingDetails: Dispatch<SetStateAction<IAccounting>>;
   setCompanyDetails: Dispatch<SetStateAction<ICompanyDetails[]>>;
   setCustomerDetails: Dispatch<SetStateAction<ICustomer>>;
   setAllEvictionCourtShariffFees: Dispatch<
      SetStateAction<IEvictionCourtShariffFee>
   >;
   setAllGarnishmentCourtSheriffFees: Dispatch<
      SetStateAction<IGarnishmentCourtSheriffFees>
   >;
   getAllC2CFees: (
      currentPage: number,
      pageSize: number,
      search?: string
   ) => void;
   getAllEvictionCourtShariffFees: (
      currentPage: number,
      pageSize: number,
      search?: string
   ) => void;
   getAllGarnishmentCourtSheriffFees: (
      currentPage: number,
      pageSize: number,
      search?: string
   ) => void;
   wallet: IWallet;
   setAllWallet: Dispatch<SetStateAction<IWallet>>;
   getAllWallet: (
      currentPage: number,
      pageSize: number,
      search?: string
   ) => void;
   clientWallet: IWalletItems;
   setClientWallet: Dispatch<SetStateAction<IWalletItems>>;
   getClientWallet: () => void;
   getRecentInvoices: () => void;
   getCustomerDetails: (
      currentPage: number,
      pageSize: number,
      search?: string
   ) => void;
   allCompanies: ICompanyItems[];
   getAllCompanies: () => void;
   getInvoicesStatusDetails: (
      periodDate: Period,
      fromDate: Date | null,
      toDate: Date | null
   ) => void;
   getAccountingDetails: () => void;
   getCompanyDetails: (
      periodDate: Period,
      fromDate: Date | null,
      toDate: Date | null
   ) => void;
   setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
   setInvoicesStatusDetails: Dispatch<SetStateAction<InvoiceAnalytics[]>>;
   setRecentInvoices: Dispatch<SetStateAction<RecentInvoicesItems[]>>;
   transaction: ITransaction;
   setAllTransaction: Dispatch<SetStateAction<ITransaction>>;
   getAllTransaction: (
      currentPage: number,
      pageSize: number,
      search?: string,
      fromDate?: Date | null,
      toDate?: Date | null,
      companyId?: string,
      isC2CCard?: boolean | null
   ) => void;
   invoices: IInvoice;
   setInvoices: Dispatch<SetStateAction<IInvoice>>;
   getInvoices: (startPosition: number, maxResults: number, searchParam?: string | null) => void;
   billingTransactions: IBilling;
   setBillingTransactions: Dispatch<SetStateAction<IBilling>>;
   getBillingTransactions: (pageNumber: number, pageSize: number, searchParam?: string | null) => void;
};

// Create a context with an initial value
const initialAccountingContextValue: AccountingContextType = {
   c2cFees: {
      items: [
         {
            id: "",
            countyId: 0,
            courtId: 0,
            clientId: "",
            c2CServiceExpFee: 0,
            c2CServiceFee: 0,
            c2CAddtlTenantsFee: 0,
            c2CServiceHouseFee: 0,
            c2CAOSFee: 0,
            c2CDismissalFee: 0,
            c2CWritFee: 0,
            evictionAutomationFee: 0,
            c2CAmendmentFee: 0,
            c2CAddtlDocFee: 0,
            c2COtherFee: 0,
            c2CEvictionFee: 0,
            c2CServiceAddtlTenantsFee: 0,
            court: {
               id: 0,
               courtName: "",
               countyId: 0,
               county: {
                  countyId: 0,
                  stateName: "",
                  countyName: "",
               },
            },
            client: {
               id: "",
               email: "",
               companyName: ""
            }
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 1,
      totalPages: 1,
   },
   evictionCourtShariffFees: {
      items: [
         {
            id: 0,
            poevService1stTenant: 0,
            poevService2ndTenant: 0,
            poevService3rdTenant: 0,
            poevService4thTenant: 0,
            poevService5thTenant: 0,
            poevServiceTotal: 0,
            poevServiceAAOTenant: 0,
            evictionCourtTransAmount: 0,
            aosCourtTransAmount: 0,
            addtlDocCourtTransAmount: 0,
            dismissalCourtTransAmount: 0,
            amendmentCourtTransAmount: 0,
            answerCourtTransAmount: 0,
            writCourtTransAmount: 0,
            powrService: 0,
            pogmService1stTime: 0,
            pogmService2ndTime: 0,
            countyId: 0,
            courtId: 0,
            court: {
               id: 0,
               courtName: "",
               county: {
                  countyId: 0,
                  stateName: "",
                  countyName: "",
               },
            },
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 1,
      totalPages: 1,
   },
   garnishmentCourtSheriffFees: {
      items: [
         {
            id: "",
            countyId: 0,
            courtId: 0,
            garnishmentType: 0,
            sheriffFeeFirstTenant: 0,
            sheriffFeeSecondTenant: 0,
            courtFee: 0,
            efileFee: 0,
            efileServiceCharge: 0,
            otherEfileCharge: 0,
            courtfeeSecondTenant: 0,
            courtFeeAndAllOthers: 0,
            pogmService1stTime: 0,
            pogmService2ndTime: 0,
            court: {
               id: 0,
               courtName: "",
               county: {
                  countyId: 0,
                  stateName: "",
                  countyName: "",
               },
               countyId: 0,
            },
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 1,
      totalPages: 1,
   },
   wallet: {
      items: [
         {
            id: "",
            balance: 0,
            limit: 0,
            isNoLimit: false,
            companyName: "",
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 1,
      totalPages: 1,
   },
   transaction: {
      items: [
         {
            id: "",
            createdDate: null,
            description: 0,
            amount: 0,
            remainingAmount: 0,
            isDebit: false,
            checkNumber: "",
            isC2CCard: false,
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 1,
      totalPages: 1,
   },
   allCompanies: [],
   accountingDetails: {
      transactionCount: 0,
      invoiceCount: 0,
      amountDue: 0,
      walletbalance: 0,
   },
   companyDetails: [
      {
         companyName: "",
         transactionCount: 0,
      },
   ],
   invoiceAnalytics: [
      {
         status: "",
         statusCount: 0,
      },
   ],
   recentInvoicesDetails: [
      {
         DocNumber: "",
         TotalAmt: 0,
         DueDate: "",
         Status: "",
      },
   ],
   customerDetails: {
      items: [
         {
            companyName: "",
            email: "",
            refId: "",
            createdAt: new Date(),
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 1,
      totalPages: 1,
   },
   clientWallet: {
      id: "",
      balance: 0,
      limit: 0,
      isNoLimit: false,
      companyName: "",
   },
   invoices: {
      items: [
         {
            id: "",
            dueDate: "",
            docNumber: "",
            totalAmt: "",
            customerRef: {
               value: "",
               name: ""
            },
            status: "",
            line: [],
            metaData: {
               createTime: ""
            },
            emailStatus: "",
            billEmail: {
               address: ""
            }
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 0,
   },
   billingTransactions: {
      items: [
         {
            id: "",
            dispoId: "",
            signedDispo: null,
            operationType: OperationTypeEnum.Eviction,
            courtDecision: CourtDecisionEnum.Accepted,
            applicantDate: "",
            filedDate: "",
            courtTransAmount: 0,
            paymentAmount: 0,
            c2CTotalFee: 0,
            invoiceDate: "",
            invoiceNumber: "",
            datePaid: "",
            checkNumber: "",
            hasInvoiceCreated: false
         }
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 0,
   },
   showSpinner: false,
   setShowSpinner: () => { },
   setClientWallet: () => { },
   setInvoicesStatusDetails: () => { },
   setCustomerDetails: () => { },
   getClientWallet: () => { },
   getRecentInvoices: () => { },
   setAllC2CFees: () => { },
   setAllEvictionCourtShariffFees: () => { },
   setAllGarnishmentCourtSheriffFees: () => { },
   setAccountingDetails: () => { },
   getCompanyDetails: () => { },
   getInvoicesStatusDetails: () => { },
   getAllC2CFees: () => { },
   getAllEvictionCourtShariffFees: () => { },
   getAllGarnishmentCourtSheriffFees: () => { },
   setAllWallet: () => { },
   setRecentInvoices: () => { },
   getAllWallet: () => { },
   getAllCompanies: () => { },
   getAccountingDetails: () => { },
   setAllCompanies: () => { },
   setCompanyDetails: () => { },
   setAllTransaction: () => { },
   getAllTransaction: () => { },
   getCustomerDetails: () => { },
   getInvoices: () => { },
   setInvoices: () => { },
   getBillingTransactions: () => { },
   setBillingTransactions: () => { }
};

// Create a context with an initial value
const AccountingContext = createContext<AccountingContextType>(
   initialAccountingContextValue
);

// Provide a component to wrap the application and make the context available
export const AccountingProvider: React.FC<{ children: ReactNode }> = ({
   children,
}) => {
   // State to hold the c2cfees data
   const [c2cFees, setAllC2CFees] = useState<IC2CFee>(
      initialAccountingContextValue.c2cFees
   );
   const [invoiceAnalytics, setInvoicesStatusDetails] = useState<InvoiceAnalytics[]>(
      initialAccountingContextValue.invoiceAnalytics
   );
   const [recentInvoicesDetails, setRecentInvoices] = useState<RecentInvoicesItems[]>(
      initialAccountingContextValue.recentInvoicesDetails
   );
   const [wallet, setAllWallet] = useState<IWallet>(
      initialAccountingContextValue.wallet
   );
   const [clientWallet, setClientWallet] = useState<IWalletItems>(
      initialAccountingContextValue.clientWallet
   );
   const [transaction, setAllTransaction] = useState<ITransaction>(
      initialAccountingContextValue.transaction
   );
   const [customerDetails, setCustomerDetails] = useState<ICustomer>(
      initialAccountingContextValue.customerDetails
   );
   // State to hold the evictionCourtShariffFees data
   const [evictionCourtShariffFees, setAllEvictionCourtShariffFees] =
      useState<IEvictionCourtShariffFee>(
         initialAccountingContextValue.evictionCourtShariffFees
      );
   // State to hold the garnishmentCourtSheriffFees data
   const [garnishmentCourtSheriffFees, setAllGarnishmentCourtSheriffFees] =
      useState<IGarnishmentCourtSheriffFees>(
         initialAccountingContextValue.garnishmentCourtSheriffFees
      );
   const [accountingDetails, setAccountingDetails] = useState<IAccounting>(
      initialAccountingContextValue.accountingDetails
   );
   const [companyDetails, setCompanyDetails] = useState<ICompanyDetails[]>(
      initialAccountingContextValue.companyDetails
   );
   // State to hold the dismissals spinner
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
      initialAccountingContextValue.allCompanies
   );
   const [invoices, setInvoices] = useState<IInvoice>(
      initialAccountingContextValue.invoices
   );
   const [billingTransactions, setBillingTransactions] = useState<IBilling>(
      initialAccountingContextValue.billingTransactions
   );

   /**
    * Get list of c2cfees from api and bind that with the c2cfees screen
    *
    */
   const getAllC2CFees = async (
      currentPage: number,
      pageSize: number,
      search?: string
   ) => {
      try {
         setShowSpinner(true);
         const apiResponse = await C2CFeesService.getAllC2CFees(
            currentPage,
            pageSize
         );
         if (apiResponse.status === HttpStatusCode.OK) {
            setAllC2CFees((prevC2CFees) => ({
               ...prevC2CFees,
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

   const getAllEvictionCourtShariffFees = async (
      currentPage: number,
      pageSize: number,
      search?: string
   ) => {
      try {
         setShowSpinner(true);
         const apiResponse =
            await EvictionCourtSheriffFeesService.getAllEvictionCourtSheriffFees(
               currentPage,
               pageSize
            );
         if (apiResponse.status === HttpStatusCode.OK) {
            setAllEvictionCourtShariffFees((prevEvictionCourtShariffFees) => ({
               ...prevEvictionCourtShariffFees,
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

   const getAllGarnishmentCourtSheriffFees = async (
      currentPage: number,
      pageSize: number,
      search?: string
   ) => {
      try {
         setShowSpinner(true);
         const apiResponse =
            await GarnishmentCourtSheriffFeesService.getAllGarnishmentCourtSheriffFees(
               currentPage,
               pageSize
            );
         if (apiResponse.status === HttpStatusCode.OK) {
            setAllGarnishmentCourtSheriffFees(
               (prevGarnishmentCourtSheriffFeesService) => ({
                  ...prevGarnishmentCourtSheriffFeesService,
                  items: apiResponse.data.items,
                  currentPage: apiResponse.data.currentPage,
                  totalCount: apiResponse.data.totalCount,
                  totalPages: apiResponse.data.totalPages,
                  pageSize: apiResponse.data.pageSize,
                  ...(search ? { searchParam: search } : {}),
               })
            );
         }
      } finally {
         setShowSpinner(false);
      }
   };

   /**
    * Get list of wallet from api and bind that with the wallet screen
    *
    */
   const getAllWallet = async (
      currentPage: number,
      pageSize: number,
      search?: string
   ) => {
      try {
         setShowSpinner(true);
         const apiResponse = await WalletService.getAllWallet(
            currentPage,
            pageSize,
            search ?? ""
         );
         if (apiResponse.status === HttpStatusCode.OK) {
            setAllWallet((prevWallet) => ({
               ...prevWallet,
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

   const getInvoicesStatusDetails = async (
      periodValue: Period,
      fromDate: Date | null,
      toDate: Date | null
   ) => {
      try {
         // setShowSpinner(true);
         const apiResponse = await InvoicesService.getInvoiceStatusDetails(
            periodValue,
            fromDate,
            toDate
         );
         if (apiResponse.status === HttpStatusCode.OK) {
            setInvoicesStatusDetails(apiResponse.data)
         }
      } finally {
         // setShowSpinner(false);
      }
   };

   const getRecentInvoices = async () => {
      try {
         setShowSpinner(true);
         const apiResponse = await InvoicesService.getRecentInvoices();
         if (apiResponse.status === HttpStatusCode.OK) {
            setRecentInvoices(apiResponse.data)
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
            // setAllCompanies((prevLateNotices) => ({
            //   ...prevLateNotices,
            //   apiResponse.data,
            // }));
         }
      } finally {
         // setShowSpinner(false);
      }
   };

   const getAllTransaction = async (
      currentPage: number,
      pageSize: number,
      search?: string,
      fromDate?: Date | null,
      toDate?: Date | null,
      companyId?: string,
      isC2CCard?: boolean | null
   ) => {
      try {
         setShowSpinner(true);
         const apiResponse = await TransactionService.getAllTransactions(
            currentPage,
            pageSize,
            search ?? "",
            fromDate ?? null,
            toDate ?? null,
            companyId ?? "",
            isC2CCard ?? null
         );
         if (apiResponse.status === HttpStatusCode.OK) {
            setAllTransaction((prevWallet) => ({
               ...prevWallet,
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

   const getAccountingDetails = async () => {
      try {
         // setShowSpinner(true);
         const apiResponse = await AccountingService.getAccountingDetails();
         if (apiResponse.status === HttpStatusCode.OK) {
            setAccountingDetails(apiResponse.data);
         }
      } finally {
         // setShowSpinner(false);
      }
   };

   const getCompanyDetails = async (
      periodValue: Period,
      fromDate: Date | null,
      toDate: Date | null
   ): Promise<void> => {
      try {
         // setShowSpinner(true);
         const apiResponse = await AccountingService.getCompanyDetails(
            periodValue,
            fromDate,
            toDate
         );
         if (apiResponse.status === HttpStatusCode.OK) {
            setCompanyDetails(apiResponse.data);
         }
      } finally {
         // setShowSpinner(false);
      }
   };

   const getCustomerDetails = async (
      currentPage: number,
      pageSize: number,
      search?: string
   ): Promise<void> => {
      try {
         setShowSpinner(true);

         const apiResponse = await CustomerService.getCustomerDetails(
            currentPage,
            pageSize,
            search ?? ""
         );
         if (apiResponse.status === HttpStatusCode.OK) {
            const transformedItems = apiResponse.data.items.map((item: any) => ({
               companyName: item.client.companyName,
               email: item.client.email,
               refId: item.refId,
               createdAt: item.createdAt,
            }));
            ;
            setCustomerDetails((prevCustomer) => ({
               ...prevCustomer,
               items: transformedItems,
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

   const getClientWallet = async () => {
      try {
         setShowSpinner(true);
         const apiResponse = await WalletService.getClientWalletDetail();
         if (apiResponse.status === HttpStatusCode.OK) {
            setClientWallet(apiResponse.data);
         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getInvoices = async (startPosition: number, maxResults: number, searchParam?: string | null) => {
      try {
         setShowSpinner(true);
         const apiResponse = await InvoicesService.getInvoices(startPosition, maxResults, searchParam);
         if (apiResponse.status === HttpStatusCode.OK) {
            setInvoices((prev) => ({
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

   const getBillingTransactions = async (pageNumber: number, pageSize: number, searchParam?: string | null) => {
      try {
         setShowSpinner(true);
         const apiResponse = await BillingService.getBillingTransactions(pageNumber, pageSize, searchParam);
         if (apiResponse.status === HttpStatusCode.OK) {
            setBillingTransactions((prev) => ({
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

   // Provide the context value to its children
   return (
      <AccountingContext.Provider
         value={{
            showSpinner,
            c2cFees,
            accountingDetails,
            companyDetails,
            customerDetails,
            invoiceAnalytics,
            recentInvoicesDetails,
            getAllC2CFees,
            setAccountingDetails,
            setCustomerDetails,
            getAccountingDetails,
            setRecentInvoices,
            setAllC2CFees,
            getCompanyDetails,
            setShowSpinner,
            evictionCourtShariffFees,
            garnishmentCourtSheriffFees,
            getAllEvictionCourtShariffFees,
            getAllGarnishmentCourtSheriffFees,
            setAllEvictionCourtShariffFees,
            setAllGarnishmentCourtSheriffFees,
            wallet,
            setAllWallet,
            getAllWallet,
            setInvoicesStatusDetails,
            getInvoicesStatusDetails,
            allCompanies,
            getAllCompanies,
            getCustomerDetails,
            getRecentInvoices,
            setAllCompanies,
            transaction,
            setCompanyDetails,
            setAllTransaction,
            getAllTransaction,
            clientWallet,
            setClientWallet,
            getClientWallet,
            invoices,
            getInvoices,
            setInvoices,
            billingTransactions,
            getBillingTransactions,
            setBillingTransactions,
         }}
      >
         {children}
      </AccountingContext.Provider>
   );
};

// Create a hook to easily access the accounting context within components
export const useAccountingContext = (): AccountingContextType => {
   // Get the context value using useContext
   const context = useContext(AccountingContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useAccountingContext must be used within a AccountingProvider"
      );
   }
   // Return the context value
   return context;
};
