// Base interface for common properties in IGarnishmentCourtSheriffFees
export interface IGarnishmentCourtSheriffFeesBase {
  id?: string;
}

// Define interface for IGarnishmentCourtSheriffFees
export interface IGarnishmentCourtSheriffFees {
  items: IGarnishmentCourtSheriffFeesItems[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Define interface for IGarnishmentCourtSheriffFeesItems extending IC2CFeesBase
export interface IGarnishmentCourtSheriffFeesItems
  extends IGarnishmentCourtSheriffFeesBase {
  countyId: number;
  courtId: number;
  garnishmentType: number;
  sheriffFeeFirstTenant: number;
  sheriffFeeSecondTenant: number;
  courtFee: number;
  efileFee: number;
  efileServiceCharge: number;
  otherEfileCharge: number;
  courtfeeSecondTenant: number;
  courtFeeAndAllOthers: number;
  pogmService1stTime: number;
   pogmService2ndTime: number;
  court: {
    id: number;
    courtName: string;
    county: {
      countyId: number;
      stateName: string;
      countyName: string;
    };
    countyId: number;
  };
}
