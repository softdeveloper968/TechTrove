import React, {
   Dispatch, SetStateAction,
   createContext,
   useContext,
   useState
} from "react";
import { HttpStatusCode } from "axios";

import { IUserItems, IUsers, ICompanyItems, ICompany, IStatePermitted } from "interfaces/all-users.interface";
import { ITylerUserItems } from "interfaces/tyler.interface";
import { ICasperUserItem } from "interfaces/casper.interface";
import { ICountyItems } from "interfaces/county.interface";
import { ICourtItems } from "interfaces/court.interface";
import AllUsersService from "services/all-users.service";
import TylerService from "services/tyler.service";
import CasperService from "services/casper.service";
import CountyService from "services/county.service";
import CourtService from "services/court.service";
import { IProperties, IPropertyItems } from "interfaces/user.interface";

export type UserContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   users: IUsers;
   setUserList: Dispatch<SetStateAction<IUsers>>;
   getListOfUsers: (currentPage: number, pageSize: number, search?: string) => void;
   companies: ICompany;
   getListOfCompany: (currentPage: number, pageSize: number, search?: string) => void;
   setCompanyList: Dispatch<SetStateAction<ICompany>>;
   allCompanies: ICompanyItems[],
   getAllCompanies: () => void;
   setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
   editUser: IUserItems;
   setEditUser: Dispatch<SetStateAction<IUserItems>>;
   editCompany: ICompanyItems;
   setEditCompany: Dispatch<SetStateAction<ICompanyItems>>;
   allTylerUsers: ITylerUserItems[];
   getAllTylerUsers: () => void;
   setAllTylerUsers: Dispatch<SetStateAction<ITylerUserItems[]>>;
   allCasperUsers: ICasperUserItem[];
   getAllCasperUsers: () => void;
   setAllCasperUsers: Dispatch<SetStateAction<ICasperUserItem[]>>;
   allCounty: ICountyItems[];
   getAllCounty: () => void;
   setAllCounty: Dispatch<SetStateAction<ICountyItems[]>>;
   allCourt: ICourtItems[];
   getAllCourt: () => void;
   setAllCourt: Dispatch<SetStateAction<ICourtItems[]>>;
   permittedStates: IStatePermitted[];
   fetchPermittedStates: (companyId: string) => Promise<void>;
   properties: IProperties;
   setProperties: Dispatch<SetStateAction<IProperties>>;
   getProperties: (currentPage: number, pageSize: number, search?: string) => void;
   companyProperties:IPropertyItems[];
   fetchCompanyProperties:(companyId: string) => Promise<void>;
}

const initialUserContextValue: UserContextType = {
   users: {
      items: [{
         isActive: false,
         email: "",
         lastName: "",
         firstName: "",
         password: "",
         role: "",
         userCompanyId: "",
         phoneNumber: "",
         emailConfirmed: false,
         isPasswordSet: false,
         createdDate: new Date,
         processServerDocuments: [],
         statesPermitted: []
      }],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
   },
   setUserList: () => { },
   getListOfUsers: () => { },
   showSpinner: false,
   setShowSpinner: () => { },
   companies: {
      items: [],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
   },
   getListOfCompany: () => { },
   setCompanyList: () => { },
   allCompanies: [],
   getAllCompanies: () => { },
   setAllCompanies: () => { },
   editUser: {
      isActive: false,
      email: "",
      lastName: "",
      firstName: "",
      password: "",
      role: "",
      userCompanyId: "",
      phoneNumber: "",
      emailConfirmed: false,
      createdDate: new Date,
      processServerDocuments: [
         {
            courtCode: "",
            courtName: "",
            countyName: "",
            pdfBase64: "",
         }],
      statesPermitted: [],
      companyProperties:[],
   },
   setEditUser: () => { },
   editCompany: {
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
      billingEmail: "",
      notes: "",
      tylerUserId: "",
      isProcessServer: false,
      casperUserId: "",
      limit: 0,
      isNoLimit: false,
      billingAddress: "",
      billingCity: "",
      billingCountrySubDivisionCode: "",
      billingPostalCode: "",
      statesPermitted: [],
      isPropertySpecific:false,
      isParentCompany:false,
      tylerUserTXId:""
   },
   setEditCompany: () => { },
   allTylerUsers: [{
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
   getAllTylerUsers: () => { },
   setAllTylerUsers: () => { },
   allCasperUsers: [{
      id: "",
      userName: "",
      password: "",
      isDefault: false,
      name: "",
      isC2CCard:true
   }],
   getAllCasperUsers: () => { },
   setAllCasperUsers: () => { },
   allCounty: [
      {
         id: "",
         stateName: "",
         countyName: "",
         method: "",
         endPoint: "",
         isMultipleAOSPdf: false
      }
   ],
   getAllCounty: () => { },
   setAllCounty: () => { },
   allCourt: [
      {
         id: "",
         countyId: 0,
         courtId: 0,
         courtName: "",
         courtCode: "",
         county: {
            countyId: 0,
            countyName: "",
            stateName: "",
            createdBy: "",
         }
      }
   ],
   getAllCourt: () => { },
   setAllCourt: () => { },
   permittedStates: [],
   fetchPermittedStates: async (companyId: string) => { },
   properties: {
      items: [],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
   },
   setProperties: () => { },
   getProperties: () => { },
   companyProperties: [],
   fetchCompanyProperties: async (companyId: string) => { },
}

export const UserContext = createContext<UserContextType>(
   initialUserContextValue
);

export const UserProvider: React.FC<{ children: any }> = ({
   children,
}) => {
   const [users, setUserList] = useState<IUsers>(
      initialUserContextValue.users
   );
   const [companies, setCompanyList] = useState<ICompany>(
      initialUserContextValue.companies
   );
   const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
      initialUserContextValue.allCompanies
   );
   const [editUser, setEditUser] = useState<IUserItems>(
      initialUserContextValue.editUser
   );
   const [editCompany, setEditCompany] = useState<ICompanyItems>(
      initialUserContextValue.editCompany
   );
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [allTylerUsers, setAllTylerUsers] = useState<ITylerUserItems[]>(
      initialUserContextValue.allTylerUsers
   );
   const [allCasperUsers, setAllCasperUsers] = useState<ICasperUserItem[]>(
      initialUserContextValue.allCasperUsers
   );
   const [allCounty, setAllCounty] = useState<ICountyItems[]>(
      initialUserContextValue.allCounty
   );
   const [allCourt, setAllCourt] = useState<ICourtItems[]>(
      initialUserContextValue.allCourt
   );
   const [permittedStates, setPermittedStates] = useState<IStatePermitted[]>(initialUserContextValue.permittedStates);
   const [companyProperties, setCompanyProperties] = useState<IPropertyItems[]>(initialUserContextValue.companyProperties);
   const [properties, setProperties] = useState<IProperties>(
      initialUserContextValue.properties
   );
   
   const getListOfUsers = async (
      currentPage: number,
      pageSize: number,
      search?: string
   ) => {
      try {
         setShowSpinner(true);
         // get late notices
         const apiResponse = await AllUsersService.getAllUser(currentPage,
            pageSize,
            search);
         if (apiResponse.status === HttpStatusCode.Ok) {
            setUserList((prevLateNotices) => ({
               ...prevLateNotices,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               pageSize: apiResponse.data.pageSize,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages
            }));
         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getListOfCompany = async (
      currentPage: number,
      pageSize: number,
      search?: string
   ) => {
      try {
         setShowSpinner(true);
         // get late notices
         const apiResponse = await AllUsersService.getAllCompanies(currentPage,
            pageSize,
            search);

         if (apiResponse.status === HttpStatusCode.Ok) {
            setCompanyList((prevLateNotices) => ({
               ...prevLateNotices,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               pageSize: apiResponse.data.pageSize,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages
            }));
         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getAllCompanies = async () => {

      try {
         // setShowSpinner(true);
         // get late notices
         const apiResponse = await AllUsersService.getAllCompaniesList();
         if (apiResponse.status === HttpStatusCode.Ok) {
            setAllCompanies(apiResponse.data)
         }
      } finally {
         // setShowSpinner(false);
      }
   };

   const getAllTylerUsers = async () => {
      try {
         setShowSpinner(true);
         // get late notices
         const apiResponse = await TylerService.getAllTylerUsersList();
         if (apiResponse.status === HttpStatusCode.Ok) {
            setAllTylerUsers(apiResponse.data)

         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getAllCasperUsers = async () => {
      try {
         setShowSpinner(true);
         // get late notices
         const apiResponse = await CasperService.getAllCasperUsers();
         if (apiResponse.status === HttpStatusCode.Ok) {
            setAllCasperUsers(apiResponse.data)

         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getAllCounty = async () => {
      try {
         // setShowSpinner(true);
         // get late notices
         const apiResponse = await CountyService.getCounties();
         if (apiResponse.status === HttpStatusCode.Ok) {
            setAllCounty(apiResponse.data)

         }
      } finally {
         // setShowSpinner(false);
      }
   };

   const getAllCourt = async () => {
      try {
         // setShowSpinner(true);
         // get late notices
         const apiResponse = await CourtService.getAllCourtList();
         if (apiResponse.status === HttpStatusCode.Ok) {
            setAllCourt(apiResponse.data)

         }
      } finally {
         // setShowSpinner(false);
      }
   };

   const fetchPermittedStates = async (companyId: string) => {
      try {
         const response = await AllUsersService.fetchPermittedStates(companyId);
         if (response.status === HttpStatusCode.Ok) {
            setPermittedStates(response.data);
         }
      } catch (error) {

      } finally {

      }
   };

   const fetchCompanyProperties = async (companyId: string) => {      
      try {
         const response = await AllUsersService.fetchCompanyProperties(companyId);
         if (response.status === HttpStatusCode.Ok) {
            setCompanyProperties(response.data);
         }
      } catch (error) {

      } finally {

      }
   };

   const getProperties = async (
      currentPage: number,
      pageSize: number,
      search?: string
   ) => {
      try {
         //setShowSpinner(true);
         const apiResponse = await AllUsersService.getProperties(currentPage, pageSize, search);
         if (apiResponse.status === HttpStatusCode.Ok) {
            setProperties((prevLateNotices) => ({
               ...prevLateNotices,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               pageSize: apiResponse.data.pageSize,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages
            }));
         }
      } finally {
         //setShowSpinner(false);
      }
   }

   return (
      <UserContext.Provider
         value={{
            showSpinner,
            users,
            setUserList,
            getListOfUsers,
            setShowSpinner,
            companies,
            setCompanyList,
            getListOfCompany,
            allCompanies,
            getAllCompanies,
            setAllCompanies,
            editUser,
            setEditUser,
            editCompany,
            setEditCompany,
            allTylerUsers,
            getAllTylerUsers,
            setAllTylerUsers,
            allCasperUsers,
            setAllCasperUsers,
            getAllCasperUsers,
            getAllCounty,
            getAllCourt,
            setAllCounty,
            setAllCourt,
            allCounty,
            allCourt,
            permittedStates,
            fetchPermittedStates,
            properties,
            setProperties,
            getProperties,
            companyProperties,
            fetchCompanyProperties
         }}
      >
         {children}
      </UserContext.Provider>
   );
}


export const useUserContext = (): UserContextType => {
   // Get the context value using useContext
   const context = useContext(UserContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useUserContext must be used within a UserProvider"
      );
   }
   // Return the context value
   return context;
};
