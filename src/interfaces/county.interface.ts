// Define interface for ICountyBase
export interface ICountyBase {
   isChecked?: boolean;
   id?: string;
   countyId?: number;
}

// Define interface for ICounty extending ICountyBase
export interface ICounty extends ICountyBase {
   items: ICountyItems[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
}

// Define interface for ICountyItems extending ICountyBase
export interface ICountyItems extends ICountyBase {
   stateName: string;
   countyName: string;
   method: string;
   endPoint: string;
   isMultipleAOSPdf: boolean;
};

export interface ICountyFormValues extends ICountyBase {
   stateName: string;
   countyName: string;
   method: string;
   endPoint: string;
   isMultipleAOSPdf: string;
};

