//DismissalsContext.tsx
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { IDismissals, IDismissalsItems } from "interfaces/dismissals.interface";
import DismissalsService from "services/dismissals.service";
import { HttpStatusCode } from "utils/enum";
import { IEvictionAutomationOtherQueue} from "interfaces/eviction-automation.interface";
import EvictionAutomationService from "services/eviction-automation.service";
import { IAllCasesReason } from "interfaces/all-cases.interface";

// Define the shape of the context data
type DismissalsContextType = {
  showSpinner: boolean;
  setShowSpinner: Dispatch<SetStateAction<boolean>>;
  unsignedDismissals: IDismissals; // The type of UnSignedDismissals data
  signedDismissals: IDismissals; // The type of SignedDismissals data
  unsignedDismissalCount:number;
  setAllUnsignedDismissals: Dispatch<SetStateAction<IDismissals>>; // A function to update unsignedDismissals data
  setAllSignedDismissals: Dispatch<SetStateAction<IDismissals>>; // A function to update signedDismissals data
  getAllDismissals: (
    currentPage: number,
    pageSize: number,
    isSigned:boolean,
    search?: string,
    county?: string,
    isViewAll?:boolean,
    casesIds?:string[],
    
  ) => void;
  selectedUnSignedDismissalsId: string[];
  setSelectedUnSignedDismissalsId: Dispatch<SetStateAction<string[]>>;
  bulkRecords: IDismissalsItems[];
  setBulkRecords: Dispatch<SetStateAction<IDismissalsItems[]>>;
  evictionAutomationDismissalApprovalsQueue: IEvictionAutomationOtherQueue;
  setEvictionAutomationDismissalApprovalsQueue: Dispatch<SetStateAction<IEvictionAutomationOtherQueue>>;
  getEvictionAutomationDismissalApprovalsQueue: (currentPage: number, pageSize: number, isDismissed: boolean, isViewAll: boolean, search?: string) => void;
  selectedEvictionDismissalApprovalId: string[];
  setSelectedEvictionDismissalApprovalId: Dispatch<SetStateAction<string[]>>;
  selectedReason: IAllCasesReason[];
  setSelectedReason: Dispatch<SetStateAction<IAllCasesReason[]>>;
};
 

// Create a context with an initial value
const initialDismissalsContextValue: DismissalsContextType = {
  unsignedDismissals: {
    items: [
      {
        isChecked: false,
        id: "",
        caseNo: "",
        documents: "",
        propertyName: "",
        county: "",
        firstName: "",
        lastName: "",
        unit: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        filed: new Date(),
        signedBy: "",
        evictionAffiantSignature:"",
        companyName:"",
        tenantNames: [],
        andAllOtherOccupants: "",
        crmInfo:{
          id: "",
          crmName: "",
          status: "",
          statusDate: null,
        }
      },
    ],
    currentPage: 1,
    pageSize: 100,
    totalCount: 1,
    totalPages: 1,
    searchParam: "",
  },
  signedDismissals: {
    items: [
      {
        isChecked: false,
        id: "",
        caseNo: "",
        documents: "",
        propertyName: "",
        county: "",
        firstName: "",
        lastName: "",
        unit: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        filed: new Date(),
        signedBy: "",
        evictionAffiantSignature:"",
        companyName:"",
        tenantNames: [],
        andAllOtherOccupants: "",
        crmInfo:{
          id: "",
          crmName: "",
          status: "",
          statusDate: null,
        }
      },
    ],
    currentPage: 1,
    pageSize: 100,
    totalCount: 1,
    totalPages: 1,
  
  },
  setAllUnsignedDismissals: () => {},
  setAllSignedDismissals: () => {},  // Corrected initialization
  getAllDismissals: () => {},
  showSpinner: false,
  setShowSpinner: () => {},
  unsignedDismissalCount:0,
  selectedUnSignedDismissalsId: [],
  setSelectedUnSignedDismissalsId: () => {},
  bulkRecords: [],
  setBulkRecords: () => {},
  evictionAutomationDismissalApprovalsQueue: {
    items: [],
    currentPage: 1,
    pageSize: 1,
    totalCount: 0,
    totalPages: 1,
    isViewAll: true,
 },
 setEvictionAutomationDismissalApprovalsQueue: () => { },
 getEvictionAutomationDismissalApprovalsQueue: () => { },
 selectedEvictionDismissalApprovalId: [],
 setSelectedEvictionDismissalApprovalId: () => { },
 selectedReason: [],
 setSelectedReason: () => { },
};

// Create a context with an initial value
const DismissalsContext = createContext<DismissalsContextType>(
  initialDismissalsContextValue
);

// Provide a component to wrap the application and make the context available
export const DismissalsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State to hold the UnsignedDismissals data
  const [unsignedDismissals, setAllUnsignedDismissals] = useState<IDismissals>(
    initialDismissalsContextValue.unsignedDismissals
  );
// State to hold the SignedDismissals data
  const [signedDismissals, setAllSignedDismissals] = useState<IDismissals>(
    initialDismissalsContextValue.unsignedDismissals
  );
  // State to hold the dismissals spinner
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  // state to hold data for selected unsigneddismissalgrids
  const [selectedUnSignedDismissalsId, setSelectedUnSignedDismissalsId] = useState<string[]>(
    initialDismissalsContextValue.selectedUnSignedDismissalsId
  );

  const [unsignedDismissalCount, setUnsignedDismissalCount] = useState<number>(0);
  const [bulkRecords, setBulkRecords] = useState<
  IDismissalsItems[]
>([]);
const [evictionAutomationDismissalApprovalsQueue, setEvictionAutomationDismissalApprovalsQueue] = 
useState<IEvictionAutomationOtherQueue>(initialDismissalsContextValue.evictionAutomationDismissalApprovalsQueue);
const [selectedEvictionDismissalApprovalId, setSelectedEvictionDismissalApprovalId] = useState<string[]>(
  initialDismissalsContextValue.selectedEvictionDismissalApprovalId
);
const [selectedReason, setSelectedReason] = useState<IAllCasesReason[]>(
  initialDismissalsContextValue.selectedReason
);
  /**
   * Get list of dismissals from api and bind that with the dismissals screen
   *
   */
  const getAllDismissals = async (
    currentPage: number,
    pageSize: number,
    isSigned:boolean,
    search?: string,
    county?: string,
    isViewAll?:boolean
  ) => {
    
    try {
      
      setShowSpinner(true);
      var casesIds = localStorage.getItem("casesList")?.split(",");
      const apiResponse = await DismissalsService.getAllDismissals(
        currentPage,
        pageSize,
        isSigned,
        search,
        county,
        isViewAll,
        casesIds??[]
      );
      if (apiResponse.status === HttpStatusCode.OK) {
        if(isSigned === false) {
        setAllUnsignedDismissals((prevFileEvictions) => ({
          ...prevFileEvictions,
          items: apiResponse.data.items,
          currentPage: apiResponse.data.currentPage,
          totalCount: apiResponse.data.totalCount,
          totalPages: apiResponse.data.totalPages,
          pageSize: apiResponse.data.pageSize,
          isViewAll:isViewAll,
          ...(search ? { searchParam: search } : {}),
        }));
        setUnsignedDismissalCount(apiResponse.data.items.length);
      }
        else {
          setAllSignedDismissals((prevFileEvictions) => ({
            ...prevFileEvictions,
            items: apiResponse.data.items,
            currentPage: apiResponse.data.currentPage,
            totalCount: apiResponse.data.totalCount,
            totalPages: apiResponse.data.totalPages,
            pageSize: apiResponse.data.pageSize,
            ...(search ? { searchParam: search } : {}),
          })); 
        }
      }
    } finally {
      setShowSpinner(false);
    }
  };
  const getEvictionAutomationDismissalApprovalsQueue = async (
    currentPage: number,
    pageSize: number,
    isDismissed: boolean,
    isViewAll: boolean,
    searchParam?: string,
 ) => {
    try {

       setShowSpinner(true);
       var casesIds = localStorage.getItem("casesList")?.split(",");
       const apiResponse = await EvictionAutomationService.getEvictionAutomationDismissalApprovalsQueue(
          currentPage,
          pageSize,
          isDismissed,
          isViewAll,
          searchParam,
          casesIds ?? []
       );
       if (apiResponse.status === HttpStatusCode.OK) {
          
             setEvictionAutomationDismissalApprovalsQueue((prevAllCases) => ({
                ...prevAllCases,
                items: apiResponse.data.items,
                currentPage: apiResponse.data.currentPage,
                totalCount: apiResponse.data.totalCount,
                totalPages: apiResponse.data.totalPages,
                pageSize: apiResponse.data.pageSize,
                isViewAll: isViewAll,
                ...(searchParam ? { searchParam: searchParam } : {}),
             }));  
       }
    } finally {
       setShowSpinner(false);
    }
 };


// Provide the context value to its children
  return (
    <DismissalsContext.Provider
      value={{
        showSpinner,
        unsignedDismissalCount,
        unsignedDismissals,
        signedDismissals,
        getAllDismissals,
        setAllUnsignedDismissals,
        setAllSignedDismissals,
        setShowSpinner,
        selectedUnSignedDismissalsId,   
        setSelectedUnSignedDismissalsId,
        bulkRecords,
        setBulkRecords,
        evictionAutomationDismissalApprovalsQueue,
        setEvictionAutomationDismissalApprovalsQueue,
        getEvictionAutomationDismissalApprovalsQueue,
        selectedEvictionDismissalApprovalId,
        setSelectedEvictionDismissalApprovalId,
        selectedReason,
        setSelectedReason,
      }}
    >
      {children}
    </DismissalsContext.Provider>
  );
};

// Create a hook to easily access the dismissals context within components
export const useDissmissalsContext = (): DismissalsContextType => {
  // Get the context value using useContext
  const context = useContext(DismissalsContext);
  // If the context is not found, throw an error
  if (!context) {
    throw new Error(
      "useDissmissalsContext must be used within a DismissalsProvider"
    );
  }
  // Return the context value
  return context;
};
