// Base interface for createdBy and modifiedBy
export interface ICreatedByModifiedBy {
  userId: null | string;
  userName: null | string;
  clientId: null | string;
  dateSaved: null | string;
  version: null | string;
}

// Base interface for filings, servicing, and billings
export interface IProcessDetails {
  createdBy: ICreatedByModifiedBy;
  modifiedBy: ICreatedByModifiedBy;
}

// Base interface for nested objects with createdBy and modifiedBy
export interface ICreatedModified {
  createdBy: ICreatedByModifiedBy;
  modifiedBy: ICreatedByModifiedBy;
}

// Base interface for objects with an ID
export interface IAttachment {
  filingId: null | string;
  attachmentId: string;
  url: string;
  type: string;
  filename: string;
}

// Base interface for fields with createdBy and modifiedBy
export interface IFields extends ICreatedModified {
  timestamp: string;
}

// Base interface for filing details
export interface IFilingDetails {
  addtlFees: string;
  allMonths: string;
  reason: string;
  monthlyRent: number;
  totalRent: number;
}

// Base interface for service request details
export interface IServiceRequestDetails {
  expedited: string;
  personalService: null | any; // You might want to create an interface for personalService
  personalServiceNotes: null | string;
  specialInstructions: null | string;
}

// Base interface for signing details
export interface ISigningDetails {
  affiantIS: string;
  affiantSignature: string;
  affiantSignDate: string;
  signature: string;
  name: null | string;
  pdfTemplateId: null | string;
}

export interface ICrmInfo {
  crmName: null | string;
  ownerId: null | string;
  propertyId: null | string;
  batchId: null | string;
}

export interface IEfile {
  courtId: null | string;
  countyName: string;
  courtType: null | string;
  courtTypeName: null | string;
  envelopeID: null | string;
  submitDate: null | string;
  caseNumber: null | string;
  issueDate: null | string;
}
export interface IPropertyInfoAddress {
  propertyCity: string;
  propertyName: string;
  propertyState: string;
  propertyStreet1: string;
  propertyStreet2: string | null;
  propertyZipCode: string;
  tenantName: string;
  caseNumber: string | null;
  filerEmail: string | null;
}
export interface IPropertyInfo {
  name: string;
  phone: null | string;
  email: string;
  owners: any[]; // You might want to create an interface for owners
  address: IPropertyInfoAddress;
  attorney: {
    barNo: string;
    name: string;
    email: string;
  };
}

export interface ITenantName {
  isEntity: null | boolean;
  entityName: null | string;
  firstName: string;
  middleName: null | string;
  lastName: string;
  suffix: null | string;
  email: null | string;
  phone: null | string;
  activeDuty: null | boolean;
}

export interface ITenantInfo {
  unitId: null | string;
  andAllOthers: boolean;
  andAllOthersText: string;
  tenantNames: ITenantName[];
  tenantName: string;
  address: {
    street: string;
    unit: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface IChangeHistory {
  // It's empty for now
}

export interface IServicingDetails extends IProcessDetails {
  // It's empty for now
}

export interface IBillingsDetails extends IProcessDetails {
  // It's empty for now
}

export interface IProcess {
  c2cProcessDate: null | string;
  servicing: IServicingDetails[];
  billings: IBillingsDetails[];
  createdBy: ICreatedByModifiedBy;
  modifiedBy: ICreatedByModifiedBy;
}

export interface ICase extends ICrmInfo, IEfile {
  id: string;
  clientId: string;
  userId: string;
  source: string;
  _etag: string;
  fields: IFields &
    IFilingDetails &
    IServiceRequestDetails &
    ISigningDetails &
    ICreatedModified;
  process: IProcess;
  attachments: IAttachment[];
}

export interface ISearchCasesRequest {
  searchParam: string;
}
export interface IAllCheckCasesBase {
  id?: string;
  tenantFirstName: string;
  tenantLastName: string;
  address: string;
  city: string;
  unit: string;
  state: string;
  propertyName: string;
  county: string;
};
export interface ICheckCaseStatusItems extends IAllCheckCasesBase{
  status: string;
  caseNo: string;
  documents: Document[];
  militaryStatusDoc: Document[];
  tenantNames: ITenant[];
  zip: string;
  evictionDateFiled: Date;
  evictionServiceDate: Date;
  attorneyBarNo:string;
  // lastDaytoAnswer: Date;
  evictionServiceMethod: string;
  courtDate: Date;
  dismissalFileDate: Date;
  writFiledDate: Date;
  attorneyName: string;
  evictionAffiantSignature: string;
  answerDate: Date;
  writSignDate: Date;
  noticeCount: number;
  evictionCount: number;
  amendmentAffiantSignature: string;
  amendedBy: string;
  answerBy: Date
  //caseCount: number;
  reason?: string;
  // for file writs
  selectedReason?: string; 
  writOrderDate?: Date | string;
  paymentAmountOwned?: string; 
  paymentDueOn?: Date | string;
  writComment?: string;
  hasSSN?: string;
  isCorporation?: string;
  selectedWritLabor?: string;
  writLaborId?: string;
  writApplicantIS?: string;
  otherApplicantIS?: string;
  writApplicantPhone?: string;
  militaryStatusReport?: string;
}

export interface ITenant {
  id: string;
  firstName: string;
  lastName: string;
  middlename: string;
  isMilitaryStatusUploaded: boolean;
  militaryStatusDocURL: string;
};

export interface IAllCheckCases {
  items: ICheckCaseStatusItems[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  searchParam?: string; 
};