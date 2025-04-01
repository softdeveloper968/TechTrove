import React, {
    Dispatch, SetStateAction,
    createContext,
    useContext,
    useState
  } from "react";
import { HttpStatusCode } from "axios";
import {
    ILateNotices,
    ILateNoticesItems,
  } from "interfaces/late-notices.interface";
  import LateNoticesService from "services/late-notices.service";

  export type DismissalNVContextType = {
    showSpinner: boolean;
    setShowSpinner: Dispatch<SetStateAction<boolean>>;
    confirmedDismissals: ILateNotices; 
    setConfirmedDismissals: Dispatch<SetStateAction<ILateNotices>>;
    getNVDismissals: (
      currentPage: number,
      pageSize: number,
      isConfirmed:boolean,
      search?: string,
      filingType?:boolean|null,     
      status?:number,
    ) => void;
    pendingDismissals: ILateNotices; 
    setPendingDismissals: Dispatch<SetStateAction<ILateNotices>>;
    selectedNVDismissalId: string[];
    setSelectedNVDismissalId: Dispatch<SetStateAction<string[]>>;
    bulkRecords: ILateNoticesItems[];
  setBulkRecords: Dispatch<SetStateAction<ILateNoticesItems[]>>;
    // getPendingDismissals: (
    //   currentPage: number,
    //   pageSize: number,
    //   search?: string,
    //   filingType?:boolean|null,     
    //   status?:number,
    // ) => void;
  }

  const initialDismissalNVContextValue: DismissalNVContextType = {
    confirmedDismissals: {
        items: [],
        currentPage: 1,
        pageSize: 100,
        isConfirmed:true,
        totalCount: 1,
        totalPages: 1,
        searchParam: "",
      },
      setConfirmedDismissals: () => { },
      getNVDismissals: () => { },
      showSpinner: false,
      setShowSpinner: () => { },
      pendingDismissals: {
        items: [],
        currentPage: 1,
        pageSize: 100,
        isConfirmed:true,
        totalCount: 1,
        totalPages: 1,
        searchParam: "",
      },
      setPendingDismissals: () => { },
      selectedNVDismissalId: [],
      setSelectedNVDismissalId: () => {},
      bulkRecords: [],
  setBulkRecords: () => {},
      //getPendingDismissals: () => { },
  }

  export const DismissalNVContext = createContext<DismissalNVContextType>(
    initialDismissalNVContextValue
  );

  export const DismissalNVProvider: React.FC<{ children: any }> = ({
    children,
  }) => {
    // State to hold the late notices data
    const [confirmedDismissals, setConfirmedDismissals] = useState<ILateNotices>(
        initialDismissalNVContextValue.confirmedDismissals
    );
    
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [pendingDismissals, setPendingDismissals] = useState<ILateNotices>(
        initialDismissalNVContextValue.pendingDismissals
  );
  // state to hold data for selected grids
  const [selectedNVDismissalId, setSelectedNVDismissalId] = useState<string[]>(
    initialDismissalNVContextValue.selectedNVDismissalId
  );
  const [bulkRecords, setBulkRecords] = useState<ILateNoticesItems[]>([]);

    const getNVDismissals = async (
      currentPage: number,
      pageSize: number,
      isConfirmed:boolean,
      search?: string,
      filingType?:boolean|null,
      status?:number,
    ) => {
      try {
        
        setShowSpinner(true);
        // get late notices
        const apiResponse = await LateNoticesService.getConfirmedDismissals(
          currentPage,
          pageSize,
          isConfirmed,
          search,
        );
        if (apiResponse.status === HttpStatusCode.Ok) {
          if(isConfirmed){
            setConfirmedDismissals((prevLateNotices) => ({
              ...prevLateNotices,
              items: apiResponse.data.items,
              currentPage: apiResponse.data.currentPage,
              totalCount: apiResponse.data.totalCount,
              totalPages: apiResponse.data.totalPages,
              pageSize: apiResponse.data.pageSize,
              isConfirmed:isConfirmed,
              filingType:filingType,
              status:status,
              ...(search ? { searchParam: search } : {}),
            }));
          }
          else{
            setPendingDismissals((prevLateNotices) => ({
              ...prevLateNotices,
              items: apiResponse.data.items,
              currentPage: apiResponse.data.currentPage,
              totalCount: apiResponse.data.totalCount,
              totalPages: apiResponse.data.totalPages,
              pageSize: apiResponse.data.pageSize,
              isConfirmed:isConfirmed,
              filingType:filingType,
              status:status,
              ...(search ? { searchParam: search } : {}),
            }));
          }
          
        }
      } finally {
        setShowSpinner(false);
      }
    };

    // const getPendingDismissals = async (
    //   currentPage: number,
    //   pageSize: number,
    //   search?: string,
    //   filingType?:boolean|null,
    //   status?:number,
    // ) => {
    //   try {
        
    //     setShowSpinner(true);
    //     // get late notices
    //     // const apiResponse = await LateNoticesService.getConfirmed(
    //     //   currentPage,
    //     //   pageSize,
    //     //   search,
    //     // );
    //     // if (apiResponse.status === HttpStatusCode.Ok) {
    //     //   setConfirmedDismissals((prevLateNotices) => ({
    //     //     ...prevLateNotices,
    //     //     items: apiResponse.data.items,
    //     //     currentPage: apiResponse.data.currentPage,
    //     //     totalCount: apiResponse.data.totalCount,
    //     //     totalPages: apiResponse.data.totalPages,
    //     //     pageSize: apiResponse.data.pageSize,
    //     //     filingType:filingType,
    //     //     status:status,
    //     //     ...(search ? { searchParam: search } : {}),
    //     //   }));
    //     // }
    //   } finally {
    //     setShowSpinner(false);
    //   }
    // };
    // Provide the context value to its children
    return (
      <DismissalNVContext.Provider
        value={{
          showSpinner,
          confirmedDismissals,
          setConfirmedDismissals,
          getNVDismissals,
          setShowSpinner,
          pendingDismissals,
         // getPendingDismissals,
          setPendingDismissals,
          selectedNVDismissalId,
          setSelectedNVDismissalId,
          bulkRecords,
        setBulkRecords,
        }}
      >
        {children}
      </DismissalNVContext.Provider>
    );
  };

  export const useDismissalNVContext = (): DismissalNVContextType => {
    // Get the context value using useContext
    const context = useContext(DismissalNVContext);
    // If the context is not found, throw an error
    if (!context) {
      throw new Error(
        "useDismissalNVContext must be used within a DismissalNVProvider"
      );
    }
    // Return the context value
    return context;
  };