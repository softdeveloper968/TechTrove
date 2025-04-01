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
import { ICountyItems } from "interfaces/county.interface";
import CountyService from "services/county.service";
import { ICompanyItems } from "interfaces/writ-labor-interface";
import AllUsersService from "services/all-users.service";
import { useAuth } from "context/AuthContext";

  export type FileEvictionNVContextType = {
    showSpinner: boolean;
    setShowSpinner: Dispatch<SetStateAction<boolean>>;
    confirmedEvictions: ILateNotices; 
    setConfirmedEvictions: Dispatch<SetStateAction<ILateNotices>>;
    getNVEvictions: (
      currentPage: number,
      pageSize: number,
      isConfirmed:boolean,
      search?: string,
      filingType?:boolean|null,     
      status?:number,
    ) => void;
    pendingEvictions: ILateNotices; 
    setPendingEvictions: Dispatch<SetStateAction<ILateNotices>>;
    selectedNVEvictionId: string[];
   setSelectedNVEvictionId: Dispatch<SetStateAction<string[]>>;
   counties: ICountyItems[];
  setCounties: Dispatch<SetStateAction<ICountyItems[]>>;
  getCounties: () => void;
  allCompanies: ICompanyItems[];
  getAllCompanies: () => void;
  setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
  bulkRecords: ILateNoticesItems[];
  setBulkRecords: Dispatch<SetStateAction<ILateNoticesItems[]>>;
    // getPendingEvictions: (
    //   currentPage: number,
    //   pageSize: number,
    //   search?: string,
    //   filingType?:boolean|null,     
    //   status?:number,
    // ) => void;
  }

  const initialFileEvictionNVContextValue: FileEvictionNVContextType = {
    confirmedEvictions: {
        items: [],
        currentPage: 1,
        pageSize: 100,
        totalCount: 1,
        totalPages: 1,
        isConfirmed:true,
        searchParam: "",
      },
      setConfirmedEvictions: () => { },
      getNVEvictions: () => { },
      showSpinner: false,
      setShowSpinner: () => { },
      pendingEvictions: {
        items: [],
        currentPage: 1,
        pageSize: 100,
        totalCount: 1,
        totalPages: 1,
        isConfirmed:false,
        searchParam: "",
      },
      setPendingEvictions: () => { },
      selectedNVEvictionId: [],
      setSelectedNVEvictionId: () => { },
      counties: [],
  setCounties: () => { },
  getCounties: () => { },
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
  bulkRecords: [],
  setBulkRecords: () => {},
   //   getPendingEvictions: () => { },
  }

  export const FileEvictionNVContext = createContext<FileEvictionNVContextType>(
    initialFileEvictionNVContextValue
  );

  export const FileEvictionNVProvider: React.FC<{ children: any }> = ({
    children,
  }) => {
    // State to hold the late notices data
    const [confirmedEvictions, setConfirmedEvictions] = useState<ILateNotices>(
        initialFileEvictionNVContextValue.confirmedEvictions
    );
    
    const [selectedNVEvictionId, setSelectedNVEvictionId] = useState<string[]>(
      initialFileEvictionNVContextValue.selectedNVEvictionId
   );
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [pendingEvictions, setPendingEvictions] = useState<ILateNotices>(
      initialFileEvictionNVContextValue.pendingEvictions
  );
  const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
    initialFileEvictionNVContextValue.allCompanies
  );
  const [counties, setCounties] = useState<ICountyItems[]>([]);
  const [bulkRecords, setBulkRecords] = useState<ILateNoticesItems[]>([]);
  const { 
    selectedStateValue
  } = useAuth();

    const getNVEvictions = async (
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
        const apiResponse = await LateNoticesService.getConfirmedEvictions(
          currentPage,
          pageSize,
          isConfirmed,
          search,
        );
        if (apiResponse.status === HttpStatusCode.Ok) {
          if(isConfirmed){
            setConfirmedEvictions((prevLateNotices) => ({
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
            setPendingEvictions((prevLateNotices) => ({
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
    const getCounties = async () => {
      try {
        // setShowSpinner(true);
        const response = await CountyService.getCounties();
        if (response.status === HttpStatusCode.Ok) {
          var stateCounties=response.data.filter(
            (x:any) => x.stateName?.toLowerCase() === selectedStateValue?.toLowerCase()
          );
          setCounties(stateCounties);
        }
      } catch (error) {
        console.log(error);
      } finally {
        // setShowSpinner(true);
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
    // const getPendingEvictions = async (
    //   currentPage: number,
    //   pageSize: number,
    //   search?: string,
    //   filingType?:boolean|null,
    //   status?:number,
    // ) => {
    //   try {
        
    //     setShowSpinner(true);
    //     // get late notices
    //     // const apiResponse = await LateNoticesService.getConfirmedEvictions(
    //     //   currentPage,
    //     //   pageSize,
    //     //   search,
    //     // );
    //     // if (apiResponse.status === HttpStatusCode.Ok) {
    //     //   setConfirmedEvictions((prevLateNotices) => ({
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
      <FileEvictionNVContext.Provider
        value={{
          showSpinner,
          confirmedEvictions,
          setConfirmedEvictions,
          getNVEvictions,
          setShowSpinner,
          pendingEvictions,
         // getPendingEvictions,
          setPendingEvictions,
          selectedNVEvictionId,
          setSelectedNVEvictionId,
          counties,
        setCounties,
        getCounties,
        allCompanies,
        getAllCompanies,
        setAllCompanies,
        bulkRecords,
        setBulkRecords,
        }}
      >
        {children}
      </FileEvictionNVContext.Provider>
    );
  };

  export const useFileEvictionNVContext = (): FileEvictionNVContextType => {
    // Get the context value using useContext
    const context = useContext(FileEvictionNVContext);
    // If the context is not found, throw an error
    if (!context) {
      throw new Error(
        "useFileEvictionNVContext must be used within a FileEvictionNVProvider"
      );
    }
    // Return the context value
    return context;
  };