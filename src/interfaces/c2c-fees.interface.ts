// Base interface for common properties in AllCases
export interface IC2CFeeBase {
   id?: string;
}

// Define interface for IC2CFees
export interface IC2CFee {
   items: IC2CFeeItems[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
}

// Define interface for IC2CFeesItems extending IC2CFeesBase
export interface IC2CFeeItems extends IC2CFeeBase {
   countyId: number;
   courtId: number;
   clientId: string;
   c2CServiceExpFee: number;
   c2CServiceFee: number;
   c2CAddtlTenantsFee: number;
   c2CServiceHouseFee: number;
   c2CAOSFee: number;
   c2CDismissalFee: number;
   c2CWritFee: number;
   evictionAutomationFee: number;
   c2CAmendmentFee: number;
   c2CAddtlDocFee: number;
   c2COtherFee: number;
   c2CEvictionFee: number;
   c2CServiceAddtlTenantsFee: number;
   court: {
      id: number;
      courtName: string;
      countyId: number;
      county: {
         countyId: number;
         stateName: string;
         countyName: string;
      };
   };
   client: {
      id: string;
      email: string;
      companyName: string;
   };
}
