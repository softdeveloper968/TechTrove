import React, { useEffect, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import ConfirmationBox from "../../../components/common/deleteConfirmation/DeleteConfirmation";
import Spinner from "../../../components/common/spinner/Spinner";
import Grid from "../../../components/common/grid/GridWithToolTip";
import Button from "../../../components/common/button/Button";
import Pagination from "../../../components/common/pagination/Pagination";
import EvictionCourtSheriffFeesFormPopupProps from "./EvictionCourtSheriffFeesFormPopup";
import { convertToPrice, toCssClassName } from "utils/helper";
import EvictionCourtSheriffFeesService from "services/eviction-court-sheriff-fees.service";
import { IEvictionCourtShariffFeeItems } from "interfaces/eviction-court-shariff-fees.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { useAccountingContext } from "../AccountingContext";

const initialColumnMapping: IGridHeader[] = [
   { columnName: "action", label: "Action", className: "action" },
   { columnName: "countyName", label: "County" },
   { columnName: "courtName", label: "Court" },
   // { columnName: "evictionCourtTransAmount", label: "EvictionCourtTransAmt" , className:'text-right' }, //Unused
   // { columnName: "aosCourtTransAmount", label: "AOSCourtTransAmount" , className:'text-right' },     //Unused
   // { columnName: "addtlDocCourtTransAmount", label: "AddtlDocCourtTransAmount", className:'text-right' }, //Unused
   // { columnName: "dismissalCourtTransAmount", label: "DismissalCourtTransAmount", className:'text-right' },  //Unused
   // { columnName: "amendmentCourtTransAmount", label: "AmendmentCourtTransAmount", className:'text-right' },  //Unused
   // { columnName: "answerCourtTransAmount", label: "AnswerCourtTransAmount", className:'text-right' },  //Unused
   // { columnName: "writCourtTransAmount", label: "WritCourtTransAmount", className:'text-right' },  //Unused
   { columnName: "poevService1stTenant", label: "POEVServiceTenant1", className:'text-right' },
   { columnName: "poevService2ndTenant", label: "POEVServiceTenant2", className:'text-right' },
   { columnName: "poevService3rdTenant", label: "POEVServiceTenant3", className:'text-right' },
   { columnName: "poevService4thTenant", label: "POEVServiceTenant4", className:'text-right' },
   { columnName: "poevService5thTenant", label: "POEVServiceTenant5", className:'text-right' },
   { columnName: "poevServiceTotal", label: "POEVServiceTotal", className:'text-right' },
   { columnName: "poevServiceAAOTenant", label: "POEVServiceTenantAAO", className:'text-right' },
   { columnName: "powrService", label: "POWRService", className:'text-right' },
   // { columnName: "pogmService1stTime", label: "POGMServiceAtt1", className:'text-right' },  //Unused
   // { columnName: "pogmService2ndTime", label: "POGMServiceAtt2", className:'text-right' },  //Unused
];

const EvictionCourtSheriffFees = () => {
   const { evictionCourtShariffFees, getAllEvictionCourtShariffFees, setAllEvictionCourtShariffFees } = useAccountingContext();
   // show spinner
   const [showSpinner, setShowSpinner] = useState<Boolean>(false);
   // get list of eviction fees
   //   const [evictionCourtShariffFeesRecord, setEvictionCourtSheriffFessRecord] =
   //     useState<IEvictionCourtShariffFeeItems[]>();
   const [
      showEvictionCourtShariffFeesForm,
      setShowEvictionCourtShariffFeesForm,
   ] = useState<Boolean>(false);
   // delete confirmation
   const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
   const [isEditMode, setIsEditMode] = useState<boolean>(false);
   // State variables for pagination for next and previous button
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      evictionCourtShariffFees.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      evictionCourtShariffFees.totalPages > 1
   );
   // State variable to store the selected row data
   const [selectedRowData, setSelectedRowData] =
      useState<IEvictionCourtShariffFeeItems>({
         isChecked: false,
         id: 0,
         poevService1stTenant: 0,
         poevService2ndTenant: 0,
         poevService3rdTenant: 0,
         poevService4thTenant: 0,
         poevService5thTenant: 0,
         poevServiceTotal: 0,
         poevServiceAAOTenant: 0,
         evictionCourtTransAmount: 0,
         aosCourtTransAmount: 0,
         addtlDocCourtTransAmount: 0,
         dismissalCourtTransAmount: 0,
         amendmentCourtTransAmount: 0,
         answerCourtTransAmount: 0,
         writCourtTransAmount: 0,
         powrService: 0,
         pogmService1stTime: 0,
         pogmService2ndTime: 0,
         countyId: 0,
         courtId: 0,
         court: {
            id: 0,
            courtName: "",
            county: {
               countyId: 0,
               stateName: "",
               countyName: "",
            },
         },
      });
   //visible columns
   const [visibleColumns] = useState<IGridHeader[]>(
      initialColumnMapping
   );


   useEffect(() => {
      getAllEvictionCourtShariffFees(1, 100, "");

   }, []);

   // on press ok from delete confirmation
   const handleDeleteEvictionCourtSheriffFees = async () => {
      try {
         // Check if countyId is available
         if (!selectedRowData.id) {
            // If not available, exit early
            return;
         }

         // Display spinner while processing
         setShowSpinner(true);

         // Attempt to delete the county
         const response =
            await EvictionCourtSheriffFeesService.removeEvictionCourtSheriffFees(
               selectedRowData?.id
            );

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record removed successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setDeleteConfirmation(false);
            getAllEvictionCourtShariffFees(
               evictionCourtShariffFees.currentPage,
               evictionCourtShariffFees.pageSize
            );
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error deleting county:", error);
      } finally {
         // Hide the spinner regardless of the outcome
         setShowSpinner(false);
      }
   };

   // on press ok from edit pop up
   const handleEditEvictionCourtSheriffFees = async (
      formValues: IEvictionCourtShariffFeeItems
   ) => {
      try {
         // Display spinner while processing
         setShowSpinner(true);
         formValues.poevService1stTenant = convertToNumber(formValues.poevService1stTenant);

         formValues.poevService2ndTenant = convertToNumber(formValues.poevService2ndTenant);
         formValues.poevService3rdTenant = convertToNumber(formValues.poevService3rdTenant);
         formValues.poevService4thTenant = convertToNumber(formValues.poevService4thTenant);
         formValues.poevService5thTenant = convertToNumber(formValues.poevService5thTenant);
         formValues.poevServiceAAOTenant = convertToNumber(formValues.poevServiceAAOTenant);
         formValues.evictionCourtTransAmount = convertToNumber(formValues.evictionCourtTransAmount);
         formValues.aosCourtTransAmount = convertToNumber(formValues.aosCourtTransAmount);
         formValues.addtlDocCourtTransAmount = convertToNumber(formValues.addtlDocCourtTransAmount);
         formValues.dismissalCourtTransAmount = convertToNumber(formValues.dismissalCourtTransAmount);
         formValues.amendmentCourtTransAmount = convertToNumber(formValues.amendmentCourtTransAmount);
         formValues.answerCourtTransAmount = convertToNumber(formValues.answerCourtTransAmount);
         formValues.writCourtTransAmount = convertToNumber(formValues.writCourtTransAmount);
         formValues.powrService = convertToNumber(formValues.powrService);
         formValues.pogmService1stTime = convertToNumber(formValues.pogmService1stTime);
         formValues.pogmService2ndTime = convertToNumber(formValues.pogmService2ndTime);
         // Attempt to delete the court
         const response =
            await EvictionCourtSheriffFeesService.updateEvictionCourtSheriffFees(
               formValues
            );

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record updated successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setShowEvictionCourtShariffFeesForm(false);
            setIsEditMode(false);
            getAllEvictionCourtShariffFees(
               evictionCourtShariffFees.currentPage,
               evictionCourtShariffFees.pageSize
            );
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
      data: IEvictionCourtShariffFeeItems,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         action: () => formatActionCell(rowIndex, data),
         courtName: () => formattedCell(data.court?.courtName),
         countyName: () => formattedCell(data.court?.county.countyName),
         poevService1stTenant: () => formattedCurrencyCell(cellValue),
         poevService2ndTenant: () => formattedCurrencyCell(cellValue),
         poevService3rdTenant: () => formattedCurrencyCell(cellValue),
         poevService4thTenant: () => formattedCurrencyCell(cellValue),
         poevService5thTenant: () => formattedCurrencyCell(cellValue),
         poevServiceTotal: () => formattedServiceTotalCell(data),
         poevServiceAAOTenant: () => formattedCurrencyCell(cellValue),
         // evictionCourtTransAmount: () => formattedCurrencyCell(cellValue),
         // aosCourtTransAmount: () => formattedCurrencyCell(cellValue),
         // addtlDocCourtTransAmount: () => formattedCurrencyCell(cellValue),
         // dismissalCourtTransAmount: () => formattedCurrencyCell(cellValue),
         // amendmentCourtTransAmount: () => formattedCurrencyCell(cellValue),
         // answerCourtTransAmount: () => formattedCurrencyCell(cellValue),
         // writCourtTransAmount: () => formattedCurrencyCell(cellValue),
         powrService: () => formattedCurrencyCell(cellValue),
         // pogmService1stTime: () => formattedCurrencyCell(cellValue),
         // pogmService2ndTime: () => formattedCurrencyCell(cellValue)
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

   const formattedServiceTotalCell = (value: IEvictionCourtShariffFeeItems) => (
      <>
         <span>$ {value !== null ? 
         convertToPrice((
            value.poevService1stTenant +
            value.poevService2ndTenant +
            value.poevService3rdTenant +
            value.poevService4thTenant +
            value.poevService5thTenant +
            value.poevServiceAAOTenant
            ).toString()) : ""}
         </span>
      </>
   );
   const formattedCurrencyCell = (value: any) => (
      <span>${value !== null ? convertToPrice(value) : ""}</span>
   );
   const convertToNumber = (value: string | number | null) => {
      return (value == null || value === "") ? 0 : Number(value);
    };

   const handleCreateEvictionCourtSheriffFees = async (
      formValues: IEvictionCourtShariffFeeItems
   ) => {
      try {
         ;
         console.log(formValues,"beforeformvalues");
         // Display spinner while processing
         setShowSpinner(true);
         // formValues.poevService1stTenant = formValues.poevService1stTenant == null || "" ? 0 : formValues.poevService1stTenant;
         formValues.poevService1stTenant = convertToNumber(formValues.poevService1stTenant);

         formValues.poevService2ndTenant = convertToNumber(formValues.poevService2ndTenant);
         formValues.poevService3rdTenant = convertToNumber(formValues.poevService3rdTenant);
         formValues.poevService4thTenant = convertToNumber(formValues.poevService4thTenant);
         formValues.poevService5thTenant = convertToNumber(formValues.poevService5thTenant);
         formValues.poevServiceAAOTenant = convertToNumber(formValues.poevServiceAAOTenant);
         formValues.evictionCourtTransAmount = convertToNumber(formValues.evictionCourtTransAmount);
         formValues.aosCourtTransAmount = convertToNumber(formValues.aosCourtTransAmount);
         formValues.addtlDocCourtTransAmount = convertToNumber(formValues.addtlDocCourtTransAmount);
         formValues.dismissalCourtTransAmount = convertToNumber(formValues.dismissalCourtTransAmount);
         formValues.amendmentCourtTransAmount = convertToNumber(formValues.amendmentCourtTransAmount);
         formValues.answerCourtTransAmount = convertToNumber(formValues.answerCourtTransAmount);
         formValues.writCourtTransAmount = convertToNumber(formValues.writCourtTransAmount);
         formValues.powrService = convertToNumber(formValues.powrService);
         formValues.pogmService1stTime = convertToNumber(formValues.pogmService1stTime);
         formValues.pogmService2ndTime = convertToNumber(formValues.pogmService2ndTime);
         // Attempt to delete the county
         const response =
            await EvictionCourtSheriffFeesService.createEvictionCourtSheriffFees(
               formValues
            );

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record added successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setShowEvictionCourtShariffFeesForm(false);
            getAllEvictionCourtShariffFees(
               evictionCourtShariffFees.currentPage,
               evictionCourtShariffFees.pageSize
            );
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

   const formatActionCell = (
      rowIndex: number,
      rowData: IEvictionCourtShariffFeeItems
   ) => {
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
                  setShowEvictionCourtShariffFeesForm(true);
                  setSelectedRowData({
                     id: rowData.id,
                     countyId: rowData.court ? rowData.court.county.countyId : 0,
                     courtId: rowData.court ? rowData.court.id : 0,
                     poevService1stTenant: rowData.poevService1stTenant,
                     poevService2ndTenant: rowData.poevService2ndTenant,
                     poevService3rdTenant: rowData.poevService3rdTenant,
                     poevService4thTenant: rowData.poevService4thTenant,
                     poevService5thTenant: rowData.poevService5thTenant,
                     poevServiceTotal: rowData.poevServiceTotal,
                     poevServiceAAOTenant: rowData.poevServiceAAOTenant,
                     evictionCourtTransAmount: rowData.evictionCourtTransAmount,
                     aosCourtTransAmount: rowData.aosCourtTransAmount,
                     addtlDocCourtTransAmount: rowData.addtlDocCourtTransAmount,
                     dismissalCourtTransAmount: rowData.dismissalCourtTransAmount,
                     amendmentCourtTransAmount: rowData.amendmentCourtTransAmount,
                     answerCourtTransAmount: rowData.answerCourtTransAmount,
                     writCourtTransAmount: rowData.writCourtTransAmount,
                     powrService: rowData.powrService,
                     pogmService1stTime: rowData.pogmService1stTime,
                     pogmService2ndTime: rowData.pogmService2ndTime
                  });
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
   // // Event handler for the 'Next' button
   const handleFrontButton = () => {
      if (
         evictionCourtShariffFees.currentPage < evictionCourtShariffFees.totalPages
      ) {
         const updatedCurrentPage = evictionCourtShariffFees.currentPage + 1;

         setAllEvictionCourtShariffFees({
            ...evictionCourtShariffFees,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getAllEvictionCourtShariffFees(
            updatedCurrentPage,
            evictionCourtShariffFees.pageSize
         );
      }
   };

   // Event handler for the 'Back' button
   const handleBackButton = () => {
      if (
         evictionCourtShariffFees.currentPage > 1 &&
         evictionCourtShariffFees.currentPage <=
         evictionCourtShariffFees.totalPages
      ) {
         const updatedCurrentPage = evictionCourtShariffFees.currentPage - 1;
         setAllEvictionCourtShariffFees({
            ...evictionCourtShariffFees,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(evictionCourtShariffFees.currentPage > 1);
         // back button get late notices
         getAllEvictionCourtShariffFees(
            updatedCurrentPage,
            evictionCourtShariffFees.pageSize
         );
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
                     setShowEvictionCourtShariffFeesForm(true);
                     setSelectedRowData({
                        isChecked: false,
                        id: 0,
                        poevService1stTenant: 0,
                        poevService2ndTenant: 0,
                        poevService3rdTenant: 0,
                        poevService4thTenant: 0,
                        poevService5thTenant: 0,
                        poevServiceTotal: 0,
                        poevServiceAAOTenant: 0,
                        evictionCourtTransAmount: 0,
                        aosCourtTransAmount: 0,
                        addtlDocCourtTransAmount: 0,
                        dismissalCourtTransAmount: 0,
                        amendmentCourtTransAmount: 0,
                        answerCourtTransAmount: 0,
                        writCourtTransAmount: 0,
                        powrService: 0,
                        pogmService1stTime: 0,
                        pogmService2ndTime: 0,
                        countyId: 0,
                        courtId: 0,
                        court: {
                           id: 0,
                           courtName: "",
                           county: {
                              countyId: 0,
                              stateName: "",
                              countyName: "",
                           },
                        },
                     });
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
                  rows={evictionCourtShariffFees.items}
                  cellRenderer={(
                     data: IEvictionCourtShariffFeeItems,
                     rowIndex: number,
                     cellIndex: number
                  ) => {
                     return handleCellRendered(cellIndex, data, rowIndex);
                  }}
               />
               {evictionCourtShariffFees.items && (
                  <Pagination
                     numberOfItemsPerPage={evictionCourtShariffFees.pageSize}
                     currentPage={evictionCourtShariffFees.currentPage}
                     totalPages={evictionCourtShariffFees.totalPages}
                     totalRecords={evictionCourtShariffFees.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               )}
            </div>
            {showEvictionCourtShariffFeesForm && (
               <EvictionCourtSheriffFeesFormPopupProps
                  showPopup={showEvictionCourtShariffFeesForm}
                  closePopup={(shouldRefresh: string) => {
                     if (shouldRefresh === "refresh") {
                        getAllEvictionCourtShariffFees(
                           evictionCourtShariffFees.currentPage,
                           evictionCourtShariffFees.totalPages
                        );
                     }
                     setShowEvictionCourtShariffFeesForm(false);
                  }}
                  isEditMode={isEditMode}
                  initialValues={selectedRowData}
                  onSubmit={(formValues: IEvictionCourtShariffFeeItems) => {
                     if (isEditMode) {
                        handleEditEvictionCourtSheriffFees(formValues);
                     } else {
                        handleCreateEvictionCourtSheriffFees(formValues);
                     }
                  }}
                  showSpinner={showSpinner}
               ></EvictionCourtSheriffFeesFormPopupProps>
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
                        handleDeleteEvictionCourtSheriffFees();
                     }}
                  ></ConfirmationBox>
               </div>
            )}
         </div>
      </div>
   );
};
export default EvictionCourtSheriffFees;
