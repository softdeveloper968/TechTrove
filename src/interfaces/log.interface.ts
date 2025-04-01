export interface ILogsButton {
  title: string;
  icon: string;
  classes: string;
}

export interface ILogs {
  // userId:string;
  // userName:string;
  logDate:Date;
  type:string;
  message:string;
  event:string;
  logTime:string;
    // message: string;
    // level: string;
    // time: string;
    // category:string;
  }

  export interface IAllLogs {
    items: ILogs[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
    event?:number|undefined;
    type?:number|undefined;
    fromDate?:Date|null;
    toDate ?:Date|null; 
    userId?:string|null;
    companyId?:string|null;
  }

  export interface ILogParameter{
      SearchContent?:string
      Type?:number|undefined,
      FromDate?:Date|null,
      ToDate?:Date|null,
  }

  export interface IUser{
    id?:string;
    firstName?:string;
    lastName?:string;
    email?:string;
  }