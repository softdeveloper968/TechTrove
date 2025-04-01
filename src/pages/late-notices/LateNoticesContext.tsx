// LateNoticesContext.tsx
import React, {
  Dispatch, SetStateAction,
  createContext,
  useContext,
  useState
} from "react";
import { HttpStatusCode } from "axios";

import {
  IConfirmDelinquenciesQueue,
  ILateNotice_SignProofInfo,
  ILateNotices,
  ILateNoticesItems,
} from "interfaces/late-notices.interface";
import { ICompanyItems } from "interfaces/writ-labor-interface";
import { ICountyItems } from "interfaces/county.interface";
import { IEvictionAutomationOtherQueue } from "interfaces/eviction-automation.interface";
import LateNoticesService from "services/late-notices.service";
import EvictionAutomationService from "services/eviction-automation.service";
import AllUsersService from "services/all-users.service";
import CountyService from "services/county.service";


// Define the shape of the context data
export type LateNoticesContextType = {
  showSpinner: boolean;
  setShowSpinner: Dispatch<SetStateAction<boolean>>;
  lateNotices: ILateNotices; // The type of late notices data
  confirmDelinquenciesQueue: IConfirmDelinquenciesQueue;
  setConfirmDelinquenciesQueue: Dispatch<SetStateAction<IConfirmDelinquenciesQueue>>;
  getConfirmDelinquenciesQueue: (currentPage: number, pageSize: number, isConfirmed: boolean, isViewAll: boolean, search?: string,filingType?:boolean|null) => void;
  setLateNotices: Dispatch<SetStateAction<ILateNotices>>; // A function to update late notices
  getLateNotices: (
    currentPage: number,
    pageSize: number,
    search?: string,
    filingType?:boolean|null,     
    status?:number,
  ) => void;
  getSignedLateNotices: (
    currentPage: number,
    pageSize: number,
    search?: string
  ) => void;
  signedLateNotices: ILateNotices;
  setSignedLateNotices: Dispatch<SetStateAction<ILateNotices>>; // A function to update late notices
  selectedLateNoticeId: string[];
  setSelectedLateNoticeId: Dispatch<SetStateAction<string[]>>;
  selectedSignedLateNoticeId: string[];
  setSelectedSignedLateNoticeId: Dispatch<SetStateAction<string[]>>;
  selectedConfirmDelinquenciesId: string[];
  setSelectedConfirmDelinquenciesId: Dispatch<SetStateAction<string[]>>;
  setActiveTab: Dispatch<SetStateAction<string>>;
  allCompanies: ICompanyItems[];
  getAllCompanies: () => void;
  setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
  activeTab: string;
  showSpinnerSignedLateNotices: boolean;
  setShowSpinnerSignedLateNotices: Dispatch<SetStateAction<boolean>>;
  unsignedNotice: boolean;
  setUnsignedNotice: Dispatch<SetStateAction<boolean>>;
  bulkRecords: ILateNoticesItems[];
  setBulkRecords: Dispatch<SetStateAction<ILateNoticesItems[]>>;
  counties: ICountyItems[];
  setCounties: Dispatch<SetStateAction<ICountyItems[]>>;
  getCounties: () => void;
  signProofInfo: ILateNotice_SignProofInfo;
  setSignProofInfo: Dispatch<SetStateAction<ILateNotice_SignProofInfo>>;
  selectedEvictionNoticeId: string[];
  setSelectedEvictionNoticeId: Dispatch<SetStateAction<string[]>>;
  evictionAutomationNoticesConfirmQueue: IEvictionAutomationOtherQueue;
  setEvictionAutomationNoticesConfirmQueue: Dispatch<SetStateAction<IEvictionAutomationOtherQueue>>;
  getEvictionAutomationNoticeQueue: (currentPage: number, pageSize: number, isConfirmed: boolean, isViewAll: boolean, search?: string) => void;
  selectedTab:string;
  setSelectedTab:Dispatch<SetStateAction<string>>;
};

// Create a context with an initial value
const initialLateNoticesContextValue: LateNoticesContextType = {
  confirmDelinquenciesQueue:
  {
    items: [{
      isChecked: false,
      id: "",
      county: "",
      tenantNames: [
        { firstName: "", lastName: "", middleName: "" },
      ],
      andAllOtherTenants: "",
      tenantAddress: "",
      tenantUnit: "",
      tenantCity: "",
      tenantState: "",
      tenantZip: "",
      reason: "",
      evictionTotalRentDue: "",
      monthlyRent: 0, // Example monthly rent
      allMonths: "",
      evictionOtherFees: "",
      ownerName: "",
      propertyName: "",
      propertyPhone: "",
      propertyEmail: "",
      propertyAddress: "",
      propertyCity: "",
      propertyState: "",
      propertyZip: "",
      attorneyName: "",
      attorneyBarNo: "",
      attorneyEmail: "",
      filerBusinessName: "",
      evictionAffiantIs: "",
      filerPhone: "",
      filerEmail: "",
      processServer: "",
      processServerEmail: "",
      expedited: "",
      stateCourt: "",
      clientReferenceId: "",
      processServerCompany: "",
      clientId:""
    },],
    currentPage: 1,
    pageSize: 1,
    totalCount: 1,
    totalPages: 1,
    isViewAll: true,
  },
  setConfirmDelinquenciesQueue: () => { },
  getConfirmDelinquenciesQueue: () => { },
  lateNotices: {
    items: [
      {
        isChecked: false,
        id: "",
        noticeAffiant: "",
        noticeDate: new Date(),
        noticeDeliveredToName: "",
        deliveryDate: new Date(),
        lateFeesDate: new Date(),
        lateFees: 0,
        otherFees: "",
        noticePeriod: 0,
        deliveredBy: "",
        serviceMethod: "",
        totalDue: 0,
        property: "",
        address: "",
        city: "",
        state: "",
        unit: "",
        // firstName: "",
        // lastName: "",
        zip: "",
        rentDue: 0,
      },
    ],
    currentPage: 1,
    pageSize: 100,
    isConfirmed:true,
    totalCount: 1,
    totalPages: 1,
    searchParam: "",
  },
  setLateNotices: () => { },
  setSignedLateNotices: () => { },
  selectedLateNoticeId: [],
  setSelectedLateNoticeId: () => { },
  selectedConfirmDelinquenciesId: [],
  setSelectedConfirmDelinquenciesId: () => { },
  selectedSignedLateNoticeId: [],
  setSelectedSignedLateNoticeId: () => { },
  signedLateNotices: {
    items: [
      {
        isChecked: false,
        id: "",
        noticeAffiant: "",
        noticeDate: new Date(),
        noticeDeliveredToName: "",
        deliveryDate: new Date(),
        lateFeesDate: new Date(),
        lateFees: 0,
        otherFees: "",
        noticePeriod: 0,
        deliveredBy: "",
        serviceMethod: "",
        totalDue: 0,
        property: "",
        address: "",
        city: "",
        state: "",
        unit: "",
        tenantNames: [{ firstName: "", lastName: "", middleName: "" }],
        zip: "",
        rentDue: 0,
      },
    ],
    currentPage: 1,
    pageSize: 100,
    isConfirmed:true,
    totalCount: 1,
    totalPages: 1,
  },
  getLateNotices: () => { },
  getSignedLateNotices: () => { },
  showSpinner: false,
  setShowSpinner: () => { },
  showSpinnerSignedLateNotices: false,
  setShowSpinnerSignedLateNotices: () => { },
  unsignedNotice: true,
  setUnsignedNotice: () => { },
  setActiveTab: () => { },
  allCompanies: [
    {
      id: "",
      companyName: "",
      phone: "",
      clientType: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      email: "",
      notes: "",
      isProcessServer: false,
    },
  ],
  getAllCompanies: () => { },
  setAllCompanies: () => { },
  activeTab: "",
  bulkRecords: [],
  setBulkRecords: () => { },
  counties: [],
  setCounties: () => { },
  getCounties: () => { },
  signProofInfo: {
    deliveredTo: "",
    deliveryDate: null,
    methodId: 0,
    dispoIds: [],
    signature: "",
  },
  setSignProofInfo: () => { },
  selectedEvictionNoticeId: [],
  setSelectedEvictionNoticeId: () => { },
  evictionAutomationNoticesConfirmQueue:
  {
    items: [{
      isChecked: false,
      id: "",
      county: "",
      tenantNames: [
        { firstName: "", lastName: "", middleName: "" },
      ],
      andAllOtherTenants: "",
      tenantAddress: "",
      tenantUnit: "",
      tenantCity: "",
      tenantState: "",
      tenantZip: "",
      reason: "",
      evictionTotalRentDue: "",
      monthlyRent: 0, // Example monthly rent
      allMonths: "",
      evictionOtherFees: "",
      ownerName: "",
      propertyName: "",
      propertyPhone: "",
      propertyEmail: "",
      propertyAddress: "",
      propertyCity: "",
      propertyState: "",
      propertyZip: "",
      attorneyName: "",
      attorneyBarNo: "",
      attorneyEmail: "",
      filerBusinessName: "",
      evictionAffiantIs: "",
      filerPhone: "",
      filerEmail: "",
      processServer: "",
      processServerEmail: "",
      expedited: "",
      stateCourt: "",
      clientReferenceId: "",
      processServerCompany: "",
      clientId:""
    },],
    currentPage: 1,
    pageSize: 1,
    totalCount: 1,
    totalPages: 1,
    isViewAll: true,
  },
  setEvictionAutomationNoticesConfirmQueue: () => { },
  getEvictionAutomationNoticeQueue: () => { },
  selectedTab:"",
  setSelectedTab:()=>{},
};
// Create a context with an initial value
export const LateNoticesContext = createContext<LateNoticesContextType>(
  initialLateNoticesContextValue
);

// Provide a component to wrap the application and make the context available
export const LateNoticesProvider: React.FC<{ children: any }> = ({
  children,
}) => {
  // State to hold the late notices data
  const [lateNotices, setLateNotices] = useState<ILateNotices>(
    initialLateNoticesContextValue.lateNotices
  );
  const [signProofInfo, setSignProofInfo] = useState<ILateNotice_SignProofInfo>(
    initialLateNoticesContextValue.signProofInfo
  );
  // State to hold the late notices spinner
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [showSpinnerSignedLateNotices, setShowSpinnerSignedLateNotices] =
    useState<boolean>(false);

  const [unsignedNotice, setUnsignedNotice] =
    useState<boolean>(true);

  // state to hold data for selected grids
  const [selectedLateNoticeId, setSelectedLateNoticeId] = useState<string[]>(
    initialLateNoticesContextValue.selectedLateNoticeId
  );
  const [selectedConfirmDelinquenciesId, setSelectedConfirmDelinquenciesId] = useState<string[]>(
    initialLateNoticesContextValue.selectedConfirmDelinquenciesId
  );

  const [signedLateNotices, setSignedLateNotices] = useState<ILateNotices>(
    initialLateNoticesContextValue.signedLateNotices
  );
  const [selectedSignedLateNoticeId, setSelectedSignedLateNoticeId] = useState<
    string[]
  >([]);
  const [confirmDelinquenciesQueue, setConfirmDelinquenciesQueue] = useState<
    IConfirmDelinquenciesQueue>(initialLateNoticesContextValue.confirmDelinquenciesQueue);
  const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
    initialLateNoticesContextValue.allCompanies
  );
  const [counties, setCounties] = useState<ICountyItems[]>([]);

  const [activeTab, setActiveTab] = useState<string>("");

  const [bulkRecords, setBulkRecords] = useState<
    ILateNoticesItems[]
  >([]);
  const [selectedEvictionNoticeId, setSelectedEvictionNoticeId] = useState<string[]>(
    initialLateNoticesContextValue.selectedEvictionNoticeId
  );
  const [selectedTab, setSelectedTab] = useState<string>(
    initialLateNoticesContextValue.selectedTab
  );
  const [evictionAutomationNoticesConfirmQueue, setEvictionAutomationNoticesConfirmQueue] = useState<IEvictionAutomationOtherQueue>(initialLateNoticesContextValue.evictionAutomationNoticesConfirmQueue);
  /**
   * Get list of late notices from api and bind that with the late notice screen
   *
   */
  const getLateNotices = async (
    currentPage: number,
    pageSize: number,
    search?: string,
    filingType?:boolean|null,
    status?:number,
  ) => {
    try {
      
      setShowSpinner(true);
      // get late notices
      const apiResponse = await LateNoticesService.getAllLateNotices(
        currentPage,
        pageSize,
        search,
        "",
        filingType,
        status
      );
      if (apiResponse.status === HttpStatusCode.Ok) {
        setLateNotices((prevLateNotices) => ({
          ...prevLateNotices,
          items: apiResponse.data.items,
          currentPage: apiResponse.data.currentPage,
          totalCount: apiResponse.data.totalCount,
          totalPages: apiResponse.data.totalPages,
          pageSize: apiResponse.data.pageSize,
          filingType:filingType,
          status:status,
          ...(search ? { searchParam: search } : {}),
        }));
      }
    } finally {
      setShowSpinner(false);
    }
  };
  const getSignedLateNotices = async (
    currentPage: number,
    pageSize: number,
    search?: string
  ) => {
    try {
      setShowSpinnerSignedLateNotices(true);
      // get late notices
      const apiResponse = await LateNoticesService.getSignedLateNotices(
        currentPage,
        pageSize,
        search
      );
      if (apiResponse.status === HttpStatusCode.Ok) {
        setSignedLateNotices((prevSignedLateNotices) => ({
          ...prevSignedLateNotices,
          items: apiResponse.data.items,
          currentPage: apiResponse.data.currentPage,
          totalCount: apiResponse.data.totalCount,
          totalPages: apiResponse.data.totalPages,
          pageSize: apiResponse.data.pageSize,
        }));
      }
    } finally {
      setShowSpinnerSignedLateNotices(false);
    }
  };
  const getConfirmDelinquenciesQueue = async (
    currentPage: number,
    pageSize: number,
    isConfirmed: boolean,
    isViewAll: boolean,
    searchParam?: string,
    filingType?:boolean|null
  ) => {
    try {
      setShowSpinner(true);
      var casesIds = localStorage.getItem("casesList")?.split(",");
      const apiResponse = await LateNoticesService.getConfirmDelinquenciesQueue(
        currentPage,
        pageSize,
        isConfirmed,
        isViewAll,
        searchParam,
        filingType,
        casesIds ?? []
      );
      if (apiResponse.status === HttpStatusCode.Ok) {
        ;
        if (isConfirmed) {
          setConfirmDelinquenciesQueue((prevAllCases) => ({
            ...prevAllCases,
            items: apiResponse.data.items,
            currentPage: apiResponse.data.currentPage,
            totalCount: apiResponse.data.totalCount,
            totalPages: apiResponse.data.totalPages,
            pageSize: apiResponse.data.pageSize,
            isViewAll: isViewAll,
            filingType:filingType,
            ...(searchParam ? { searchParam: searchParam } : {}),
          }));
        }

        else {
          setConfirmDelinquenciesQueue((prevAllCases) => ({
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

      }
    } finally {
      setShowSpinner(false);
    }
  };
  const getAllCompanies = async () => {
    try {
      setShowSpinner(true);
      // get late notices
      const apiResponse = await AllUsersService.getAllCompaniesList();
      if (apiResponse.status === HttpStatusCode.Ok) {
        setAllCompanies(apiResponse.data);
      }
    } finally {
      setShowSpinner(false);
    }
  };
  const getCounties = async () => {
    try {
      // setShowSpinner(true);
      const response = await CountyService.getCounties();
      if (response.status === HttpStatusCode.Ok) {
        setCounties(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      // setShowSpinner(true);
    }
  };
  const getEvictionAutomationNoticeQueue = async (
    currentPage: number,
    pageSize: number,
    isConfirmed: boolean,
    isViewAll: boolean,
    searchParam?: string,
  ) => {
    try {
      setShowSpinner(true);
      var casesIds = localStorage.getItem("casesList")?.split(",");
      const apiResponse = await EvictionAutomationService.getEvictionAutomationNoticeQueue(
        currentPage,
        pageSize,
        isConfirmed,
        isViewAll,
        searchParam,
        casesIds ?? []
      );
      if (apiResponse.status === HttpStatusCode.Ok) {

        setEvictionAutomationNoticesConfirmQueue((prevAllCases) => ({
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
    <LateNoticesContext.Provider
      value={{
        showSpinnerSignedLateNotices,
        setShowSpinnerSignedLateNotices,
        unsignedNotice,
        setUnsignedNotice,
        showSpinner,
        lateNotices,
        setLateNotices,
        getLateNotices,
        getSignedLateNotices,
        signedLateNotices,
        setSignedLateNotices,
        setSelectedLateNoticeId,
        setSelectedConfirmDelinquenciesId,
        setShowSpinner,
        setSelectedSignedLateNoticeId,
        selectedSignedLateNoticeId,
        selectedLateNoticeId,
        selectedConfirmDelinquenciesId,
        activeTab,
        setActiveTab,
        allCompanies,
        getAllCompanies,
        setAllCompanies,
        bulkRecords,
        setBulkRecords,
        confirmDelinquenciesQueue,
        setConfirmDelinquenciesQueue,
        getConfirmDelinquenciesQueue,
        counties,
        setCounties,
        getCounties,
        signProofInfo,
        setSignProofInfo,
        setSelectedEvictionNoticeId,
        selectedEvictionNoticeId,
        getEvictionAutomationNoticeQueue,
        setEvictionAutomationNoticesConfirmQueue,
        evictionAutomationNoticesConfirmQueue,
        selectedTab,
        setSelectedTab,
      }}
    >
      {children}
    </LateNoticesContext.Provider>
  );
};

// Create a hook to easily access the late notices context within components
export const useLateNoticesContext = (): LateNoticesContextType => {
  // Get the context value using useContext
  const context = useContext(LateNoticesContext);
  // If the context is not found, throw an error
  if (!context) {
    throw new Error(
      "useLateNoticesContext must be used within a LateNoticesProvider"
    );
  }
  // Return the context value
  return context;
};
