import React, { useEffect, useRef, useState } from "react";
import Pagination from "components/common/pagination/Pagination";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import { convertToPrice, formattedDate, toCssClassName } from "utils/helper";
import { OperationTypeEnum } from "utils/enum";
import { IGridHeader } from "interfaces/grid-interface";
import { IBillingItem } from "interfaces/billing.interface";
import { useAccountingContext } from "../AccountingContext";

type BillingGridProps = {};

const initialColumnMapping: IGridHeader[] = [
   { columnName: "applicantDate", label: "ApplicantDate" },
   { columnName: "county", label: "County" },
   { columnName: "caseNo", label: "CaseNo" },
   { columnName: "propertyName", label: "PropertyName" },
   { columnName: "operationType", label: "OperationType" },
   { columnName: "filedDate", label: "FiledDate" },
   { columnName: "courtTransAmount", label: "CourtTransAmount" },
   { columnName: "paymentAmount", label: "PaymentAmount" },
   { columnName: "c2CTotalFee", label: "C2CTotalFee" },
   { columnName: "invoiceDate", label: "InvoiceDate" },
   { columnName: "invoiceNumber", label: "Invoice#" },
   { columnName: "datePaid", label: "DatePaid" },
   { columnName: "checkNumber", label: "CheckNumber" },
   { columnName: "datePaid", label: "DatePaid" }
];

const BillingGrid = (props: BillingGridProps) => {
   const isMounted = useRef(true);
   const {
      showSpinner,
      billingTransactions,
      getBillingTransactions
   } = useAccountingContext();

   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(billingTransactions.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(billingTransactions.totalPages > 1);

   useEffect(() => {
      if (isMounted.current) {
         getBillingTransactions(1, 100, "");
         isMounted.current = false;
      };

   }, []);

   const handleCellRendered = (cellIndex: number, data: IBillingItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];

      const renderers: Record<string, () => JSX.Element> = {
         county: () => formattedCell(data.signedDispo?.efile?.county),
         caseNo: () => formattedCell(data.signedDispo?.efile?.caseNumber),
         propertyName: () => formattedCell(data.signedDispo?.fields?.propertyInfo?.propertyName),
         applicantDate: () => formattedDateCell(cellValue),
         filedDate: () => formattedDateCell(cellValue),
         invoiceDate: () => formattedDateCell(cellValue),
         datePaid: () => formattedDateCell(cellValue),
         courtTransAmount: () => formattedCurrencyCell(cellValue),
         paymentAmount: () => formattedCurrencyCell(cellValue),
         c2CTotalFee: () => formattedCurrencyCell(cellValue),
         operationType: () => formattedOperationTypeCell(cellValue)
      };

      const renderer = renderers[propertyName] || (() => formattedCell(cellValue));

      if (visibleColumns.find(x => x.label === columnName)) {

         return (
            <td
               key={cellIndex}
               className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929] ${toCssClassName(columnName)}`}
            >
               {renderer()}
            </td>
         );
      }

      return <></>;
   };

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   const formattedCurrencyCell = (value: any) => (
      <span>$ {value !== null ? convertToPrice(value) : ""}</span>
   );

   const formattedDateCell = (value: any) => (
      <span>{value ? formattedDate(value as string) : ""}</span>
   );

   const formattedOperationTypeCell = (value: any) => (
      <span className={getOperationTypeString(value).toLowerCase()}>{value ? getOperationTypeString(value) : ""}</span>
   );

   const getOperationTypeString = (type: OperationTypeEnum): string => {
      switch (type) {
         case OperationTypeEnum.Eviction:
            return "Eviction";
         case OperationTypeEnum.Dismissal:
            return "Dismissal";
         case OperationTypeEnum.Writ:
            return "Writ";
         case OperationTypeEnum.Amendment:
            return "Amendment";
         case OperationTypeEnum.AOS:
            return "AOS";
         default:
            return "Unknown Operation Type";
      }
   }

   const handleFrontButton = () => {
      if (billingTransactions.currentPage < billingTransactions.totalPages) {
         const updatedCurrentPage = billingTransactions.currentPage + 1;
         setCanPaginateBack(updatedCurrentPage > 1);
         getBillingTransactions(
            updatedCurrentPage,
            billingTransactions.pageSize
         );
      }
   };

   const handleBackButton = () => {
      if (
         billingTransactions.currentPage > 1 &&
         billingTransactions.currentPage <= billingTransactions.totalPages
      ) {
         const updatedCurrentPage = billingTransactions.currentPage - 1;
         setCanPaginateBack(billingTransactions.currentPage > 1);
         getBillingTransactions(
            updatedCurrentPage,
            billingTransactions.pageSize
         );
      }
   };

   return (
      <div className="pt-1.5 lg:pt-2 accounting_grid">
         <div className="relative -mr-0.5">
            <div className="text-right">
               {/* {userRole.includes(UserRole.C2CAdmin) && (
                  <Button
                     isRounded={false}
                     title={"Generate Invoices"}
                     type={"button"}
                     icon={<FaFileInvoice className="mr-1.5" />}
                     handleClick={() => setOpenModal(true)}
                     disabled={showSpinner}
                     classes="bg-[#4DB452] px-3 md:px-3.5 py-1.5 font-medium text-[10.4px] md:text-[11px] text-white rounded-md shadow-lg inline-flex items-center relative z-[1] font-semibold"
                  />
               )} */}
               {/* <Button
                  isRounded={false}
                  title={"Fetch Invoices"}
                  type={"button"}
                  icon={<FaSyncAlt className="mr-1.5" />}
                  handleClick={() => getInvoices(1, 100)}
                  disabled={showSpinner}
                  classes="bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10.4px] md:text-[11px] text-white rounded-md shadow-lg inline-flex items-center relative z-[1] font-semibold"
               /> */}
               {/* <Button
                  isRounded={false}
                  title={"Connect to QuickBooks"}
                  type={"button"}
                  handleClick={() => handleAuthorize()}
                  classes="bg-[#4DB452] px-3.5 md:px-4 py-2 font-medium text-[12px] md:text-[13px] text-white rounded-md shadow-lg inline-flex items-center"
               /> */}
            </div>
            <div className="relative -mr-0.5">
               {showSpinner && <Spinner />}
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={billingTransactions.totalCount ? billingTransactions.items : []}
                     // handleSelectAllChange={handleSelectAllChange}
                     // selectAll={selectAll}
                     cellRenderer={(data: IBillingItem, rowIndex: number, cellIndex: number) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={billingTransactions.pageSize}
                     currentPage={billingTransactions.currentPage}
                     totalPages={billingTransactions.totalPages}
                     totalRecords={billingTransactions.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               </>
            </div>
         </div>
      </div>
   )
};

export default BillingGrid;