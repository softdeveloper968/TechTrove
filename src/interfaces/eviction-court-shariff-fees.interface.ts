export interface IEvictionCourtShariffFeeBase {
   isChecked?: boolean;
   id: number;
}

export interface IEvictionCourtShariffFee {
   items: IEvictionCourtShariffFeeItems[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
}

export interface IEvictionCourtShariffFeeItems extends IEvictionCourtShariffFeeBase {
   poevService1stTenant: number;
   poevService2ndTenant: number;
   poevService3rdTenant: number;
   poevService4thTenant: number;
   poevService5thTenant: number;
   poevServiceTotal: number;
   poevServiceAAOTenant: number;
   evictionCourtTransAmount: number;
   aosCourtTransAmount: number;
   addtlDocCourtTransAmount: number;
   dismissalCourtTransAmount: number;
   amendmentCourtTransAmount: number;
   answerCourtTransAmount: number;
   writCourtTransAmount: number;
   powrService: number;
   pogmService1stTime: number;
   pogmService2ndTime: number;
   countyId: number;
   courtId: number;
   court?: {
      id: number;
      courtName: string;
      county: {
         countyId: number;
         stateName: string;
         countyName: string;
      };
   };
}
