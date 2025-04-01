// Define interface for ICountyBase
export interface ICourtBase {
  isChecked?: boolean;
  id?: string;
  courtId?: number;
}

// Define interface for ICourt extending ICourtBase
export interface ICourt extends ICourtBase {
  items: ICourtItems[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Define interface for ICourtItems extending ICourtBase
export interface ICourtItems extends ICourtBase {
  countyId: number;
  courtName: string;
  courtCode: string;
  county: {
    countyId: number;
    countyName: string;
    stateName: string;
    createdBy: string;
  };
}

export interface ICourtDropdownList{
   code:string;
   name:string;
}