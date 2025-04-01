import React, { useEffect, useRef, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import Grid from "components/common/grid/GridWithToolTip";
import C2CFormPopup from "./C2CFeesModal";
import { convertToPrice, toCssClassName } from "utils/helper";
import C2CFeesService from "services/c2c-fees.service";
import { IC2CFeeItems } from "interfaces/c2c-fees.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { ICommonSelectOptions } from "interfaces/common.interface";
import { useAccountingContext } from "../AccountingContext";

const initialColumnMapping: IGridHeader[] = [
   { columnName: "action", label: "Action", className: "action" },
   { columnName: "countyName", label: "County" },
   { columnName: "courtName", label: "Court" },
   { columnName: "clientId", label: "CompanyName" },
   { columnName: "evictionAutomationFee", label: "EAFee", className:'text-right' },
   { columnName: "c2CEvictionFee", label: "C2CEvictionFee", className:'text-right' },
   { columnName: "c2CAddtlTenantsFee", label: "C2CAddtlTenantsFee", className:'text-right' },
   { columnName: "c2CAOSFee", label: "C2CAOSFee", className:'text-right' },
   { columnName: "c2CAddtlDocFee", label: "C2CAddtlDocFee", className:'text-right' },
   { columnName: "c2CDismissalFee", label: "C2CDismissalFee", className:'text-right' },
   { columnName: "c2CAmendmentFee", label: "C2CAmendmentFee", className:'text-right' },
   { columnName: "c2CWritFee", label: "C2CWritFee", className:'text-right' },
   { columnName: "c2COtherFee", label: "C2COtherFee", className:'text-right' },
   { columnName: "c2CServiceFee", label: "C2CServiceFee", className:'text-right' },
   { columnName: "c2CServiceExpFee", label: "C2CServiceExpFee", className:'text-right' },
   { columnName: "c2CServiceAddtlTenantsFee", label: "C2CServiceAddtlTenantsFee", className:'text-right' },
   { columnName: "c2CServiceHouseFee", label: "C2CServiceHouseFee", className:'text-right' }
];

const initialC2CFee: IC2CFeeItems = {
   id: "",
   countyId: 0,
   courtId: 0,
   clientId: "",
   c2CServiceExpFee: 0,
   c2CServiceFee: 0,
   c2CAddtlTenantsFee: 0,
   c2CServiceHouseFee: 0,
   c2CAOSFee: 0,
   c2CDismissalFee: 0,
   c2CWritFee: 0,
   evictionAutomationFee: 0,
   c2CAmendmentFee: 0,
   c2CAddtlDocFee: 0,
   c2COtherFee: 0,
   c2CEvictionFee: 0,
   c2CServiceAddtlTenantsFee: 0,
   court: {
      id: 0,
      courtName: "",
      countyId: 0,
      county: {
         countyId: 0,
         stateName: "",
         countyName: "",
      },
   },
   client: {
      id: "",
      email: "",
      companyName: ""
   }
};

const C2CFees = () => {
   const {
      c2cFees,
      getAllC2CFees,
      setAllC2CFees,
      allCompanies,
      getAllCompanies
   } = useAccountingContext();
   const isMounted = useRef(true);
   const [showSpinner, setShowSpinner] = useState<Boolean>(false);
   const [companyOptions, setCompanyOptions] = useState<ICommonSelectOptions[]>([]);
   //   const [c2cFeesRecord, setC2CFeesRecord] = useState<IC2CFeeItems[]>();
   const [showC2CFeesForm, setShowC2CFeesForm] = useState<Boolean>(false);
   // delete confirmation
   const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
   const [isEditMode, setIsEditMode] = useState<boolean>(false);
   // State variables for pagination for next and previous button
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      c2cFees.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      c2cFees.totalPages > 1
   );
   // State variable to store the selected row data
   const [selectedRowData, setSelectedRowData] = useState<IC2CFeeItems>(initialC2CFee);
   //visible columns
   const [visibleColumns] = useState<IGridHeader[]>(
      initialColumnMapping
   );

   useEffect(() => {
      if (isMounted.current) {
         getAllCompanies();
         isMounted.current = false;
      }
      const options: ICommonSelectOptions[] = allCompanies.map(item => ({
         id: item.id,
         value: item.companyName
      }));
      setCompanyOptions(options);
   }, [allCompanies, getAllCompanies]);

   useEffect(() => {
      getAllC2CFees(1, 100, "");
   }, []);

   // on press ok from delete confirmation
   const handleDeleteC2CFees = async () => {
      try {
         // Check if countyId is available
         if (!selectedRowData.id) {
            // If not available, exit early
            return;
         }

         // Display spinner while processing
         setShowSpinner(true);

         // Attempt to delete the county
         const response = await C2CFeesService.removeC2CFees(selectedRowData.id);

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record removed successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setDeleteConfirmation(false);
            getAllC2CFees(c2cFees.currentPage, c2cFees.pageSize);
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error deleting county:", error);
      } finally {
         // Hide the spinner regardless of the outcome
         setShowSpinner(false);
      }
   };
   const convertToNumber = (value: string | number | null) => {
      return (value == null || value === "") ? 0 : Number(value);
    };
   // on press ok from edit pop up
   const handleEditC2CFees = async (formValues: IC2CFeeItems) => {
      try {
         // Display spinner while processing
         setShowSpinner(true);

         // Attempt to delete the county
         formValues.c2CAOSFee=convertToNumber(formValues.c2CAOSFee);
         formValues.c2CServiceExpFee=convertToNumber(formValues.c2CServiceExpFee);
         formValues.c2CServiceFee=convertToNumber(formValues.c2CServiceFee);
         formValues.c2CAddtlTenantsFee=convertToNumber(formValues.c2CAddtlTenantsFee);
         formValues.c2CServiceHouseFee=convertToNumber(formValues.c2CServiceHouseFee);
         formValues.c2CDismissalFee=convertToNumber(formValues.c2CDismissalFee);
         formValues.c2CWritFee=convertToNumber(formValues.c2CWritFee);
         formValues.evictionAutomationFee=convertToNumber(formValues.evictionAutomationFee);
         formValues.c2CAmendmentFee=convertToNumber(formValues.c2CAmendmentFee);
         formValues.c2CAddtlDocFee=convertToNumber(formValues.c2CAddtlDocFee);
         formValues.c2COtherFee=convertToNumber(formValues.c2COtherFee);
         formValues.c2CEvictionFee=convertToNumber(formValues.c2CEvictionFee);
         formValues.c2CServiceAddtlTenantsFee=convertToNumber(formValues.c2CServiceAddtlTenantsFee);
         const response = await C2CFeesService.updateC2CFees(formValues);

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record updated successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setShowC2CFeesForm(false);
            setIsEditMode(false);
            getAllC2CFees(c2cFees.currentPage, c2cFees.pageSize);
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error deleting county:", error);
      } finally {
         // Hide the spinner regardless of the outcome
         setShowSpinner(false);
      }
   };

   /**
    * Render each cell of a table
    * @param cellIndex  : cell of table
    * @param data  :data of cell
    * @param rowIndex : row index
    * @returns render cell
    */
   const handleCellRendered = (
      cellIndex: number,
      data: IC2CFeeItems,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         action: () => formatActionCell(rowIndex, data),
         countyName: () => formattedCell(data.court.county.countyName),
         courtName: () => formattedCell(data.court.courtName),
         clientId: () => formattedClientCell(data),
         c2CServiceExpFee: () => formattedCurrencyCell(cellValue),
         c2CServiceFee: () => formattedCurrencyCell(cellValue),
         c2CAddtlTenantsFee: () => formattedCurrencyCell(cellValue),
         c2CServiceHouseFee: () => formattedCurrencyCell(cellValue),
         c2CAOSFee: () => formattedCurrencyCell(cellValue),
         c2CDismissalFee: () => formattedCurrencyCell(cellValue),
         c2CWritFee: () => formattedCurrencyCell(cellValue),
         evictionAutomationFee: () => formattedCurrencyCell(cellValue),
         c2CAmendmentFee: () => formattedCurrencyCell(cellValue),
         c2CAddtlDocFee: () => formattedCurrencyCell(cellValue),
         c2COtherFee: () => formattedCurrencyCell(cellValue),
         c2CEvictionFee: () => formattedCurrencyCell(cellValue),
         c2CServiceAddtlTenantsFee: () => formattedCurrencyCell(cellValue)
      };
      const renderer =
         renderers[propertyName] || (() => formattedCell(cellValue));
      if (visibleColumns.find(x => x.label === columnName)) {

         return (
            <td
               key={cellIndex}
               className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929]  ${toCssClassName(columnName)}`}
            >
               {renderer()}
            </td>
         );
      }
      return <></>;
   };

   const handleCreateC2CFees = async (formValues: IC2CFeeItems) => {
      try {
         // Display spinner while processing
         setShowSpinner(true);
         //Attempt to delete the county
         formValues.c2CAOSFee=convertToNumber(formValues.c2CAOSFee);
         formValues.c2CServiceExpFee=convertToNumber(formValues.c2CServiceExpFee);
         formValues.c2CServiceFee=convertToNumber(formValues.c2CServiceFee);
         formValues.c2CAddtlTenantsFee=convertToNumber(formValues.c2CAddtlTenantsFee);
         formValues.c2CServiceHouseFee=convertToNumber(formValues.c2CServiceHouseFee);
         formValues.c2CDismissalFee=convertToNumber(formValues.c2CDismissalFee);
         formValues.c2CWritFee=convertToNumber(formValues.c2CWritFee);
         formValues.evictionAutomationFee=convertToNumber(formValues.evictionAutomationFee);
         formValues.c2CAmendmentFee=convertToNumber(formValues.c2CAmendmentFee);
         formValues.c2CAddtlDocFee=convertToNumber(formValues.c2CAddtlDocFee);
         formValues.c2COtherFee=convertToNumber(formValues.c2COtherFee);
         formValues.c2CEvictionFee=convertToNumber(formValues.c2CEvictionFee);
         formValues.c2CServiceAddtlTenantsFee=convertToNumber(formValues.c2CServiceAddtlTenantsFee);
         const response = await C2CFeesService.createC2CFees(formValues);
         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record added successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });
            // Close the confirmation pop-up and refresh the list
            setShowC2CFeesForm(false);
            getAllC2CFees(c2cFees.currentPage, c2cFees.pageSize);
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error deleting county:", error);
      } finally {
         // Hide the spinner regardless of the outcome
         setShowSpinner(false);
      }
   };

   /**
    * @param value value to be shown in the cell
    * @returns span
    */
   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   const formattedCurrencyCell = (value: any) => (
      <span>${value !== null ? convertToPrice(value) : ""}</span>
   );

   const formatActionCell = (rowIndex: number, rowData: IC2CFeeItems) => {
      return (
         <div
            className="cursor-pointer flex flex-row"
            key={`${rowIndex}_cross`}
         >
            <FaEdit
               style={{
                  height: 14,
                  width: 14,
                  color: "#2472db",
                  margin: 3,
               }}
               onClick={() => {
                  setIsEditMode(true);
                  setShowC2CFeesForm(true);
                  setSelectedRowData({
                     ...rowData,
                     countyId: rowData.court.countyId,
                  }); // Set the selected row data
               }}
            ></FaEdit>
            <FaTrash
               style={{
                  height: 14,
                  width: 14,
                  color: "#E61818",
                  margin: 3,
               }}
               onClick={() => {
                  setDeleteConfirmation(true);
                  setSelectedRowData(rowData); // Set the selected row data
               }}
            ></FaTrash>
         </div>
      );
   };

   const formattedClientCell = (data: IC2CFeeItems) => (
      <span>{data.client.companyName ?? ""}</span>
   );

   // // Event handler for the 'Next' button
   const handleFrontButton = () => {
      if (c2cFees.currentPage < c2cFees.totalPages) {
         const updatedCurrentPage = c2cFees.currentPage + 1;
         setAllC2CFees({
            ...c2cFees,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getAllC2CFees(updatedCurrentPage, c2cFees.pageSize);
      }
   };

   // Event handler for the 'Back' button
   const handleBackButton = () => {
      if (c2cFees.currentPage > 1 && c2cFees.currentPage <= c2cFees.totalPages) {
         const updatedCurrentPage = c2cFees.currentPage - 1;
         setAllC2CFees({
            ...c2cFees,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(c2cFees.currentPage > 1);
         // back button get late notices
         getAllC2CFees(updatedCurrentPage, c2cFees.pageSize);
      }
   };

   return (
      <div className="pt-1.5 lg:pt-2 accounting_grid">
         <div className="relative -mr-0.5">
            <div className="text-right">
               <Button
                  isRounded={false}
                  classes="bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-semibold text-xs text-white rounded shadow-lg inline-flex items-center"
                  title={"Add New"}
                  handleClick={() => {
                     setIsEditMode(false);
                     setShowC2CFeesForm(true);
                     setSelectedRowData(initialC2CFee);
                  }}
                  icon={<FaPlus className="mr-1.5"></FaPlus>}
                  type={"button"}
               ></Button>
            </div>
            <div className="mt-1.5">
               {/* Render the Grid component with column headings and grid data */}
               {showSpinner === true && <Spinner />}
               <Grid
                  columnHeading={visibleColumns}
                  rows={c2cFees?.items}
                  cellRenderer={(
                     data: IC2CFeeItems,
                     rowIndex: number,
                     cellIndex: number
                  ) => {
                     return handleCellRendered(cellIndex, data, rowIndex);
                  }}
               />
               {c2cFees && (
                  <Pagination
                     numberOfItemsPerPage={c2cFees.pageSize}
                     currentPage={c2cFees.currentPage}
                     totalPages={c2cFees.totalPages}
                     totalRecords={c2cFees.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               )}
            </div>
            {showC2CFeesForm && (
               <C2CFormPopup
                  showPopup={showC2CFeesForm}
                  closePopup={(shouldRefresh: string) => {
                     if (shouldRefresh === "refresh") {
                        getAllC2CFees(c2cFees.currentPage, c2cFees.totalPages);
                     }
                     setShowC2CFeesForm(false);
                  }}
                  isEditMode={isEditMode}
                  initialValues={selectedRowData}
                  companyOptions={companyOptions}
                  onSubmit={(formValues: IC2CFeeItems) => {
                     if (isEditMode) {
                        handleEditC2CFees(formValues);
                     } else {
                        handleCreateC2CFees(formValues);
                     }
                  }}
                  showSpinner= {showSpinner}
               ></C2CFormPopup>
            )}
            {deleteConfirmation === true && (
               <div>
                  <ConfirmationBox
                     heading={"Confirmation"}
                     message={"Are you sure you want to delete this record?"}
                     showConfirmation={deleteConfirmation}
                     confirmButtonTitle="OK"
                     closePopup={() => {
                        setDeleteConfirmation(false);
                     }}
                     handleSubmit={() => {
                        setDeleteConfirmation(false);
                        handleDeleteC2CFees();
                     }}
                  ></ConfirmationBox>
               </div>
            )}
         </div>
      </div>
   );
};
export default C2CFees;
