export interface IFilingType {
   items: IFilingTypeItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
};

export interface IFilingTypeItem {
   id: string;
   name: string;
   description: string;
};

export interface IAddFilingType {
   name: string;
   description: string;
};