import React, {
   Dispatch,
   useContext,
   createContext,
   useState,
   SetStateAction
} from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { ICourt } from "interfaces/court.interface";
import { ConfigStatusResource, ITylerConfig } from "interfaces/tyler.interface";
import { IFilingTypeItem } from "interfaces/filing-type.interface";
import { ICountyItems } from "interfaces/county.interface";
import TylerService from "services/tyler.service";
import CourtService from "services/court.service";
import FilingTypeService from "services/filing-type.service";
import CountyService from "services/county.service";

export type TylerConfigContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   tylerConfigs: ITylerConfig;
   setTylerConfigs: Dispatch<SetStateAction<ITylerConfig>>;
   getTylerConfigs: (currentPage: number, pageSize: number, search?: string, county?: string) => void;
   allCourts: ICourt;
   setAllCourts: Dispatch<SetStateAction<ICourt>>;
   getAllCourts: (currentPage: number, pageSize: number) => void;
   filingTypeList: IFilingTypeItem[];
   setFilingTypeList: Dispatch<SetStateAction<IFilingTypeItem[]>>;
   getFilingTypeList: () => void;
   counties: ICountyItems[];
   setCounties: Dispatch<SetStateAction<ICountyItems[]>>;
   getCounties: () => void;
   updateConfigStatus:(item:ConfigStatusResource)=>void;
};

const initialTylerConfigContextValue: TylerConfigContextType = {
   showSpinner: false,
   setShowSpinner: () => { },
   tylerConfigs: {
      items: [{
         id: "",
         feeCalcOnly: false,
         maxPayment: 0,
         ccEmail: "",
         preliminaryCopyEmail: "",
         countyName: "",
         locationCode: "",
         locationName: "",
         state: "",
         // locationCode: "fulton:mag",
         caseTypeCode: "",
         caseTypeName: "",
         filingCode: "",
         filingCodeName: "",
         filingDescription: "",
         optionalService: [],
         fileIntoExistingCase: false,
         filingType: "",
         courtType: "",
         requiredSupplementDoc: false,
         supplementCode: "",
         supplementCodeName: "",
         supplementDescription: "",
         isActive:false
      }],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
   },
   setTylerConfigs: () => { },
   getTylerConfigs: () => { },
   allCourts: {
      items: [],
      currentPage: 0,
      pageSize: 0,
      totalCount: 0,
      totalPages: 0
   },
   setAllCourts: () => { },
   getAllCourts: () => { },
   filingTypeList: [{
      id: "",
      name: "",
      description: ""
   }],
   setFilingTypeList: () => { },
   getFilingTypeList: () => { },
   counties: [],
   setCounties: () => { },
   getCounties: () => { },
   updateConfigStatus:()=>{},
};

export const TylerConfigContext = createContext<TylerConfigContextType>(initialTylerConfigContextValue);

export const TylerConfigProvider: React.FC<{ children: any }> = ({ children }) => {
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [tylerConfigs, setTylerConfigs] = useState<ITylerConfig>(initialTylerConfigContextValue.tylerConfigs);
   const [allCourts, setAllCourts] = useState<ICourt>(initialTylerConfigContextValue.allCourts);
   const [filingTypeList, setFilingTypeList] = useState<IFilingTypeItem[]>([]);
   const [counties, setCounties] = useState<ICountyItems[]>([]);

   const getTylerConfigs = async (currentPage: number, pageSize: number, searchParams?: string, county?: string) => {
      try {
         setShowSpinner(true);
         const response = await TylerService.getTylerConfigs(currentPage, pageSize, searchParams, county);
         if (response.status === HttpStatusCode.Ok) {
            setTylerConfigs((prev) => ({
               ...prev,
               items: response.data.items,
               currentPage: response.data.currentPage,
               pageSize: response.data.pageSize,
               totalCount: response.data.totalCount,
               totalPages: response.data.totalPages,
            }));
         }
      } catch (error) {
         console.log("🚀 ~ getTylerConfigs ~ error:", error);
      } finally {
         setShowSpinner(false);
      }
   };

   const getAllCourts = async (currentPage: number, pageSize: number) => {
      try {
         if (!allCourts.items.length) {
            setShowSpinner(true);
            const response = await CourtService.getAllCourt(currentPage, pageSize);
            if (response.status === HttpStatusCode.Ok) {
               setAllCourts(response.data);
            }
         }
      } catch (error) {
         console.log("🚀 ~ getCourts ~ error:", error)
      } finally {
         setShowSpinner(false);
      }
   };

   const updateConfigStatus=async(item:ConfigStatusResource)=>{
      try {
          setShowSpinner(true);
          const apiResponse = await TylerService.updateConfigStatus(
              item
          );
          if (apiResponse.status === HttpStatusCode.Ok) {
                toast.success(apiResponse?.data?.message)
          }
          else
          {
            toast.success(apiResponse?.data?.message)
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

   const getCounties = async () => {
      try {
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

   return (
      <TylerConfigContext.Provider
         value={{
            showSpinner,
            setShowSpinner,
            tylerConfigs,
            setTylerConfigs,
            getTylerConfigs,
            allCourts,
            setAllCourts,
            getAllCourts,
            filingTypeList,
            setFilingTypeList,
            getFilingTypeList,
            counties,
            setCounties,
            getCounties,
            updateConfigStatus
         }}
      >
         {children}
      </TylerConfigContext.Provider>
   );
}

export const useTylerConfigContext = (): TylerConfigContextType => {
   // Get the context value using useContext
   const context = useContext(TylerConfigContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useTylerConfigContext must be used within a WritLaborProvider"
      );
   }

   return context;
};