import React, { useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { IGridHeader } from "interfaces/grid-interface";
import { IAccountingQueueItem, IFilingTransactionItem } from "interfaces/filing-transaction.interface";
import { ITenant } from "interfaces/all-cases.interface";
import Pagination from "components/common/pagination/Pagination";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import GridCheckbox from "components/formik/GridCheckBox";
import { convertUtcToEst, formatCurrency, formattedDate, toCssClassName } from "utils/helper";
import { OperationTypeEnum } from "utils/enum";
import { useFilingTransactionContext } from "../FilingTransactionContext";
import { useAuth } from "context/AuthContext";

type AccountingQueueProps = {};


const AccountingQueueGrid = (props: AccountingQueueProps) => {
   const isMounted = useRef(true);
   const {
      showSpinner,
      accountingQueue,
      getAccountingQueue,
      companyId,
      getAllCompanies,
      selectedFilingTransactionId,
      setSelectedFilingTransactionId,
      bulkRecords,
      setBulkRecords,
      setCompanyId,
      setDateFiled,
      setDatePaid,
      setFilingType,
      getAllCounties
   } = useFilingTransactionContext();
   const { selectedStateValue } = useAuth();

   const initialColumnMapping: IGridHeader[] = [
      { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
      { columnName: "type", label: "ActionType" },
      { columnName: "aosType", label: "AOSType" },
      { columnName: "applicantDate", label: "Created" },
      { columnName: "clientReferenceId", label: "ClientReferenceID" },
      { columnName: "county", label: "County" },
      { columnName: "caseNumber", label: "CaseNo" },
      { columnName: "filerEmail", label: "FilerEmail" },
      { columnName: "tenantOne", label: "TenantOne" },
      { columnName: "eFileMethod", label: "eFileMethod" },
      { columnName: "envelopeId", label: "EnvelopeId" },
      { columnName: "filedDate", label: "FiledDate" },
      { columnName: "paymentMethod", label: "eFilePaymentMethod" },
      { columnName: "invoiceNumber", label: "Invoice#" },
      { columnName: "invoiceDate", label: "InvoiceDate" },
      { columnName: "datePaid", label: "DatePaid" },
      { columnName: "checkNumber", label: "Check#" },
      { columnName: "paymentNotes", label: "PaymentNotes" },
      { columnName: "c2CFilingFee", label: "C2CFee", className: 'text-right' },
      { columnName: "courtTransAmount", label: "CourtTransAmt", className: 'text-right' },
      { columnName: "addtlTenants", label: "AddtlTenants", className: 'text-right' },
      { columnName: "andAllOtherOccupants", label: "AndAllOtherOccupants" },
      ...selectedStateValue.toLowerCase() == "tx" ? [] : [{ columnName: "expedited", label: "Expedited" }],
      { columnName: "companyName", label: "CompanyName" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "address", label: "TenantAddressCombined" },
      { columnName: "processServerCompany", label: "ProcessServerCompany" },
      { columnName: "serverReceived", label: "ServerReceived" },
      { columnName: "serviceDate", label: "ServiceDate" },
      { columnName: "serviceDayCalc", label: "ServiceDayCalc", className: 'text-right' },
      { columnName: "paidServer", label: "PaidServer$" },
      { columnName: "serverPayAdminNotes", label: "ServerPayAdminNotes" },
      { columnName: "serverSignature", label: "ServerSignature" },
      { columnName: "personalService", label: "PersonalService" },
      { columnName: "serviceMethod", label: "ServiceMethod" },
      { columnName: "house", label: "House" },
      { columnName: "c2CServiceFee", label: "C2CServiceFee", className: 'text-right' },
      { columnName: "sheriffFee", label: "SheriffFee", className: 'text-right' },
      { columnName: "payPalFee", label: "PayPalFee ", className: 'text-right' },
      { columnName: "payPalManual", label: "PayPalManual", className: 'text-right' },
      ...selectedStateValue.toLowerCase() == "tx" ? [{ columnName: "stateCourt", label: "Court", className: "StateCourt" }] : [{ columnName: "stateCourt", label: "StateCourt" }],
      { columnName: "payrollDate", label: "PayrollDate" },
      { columnName: "commissionDate", label: "CommissionDate" },
      { columnName: "paymentAmount", label: "PaymentAmount", className: 'text-right' },
      { columnName: "notes", label: "Notes" },
      { columnName: "officeCheckedDate", label: "OfficeCheckedDate" },
      { columnName: "officeCheckedBy", label: "OfficeCheckedBy" },
      { columnName: "officeCheckedNotes", label: "OfficeCheckedNotes" },
      { columnName: "paymentAccount", label: "PaymentAccount" },
      { columnName: "serviceDateAmendment", label: "ServiceDateAmendment" },
      { columnName: "serverReceivedAmendment", label: "ServerReceivedAmendment" },
      { columnName: "serviceMethodAmendment", label: "ServiceMethodAmendment" },
      { columnName: "serverSignatureAmendment", label: "ServerSignatureAmendment" },
   ];
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(accountingQueue.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(accountingQueue.totalPages > 1);
   const [openInfoModal, setInfoModal] = useState<boolean>(false);
   const [selectedId, setSelectedId] = useState<string | undefined>("");
   const [selectedPayment, setSelectedPayment] = useState<number>();
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(Array(accountingQueue.items?.length).fill(false));
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   const [newSelectedRows] = useState<boolean[]>([]);
   const [accountingQueueRecords, setAccountingQueueRecords] = useState<IAccountingQueueItem[]>([]);

   useEffect(() => {
      if (isMounted.current) {
         setCompanyId("");
         setDateFiled([null, null]);
         setDatePaid([null, null]);
         getAccountingQueue(1, 100, '');
         getAllCompanies();
         getAllCounties();
         setSelectedFilingTransactionId([]);
         setFilingType("");
         isMounted.current = false;
      };

   }, []);

   useEffect(() => {
      const accountingQueueRecords: IAccountingQueueItem[] = accountingQueue.items.map((item: any) => {
         return {
            isChecked: selectedFilingTransactionId.includes(item.id) ? true : false, // Add the new property
            ...item, // Spread existing properties
         };
      });
      setAccountingQueueRecords(accountingQueueRecords);

      const updatedSelectedRows = (accountingQueue.items || []).map((item: any) =>
         selectedFilingTransactionId.includes(item.id)
      );
      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(accountingQueue.currentPage > 1);
      setCanPaginateFront(accountingQueue.totalPages > 1);
      // Update the state with the new selectedRows array
      setSelectedRows(updatedSelectedRows);
      // setSelectedRows(Array(fileEvictions.items?.length).fill(false));    
      setSelectAll(false);
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === "Shift") {
            setShiftKeyPressed(true);
         }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
         if (e.key === "Shift") {
            // Reset selected rows to the top (index 0)
            setShiftKeyPressed(false);
         }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
         window.removeEventListener("keydown", handleKeyDown);
         window.removeEventListener("keyup", handleKeyUp);
      };

   }, [accountingQueue, selectedFilingTransactionId]);

   const settingData = async (record: IAccountingQueueItem) => {
      const checkItem = {
         id: record.id,
         dispoId: record.dispoId,
         caseNumber: record.caseNumber ?? "",
         courtTransAmount: record.courtTransAmount ?? 0,
         payPalFee: record.payPalFee ?? 0,
         payPalManual: record.payPalManual ?? 0,
         datePaid: record.datePaid ?? "",
         filedDate: record.filedDate ?? "",
         invoiceDate: record.invoiceDate ?? "",
         invoiceNumber: record.invoiceNumber ?? "",
         serverPayAdminNotes: record.serverPayAdminNotes ?? "",
         checkNumber: record.checkNumber ?? "",
         commissionDate: record.commissionDate ?? "",
         paymentAmount: record.paymentAmount ?? 0,
         payrollDate: record.payrollDate ?? "",
         paidServer: record.paidServer ?? 0,
         expedited: record.expedited ?? "",
         notes: record.notes ?? "",
         officeCheckedDate: record.officeCheckedDate ?? "",
         officeCheckedBy: record.officeCheckedBy ?? "",
         officeCheckedNotes: record.officeCheckedNotes ?? "",
         paymentAccount: record.paymentAccount,
         paymentMethod: record.paymentMethod
      };

      setBulkRecords(prevItems => {
         const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
         uniqueItems.add(JSON.stringify(checkItem)); // Add the new item
         return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
      });

   };

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
      ;
      if (shiftKeyPressed && lastClickedRowIndex !== -1 && accountingQueueRecords) {
         const start = Math.min(index, lastClickedRowIndex);
         const end = Math.max(index, lastClickedRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (accountingQueueRecords || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         accountingQueueRecords.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            settingData(item);
         })
         setSelectedFilingTransactionId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (accountingQueueRecords.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = accountingQueueRecords.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked
            setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedFilingTransactionId(prevIds => prevIds.filter(item => item !== id));
         } else {
            // If checked, add the selected item to filteredRecords
            // const selectedItemIndex = selectedIds.findIndex(itemId => itemId === id);
            // const selectedItem = (fileEvictions.items || [])[selectedItemIndex]; // Get the selected item by index
            settingData(accountingQueueRecords.filter(x => x.id === id)[0])
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedFilingTransactionId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }
         ;
         console.log(bulkRecords);

      }

      setLastClickedRowIndex(index);
   };

   const handleCellRendered = (cellIndex: number, data: IAccountingQueueItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      if (propertyName == "serviceDate") {

         const value = cellValue !== null ? convertUtcToEst(cellValue).date : "";
      }
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               // checked={selectedRows.some(row => row.id === data.id && row.selected)}
               checked={selectedFilingTransactionId.includes(data.id as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id as string, checked)
               }
               label=""
            />
         ),
         // action: () => renderActionsCell(data.id ?? "", data),
         // county: () => renderHighlightedCell(cellValue),
         caseNumber: () => renderHighlightedCell(cellValue),
         propertyName: () => renderHighlightedCell(cellValue),
         companyName: () => renderHighlightedCell(cellValue),
         invoiceNumber: () => renderHighlightedCell(cellValue),
         checkNumber: () => renderHighlightedCell(cellValue),
         eFileMethod: () => renderHighlightedCell(cellValue),
         applicantDate: () => formattedDateCell(cellValue),
         filedDate: () => formattedDateCell(cellValue),
         invoiceDate: () => formattedDateCell(cellValue),
         datePaid: () => formattedDateCell(cellValue),
         issueDate: () => formattedDateCell(cellValue),
         payrollDate: () => formattedDateCell(cellValue),
         commissionDate: () => formattedDateCell(cellValue),
         serverReceived: () => formattedDateCell(cellValue),
         // evictionServiceDate: () => formattedDateCell(cellValue),
         serviceDate: () => formattedDateCell(cellValue),
         courtTransAmount: () => formatCurrencyCell(cellValue),
         eFileClientFee: () => formatCurrencyCell(cellValue),
         expFee: () => formatCurrencyCell(cellValue),
         c2CFilingFee: () => formatCurrencyCell(cellValue),
         sheriffFee: () => formatCurrencyCell(cellValue),
         c2CServiceFee: () => formatCurrencyCell(cellValue),
         paidServer: () => formatCurrencyCell(cellValue),
         expedited: () => <span>{cellValue != "" && cellValue != null ? "Expedited" : ""}</span>,
         automationFee: () => formatCurrencyCell(cellValue),
         paymentAmount: () => formatCurrencyCell(cellValue),
         payPalFee: () => formatCurrencyCell(cellValue),
         payPalManual: () => formatCurrencyCell(cellValue),
         tenantOne: () => <HighlightedText text={`${data?.tenantFirstName ?? ''} ${data?.tenantMiddleName ?? ""} ${data?.tenantLastName ?? ''}`} query={accountingQueue.searchParam ?? ''} />,
         operationType: () => formattedOperationTypeCell(cellValue),
         serverSignature: () => renderHighlightedCell(cellValue),
         filerEmail: () => renderHighlightedCell(cellValue),
         officeCheckedDate: () => formattedDateCell(cellValue),
         serviceDateAmendment: () => formattedDateCell(cellValue),
         serverReceivedAmendment: () => formattedDateCell(cellValue),
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

   // const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
   //    <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={accountingQueue.searchParam ?? ''} />
   // );
   // const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
   //    <span >{`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} </span>
   // );

   const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
      <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={accountingQueue.searchParam ?? ''} />
   );

   const renderActionsCell = (id: string, data: IAccountingQueueItem) => {
      return (
         <>
            <div
               className="cursor-pointer flex flex-row items-center"
            >
               <FaEdit
                  className={`h-[14px] w-[14px] cursor-pointer fill-[#2472db]`}
                  onClick={() => {
                     setInfoModal(true);
                     setSelectedPayment(data.paymentAmount);
                     setSelectedId(data?.id);
                  }}
               />
            </div>
         </>
      );
   };

   // const formattedCell = (value: any) => (
   //      <span><HighlightedText text={value !== null ? value : ""} query={filingTransactions.searchParam ??''} /></span>
   //  //   <span>{value !== null ? value : ""}</span>
   // );

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );


   const renderHighlightedCell = (value: any) => (
      <HighlightedText text={value as string ?? ''} query={accountingQueue.searchParam ?? ''} />
   );

   const formatCurrencyCell = (value: number) => (
      <span>{value !== null ? formatCurrency(value) : ""}</span>
   );

   // const formattedDateCell = (value: any) => (
   //    <span>{value ? formattedDate(value as string) : ""}</span>
   // );

   // const formattedDateCell = (value: any) => (
   //    <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
   // //   <span>{value !== null ? formattedDate(value) : ""}</span>
   // );

   const formattedDateCell = (value: any) => {
      if (value != null) {
         const newsd = new Date(value).toLocaleDateString();
      }
      // Check if value is null or matches the "01/01/1111" date
      const isInvalidDate = value !== null && new Date(value).toLocaleDateString() === "1/1/1111"; // Format might vary depending on your locale
      return (
         <span>{isInvalidDate ? "NA" : value !== null ? convertUtcToEst(value).date : ""}</span>
      );
   };

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
      if (accountingQueue.currentPage < accountingQueue.totalPages) {
         const updatedCurrentPage = accountingQueue.currentPage + 1;
         setCanPaginateBack(updatedCurrentPage > 1);
         // getAccountingQueue(
         //    updatedCurrentPage,
         //    accountingQueue.pageSize,
         //    accountingQueue.searchParam,
         // );
         getAccountingQueue(updatedCurrentPage, accountingQueue.pageSize, accountingQueue.searchParam, accountingQueue.fromDatePaid, accountingQueue.toDatePaid
            , accountingQueue.type, accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll
            , accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption, accountingQueue.nonBlankOption, accountingQueue.county);
      }
   };

   const handleBackButton = () => {
      if (
         accountingQueue.currentPage > 1 &&
         accountingQueue.currentPage <= accountingQueue.totalPages
      ) {
         const updatedCurrentPage = accountingQueue.currentPage - 1;
         setCanPaginateBack(accountingQueue.currentPage > 1);
         // getAccountingQueue(
         //    updatedCurrentPage,
         //    accountingQueue.pageSize,
         //    accountingQueue.searchParam,
         // );
         getAccountingQueue(updatedCurrentPage, accountingQueue.pageSize, accountingQueue.searchParam, accountingQueue.fromDatePaid, accountingQueue.toDatePaid
            , accountingQueue.type, accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll
            , accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption, accountingQueue.nonBlankOption, accountingQueue.county);
      }
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = accountingQueueRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         accountingQueueRecords
            .map((item) => settingData(item));
         setSelectedFilingTransactionId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         accountingQueueRecords.forEach((item) => {
            setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedFilingTransactionId(prevIds => prevIds.filter(id => id !== item.id));
         });
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

   const checkIfAllIdsExist = (
      accountingQueueRecords: IAccountingQueueItem[],
      selectedAccountingQueueId: string[]
   ): boolean | undefined => {
      if (accountingQueueRecords.length === 0) {
         return false;
      }
      return accountingQueueRecords.every(record =>
         selectedAccountingQueueId.includes(record.id as string)
      );
   };

   return (
      <div className="pt-1.5 lg:pt-2 accounting_grid">
         <div className="relative -mr-0.5">
            <div className="mb-2 text-sm text-gray-600">
               {selectedFilingTransactionId.length} of {accountingQueue.totalCount} records selected
            </div>
            <div className="text-right">
            </div>
            <div className="relative -mr-0.5">
               {showSpinner && <Spinner />}
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={accountingQueue.totalCount ? accountingQueue.items : []}
                     handleSelectAllChange={handleSelectAllChange}
                     selectAll={checkIfAllIdsExist(accountingQueueRecords, selectedFilingTransactionId)}
                     cellRenderer={(data: IAccountingQueueItem, rowIndex: number, cellIndex: number) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                     selectedIds={selectedFilingTransactionId}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={accountingQueue.pageSize}
                     currentPage={accountingQueue.currentPage}
                     totalPages={accountingQueue.totalPages}
                     totalRecords={accountingQueue.totalCount}
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

export default AccountingQueueGrid;