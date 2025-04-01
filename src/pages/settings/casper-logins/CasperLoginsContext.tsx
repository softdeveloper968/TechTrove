import React, {
    Dispatch,
    useContext,
    createContext,
    useState,
    SetStateAction
} from "react";
import { HttpStatusCode } from "axios";
import { ICasperUser } from "interfaces/casper.interface";
import CasperService from "services/casper.service";

export type CasperLoginsContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   casperUsers: ICasperUser;
   setCasperUsers: Dispatch<SetStateAction<ICasperUser>>;
   getCasperUsers: (currentPage: number, pageSize: number, search?: string) => void;
};

const initialCasperLoginsContextValue: CasperLoginsContextType = {
   showSpinner: false,
   setShowSpinner: () => { },
   casperUsers: {
       items: [{
           id: "",
           userName: "",
           password: "",
           isDefault: false,
           name:"",
           isC2CCard:true,
       }],
       currentPage: 1,
       pageSize: 1,
       totalCount: 0,
       totalPages: 1,
   },
   setCasperUsers: () => { },
   getCasperUsers: () => { }
};

export const CasperLoginsContext = createContext<CasperLoginsContextType>(initialCasperLoginsContextValue);

export const CasperLoginsProvider: React.FC<{ children: any }> = ({ children }) => {
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [casperUsers, setCasperUsers] = useState<ICasperUser>(initialCasperLoginsContextValue.casperUsers);

   const getCasperUsers = async (currentPage: number, pageSize: number, searchParams?: string) => {
       try {
           setShowSpinner(true);
           const response = await CasperService.getCasperLoginUsers(currentPage, pageSize, searchParams);
           if (response.status === HttpStatusCode.Ok) {
               setCasperUsers((prev) => ({
                   ...prev,
                   items: response.data.items,
                   currentPage: response.data.currentPage,
                   pageSize: response.data.pageSize,
                   totalCount:response.data.totalCount,
                   totalPages: response.data.totalPages,
               }));
           }
       } catch (error) {
           console.log("🚀 ~ getCasperUsers ~ error:", error);
       } finally {
           setShowSpinner(false);
       }
   };

   return (
       <CasperLoginsContext.Provider
           value={{
               showSpinner,
               setShowSpinner,
               casperUsers,
               setCasperUsers,
               getCasperUsers
           }}
       >
           {children}
       </CasperLoginsContext.Provider>
   );
}

export const useCasperLoginsContext = (): CasperLoginsContextType => {
   // Get the context value using useContext
   const context = useContext(CasperLoginsContext);
   // If the context is not found, throw an error
   if (!context) {
       throw new Error(
           "useCasperLoginsContext must be used within a WritLaborProvider"
       );
   }

   return context;
};