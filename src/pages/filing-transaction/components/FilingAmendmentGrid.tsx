import React, { useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { IGridHeader } from "interfaces/grid-interface";
import { IFilingTransactionItem } from "interfaces/filing-transaction.interface";
import Pagination from "components/common/pagination/Pagination";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import GridCheckbox from "components/formik/GridCheckBox";
import { convertUtcToEst, formatCurrency, formattedDate, toCssClassName } from "utils/helper";
import { OperationTypeEnum } from "utils/enum";
import { useFilingTransactionContext } from "../FilingTransactionContext";
import { ITenant } from "interfaces/all-cases.interface";

type FilingTransactionProps = {};

const initialColumnMapping: IGridHeader[] = [
   { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
   { columnName: "applicantDate", label: "AmendmentApplicantDate" },
   { columnName: "county", label: "County" },
   { columnName: "caseNumber", label: "CaseNo" },
   { columnName: "companyName", label: "CompanyName" },
   { columnName: "propertyName", label: "PropertyName" },
   { columnName: "tenantOne", label: "TenantOne" },
   { columnName: "address", label: "TenantAddressCombined" },
   { columnName: "filedDate", label: "AmendmentFiledDate" },
   { columnName: "courtTransAmount", label: "AmendmentCourtTransAmount", className:'text-right' },
   { columnName: "sheriffFee", label: "SheriffFee", className:'text-right' },
   { columnName: "c2CFilingFee", label: "C2CAmendmentFee", className:'text-right' },
   { columnName: "c2CServiceFee", label: "C2CServiceFee", className:'text-right' },
   { columnName: "paymentAmount", label: "AmendmentPaymentAmount", className:'text-right' },
   { columnName: "payPalFee", label: "AmendmentPayPalFee", className:'text-right' },
   { columnName: "payPalManual", label: "AmendmentPayPalManual", className:'text-right' },
   { columnName: "filingCount", label: "FilingCount", className:'text-right' },
   { columnName: "paymentMethod", label: "eFilePaymentMethod" },
   { columnName: "invoiceDate", label: "AmendmentInvoiceDate" },
   { columnName: "invoiceNumber", label: "AmendmentInvoice#" },
   { columnName: "datePaid", label: "AmendmentDatePaid" },
   { columnName: "checkNumber", label: "AmendmentCheck#" },
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

const FilingAmendmentGrid = (props: FilingTransactionProps) => {
   const isMounted = useRef(true);
   const {
      showSpinner,
      amendmentsFilingTransactions,
      getFilingTransactions,
      setShowSpinner,
      filingType,
      setFilingType,
      companyId,
      selectedFilingTransactionId,
      setSelectedFilingTransactionId,
      amendmentBulkRecords,
      setAmendmentBulkRecords,
      setCompanyId,
      setDateFiled,
      setDatePaid
      
   } = useFilingTransactionContext();

   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(amendmentsFilingTransactions.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(amendmentsFilingTransactions.totalPages > 1);
   const [openInfoModal, setInfoModal] = useState<boolean>(false);
   const [selectedId, setSelectedId] = useState<string|undefined>("");
   const [selectedPayment, setSelectedPayment] = useState<number>();
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(Array(amendmentsFilingTransactions.items?.length).fill(false));
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   const [newSelectedRows] = useState<boolean[]>([]);
   const [filingTransactionsRecords, setFilingTransactionsRecords] = useState<IFilingTransactionItem[]>([]);
   useEffect(() => {
      if (isMounted.current) {
         setCompanyId("");
         setDateFiled([null, null]);
         setDatePaid([null, null]);
        getFilingTransactions(1, 100,'',"Amendment");
        setFilingType("Amendment");
        setSelectedFilingTransactionId([]);
         isMounted.current = false;
      };

   }, []);

   useEffect(() => {
      const filingTransactionsRecords: IFilingTransactionItem[] = amendmentsFilingTransactions.items.map((item: any) => {
         return {
            isChecked: selectedFilingTransactionId.includes(item.id) ? true : false, // Add the new property
            ...item, // Spread existing properties
         };
      });
      setFilingTransactionsRecords(filingTransactionsRecords);

      const updatedSelectedRows = (amendmentsFilingTransactions.items || []).map((item: any) =>
         selectedFilingTransactionId.includes(item.id)
      );

      // const updatedSelectedRows = (fileEvictions.items || []).map((item: any) => ({
      //   id: item.id,
      //   selected: selectedFileEvictionId.includes(item.id)
      // }));

      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(amendmentsFilingTransactions.currentPage > 1);
      setCanPaginateFront(amendmentsFilingTransactions.totalPages > 1);
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

   }, [amendmentsFilingTransactions, selectedFilingTransactionId]);

   const settingData = async (record: IFilingTransactionItem) => {
      const checkItem = {
         id: record.id,
         dispoId: record.dispoId,
         caseNumber: record.caseNumber ?? "",
         courtTransAmount: record.courtTransAmount ?? 0,
         sheriffFee: record.sheriffFee ?? 0,
         c2CFilingFee: record.c2CFilingFee ?? 0,
         c2CServiceFee: record.c2CServiceFee ?? 0,
         paymentAmount: record.paymentAmount ?? 0,
         payPalFee: record.payPalFee ?? 0,
         payPalManual: record.payPalManual ?? 0,
         datePaid: record.datePaid ?? "",
         filedDate: record.filedDate ?? "",
         invoiceDate: record.invoiceDate ?? "",
         invoiceNumber: record.invoiceNumber ?? "",
         checkNumber: record.checkNumber ?? "",
         notes: record.notes ?? "",
         officeCheckedDate: record.officeCheckedDate ?? "",
         officeCheckedBy: record.officeCheckedBy ?? "",
         officeCheckedNotes: record.officeCheckedNotes ?? "",
         paymentAccount: record.paymentAccount,
         paymentMethod: record.paymentMethod,
         serviceDateAmendment: record.serviceDateAmendment ?? "",
         serverReceivedAmendment: record.serverReceivedAmendment ?? "",
         serviceMethodAmendment: record.serviceMethodAmendment ?? "",
         serverSignatureAmendment: record.serverSignatureAmendment ?? ""
      };

      setAmendmentBulkRecords(prevItems => {
         const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
         uniqueItems.add(JSON.stringify(checkItem)); // Add the new item
         return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
      });

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
            setAmendmentBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedFilingTransactionId(prevIds => prevIds.filter(id => id !== item.id));
         });
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };
   // const checkIfAllIdsExist = (
   //    filingAOSRecords: IFilingTransactionItem[],
   //    selectedFilingAOSId: string[]
   // ): boolean | undefined => {

   //    return filingAOSRecords.every(record =>
   //       selectedFilingAOSId.includes(record.id as string)
   //    );
   // };
   const checkIfAllIdsExist = (
      filingAmendmentRecords: IFilingTransactionItem[],
      selectedFilingAmendmentId: string[]
   ): boolean | undefined => {
      if (filingAmendmentRecords.length === 0) {
          return false;
      }
      return filingAmendmentRecords.every(record =>
         selectedFilingAmendmentId.includes(record.id as string)
      );
   };

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {

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
         // const selectedIds = (fileEvictions.items || [])
         //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
         //   .map((item) => item.id)
         //   .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked
            setAmendmentBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
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
         applicantDate: () => formattedDateCell(cellValue),
         filedDate: () => formattedDateCell(cellValue),
         invoiceDate: () => formattedDateCell(cellValue),
         datePaid: () => formattedDateCell(cellValue),
         courtTransAmount: () => formatCurrencyCell(cellValue),
         sheriffFee: () => formatCurrencyCell(cellValue),
         c2CFilingFee: () => formatCurrencyCell(cellValue),
         c2CServiceFee: () => formatCurrencyCell(cellValue),
         paymentAmount: () => formatCurrencyCell(cellValue),
         payPalFee: () => formatCurrencyCell(cellValue),
         payPalManual: () => formatCurrencyCell(cellValue),
         tenantOne: () => <HighlightedText text={`${data?.tenantFirstName ?? ''} ${data?.tenantMiddleName ?? ""} ${data?.tenantLastName ?? ''}`} query={amendmentsFilingTransactions.searchParam ?? ''} />,
        //  c2CTotalFee: () => formattedCurrencyCell(cellValue),
         operationType: () => formattedOperationTypeCell(cellValue),
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

   // const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
   //    <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={filingTransactions.searchParam ?? ''} />
   // );
   // const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
   //    <span >{`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} </span>
   // );
   const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
      <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={amendmentsFilingTransactions.searchParam ?? ''} />
   );
   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );
   

   const renderHighlightedCell = (value: any) => (
      <HighlightedText text={value as string ?? ''} query={amendmentsFilingTransactions.searchParam ?? ''} />
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
      if (amendmentsFilingTransactions.currentPage < amendmentsFilingTransactions.totalPages) {
         const updatedCurrentPage = amendmentsFilingTransactions.currentPage + 1;
         setCanPaginateBack(updatedCurrentPage > 1);
         getFilingTransactions(
            updatedCurrentPage,
            amendmentsFilingTransactions.pageSize,
            amendmentsFilingTransactions.searchParam,
            "Amendment",
            companyId,
            amendmentsFilingTransactions.fromDate,
            amendmentsFilingTransactions.toDate,
            amendmentsFilingTransactions.datePaidFromDate,
            amendmentsFilingTransactions.datePaidToDate,
            amendmentsFilingTransactions.blankOption
            ,amendmentsFilingTransactions.nonBlankOption
            ,amendmentsFilingTransactions.county
         );
      }
   };

   const handleBackButton = () => {
      if (
         amendmentsFilingTransactions.currentPage > 1 &&
         amendmentsFilingTransactions.currentPage <= amendmentsFilingTransactions.totalPages
      ) {
         const updatedCurrentPage = amendmentsFilingTransactions.currentPage - 1;
         setCanPaginateBack(amendmentsFilingTransactions.currentPage > 1);
         getFilingTransactions(
            updatedCurrentPage,
            amendmentsFilingTransactions.pageSize,
            amendmentsFilingTransactions.searchParam,
            "Amendment",
            companyId,
            amendmentsFilingTransactions.fromDate,
            amendmentsFilingTransactions.toDate,
            amendmentsFilingTransactions.datePaidFromDate,
            amendmentsFilingTransactions.datePaidToDate,
            amendmentsFilingTransactions.blankOption
            ,amendmentsFilingTransactions.nonBlankOption
            ,amendmentsFilingTransactions.county
         );
      }
   };

   // const handleEditData = async (amount: number | undefined) => {      
   //    setInfoModal(false);
   //    // setShowSpinner(true);
   //    var data={Id:selectedId as string ,PaymentAmount:amount}
   //    const response =await FilingTransactionService.updatePaymentAmount(data);
   //    if (response.status === HttpStatusCode.OK) {
   //       toast.success("Updated Successfully.");
   //       getFilingTransactions(1,100,filingTransactions.searchParam,OperationTypeEnum.Amendment,companyId);
   //    }
   //    setShowSpinner(false);
   // }

   return (
      <div className="pt-1.5 lg:pt-2 accounting_grid">
         <div className="relative -mr-0.5">
         <div className="mb-2 text-sm text-gray-600">
            {selectedFilingTransactionId.length} of {amendmentsFilingTransactions.totalCount} records selected
         </div>
            <div className="text-right">
            </div>
            <div className="relative -mr-0.5">
               {showSpinner && <Spinner />}
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={amendmentsFilingTransactions.totalCount ? amendmentsFilingTransactions.items : []}
                     handleSelectAllChange={handleSelectAllChange}
                     selectAll={checkIfAllIdsExist(filingTransactionsRecords, selectedFilingTransactionId)}
                     cellRenderer={(data: IFilingTransactionItem, rowIndex: number, cellIndex: number) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                     selectedIds={selectedFilingTransactionId}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={amendmentsFilingTransactions.pageSize}
                     currentPage={amendmentsFilingTransactions.currentPage}
                     totalPages={amendmentsFilingTransactions.totalPages}
                     totalRecords={amendmentsFilingTransactions.totalCount}
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

export default FilingAmendmentGrid;