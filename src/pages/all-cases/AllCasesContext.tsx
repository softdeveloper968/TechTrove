import React, {
   Dispatch,
   ReactNode,
   SetStateAction,
   createContext,
   useContext,
   useState,
} from "react";
import { HttpStatusCode } from "axios";
import {
   IAllCases,
   IAllCasesItems,
   IAllCasesReason,
   IWritsLabor
} from "interfaces/all-cases.interface";
import { ICountyItems } from "interfaces/county.interface";
import AllCasesService from "services/all-cases.service";
import CountyService from "services/county.service";
import { ICompanyItems } from "interfaces/all-users.interface";
import AllUsersService from "services/all-users.service";
import { useAuth } from "context/AuthContext";
import { SortingOption } from "interfaces/common.interface";
import CourtService from "services/court.service";
import { ICourtDropdownList } from "interfaces/court.interface";

// Define the shape of the context data
type AllCasesContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   allCases: IAllCases; // The type of All Cases data
   setAllCases: Dispatch<SetStateAction<IAllCases>>; // A function to update AllCases
   getAllCases: (currentPage: number, pageSize: number, searchParam?: string, status?: string, county?: string, filing?: boolean | null, court?: string, sortings?: SortingOption[]) => void;
   selectedAllCasesId: string[];
   selectedFilteredCasesId: string[];
   setSelectedAllCasesId: Dispatch<SetStateAction<string[]>>;
   setSelectedFilteredCasesId: Dispatch<SetStateAction<string[]>>;
   selectedCaseIdsForFiling: string[];
   setSelectedCaseIdsForFiling: Dispatch<SetStateAction<string[]>>;
   // issignerPermission: boolean;
   // setIsSignerPermission: Dispatch<SetStateAction<boolean>>;
   selectedReason: IAllCasesReason[];
   setSelectedReason: Dispatch<SetStateAction<IAllCasesReason[]>>;
   filteredRecords: IAllCasesItems[],
   setFilteredRecords: Dispatch<SetStateAction<IAllCasesItems[]>>;
   getWritLabors: () => void;
   setWritLabors: Dispatch<SetStateAction<IWritsLabor[]>>;
   writLabors: IWritsLabor[],
   bulkRecords: IAllCasesItems[];
   setBulkRecords: Dispatch<SetStateAction<IAllCasesItems[]>>;
   allCounties: ICountyItems[];
   getAllCounties: () => void;
   setAllCounties: Dispatch<SetStateAction<ICountyItems[]>>;
   showCaseSnapShot: boolean;
   setShowCaseSnapShot: Dispatch<SetStateAction<boolean>>;
   allCompanies: ICompanyItems[];
   getAllCompanies: () => void;
   setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
   clickedFilingButton: string,
   setClickedFilingButton: Dispatch<SetStateAction<string>>;
   searchCases: string,
   setSearchCases: Dispatch<SetStateAction<string>>;
   filingType: string,
   setFilingType: Dispatch<SetStateAction<string>>;
   caseSearchError: string,
   setCaseSearchError: Dispatch<SetStateAction<string>>;
   unFinedCases: string[],
   setUnFindCases: Dispatch<SetStateAction<string[]>>;
   courts: ICourtDropdownList[];
   setCourts: Dispatch<SetStateAction<ICourtDropdownList[]>>;
   getCourts: () => void;
   caseSearchFor: string;
   setCaseSearchFor: Dispatch<SetStateAction<string>>;
   proceedWithDismissals: boolean;
   setProceedWithDismissals: Dispatch<SetStateAction<boolean>>;
};

// Create a context with an initial value
const initialAllCasesContextValue: AllCasesContextType = {
   allCases: {
      items: [
         {
            isChecked: false,
            id: "",
            status: "",
            caseNo: "",
            documents: [],
            militaryStatusDoc: [],
            tenantNames: [],
            propertyName: "",
            county: "",
            tenantFirstName: "",
            tenantLastName: "",
            unit: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            attorneyBarNo: "",
            evictionDateFiled: null,
            evictionServiceDate: null,
            answerBy: null,
            evictionServiceMethod: "",
            courtDate: null,
            dismissalFileDate: null,
            writFiledDate: null,
            attorneyName: "",
            evictionAffiantSignature: "",
            answerDate: null,
            writSignDate: null,
            noticeCount: 0,
            evictionCount: 0,
            amendmentAffiantSignature: "",
            amendedBy: "",
            // caseCount: 0,
            reason: "",
            companyName: "",
            ownerName: "",
            monthlyRent: "",
            totalRent: "",
            evictionAffiantIs: "",
            andAllOtherOccupants: "",
            envelopeNo: "",
            createdAt: "",
            crmInfo: {
               id: "",
               crmName: "",
               status: "",
               statusDate: null,
            },
            clientReferenceId: "",
            issueDate: null,
            isDismissal: null
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 1,
      searchParam: "",
      status: "",
      county: "",
      filingType: null,
      sortings: []
   },
   setAllCases: () => { },
   getAllCases: () => { },
   selectedAllCasesId: [],
   selectedFilteredCasesId: [],
   setSelectedAllCasesId: () => { },
   setSelectedFilteredCasesId: () => { },
   selectedCaseIdsForFiling: [],
   setSelectedCaseIdsForFiling: () => { },
   showSpinner: false,
   setShowSpinner: () => { },
   showCaseSnapShot: false,
   setShowCaseSnapShot: () => { },
   filteredRecords: [],
   setFilteredRecords: () => { },
   // issignerPermission: false,
   // setIsSignerPermission: () => {},
   selectedReason: [],
   setSelectedReason: () => { },
   getWritLabors: () => { },
   setWritLabors: () => { },
   writLabors: [],
   bulkRecords: [],
   setBulkRecords: () => { },
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
   allCompanies: [],
   getAllCompanies: () => { },
   setAllCompanies: () => { },
   clickedFilingButton: "",
   setClickedFilingButton: () => { },
   searchCases: "",
   setSearchCases: () => { },
   filingType: "",
   setFilingType: () => { },
   caseSearchError: "",
   setCaseSearchError: () => { },
   unFinedCases: [],
   setUnFindCases: () => { },
   courts: [],
   setCourts: () => { },
   getCourts: () => { },
   caseSearchFor: "",
   setCaseSearchFor: () => { },
   proceedWithDismissals: true,
   setProceedWithDismissals: () => { },
};

// Create a context with an initial value
const AllCasesContext = createContext<AllCasesContextType>(
   initialAllCasesContextValue
);

// Provide a component to wrap the application and make the context available
export const AllCasesProvider: React.FC<{ children: ReactNode }> = ({
   children,
}) => {
   // State to hold the allcases data
   const [allCases, setAllCases] = useState<IAllCases>(
      initialAllCasesContextValue.allCases
   );
   // State to hold the late notices spinner
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [showCaseSnapShot, setShowCaseSnapShot] = useState<boolean>(false);
   const [allCounties, setAllCounties] = useState<ICountyItems[]>(
      initialAllCasesContextValue.allCounties
   );
   // state to hold data for selected grids
   const [selectedAllCasesId, setSelectedAllCasesId] = useState<string[]>(
      initialAllCasesContextValue.selectedAllCasesId
   );
   const [selectedFilteredCasesId, setSelectedFilteredCasesId] = useState<string[]>(
      initialAllCasesContextValue.selectedAllCasesId
   );
   const [selectedCaseIdsForFiling, setSelectedCaseIdsForFiling] = useState<string[]>(
      initialAllCasesContextValue.selectedCaseIdsForFiling
   );
   const [bulkRecords, setBulkRecords] = useState<IAllCasesItems[]>([]);

   const [filteredRecords, setFilteredRecords] = useState<IAllCasesItems[]>([]);
   // const [issignerPermission, setIsSignerPermission] = useState<boolean>(false);
   // const [userRole, setUserRole] = useState<string | null>(null);

   const [selectedReason, setSelectedReason] = useState<IAllCasesReason[]>(
      initialAllCasesContextValue.selectedReason
   );

   const [writLabors, setWritLabors] = useState<IWritsLabor[]>(
      initialAllCasesContextValue.writLabors
   );

   const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
      initialAllCasesContextValue.allCompanies
   );
   const [courts, setCourts] = useState<ICourtDropdownList[]>([]);

   const [clickedFilingButton, setClickedFilingButton] = useState<string>("");

   const [searchCases, setSearchCases] = useState<string>("");
   const [filingType, setFilingType] = useState<string>("");
   const [caseSearchError, setCaseSearchError] = useState<string>("");
   const [unFinedCases, setUnFindCases] = useState<string[]>([]);
   const [caseSearchFor, setCaseSearchFor] = useState<string>("");

   const [proceedWithDismissals, setProceedWithDismissals] = useState<boolean>(true);

   const {
      selectedStateValue
   } = useAuth();
   /**
    * Get list of late notices from api and bind that with the All cases screen
    *
    */
   // const getAllCases = async (
   //   currentPage: number,
   //   pageSize: number,
   //   search?: string,
   //   status?: string,
   //   county?: string
   // ) => {
   //   try {

   //     setShowSpinner(true);    
   //     // get All cases
   //     const apiResponse = await AllCasesService.getAllCases(
   //       currentPage,
   //       pageSize,
   //       search,
   //       status,
   //       county
   //     );
   //     if (apiResponse.status === HttpStatusCode.Ok) {
   //       setAllCases((prevAllCases) => ({
   //         ...prevAllCases,
   //         items: apiResponse.data.items,
   //         currentPage: apiResponse.data.currentPage,
   //         totalCount: apiResponse.data.totalCount,
   //         totalPages: apiResponse.data.totalPages,
   //         pageSize: apiResponse.data.pageSize,
   //         ...(search ? { searchParam: search } : {}),
   //       }));
   //     }
   //   } finally {
   //     setShowSpinner(false);
   //   }
   // };

   const getAllCases = async (
      currentPage: number,
      pageSize: number,
      search?: string,
      status?: string,
      county?: string,
      filing?: boolean | null,
      court?: string,
      sortings?: SortingOption[]
   ) => {
      try {
         setShowSpinner(true);
         // get All cases
         const apiResponse = await AllCasesService.getAllCases(
            currentPage,
            pageSize,
            search,
            status,
            county,
            filing,
            selectedStateValue,
            court,
            sortings
         );
         if (apiResponse.status === HttpStatusCode.Ok) {
            // const updatedItems = apiResponse.data.items.map((item: IAllCasesItems) => ({
            //   ...item,
            //   crmInfo: {
            //     ...item.crmInfo,
            //     isCrmRecord: !!item.crmInfo.crmName,
            //   }
            // }));

            setAllCases((prevAllCases) => ({
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

   const getWritLabors = async () => {
      const response = await AllCasesService.getWritLabors();
      if (response.status === HttpStatusCode.Ok) {
         setWritLabors(response.data);
      }
   }

   const getAllCounties = async () => {
      try {
         // setShowSpinner(true);
         const response = await CountyService.getCounties();
         if (response.status === HttpStatusCode.Ok) {
            setAllCounties(response.data);
         }
      } catch (error) {
         console.log(error);
      } finally {
         // setShowSpinner(true);
      }
   };

   const getAllCompanies = async () => {
      try {
         // setShowSpinner(true);
         // get late notices
         const apiResponse = await AllUsersService.getAllCompaniesList();
         if (apiResponse.status === HttpStatusCode.Ok) {
            setAllCompanies(apiResponse.data);
         }
      } finally {
         // setShowSpinner(false);
      }
   };
   const getCourts = async () => {
      try {
         // setShowSpinner(true);
         const response = await CourtService.getCourtsByState(selectedStateValue)

         // const response = await CourtService.getAllCourtList();
         if (response.status === HttpStatusCode.Ok) {
            setCourts(
               response.data
            );
         }
      } catch (error) {
         console.log(error);
      } finally {
         // setShowSpinner(true);
      }
   };

   // Provide the context value to its children
   return (
      <AllCasesContext.Provider
         value={{
            showSpinner,
            showCaseSnapShot,
            allCases,
            setAllCases,
            getAllCases,
            setShowSpinner,
            setShowCaseSnapShot,
            filteredRecords,
            setFilteredRecords,
            selectedAllCasesId,
            setSelectedAllCasesId,
            setSelectedFilteredCasesId,
            selectedFilteredCasesId,
            selectedCaseIdsForFiling,
            setSelectedCaseIdsForFiling,
            selectedReason,
            setSelectedReason,
            getWritLabors,
            setWritLabors,
            writLabors,
            bulkRecords,
            setBulkRecords,
            getAllCounties,
            setAllCounties,
            allCounties,
            allCompanies,
            getAllCompanies,
            setAllCompanies,
            clickedFilingButton,
            setClickedFilingButton,
            searchCases,
            setSearchCases,
            filingType,
            setFilingType,
            caseSearchError,
            setCaseSearchError,
            unFinedCases,
            setUnFindCases,
            courts,
            setCourts,
            getCourts,
            caseSearchFor,
            setCaseSearchFor,
            proceedWithDismissals,
            setProceedWithDismissals
         }}
      >
         {children}
      </AllCasesContext.Provider>
   );
};

// Create a hook to easily access the AllCases context within components
export const useAllCasesContext = (): AllCasesContextType => {
   // Get the context value using useContext
   const context = useContext(AllCasesContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useAllCasesContext must be used within a AllCasesProvider"
      );
   }
   // Return the context value
   return context;
};
