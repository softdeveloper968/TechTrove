import React, { useState, useContext, createContext, Dispatch, SetStateAction } from "react";
import { HttpStatusCode } from "axios";
import ProcessServerService from "services/process-server.service";
import { IProcessServerUser, IProcessServerUserItem, IServerUserInfo } from "interfaces/process-server.interface";
import { SortingOption } from "interfaces/common.interface";
import { useAuth } from "context/AuthContext";

export type ProcessServerContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   processServerUsers: IServerUserInfo[];
   setProcessServerUsers: Dispatch<SetStateAction<IServerUserInfo[]>>;
   getProcessServerUsers: () => void;
   processServers: IProcessServerUser;
   setProcessServers: Dispatch<SetStateAction<IProcessServerUser>>;
   getProcessServers: (currentPage: number, pageSize: number, searchParam?: string, sortings?: SortingOption[]) => void;
   selectedProcessServerIds: string[];
   setSelectedProcessServerIds: Dispatch<SetStateAction<string[]>>;
   filteredRecords: IProcessServerUserItem[],
   setFilteredRecords: Dispatch<SetStateAction<IProcessServerUserItem[]>>;
   bulkRecords: IProcessServerUserItem[];
   setBulkRecords: Dispatch<SetStateAction<IProcessServerUserItem[]>>;
};

const initialProcessServerContextValue: ProcessServerContextType = {
   showSpinner: false,
   setShowSpinner: () => { },
   processServerUsers: [],
   setProcessServerUsers: () => { },
   getProcessServerUsers: () => { },
   processServers: {
      items: [{
         id: "",
         userId: "",
         email: "",
         county: "",
         state: "",
         zip: "",
         city: "",
         alternateCity: "",
         companyName: "",
      }],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
      sortings: [],
   },
   setProcessServers: () => { },
   getProcessServers: () => { },
   selectedProcessServerIds: [],
   setSelectedProcessServerIds: () => { },
   filteredRecords: [],
   setFilteredRecords: () => { },
   bulkRecords: [],
   setBulkRecords: () => { },
};

export const ProcessServerContext = createContext<ProcessServerContextType>(initialProcessServerContextValue);

export const ProcessServerProvider: React.FC<{ children: any }> = ({ children }) => {
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [processServerUsers, setProcessServerUsers] = useState<IServerUserInfo[]>([]);
   const [processServers, setProcessServers] = useState<IProcessServerUser>(initialProcessServerContextValue.processServers);
   const [bulkRecords, setBulkRecords] = useState<IProcessServerUserItem[]>([]);
   const [filteredRecords, setFilteredRecords] = useState<IProcessServerUserItem[]>([]);
   const [selectedProcessServerIds, setSelectedProcessServerIds] = useState<string[]>(
      initialProcessServerContextValue.selectedProcessServerIds
   );
   const {selectedStateValue}=useAuth();

   const getProcessServerUsers = async () => {
      try {
         setShowSpinner(true);
         const response = await ProcessServerService.getProcessServerUsers();
         if (response.status === HttpStatusCode.Ok) {
            setProcessServerUsers(response.data);
         }
         setShowSpinner(false);
      } catch (error) {
         setShowSpinner(false);
         console.log("🚀 ~ getProcessServerUsers ~ error:", error);
      } finally {
         setShowSpinner(false);
      }
   };

   const getProcessServers = async (currentPage: number, pageSize: number, searchParams?: string, sortings?: SortingOption[]) => {
      try {
         setShowSpinner(true);         
         const response = await ProcessServerService.getProcessServers(currentPage, pageSize, searchParams, sortings,selectedStateValue);
         if (response.status === HttpStatusCode.Ok) {
            setProcessServers((prev) => ({
               ...prev,
               items: response.data.items,
               currentPage: response.data.currentPage,
               pageSize: response.data.pageSize,
               totalCount: response.data.totalCount,
               totalPages: response.data.totalPages,
               sortings: response.data.sortings
            }));
         }
         setShowSpinner(false);
      } catch (error) {
         setShowSpinner(false);
         console.log("🚀 ~ getProcessServerUsers ~ error:", error);
      } finally {
         setShowSpinner(false);
      }
   };

   return (
      <ProcessServerContext.Provider
         value={{
            showSpinner,
            setShowSpinner,
            processServerUsers,
            setProcessServerUsers,
            getProcessServerUsers,
            processServers,
            setProcessServers,
            getProcessServers,
            selectedProcessServerIds,
            setSelectedProcessServerIds,
            filteredRecords,
            setFilteredRecords,
            bulkRecords,
            setBulkRecords
         }}
      >
         {children}
      </ProcessServerContext.Provider>
   );
}

export const useProcessServerContext = (): ProcessServerContextType => {
   // Get the context value using useContext
   const context = useContext(ProcessServerContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useProcessServerContext must be used within a ProcessServerContext"
      );
   }

   return context;
};