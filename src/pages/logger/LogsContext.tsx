import React, {
  Dispatch,
  useContext,
  createContext,
  useState,
  SetStateAction,
} from "react";
import { HttpStatusCode } from "axios";
import {
  IAllLogs, IUser
} from "interfaces/log.interface";
import {
  ICompanyItems
} from "interfaces/all-users.interface";
import LoggerService from "services/logger.service";
import AllUsersService from "services/all-users.service";
import Spinner from "components/common/spinner/Spinner";
export type LogsContextType = {
  showSpinner: boolean;
  setShowSpinner: Dispatch<SetStateAction<boolean>>;
  logs: IAllLogs;
  setLogs: Dispatch<SetStateAction<IAllLogs>>;
  getLogs: (
    currentPage: number,
    pageSize: number,
    search?: string,
    event?: number,
    type?: number,
    fromDate?: Date | null,
    toDate?: Date | null,
    userId?: string,
    companyId?: string
  ) => void;
  users: IUser[];
  setUsers: Dispatch<SetStateAction<IUser[]>>;
  getUsers: (search: string, companyId: string) => void;
  allCompanies: ICompanyItems[];
  getAllCompanies: () => void;
  setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
};

const initialLogsContextValue: LogsContextType = {
  showSpinner: false,
  setShowSpinner: () => { },
  logs: {
    items: [
      {
        // userId:"",
        // userName:"",
        logDate: new Date(),
        type: "",
        message: "",
        event: "",
        logTime: "",
      },
    ],
    currentPage: 1,
    pageSize: 1,
    totalCount: 0,
    totalPages: 1,
    userId: "",
  },
  setLogs: () => { },
  getLogs: () => { },
  users: [
    {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
    },
  ],
  setUsers: () => { },
  getUsers: () => { },
  allCompanies: [],
  getAllCompanies: () => { },
  setAllCompanies: () => { },
};

export const LogsContext = createContext<LogsContextType>(
  initialLogsContextValue
);

export const LogsProvider: React.FC<{ children: any }> = ({ children }) => {
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [logs, setLogs] = useState<IAllLogs>(initialLogsContextValue.logs);
  const [users, setUsers] = useState<IUser[]>(initialLogsContextValue.users);
  const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
    initialLogsContextValue.allCompanies
  );
  const getLogs = async (
    currentPage: number,
    pageSize: number,
    searchParams?: string,
    event?: number,
    type?: number,
    fromDate?: Date | null,
    toDate?: Date | null,
    userId?: string,
    companyId?: string
  ) => {
    try {
      setShowSpinner(true);
      const response = await LoggerService.getLogs(
        currentPage,
        pageSize,
        searchParams,
        event,
        type,
        fromDate,
        toDate,
        userId,
        companyId
      );
      if (response.status === HttpStatusCode.Ok) {
        setLogs((prev) => ({
          ...prev,
          items: response.data.items,
          currentPage: response.data.currentPage,
          totalCount: response.data.totalCount,
          totalPages: response.data.totalPages,
          pageSize: response.data.pageSize,
          ...(searchParams ? { searchParam: searchParams } : {}),
        }));
      }
    } catch (error) {
      console.log("🚀 ~ getLogs ~ error:", error);
    } finally {
      setShowSpinner(false);
    }
  };

  const getUsers = async (search: string, companyId: string) => {
    try {
      // setShowSpinner(true);
      const response = await LoggerService.getUsers(search, companyId);
      if (response.status === HttpStatusCode.Ok) {
        setUsers(response.data ?? []);
      }
    } catch (error) {
      console.log("🚀 ~ getLogs ~ error:", error);
    } finally {
      // setShowSpinner(false);
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
  return (
    <LogsContext.Provider
      value={{
        showSpinner,
        setShowSpinner,
        logs,
        setLogs,
        getLogs,
        users,
        setUsers,
        getUsers,
        allCompanies,
        getAllCompanies,
        setAllCompanies,
      }}
    >
      {children}
        {showSpinner && <Spinner />}
    </LogsContext.Provider>
  );
};

export const useLogsContext = (): LogsContextType => {
  // Get the context value using useContext
  const context = useContext(LogsContext);
  // If the context is not found, throw an error
  if (!context) {
    throw new Error("Error");
  }

  return context;
};
