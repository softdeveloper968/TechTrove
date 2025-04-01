export interface IAttorney {
   items: IAttorneyItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
};

export interface IAttorneyItem {
   id: string;
   firstName: string;
   lastName: string;
   barNumber: string;
   email: string;
   firmName: string;
   address: string;
   unit: string;
   city: string;
   state: string;
   zipCode: string;
};

export interface IAddAttorney {
   firstName: string;
   lastName: string;
   barNumber: string;
   email: string;
   firmName: string;
   address: string;
   unit: string;
   city: string;
   state: string;
   zipCode: string;
};