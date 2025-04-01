import { ITenant } from "./all-cases.interface";

// Interface for items displayed in the service tracker screen
export interface IServiceTrackerItems {
    id?: string;
    status:string;
    caseNo : string;
    documents: Document[];
    propertyName :string;
    county: string;
    tenantFirstName: string;
    tenantLastName: string;
    unit: string;
    address?: string;
    city: string;
    state: string;
    zip: string;
    evictionDateFiled :Date;
    evictionServiceDate :Date;
    lastDayToAnswer : Date;
    evictionServiceMethod :string;
    courtDate :Date;
    answerDate :Date;
    answerDefendantName :string;
    answerDefendantEmail :string;
    evictionCourtDate : Date;
    evictionCourtTime : string;
    evictionCourtRoom : string;
    attorneyName : string;
    companyName:string;
    tenantNames: ITenant[],
    andAllOtherOccupants: string;
    expedited: string;
    serverNote: string;
    serverReceived: Date | null;
//   serviceDate: Date | null;
  serviceDayCal: number | null;
  processServerEmail: string;
}

// Interface for file evictions along with pagination
export interface IServiceTracker {
    items: IServiceTrackerItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
    evictionPdfLink: string;
  }

  export interface IUnservedQueueItems {
    id?: string;
    processServerEmail: string;
    county: string;
    expedited?: string;
    caseNo : string;
    serverIssuesRemarks: string;
    propertyName :string;
    serverReceived: Date | null;
    tenantFirstName: string;
    tenantLastName: string;
    tenantMiddleName?: string;
    tenantNames: ITenant[],
    street: string;
    address?: string;
    unit: string;
    city: string;
    state: string;
    zip: string;
    personalService?: string;
    serverServiceInfo: string;
    propertyPhone?: string;
    filerEmail?: string;
    companyName:string;
    taskId?: string;
}

export interface ExportUnservedQueueItems {
  ProcessServerEmail: string;
  County: string;
  Expedited?: string;
  CaseNo : string;
  ServerIssuesRemarks: string;
  PropertyName :string;
  serverReceived: Date | null;
  TenantOne: string;
  // TenantStreetNo: string;
  TenantAddress?: string;
  TenantUnit: string;
  TenantCity: string;
  TenantState: string;
  TenantZip: string;
  PersonalService?: string;
  ServerServiceInfo: string;
  PropertyPhone?: string;
  EvictionFilerEmail?: string;
  CompanyName:string;
}

export interface ExportServiceTrackerItems {
  caseNo: string;
  expedited: string;
  propertyNameVsTenants: string;
  evictionDateFiled: Date | null;
  serverReceived: Date | null;
  evictionServiceDate: Date | null;
  evictionLastDayToAnswer: Date | null;
  evictionServiceMethod: string;
  serverNotes: string;
  serviceDayCal?: number | string;
  processServerEmail: string;
  expeditedLate: string;
  tenantOne: string;
  propertyName: string;
  companyName: string;
}
  export interface IUnservedQueue {
    items: IUnservedQueueItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
    evictionPdfLink: string;
  }
  