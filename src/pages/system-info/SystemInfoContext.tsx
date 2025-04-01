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
import { ISystemInfo } from "interfaces/system-info.interface";
import SystemInfoService from "services/system-info.service";
    
    // Define the shape of the context data
    type SystemInfoContextType = {
      showSpinner: boolean;
      setShowSpinner: Dispatch<SetStateAction<boolean>>;
      systemInfo: ISystemInfo; // The type of System Info data
      setSystemInformationRecords: Dispatch<SetStateAction<ISystemInfo>>; // A function to update System Info Records
      getSystemInformationRecords: (currentPage: number, pageSize: number, search?: string) => void;
    };
    
    // Create a context with an initial value
    const initialSystemInfoContextValue: SystemInfoContextType = {
      showSpinner: false,
      setShowSpinner: () => {},
      systemInfo: {
          items: [
            {
                id:"34abc",
                status: "InActive",
                lastSync: "08/10/24 10:30 AM",
                nextSync: "10/10/24 11:30 AM",  
                syncStatus: "10/20/24 03:45 PM",             
              scheduler:"Cobb Crawl"
            },
            {
                id:"34xyz",
                status: "Active",
                lastSync: "04/14/24 09:30 AM",
                nextSync: "10/14/24 10:30 AM",  
                syncStatus: "10/15/24 12:45 PM",             
              scheduler:"Email"
            },
            {
                id:"34axc",
                status: "Completed",
                lastSync: "05/10/24 08:30 AM",
                nextSync: "10/10/24 09:30 AM",  
                syncStatus: "10/15/24 12:52 PM",               
              scheduler:"Cobb Crawl"
            },
          ],
          currentPage: 1,
          pageSize: 100,
          totalCount: 3,
          totalPages: 1,
          searchParam: "",
        },
        setSystemInformationRecords: () => {},
        getSystemInformationRecords: () => {},
    };
    
    // Create a context with an initial value
    const SystemInfoContext = createContext<SystemInfoContextType>(
        initialSystemInfoContextValue
    );
    
    // Provide a component to wrap the application and make the context available
    export const SystemInfoProvider: React.FC<{ children: ReactNode }> = ({
      children,
    }) => {
   
       // State to hold the system info data
    const [systemInfo, setSystemInformationRecords] = useState<ISystemInfo>(
        initialSystemInfoContextValue.systemInfo
    );
      // State to hold the system info spinner
      const [showSpinner, setShowSpinner] = useState<boolean>(false);
  
      const getSystemInformationRecords = async (
          currentPage: number,
          pageSize: number,
          search?: string,
        ) => {
          try {
            setShowSpinner(true);
            // get All payments
            const apiResponse = await SystemInfoService.getSystemInformationRecords(
              currentPage,
              pageSize,
              search,
            );
            if (apiResponse.status === HttpStatusCode.Ok) {
                setSystemInformationRecords((prevAllCases) => ({
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
        <SystemInfoContext.Provider
          value={{
            showSpinner,
            setShowSpinner,
            systemInfo,
            setSystemInformationRecords,
            getSystemInformationRecords,
          }}
        >
          {children}
        </SystemInfoContext.Provider>
      );
    };
    
    // Create a hook to easily access the System Info context within components
    export const useSystemInfoContext = (): SystemInfoContextType => {
      // Get the context value using useContext
      const context = useContext(SystemInfoContext);
      // If the context is not found, throw an error
      if (!context) {
        throw new Error(
          "useSystemInfoContext must be used within a SystemInfoProvider"
        );
      }
      // Return the context value
      return context;
    };
    
