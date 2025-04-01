import React, { useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { IGridHeader } from "interfaces/grid-interface";
import { IFilingTransactionItem } from "interfaces/filing-transaction.interface";
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

type FilingTransactionProps = {};


const FilingDispossessoryGrid = (props: FilingTransactionProps) => {
   const isMounted = useRef(true);
   const {
      showSpinner,
      filingTransactions,
      getFilingTransactions,
      setFilingType,
      companyId,
      getAllCompanies,
      selectedFilingTransactionId,
      setSelectedFilingTransactionId,
      bulkRecords,
      setBulkRecords,
      setCompanyId,
      setDateFiled,
      setDatePaid
   } = useFilingTransactionContext();

   const {selectedStateValue}=useAuth();

   const initialColumnMapping: IGridHeader[] = [
      { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
      { columnName: "applicantDate", label: "Created" },
      { columnName: "county", label: "County" },
      { columnName: "caseNumber", label: "CaseNo" },
      { columnName: "issueDate", label: "IssueDate" },
      ...selectedStateValue.toLowerCase()=="tx"?[]:[{ columnName: "expedited", label: "Expedited" }],
      { columnName: "companyName", label: "CompanyName" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "tenantOne", label: "TenantOne" },
      { columnName: "address", label: "TenantAddressCombined" },
      { columnName: "clientReferenceId", label: "ClientReferenceID" },
      { columnName: "serverReceived", label: "ServerReceived" },
      { columnName: "serviceDate", label: "ServiceDate" },
      { columnName: "serviceDayCalc", label: "ServiceDayCalc", className:'text-right' },
      { columnName: "personalService", label: "PersonalService" },
      { columnName: "house", label: "House" },
      { columnName: "addtlTenants", label: "AddtlTenants", className:'text-right' },
      { columnName: "andAllOtherOccupants", label: "AndAllOtherOccupants" },
      ...selectedStateValue.toLocaleLowerCase()=="tx"?[{ columnName: "stateCourt", label: "Court", className: "StateCourt" }]:[{ columnName: "stateCourt", label: "StateCourt" }],  
      { columnName: "eFileMethod", label: "eFileMethod" },
      { columnName: "paymentNotes", label: "PaymentNotes" },
      { columnName: "courtTransAmount", label: "EvictionCourtTransAmt", className:'text-right' },
      { columnName: "eFileClientFee", label: "EvictionEfileFee", className:'text-right' },
      { columnName: "expFee", label: "C2CServiceExpFee", className:'text-right' },
      { columnName: "c2CFilingFee", label: "C2CEvictionFee", className:'text-right' },
      { columnName: "sheriffFee", label: "SheriffFee", className:'text-right' },
      { columnName: "c2CServiceFee", label: "C2CServiceFee", className:'text-right' },
      { columnName: "automationFee", label: "EAFee", className:'text-right' },
      { columnName: "paymentAmount", label: "EvictionPaymentAmount", className:'text-right' },
      { columnName: "payPalFee", label: "EvictionPayPalFee ", className:'text-right' },
      { columnName: "payPalManual", label: "EvictionPayPalManual", className:'text-right' },
      { columnName: "filedDate", label: "EvictionFiledDate" },
      { columnName: "filingCount", label: "FilingCount", className:'text-right' },
      { columnName: "paymentMethod", label: "eFilePaymentMethod" },
      { columnName: "invoiceDate", label: "EvictionInvoiceDate" },
      { columnName: "invoiceNumber", label: "EvictionInvoice#" },
      { columnName: "datePaid", label: "EvictionDatePaid" },
      { columnName: "eFileDatePaid", label: "EFileDatePaid" },
      { columnName: "checkNumber", label: "EvictionCheck#" },
      { columnName: "notes", label: "Notes" },
      { columnName: "officeCheckedDate", label: "OfficeCheckedDate" },
      { columnName: "officeCheckedBy", label: "OfficeCheckedBy" },
      { columnName: "officeCheckedNotes", label: "OfficeCheckedNotes" },
      { columnName: "paymentAccount", label: "PaymentAccount" },
   ];
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(filingTransactions.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(filingTransactions.totalPages > 1);
   const [openInfoModal, setInfoModal] = useState<boolean>(false);
   const [selectedId, setSelectedId] = useState<string | undefined>("");
   const [selectedPayment, setSelectedPayment] = useState<number>();
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(Array(filingTransactions.items?.length).fill(false));
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   const [newSelectedRows] = useState<boolean[]>([]);
   const [filingTransactionsRecords, setFilingTransactionsRecords] = useState<IFilingTransactionItem[]>([]);

   useEffect(() => {
      if (isMounted.current) {
         setCompanyId("");
         setDateFiled([null, null]);
         setDatePaid([null, null]);
         getFilingTransactions(1, 100, '', "Eviction");
         getAllCompanies();
         setFilingType("Eviction");
         setSelectedFilingTransactionId([]);
         isMounted.current = false;
      };

   }, []);

   useEffect(() => {
      const filingTransactionsRecords: IFilingTransactionItem[] = filingTransactions.items.map((item: any) => {
         return {
            isChecked: selectedFilingTransactionId.includes(item.id) ? true : false, // Add the new property
            ...item, // Spread existing properties
         };
      });
      setFilingTransactionsRecords(filingTransactionsRecords);

      const updatedSelectedRows = (filingTransactions.items || []).map((item: any) =>
         selectedFilingTransactionId.includes(item.id)
      );

      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(filingTransactions.currentPage > 1);
      setCanPaginateFront(filingTransactions.totalPages > 1);
      // Update the state with the new selectedRows array
      setSelectedRows(updatedSelectedRows); 
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

   }, [filingTransactions, selectedFilingTransactionId]);

   const settingData = async (record: IFilingTransactionItem) => {
      const checkItem = {
         id: record.id,
         dispoId: record.dispoId,
         caseNumber: record.caseNumber ?? "",
         courtTransAmount: record.courtTransAmount ?? 0,
         eFileClientFee: record.eFileClientFee ?? 0,
         expFee: record.expFee ?? 0,
         c2CFilingFee: record.c2CFilingFee ?? 0,
         sheriffFee: record.sheriffFee ?? 0,
         c2CServiceFee: record.c2CServiceFee ?? 0,
         automationFee: record.automationFee ?? 0,
         paymentAmount: record.paymentAmount ?? 0,
         payPalFee: record.payPalFee ?? 0,
         payPalManual: record.payPalManual ?? 0,
         invoiceDate: record.invoiceDate ?? "",
         datePaid: record.datePaid ?? "",
         eFileDatePaid: record.eFileDatePaid ?? "",
         filedDate: record.filedDate ?? "",
         invoiceNumber: record.invoiceNumber ?? "",
         checkNumber: record.checkNumber ?? "",
         house: record.house ?? "",
         paymentNotes: record.paymentNotes ?? "",
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
      if (shiftKeyPressed && lastClickedRowIndex !== -1 && filingTransactionsRecords) {
         const start = Math.min(index, lastClickedRowIndex);
         const end = Math.max(index, lastClickedRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (filingTransactionsRecords || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         filingTransactionsRecords.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            settingData(item);
         })
         setSelectedFilingTransactionId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (filingTransactionsRecords.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = filingTransactionsRecords.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked
            setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedFilingTransactionId(prevIds => prevIds.filter(item => item !== id));
         } else {
            // If checked, add the selected item to filteredRecords
            // const selectedItemIndex = selectedIds.findIndex(itemId => itemId === id);
            // const selectedItem = (fileEvictions.items || [])[selectedItemIndex]; // Get the selected item by index
            settingData(filingTransactionsRecords.filter(x => x.id === id)[0])
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedFilingTransactionId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }
         ;
         console.log(bulkRecords);

      }

      setLastClickedRowIndex(index);
   };

   const handleCellRendered = (cellIndex: number, data: IFilingTransactionItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
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
         serverReceived: () => formattedDateCell(cellValue),
         serviceDate: () => formattedDateCell(cellValue),
         eFileDatePaid: () => formattedDateCell(cellValue),
         courtTransAmount: () => formatCurrencyCell(cellValue),
         eFileClientFee: () => formatCurrencyCell(cellValue),
         expFee: () => formatCurrencyCell(cellValue),
         c2CFilingFee: () => formatCurrencyCell(cellValue),
         sheriffFee: () => formatCurrencyCell(cellValue),
         c2CServiceFee: () => formatCurrencyCell(cellValue),
         expedited: () => <span>{cellValue != "" && cellValue != null ? "Expedited" : ""}</span>,
         automationFee: () => formatCurrencyCell(cellValue),
         paymentAmount: () => formatCurrencyCell(cellValue),
         payPalFee: () => formatCurrencyCell(cellValue),
         payPalManual: () => formatCurrencyCell(cellValue),
         tenantOne: () => formattedTenantFullName(data?.tenantNames[0] ?? null),
         operationType: () => formattedOperationTypeCell(cellValue),
         officeCheckedDate: () => formattedDateCell(cellValue)
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
   //    <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={filingTransactions.searchParam ?? ''} />
   // );
   // const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
   //    <span >{`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} </span>
   // );
   const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
      <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={filingTransactions.searchParam ?? ''} />
   );

   const renderActionsCell = (id: string, data: IFilingTransactionItem) => {
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
      <HighlightedText text={value as string ?? ''} query={filingTransactions.searchParam ?? ''} />
   );

   const formatCurrencyCell = (value: number) => (
      <span>{value !== null ? formatCurrency(value) : ""}</span>
   );

   // const formattedDateCell = (value: any) => (
   //    <span>{value ? formattedDate(value as string) : ""}</span>
   // );

   const formattedDateCell = (value: any) => (
      <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
   //   <span>{value !== null ? formattedDate(value) : ""}</span>
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
      if (filingTransactions.currentPage < filingTransactions.totalPages) {
         const updatedCurrentPage = filingTransactions.currentPage + 1;
         setCanPaginateBack(updatedCurrentPage > 1);
         getFilingTransactions(
            updatedCurrentPage,
            filingTransactions.pageSize,
            filingTransactions.searchParam,
            "Eviction",
            companyId,
            filingTransactions.fromDate,
            filingTransactions.toDate,
            filingTransactions.datePaidFromDate,
            filingTransactions.datePaidToDate,
            filingTransactions.blankOption
            ,filingTransactions.nonBlankOption
            ,filingTransactions.county

         );
      }
   };

   const handleBackButton = () => {
      if (
         filingTransactions.currentPage > 1 &&
         filingTransactions.currentPage <= filingTransactions.totalPages
      ) {
         const updatedCurrentPage = filingTransactions.currentPage - 1;
         setCanPaginateBack(filingTransactions.currentPage > 1);
         getFilingTransactions(
            updatedCurrentPage,
            filingTransactions.pageSize,
            filingTransactions.searchParam,
            "Eviction",
            companyId,
            filingTransactions.fromDate,
            filingTransactions.toDate,
            filingTransactions.datePaidFromDate,
            filingTransactions.datePaidToDate,
            filingTransactions.blankOption
            ,filingTransactions.nonBlankOption
            ,filingTransactions.county
         );
      }
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = filingTransactionsRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         filingTransactionsRecords
            .map((item) => settingData(item));
         setSelectedFilingTransactionId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         filingTransactionsRecords.forEach((item) => {
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

   //    const checkIfAllIdsExist = (
   //       filingAOSRecords: IFilingTransactionItem[],
   //       selectedFilingAOSId: string[]
   //    ): boolean | undefined => {
   //       return filingAOSRecords.every(record =>
   //          selectedFilingAOSId.includes(record.id as string)
   //       );
   //    };

   const checkIfAllIdsExist = (
      filingAOSRecords: IFilingTransactionItem[],
      selectedFilingAOSId: string[]
   ): boolean | undefined => {
      if (filingAOSRecords.length === 0) {
         return false;
      }
      return filingAOSRecords.every(record =>
         selectedFilingAOSId.includes(record.id as string)
      );
   };

   // const handleEditData = async (amount: number | undefined) => {      
   //    setInfoModal(false);
   //    // setShowSpinner(true);
   //    var data={Id:selectedId as string ,PaymentAmount:amount}
   //    // const response =await FilingTransactionService.updatePaymentAmount(data);
   //    // if (response.status === HttpStatusCode.OK) {
   //    //    toast.success("Updated Successfully.");
   //    //    getFilingTransactions(1,100,filingTransactions.searchParam,OperationTypeEnum.AOS,companyId);
   //    // }
   //    setShowSpinner(false);
   // }

   return (
      <div className="pt-1.5 lg:pt-2 accounting_grid">
         <div className="relative -mr-0.5">
         <div className="mb-2 text-sm text-gray-600">
            {selectedFilingTransactionId.length} of {filingTransactions.totalCount} records selected
         </div>

            <div className="text-right">
            </div>
            <div className="relative -mr-0.5">
               {showSpinner && <Spinner />}
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={filingTransactions.totalCount ? filingTransactions.items : []}
                     handleSelectAllChange={handleSelectAllChange}
                     selectAll={checkIfAllIdsExist(filingTransactionsRecords, selectedFilingTransactionId)}
                     cellRenderer={(data: IFilingTransactionItem, rowIndex: number, cellIndex: number) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                     selectedIds={selectedFilingTransactionId}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={filingTransactions.pageSize}
                     currentPage={filingTransactions.currentPage}
                     totalPages={filingTransactions.totalPages}
                     totalRecords={filingTransactions.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               </>
            </div>
         </div>

         {/* <Modal showModal={openInfoModal} onClose={() => setInfoModal(false)} width="max-w-sm">
            <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
               <div className="sm:flex sm:items-start">
                  <div className="text-center sm:text-left">
                     <h3
                        className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                        id="modal-title"
                     >
                        Update
                     </h3>
                  </div>
               </div>
               <Formik
                  initialValues={{ paymentAmount: selectedPayment }}
                  onSubmit={(values) => handleEditData(values.paymentAmount)}
               >
                  {(formik) => (
                     <Form className="pt-1">
                        <div className="md:grid-cols-2 gap-2.5 sm:gap-3.5 mb-2.5">
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Payment Amount"}
                                 name={"paymentAmount"}
                                 placeholder={"Enter Amount"}
                              />
                           </div>
                        </div>
                        <div className="mt-1.5 md:mt-0 py-2.5 flex justify-end items-center">
                           <Button
                              type="button"
                              isRounded={false}
                              title="Cancel"
                              handleClick={() => setInfoModal(false)}
                              classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                           ></Button>
                           <Button
                              title={"Update"}
                              type={"submit"}
                              isRounded={false}
                              disabled={showSpinner}
                              classes="py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                           ></Button>
                        </div>
                     </Form>
                  )}
               </Formik>
            </div>
         </Modal> */}
      </div>
   )
};

export default FilingDispossessoryGrid;