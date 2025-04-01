//AmendmentsContext.tsx
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { IAmendments, IAmendmentsItems } from "interfaces/amendments.interface";
import { IUnservedQueue, IUnservedQueueItems } from "interfaces/service-tracker.interface";
import AmendmentsService from "services/amendments.service";
import { HttpStatusCode } from "utils/enum";

// Define the shape of the context data
type AmendmentsContextType = {
  showSpinner: boolean;
  setShowSpinner: Dispatch<SetStateAction<boolean>>;
  // amendments: IAmendments; // The type of Amendments data
  // setAllAmendments: Dispatch<SetStateAction<IAmendments>>; // A function to update Amendments
  unsignedAmendment: IAmendments; // The type of UnSignedDismissals data
  signedAmendment: IAmendments; // The type of SignedDismissals data
  setAllUnsignedAmendment: Dispatch<SetStateAction<IAmendments>>; // A function to update unsignedDismissals data
  setAllSignedAmendment: Dispatch<SetStateAction<IAmendments>>; // A function to update signedDismissals data
  getAllAmendments: (
    currentPage: number,
    pageSize: number,
    isSigned: boolean,
    search?: string
  ) => void;
  selectedAmendmentsId: string[];
  setSelectedAmendmentsId: Dispatch<SetStateAction<string[]>>;
  unsignedAmendmentCount:number;
  signedAmendmentCount:number;
  unservedAmendment: IUnservedQueue; // The type of UnservedAmendment data
  setAllUnservedAmendment: Dispatch<SetStateAction<IUnservedQueue>>; // A function to update UnservedAmendment data
  getAllUnservedAmendment: (
    currentPage: number,
    pageSize: number,
    search?: string
  ) => void;
  bulkRecords: IAmendmentsItems[];
  setBulkRecords: Dispatch<SetStateAction<IAmendmentsItems[]>>;
  unservedAmendmentsBulkRecords: IUnservedQueueItems[];
  setUnservedAmendmentsBulkRecords: Dispatch<SetStateAction<IUnservedQueueItems[]>>;
};

// Create a context with an initial value
const initialAmendmentsContextValue: AmendmentsContextType = {
  unsignedAmendment: {
    items: [
      {
        isChecked: false,
        id: "",
        caseNo: "",
        propertyName: "",
        county: "",
        // firstName: "",
        // middleName: "",
        // lastName: " ",
        unit: "",
        // streetNo: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        evictionDateFiled: new Date(),
        evictionServiceDate: new Date(),
        lastDaytoAnswer: new Date(),
        evictionServiceMethod: " service method ",
        courtDate: new Date(),
        dismissalFileDate: new Date(),
        writFileDate: new Date(),
        attorneyName: "attorney name",
        evictionAffiantSignature: "",
        amendedBy: "amendedBy",
        amendmentAffiantSignature: "",
        amendedDate: new Date(),
        //companyName:"",
        ownerName: "",
        monthlyRent: "",
        totalRent: "",
        evictionAffiantIs: "",
        tenantNames: [],
        andAllOtherOccupants: "",
        versionNumber: 0
      },
    ],
    currentPage: 1,
    pageSize: 100,
    totalCount: 1,
    totalPages: 1,
    searchParam: "",
  },
  signedAmendment: {
    items: [
      {
        isChecked: false,
        id: "",
        caseNo: "",
        propertyName: "",
        county: "",
        // firstName: "",
        // middleName: "",
        // lastName: "",
        unit: "",
       // streetNo: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        evictionDateFiled: new Date(),
        evictionServiceDate: new Date(),
        lastDaytoAnswer: new Date(),
        evictionServiceMethod: " service method ",
        courtDate: new Date(),
        dismissalFileDate: new Date(),
        writFileDate: new Date(),
        attorneyName: "attorney name",
        evictionAffiantSignature: "",
        amendedBy: "",
        amendmentAffiantSignature: "",
        amendedDate: new Date(),
        //companyName:"",
        ownerName: "",
        monthlyRent: "",
        totalRent: "",
        evictionAffiantIs: "",
        tenantNames: [],
        andAllOtherOccupants: "",
        versionNumber: 0
      },
    ],
    currentPage: 1,
    pageSize: 100,
    totalCount: 1,
    totalPages: 1,
    searchParam: "",
  },
  setAllUnsignedAmendment: () => {},
  setAllSignedAmendment: () => {},  // Corrected initialization
  getAllAmendments: () => { },
  showSpinner: false,
  setShowSpinner: () => { },
  selectedAmendmentsId: [],
  setSelectedAmendmentsId: () => { },
  unsignedAmendmentCount:0,
  signedAmendmentCount:0,
  unservedAmendment: {
    items: [      
      {

        id: "",
        processServerEmail: "",
        county: "",
        expedited:"",
        caseNo: "",
        serverIssuesRemarks:"",
        propertyName: "",
        serverReceived: null,
        tenantFirstName: "",
        tenantLastName: "",
        tenantNames: [],
        street: "",
        address: "",
        unit: "",
        city: "",
        state: "",
        zip: "",
        personalService: "",
        serverServiceInfo: "",
        propertyPhone: "",
        filerEmail: "",
        companyName:"",
      }
    ],
    currentPage: 1,
    pageSize: 100,
    totalCount: 1,
    totalPages: 1,
    searchParam: "",
    evictionPdfLink: "",
  },
  setAllUnservedAmendment: () => {},  // Corrected initialization
  getAllUnservedAmendment: () => { },
  unservedAmendmentsBulkRecords: [],
  setUnservedAmendmentsBulkRecords: () => {},
  bulkRecords: [],
  setBulkRecords: () => {},
};

// Create a context with an initial value
const AmendmentsContext = createContext<AmendmentsContextType>(
  initialAmendmentsContextValue
);

// Provide a component to wrap the application and make the context available
export const AmendmentsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State to hold the amendments data
  // const [amendments, setAllAmendments] = useState<IAmendments>(
  //   initialAmendmentsContextValue.amendments
  // );

  const [unsignedAmendment, setAllUnsignedAmendment] = useState<IAmendments>(
    initialAmendmentsContextValue.unsignedAmendment
  );
// State to hold the SignedDismissals data
  const [signedAmendment, setAllSignedAmendment] = useState<IAmendments>(
    initialAmendmentsContextValue.signedAmendment
  );
  // State to hold the UnservedAmendments data
  const [unservedAmendment, setAllUnservedAmendment] = useState<IUnservedQueue>(
    initialAmendmentsContextValue.unservedAmendment
  );
 // State to hold the unsignedAmendmentCount
const [unsignedAmendmentCount, setUnsignedAmendmentCount] = useState<number>(0);
// State to hold the SignedAmendmentCount
const [signedAmendmentCount, setSignedAmendmentCount] = useState<number>(0);
  // State to hold the amendments spinner
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  // state to hold data for selected grids
  const [selectedAmendmentsId, setSelectedAmendmentsId] = useState<string[]>(
    initialAmendmentsContextValue.selectedAmendmentsId
  );
  const [bulkRecords, setBulkRecords] = useState<
  IAmendmentsItems[]
>([]);
const [unservedAmendmentsBulkRecords, setUnservedAmendmentsBulkRecords] = useState<
IUnservedQueueItems[]
>([]);
  /**
   * Get list of amendments from api and bind that with the amendments screen
   *
   */
  const getAllAmendments = async (
    currentPage: number,
    pageSize: number,
    isSigned: boolean,
    search?: string
  ) => {
    
    try {
      setShowSpinner(true);
      // get amendments
      
      const apiResponse = await AmendmentsService.getAllAmendments(
        currentPage,
        pageSize,
        isSigned,
        search
      );
      if (apiResponse.status === HttpStatusCode.OK) {
        if(isSigned === false) {
          setAllUnsignedAmendment((prevFileEvictions) => ({
            ...prevFileEvictions,
            items: apiResponse.data.items,
            currentPage: apiResponse.data.currentPage,
            totalCount: apiResponse.data.totalCount,
            totalPages: apiResponse.data.totalPages,
            pageSize: apiResponse.data.pageSize,
            ...(search ? { searchParam: search } : {}),
          })); 
          setUnsignedAmendmentCount(apiResponse.data.items.length);
      }
        else {
          setAllSignedAmendment((prevFileEvictions) => ({
            ...prevFileEvictions,
            items: apiResponse.data.items,
            currentPage: apiResponse.data.currentPage,
            totalCount: apiResponse.data.totalCount,
            totalPages: apiResponse.data.totalPages,
            pageSize: apiResponse.data.pageSize,
            ...(search ? { searchParam: search } : {}),
          }));
          setSignedAmendmentCount(apiResponse.data.items.length);
        }
      }
    } finally {
      setShowSpinner(false);
    }
  };

  /**
   * Get list of unserved amendments from api and bind that with the unserved amendments screen
   *
   */
  const getAllUnservedAmendment = async (
    currentPage: number,
    pageSize: number,
    search?: string
  ) => {
    
    try {
      setShowSpinner(true);
      // get amendments
      
      const apiResponse = await AmendmentsService.getAllUnservedAmendments(
        currentPage,
        pageSize,
        search
      );
      if (apiResponse.status === HttpStatusCode.OK) {
        setAllUnservedAmendment((prevFileEvictions) => ({
            ...prevFileEvictions,
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
    <AmendmentsContext.Provider
      value={{
        showSpinner,
        unsignedAmendment,
        signedAmendment,
        getAllAmendments,
        setShowSpinner,
        setAllUnsignedAmendment,
        setAllSignedAmendment,
        selectedAmendmentsId,
        setSelectedAmendmentsId,
        unsignedAmendmentCount,
        signedAmendmentCount,
        unservedAmendment,
        getAllUnservedAmendment,
        setAllUnservedAmendment,
        unservedAmendmentsBulkRecords,
        setUnservedAmendmentsBulkRecords,
        bulkRecords,
        setBulkRecords,
      }}
    >
      {children}
    </AmendmentsContext.Provider>
  );
};

// Create a hook to easily access the amendments context within components
export const useAmendmentsContext = (): AmendmentsContextType => {
  // Get the context value using useContext
  const context = useContext(AmendmentsContext);
  // If the context is not found, throw an error
  if (!context) {
    throw new Error(
      "useAmendmentsContext must be used within a AmendmentsProvider"
    );
  }
  // Return the context value
  return context;
};
