import React, {
   Dispatch,
   ReactNode,
   SetStateAction,
   createContext,
   useContext,
   useState,
} from "react";
import { HttpStatusCode } from "axios";
import { IAllCheckCases } from "interfaces/case.interface";
import CaseStatusService from "services/case-status.service";
import { useAuth } from "context/AuthContext";

// Define the shape of the context data
type CheckCasesContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   allCheckCases: IAllCheckCases; // The type of all check cases data
   setAllCheckCases: Dispatch<SetStateAction<IAllCheckCases>>; // A function to update AllCheckCases
   getAllCheckCases: (currentPage: number, pageSize: number, search?: string) => void;
};


// Create a context with an initial value
const initialCheckCasesContextValue: CheckCasesContextType = {
   allCheckCases: {
      items: [
         {
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
            evictionDateFiled: new Date(),
            evictionServiceDate: new Date(),
            answerBy: new Date(),
            evictionServiceMethod: "",
            courtDate: new Date(),
            dismissalFileDate: new Date(),
            writFiledDate: new Date(),
            attorneyName: "",
            evictionAffiantSignature: "",
            answerDate: new Date(),
            writSignDate: new Date(),
            noticeCount: 0,
            evictionCount: 0,
            amendmentAffiantSignature: "",
            amendedBy: "",
            reason: "",
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 1,
      searchParam: ""
   },
   setAllCheckCases: () => { },
   getAllCheckCases: () => { },
   showSpinner: false,
   setShowSpinner: () => { },
};

// Create a context with an initial value
const AllCheckCasesContext = createContext<CheckCasesContextType>(
   initialCheckCasesContextValue
);


// Provide a component to wrap the application and make the context available
export const CheckCasesProvider: React.FC<{ children: ReactNode }> = ({
   children,
}) => {
   // State to hold the allCheckcases data
   const [allCheckCases, setAllCheckCases] = useState<IAllCheckCases>(
      initialCheckCasesContextValue.allCheckCases
   );

   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const { 
      selectedStateValue
    } = useAuth();
   
   /**
    * Get list of late notices from api and bind that with the All cases screen
    *
    */
   const getAllCheckCases = async (
      currentPage: number,
      pageSize: number,
      searchParam?: string
   ) => {
      try {
         setShowSpinner(true);
         if (searchParam?.trim() !== "") {
            const apiResponse = await CaseStatusService.getAllCheckCases(currentPage, pageSize, searchParam,selectedStateValue);
            if (apiResponse.status === HttpStatusCode.Ok) {
               setAllCheckCases((prevAllCheckCases) => ({
                  ...prevAllCheckCases,
                  items: apiResponse.data.items,
                  currentPage: apiResponse.data.currentPage,
                  totalCount: apiResponse.data.totalCount,
                  totalPages: apiResponse.data.totalPages,
                  pageSize: apiResponse.data.pageSize,
                  ...(searchParam ? { searchParam: searchParam } : {}),
               }));
            }
         } else {
            setAllCheckCases((prevAllCheckCases) => ({
               ...prevAllCheckCases,
               items: [],
               currentPage: 1,
               totalCount: 0,
               totalPages: 1,
               pageSize: 100,
            }));
         }
      } finally {
         setShowSpinner(false);
      }
   };

   // Provide the context value to its children
   return (
      <AllCheckCasesContext.Provider
         value={{
            showSpinner,
            allCheckCases,
            setAllCheckCases,
            getAllCheckCases,
            setShowSpinner,
         }}
      >
         {children}
      </AllCheckCasesContext.Provider>
   );
};

// Create a hook to easily access the AllCheckCases context within components
export const useAllCheckCasesContext = (): CheckCasesContextType => {
   // Get the context value using useContext
   const context = useContext(AllCheckCasesContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useAllCheckCasesContext must be used within a AllCheckCasesProvider"
      );
   }
   // Return the context value
   return context;
};
