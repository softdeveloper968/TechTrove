export interface ISystemInfoItems {
    id:string;
    status: string;
    nextSync: Date | string | null
    lastSync: Date | string | null;
    syncStatus: Date | string | null;
    scheduler: string;
  };

  export interface ISystemInfo {
    items: ISystemInfoItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
  };