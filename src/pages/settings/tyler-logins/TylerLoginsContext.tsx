import React, {
   Dispatch,
   useContext,
   createContext,
   useState,
   SetStateAction
} from "react";
import { HttpStatusCode } from "axios";
import { ITylerConfigItems, ITylerUser } from "interfaces/tyler.interface";
import TylerService from "services/tyler.service";
import { IFilingTypeItem } from "interfaces/filing-type.interface";
import FilingTypeService from "services/filing-type.service";

export type TylerLoginsContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   tylerUsers: ITylerUser;
   setTylerUsers: Dispatch<SetStateAction<ITylerUser>>;
   getTylerUsers: (currentPage: number, pageSize: number, search?: string) => void;
   allCourt: ITylerConfigItems[];
   getAllCourt: () => void;
   setAllCourt: Dispatch<SetStateAction<ITylerConfigItems[]>>;
   filingTypeList: IFilingTypeItem[];
   setFilingTypeList: Dispatch<SetStateAction<IFilingTypeItem[]>>;
   getFilingTypeList: () => void;
};

const initialTylerLoginsContextValue: TylerLoginsContextType = {
   showSpinner: false,
   setShowSpinner: () => { },
   tylerUsers: {
      items: [{
         id: "",
         userName: "",
         password: "",
         firstName: "",
         lastName: "",
         paymentName: "",
         hasAttorney: false,
         isDefaultPayment: false,
         courtPayments: [
            {
               courtName: "",
               paymentName: "",
               isC2CCard: false,
               courtCode: "",
               state: "",
               filingType: ""
            }]
      }],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
   },
   setTylerUsers: () => { },
   getTylerUsers: () => { },
   allCourt: [],
   getAllCourt: () => { },
   setAllCourt: () => { },
   filingTypeList: [{
      id: "",
      name: "",
      description: ""
   }],
   setFilingTypeList: () => { },
   getFilingTypeList: () => { },
};

export const TylerLoginsContext = createContext<TylerLoginsContextType>(initialTylerLoginsContextValue);

export const TylerLoginsProvider: React.FC<{ children: any }> = ({ children }) => {
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [tylerUsers, setTylerUsers] = useState<ITylerUser>(initialTylerLoginsContextValue.tylerUsers);

   const [allCourt, setAllCourt] = useState<ITylerConfigItems[]>(
      initialTylerLoginsContextValue.allCourt
   );

   const [filingTypeList, setFilingTypeList] = useState<IFilingTypeItem[]>([]);

   const getTylerUsers = async (currentPage: number, pageSize: number, searchParams?: string) => {
      try {
         setShowSpinner(true);
         const response = await TylerService.getTylerUsers(currentPage, pageSize, searchParams);
         if (response.status === HttpStatusCode.Ok) {
            setTylerUsers((prev) => ({
               ...prev,
               items: response.data.items,
               currentPage: response.data.currentPage,
               pageSize: response.data.pageSize,
               totalCount: response.data.totalCount,
               totalPages: response.data.totalPages,
            }));
         }
      } catch (error) {
         console.log("🚀 ~ getTylerUsers ~ error:", error);
      } finally {
         setShowSpinner(false);
      }
   };

   const getAllCourt = async () => {
      try {
         setShowSpinner(true);
         const apiResponse = await TylerService.getAllTylerConfigCourt()
         if (apiResponse.status === HttpStatusCode.Ok) {
            setAllCourt(apiResponse.data)
         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getFilingTypeList = async () => {
      try {
         const response = await FilingTypeService.getFilingTypeList();
         if (response.status === HttpStatusCode.Ok) {
            setFilingTypeList(response.data);
         }
      } catch (error) {
         console.log(error);
      }
   };

   return (
      <TylerLoginsContext.Provider
         value={{
            showSpinner,
            setShowSpinner,
            tylerUsers,
            setTylerUsers,
            getTylerUsers,
            allCourt,
            getAllCourt,
            setAllCourt,
            filingTypeList,
            setFilingTypeList,
            getFilingTypeList,
         }}
      >
         {children}
      </TylerLoginsContext.Provider>
   );
}

export const useTylerLoginsContext = (): TylerLoginsContextType => {
   // Get the context value using useContext
   const context = useContext(TylerLoginsContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useTylerLoginsContext must be used within a WritLaborProvider"
      );
   }

   return context;
};