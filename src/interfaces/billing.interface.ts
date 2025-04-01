import { CourtDecisionEnum, OperationTypeEnum } from "utils/enum";
import { IRootCaseInfo } from "./common.interface";

export interface IBilling {
   items: IBillingItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
};

export interface IBillingItem {
   id: string;
   dispoId: string;
   signedDispo: IRootCaseInfo | null;
   operationType: OperationTypeEnum;
   courtDecision: CourtDecisionEnum;
   applicantDate: string | null;
   filedDate: string | null;
   courtTransAmount: number;
   paymentAmount: number;
   c2CTotalFee: number;
   invoiceDate: string | null;
   invoiceNumber: string;
   datePaid: string | null;
   checkNumber: string;
   hasInvoiceCreated: boolean;
};