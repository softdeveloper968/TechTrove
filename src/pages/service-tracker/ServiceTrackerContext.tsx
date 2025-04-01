//ServiceTrackerContext.tsx
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { HttpStatusCode } from "axios";
import { IServiceTracker, IServiceTrackerItems, IUnservedQueue, IUnservedQueueItems } from "interfaces/service-tracker.interface";
import ServiceTrackerService from "services/service-tracker.service";

// Define the shape of the context data
type ServiceTrackerContextType = {
  showSpinner: boolean;
  setShowSpinner: Dispatch<SetStateAction<boolean>>;
  serviceTracker: IServiceTracker; // The type of service tracker data
  setServiceTracker: Dispatch<SetStateAction<IServiceTracker>>; // A function to update service trackers
  getServiceTracker: (
    currentPage: number,
    pageSize: number,
    search?: string
  ) => void;
  selectedServiceTrackerId: string[];
  setSelectedServiceTrackerId: Dispatch<SetStateAction<string[]>>;
  selectedFilteredServiceTrackerId: string[];
  setSelectedFilteredServiceTrackerId: Dispatch<SetStateAction<string[]>>;
  unservedQueue: IUnservedQueue; // The type of unserved queue data
  setUnservedQueue: Dispatch<SetStateAction<IUnservedQueue>>; // A function to update unserved queues
  getUnservedQueue: (
    currentPage: number,
    pageSize: number,
    search?: string
  ) => void;
  unservedAmendment: IUnservedQueue; // The type of UnservedAmendment data
  setAllUnservedAmendment: Dispatch<SetStateAction<IUnservedQueue>>; // A function to update UnservedAmendment data
  getAllUnservedAmendment: (
    currentPage: number,
    pageSize: number,
    search?: string
  ) => void;
  bulkRecords: IServiceTrackerItems[];
  setBulkRecords: Dispatch<SetStateAction<IServiceTrackerItems[]>>;
  unservedQueueBulkRecords: IUnservedQueueItems[];
  setUnservedQueueBulkRecords: Dispatch<SetStateAction<IUnservedQueueItems[]>>;
  unservedQueueFilteredRecords: IUnservedQueueItems[];
  setUnservedQueueFilteredRecords: Dispatch<SetStateAction<IUnservedQueueItems[]>>;
};

// Create a context with an initial value
const initialServiceTrackerContextValue: ServiceTrackerContextType = {
  serviceTracker: {
    items: [      
      {
        id: "",
        status: "",
        caseNo: "",
        documents:[],
        propertyName: "",
        county: "",
        tenantFirstName: "",
        tenantLastName: "",
        unit: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        evictionDateFiled: new Date(),
        evictionServiceDate: new Date(),
        lastDayToAnswer: new Date(),
        courtDate: new Date(),
        answerDate: new Date(),
        evictionServiceMethod: "",
        answerDefendantName: "",
        answerDefendantEmail: "",
        evictionCourtDate: new Date(),
        evictionCourtTime: "",
        evictionCourtRoom: "",
        attorneyName: "",
        companyName:"",
        tenantNames: [],
        andAllOtherOccupants: "",
        serverNote: "",
        serverReceived: null,
        serviceDayCal: null,
        processServerEmail: "",
        expedited: ""
      }
    ],
    currentPage: 1,
    pageSize: 100,
    totalCount: 1,
    totalPages: 1,
    searchParam: "",
    evictionPdfLink: "",
  },
  setServiceTracker: () => {},
  getServiceTracker: () => {},
  showSpinner: false,
  setShowSpinner: () => {},
  selectedServiceTrackerId: [],
  setSelectedServiceTrackerId: () => {},
  unservedQueue: {
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
  setUnservedQueue: () => {},
  getUnservedQueue: () => {},
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
  bulkRecords: [],
  setBulkRecords: () => {},
  unservedQueueBulkRecords: [],
  setUnservedQueueBulkRecords: () => {},
  unservedQueueFilteredRecords: [],
  setUnservedQueueFilteredRecords: () => {},
  selectedFilteredServiceTrackerId: [],
  setSelectedFilteredServiceTrackerId: () => {},
};

// Create a context with an initial value
const ServiceTrackerContext = createContext<ServiceTrackerContextType>(
  initialServiceTrackerContextValue
);

// Provide a component to wrap the application and make the context available
export const ServiceTrackerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State to hold the service tracker data
  const [serviceTracker, setServiceTracker] = useState<IServiceTracker>(
    initialServiceTrackerContextValue.serviceTracker
  );
  const [unservedQueue, setUnservedQueue] = useState<IUnservedQueue>(
    initialServiceTrackerContextValue.unservedQueue
  );
  // State to hold the UnservedAmendments data
  const [unservedAmendment, setAllUnservedAmendment] = useState<IUnservedQueue>(
    initialServiceTrackerContextValue.unservedAmendment
  );
  // State to hold the service tracker spinner
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [selectedServiceTrackerId, setSelectedServiceTrackerId] = useState<string[]>(
    initialServiceTrackerContextValue.selectedServiceTrackerId
  );
  const [selectedFilteredServiceTrackerId, setSelectedFilteredServiceTrackerId] = useState<string[]>(
    initialServiceTrackerContextValue.selectedFilteredServiceTrackerId
  );
  const [bulkRecords, setBulkRecords] = useState<
  IServiceTrackerItems[]
>([]);
const [unservedQueueBulkRecords, setUnservedQueueBulkRecords] = useState<
IUnservedQueueItems[]
>([]);
const [unservedQueueFilteredRecords, setUnservedQueueFilteredRecords] = useState<
IUnservedQueueItems[]
>([]);
  /**
   * Get list of service tracker from api and bind that with the service tracker screen
   *
   */
  const getServiceTracker = async (
    currentPage: number,
    pageSize: number,
    search?: string
  ) => {
    try {
      
      setShowSpinner(true);
      // get service tracker
      const apiResponse = await ServiceTrackerService.getAllServiceTracker(
        currentPage,
        pageSize,
        search
      );
      if (apiResponse.status === HttpStatusCode.Ok) {
        setServiceTracker((prevFileEvictions) => ({
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
   /**
   * Get list of Unserved Queue from api and bind that with the Unserved Queue screen
   *
   */
   const getUnservedQueue = async (
    currentPage: number,
    pageSize: number,
    search?: string
  ) => {
    try {
      
      setShowSpinner(true);
      // get service tracker
      const apiResponse = await ServiceTrackerService.getAllUnservedQueue(
        currentPage,
        pageSize,
        search
      );
      if (apiResponse.status === HttpStatusCode.Ok) {
        setUnservedQueue((prevUnservedQueue) => ({
          ...prevUnservedQueue,
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
      
      const apiResponse = await ServiceTrackerService.getAllUnservedAmendments(
        currentPage,
        pageSize,
        search
      );
      if (apiResponse.status === HttpStatusCode.Ok) {
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
    <ServiceTrackerContext.Provider
      value={{
        showSpinner,
        serviceTracker,
        getServiceTracker,
        setServiceTracker,
        setShowSpinner,
        selectedServiceTrackerId,
        setSelectedServiceTrackerId,
        selectedFilteredServiceTrackerId,
        setSelectedFilteredServiceTrackerId,
        unservedQueue,
        setUnservedQueue,
        getUnservedQueue,
        unservedAmendment,
        getAllUnservedAmendment,
        setAllUnservedAmendment,
        bulkRecords,
        setBulkRecords,
        unservedQueueBulkRecords,
        setUnservedQueueBulkRecords,
        unservedQueueFilteredRecords,
        setUnservedQueueFilteredRecords,
      }}
    >
      {children}
    </ServiceTrackerContext.Provider>
  );
};

// Create a hook to easily access the serviceTracker context within components
export const useServiceTrackerContext = (): ServiceTrackerContextType => {
  // Get the context value using useContext
  const context = useContext(ServiceTrackerContext);
  // If the context is not found, throw an error
  if (!context) {
    throw new Error(
      "useServiceTrackerContext must be used within a ServiceTrackerProvider"
    );
  }
  // Return the context value
  return context;
};
