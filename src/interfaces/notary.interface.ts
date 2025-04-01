export interface INotary {
    items: INotaryItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

// Define interface for ICountyItems extending ICountyBase
export interface INotaryItems {
    id?: string;
    notaryName: string;
    notaryExpDate: Date | string | null;
    notaryCountyId: number;
    notaryCounty?:string;
    notaryCountyName?:string;
    qualifiedInCountyId: number;
    qualifiedInCounty?:string;
    qualifiedInCountyName?:string;
}
