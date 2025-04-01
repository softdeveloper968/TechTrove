//WritsOfPossessionContext.tsx
import React, {
   Dispatch,
   ReactNode,
   SetStateAction,
   createContext,
   useContext,
   useState,
} from "react";
import { IWritsOfPossession, IWritsOfPossessionItems } from "interfaces/writs-of-possession.interface";
import WritsOfPossessionService from "services/writs-of-possesson.service";
import { HttpStatusCode, UserRole } from "utils/enum";
import { useAuth } from "context/AuthContext";
import { SortingOption } from "interfaces/common.interface";

// Define the shape of the context data
type WritsOfPossessionContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   unsignedWrits: IWritsOfPossession; // The type of unsignedWrits data
   signedWrits: IWritsOfPossession; // The type of SignedWrits data
   setAllUnsignedWrits: Dispatch<SetStateAction<IWritsOfPossession>>; // A function to update unsignedWrits data
   setAllSignedWrits: Dispatch<SetStateAction<IWritsOfPossession>>; // A function to update signedWrits data
   writsOfPossession: IWritsOfPossession; // The type of Writs Of Possession data
   setAllWritsOfPossession: Dispatch<SetStateAction<IWritsOfPossession>>; // A function to update writs of possession
   getAllWritsOfPossession: (
      currentPage: number,
      pageSize: number,
      isSigned: boolean,
      sortings: SortingOption[],
      search?: string,
   ) => void;
   selectedWritsOfPossessionId: string[];
   setSelectedWritsOfPossessionId: Dispatch<SetStateAction<string[]>>;
   selectedUnSignedWritsId: string[];
   setSelectedUnSignedWritsId: Dispatch<SetStateAction<string[]>>;
   selectedSignedWritsId: string[];
   setSelectedSignedWritsId: Dispatch<SetStateAction<string[]>>;
   unsignedWritsCount: number;
   filteredRecords: IWritsOfPossessionItems[],
   setFilteredRecords: Dispatch<SetStateAction<IWritsOfPossessionItems[]>>;
   selectedFilteredWritOfPossessionId: string[];
   setSelectedFilteredWritOfPossessionId: Dispatch<SetStateAction<string[]>>;
   bulkRecords: IWritsOfPossessionItems[];
   setBulkRecords: Dispatch<SetStateAction<IWritsOfPossessionItems[]>>;
};

// Create a context with an initial value
const initialWritsOfPossessionContextValue: WritsOfPossessionContextType = {
   writsOfPossession: {
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
            dateFiled: null,
            writLabor: "",
            amended: "",
            answerBy: "",
            dateServed: "",
            evictionAffiantSignature: "",
            signedBy: "",
            companyName: "",
            tenantNames: [],
            andAllOtherOccupants: "",
            reason: "",
            writOrderDate: null,
            paymentAmountOwned: null,
            paymentDueOn: null,
            writComment: "",
            hasSSN: false,
            writLaborId: "",
            writApplicantIs: "",
            writApplicantPhone: "",
            isCorporation: false,
            documentsPdf: [],
            versionNumber: 0
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 1,
      totalPages: 1,
      searchParam: "",
      writsOfPossessionPdfLink: "",
      sortings: []
   },
   unsignedWrits: {
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
            dateFiled: null,
            writLabor: "",
            amended: "",
            answerBy: "",
            dateServed: "",
            evictionAffiantSignature: "",
            signedBy: "",
            companyName: "",
            tenantNames: [],
            andAllOtherOccupants: "",
            reason: "",
            writOrderDate: null,
            paymentAmountOwned: null,
            paymentDueOn: null,
            writComment: "",
            hasSSN: false,
            writLaborId: "",
            writApplicantIs: "",
            writApplicantPhone: "",
            isCorporation: false,
            documentsPdf: [],
            versionNumber: 0
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 1,
      totalPages: 1,
      searchParam: "",
      writsOfPossessionPdfLink: "",
      sortings: []
   },
   signedWrits: {
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
            dateFiled: null,
            writLabor: "",
            amended: "",
            answerBy: "",
            dateServed: "",
            evictionAffiantSignature: "",
            signedBy: "",
            companyName: "",
            tenantNames: [],
            andAllOtherOccupants: "",
            reason: "",
            writOrderDate: null,
            paymentAmountOwned: null,
            paymentDueOn: null,
            writComment: "",
            hasSSN: false,
            writLaborId: "",
            writApplicantIs: "",
            writApplicantPhone: "",
            isCorporation: false,
            documentsPdf: [],
            versionNumber: 0
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 1,
      totalPages: 1,
      writsOfPossessionPdfLink: "",
      sortings: []
   },
   setAllUnsignedWrits: () => { },
   setAllSignedWrits: () => { },
   // setEvictionPdfLink: () => {},
   setAllWritsOfPossession: () => { },
   getAllWritsOfPossession: () => { },
   showSpinner: false,
   setShowSpinner: () => { },
   selectedWritsOfPossessionId: [],
   setSelectedWritsOfPossessionId: () => { },
   selectedUnSignedWritsId: [],
   setSelectedUnSignedWritsId: () => { },
   selectedSignedWritsId: [],
   setSelectedSignedWritsId: () => { },
   unsignedWritsCount: 0,
   filteredRecords: [],
   setFilteredRecords: () => { },
   selectedFilteredWritOfPossessionId: [],
   setSelectedFilteredWritOfPossessionId: () => { },
   bulkRecords: [],
   setBulkRecords: () => { },
};

// Create a context with an initial value
const WritsOfPossessionContext = createContext<WritsOfPossessionContextType>(
   initialWritsOfPossessionContextValue
);

// Provide a component to wrap the application and make the context available
export const WritsOfPossessionProvider: React.FC<{ children: ReactNode }> = ({
   children,
}) => {
   // State to hold the UnsignedWrits data
   const [unsignedWrits, setAllUnsignedWrits] = useState<IWritsOfPossession>(
      initialWritsOfPossessionContextValue.unsignedWrits
   );
   // State to hold the SignedWrits data
   const [signedWrits, setAllSignedWrits] = useState<IWritsOfPossession>(
      initialWritsOfPossessionContextValue.signedWrits
   );
   const [selectedFilteredWritOfPossessionId, setSelectedFilteredWritOfPossessionId] = useState<string[]>(
      initialWritsOfPossessionContextValue.selectedFilteredWritOfPossessionId
   );
   const [filteredRecords, setFilteredRecords] = useState<IWritsOfPossessionItems[]>([]);

   // State to hold the writs of possession data
   const [writsOfPossession, setAllWritsOfPossession] = useState<IWritsOfPossession>(
      initialWritsOfPossessionContextValue.writsOfPossession
   );
   // State to hold the writs of possession spinner
   const [showSpinner, setShowSpinner] = useState<boolean>(false);

   // state to hold data for selected grids
   const [selectedWritsOfPossessionId, setSelectedWritsOfPossessionId] = useState<
      string[]
   >(initialWritsOfPossessionContextValue.selectedWritsOfPossessionId);

   const [selectedUnSignedWritsId, setSelectedUnSignedWritsId] = useState<string[]>(
      initialWritsOfPossessionContextValue.selectedUnSignedWritsId
   );

   const [selectedSignedWritsId, setSelectedSignedWritsId] = useState<string[]>(
      initialWritsOfPossessionContextValue.selectedSignedWritsId
   );
   const [unsignedWritsCount, setUnsignedWritsCount] = useState<number>(0);
   const [bulkRecords, setBulkRecords] = useState<
      IWritsOfPossessionItems[]
   >([]);
   const { userRole } = useAuth();
   /**
    * Get list of writs of possession from api and bind that with the writs of possession screen
    *
    */
   const getAllWritsOfPossession = async (
      currentPage: number,
      pageSize: number,
      isSigned: boolean,
      sortings: SortingOption[] = [],
      search?: string,
   ) => {
      try {
         setShowSpinner(true);
         const apiResponse = await WritsOfPossessionService.getAllWritesOfPossession(
            currentPage,
            pageSize,
            isSigned,
            sortings,
            search,
         );
         if (apiResponse.status === HttpStatusCode.OK) {
            if (isSigned === false && !userRole.includes(UserRole.WritLabor)) {
               setAllUnsignedWrits((prevFileEvictions) => ({
                  ...prevFileEvictions,
                  items: apiResponse.data.items,
                  currentPage: apiResponse.data.currentPage,
                  totalCount: apiResponse.data.totalCount,
                  totalPages: apiResponse.data.totalPages,
                  pageSize: apiResponse.data.pageSize,
                  ...(search ? { searchParam: search } : {}),

               }));
               setUnsignedWritsCount(apiResponse.data.items.length);
            }
            else {
               setAllSignedWrits((prevFileEvictions) => ({
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

   // Provide the context value to its children
   return (
      <WritsOfPossessionContext.Provider
         value={{
            showSpinner,
            signedWrits,
            writsOfPossession,
            unsignedWrits,
            setAllUnsignedWrits,
            setAllSignedWrits,
            getAllWritsOfPossession,
            setAllWritsOfPossession,
            setShowSpinner,
            selectedWritsOfPossessionId,
            setSelectedWritsOfPossessionId,
            selectedUnSignedWritsId,
            setSelectedUnSignedWritsId,
            selectedSignedWritsId,
            setSelectedSignedWritsId,
            unsignedWritsCount,
            filteredRecords,
            setFilteredRecords,
            selectedFilteredWritOfPossessionId,
            setSelectedFilteredWritOfPossessionId,
            bulkRecords,
            setBulkRecords,
         }}
      >
         {children}
      </WritsOfPossessionContext.Provider>
   );
};

// Create a hook to easily access the WritsOfPossession context within components
export const useWritsOfPossessionContext = (): WritsOfPossessionContextType => {
   // Get the context value using useContext
   const context = useContext(WritsOfPossessionContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useWritsOfPossessionContext must be used within a WritsOfPossessionProvider"
      );
   }
   // Return the context value
   return context;
};
