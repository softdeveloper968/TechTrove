import React from "react";
import { useEffect, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Pagination from "components/common/pagination/Pagination";

import { ICounty, ICountyFormValues, ICountyItems } from "interfaces/county.interface";
import { IGridHeader } from "interfaces/grid-interface";
import CountyService from "services/county.service";
import CountyFormPopup from "./CountyFormPopup";
import { toCssClassName } from "utils/helper";

const initialColumnMapping: IGridHeader[] = [
   { columnName: "action", label: "Action", className: "action"  },
   { columnName: "countyName", label: "County" },
   { columnName: "stateName", label: "State" },
   { columnName: "method", label: "eFileMethod" },
   { columnName: "endPoint", label: "End Point" },
   // "County Name": "countyName",
   // State: "stateName",
   // "": "action",
];

const County = () => {
   // show spinner
   const [showSpinner, setShowSpinner] = useState<Boolean>(false);
   // get list of counties
   const [counties, setCounties] = useState<ICounty>({
      items: [
         {
            isChecked: false,
            id: "",
            stateName: "",
            countyName: "",
            method: "",
            endPoint: "",
            isMultipleAOSPdf: false
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 1,
      totalPages: 1,
   });
   const [showCountyForm, setShowCountyForm] = useState<Boolean>(false);
   // delete confirmation
   const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
   const [isEditMode, setIsEditMode] = useState<boolean>(false);
   // State variables for pagination for next and previous button
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      counties.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      counties.totalPages > 1
   );
   // State variable to store the selected row data
   const [selectedRowData, setSelectedRowData] = useState<ICountyItems>({
      id: "",
      stateName: "",
      countyName: "",
      method: "",
      endPoint: "",
      isMultipleAOSPdf: false
   });
   //visible columns
   const [visibleColumns] = useState<IGridHeader[]>(
      initialColumnMapping
   );

   // get list of counties
   const getCounties = async (pageNumber: number, pageSize: number) => {
      try {
         setShowSpinner(true);
         const response = await CountyService.getAllCounty(pageNumber, pageSize);
         if (response.status === HttpStatusCode.Ok) {
            setCounties(response.data);
            setCanPaginateBack(counties.currentPage > 1);
            setCanPaginateFront(counties.totalPages > 1);
         }
      } finally {
         setShowSpinner(false);
      }
   };

   // get list of counties
   useEffect(() => {
      getCounties(1, 100);
   }, []);

   // on press ok from delete confirmation
   const handleDeleteCounty = async () => {
      try {
         // Check if countyId is available
         if (!selectedRowData.countyId) {
            // If not available, exit early
            return;
         }

         // Display spinner while processing
         setShowSpinner(true);

         // Attempt to delete the county
         const response = await CountyService.removeCounty(
            selectedRowData.countyId
         );

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record removed successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setDeleteConfirmation(false);
            getCounties(counties.currentPage, counties.pageSize);
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
   const handleEditCounty = async (formValues: ICountyFormValues) => {
      try {
         // Display spinner while processing
         setShowSpinner(true);

         const payload: ICountyItems = {
            countyId: selectedRowData.countyId,
            stateName: formValues.stateName,
            countyName: formValues.countyName,
            method: formValues.method,
            endPoint: formValues.endPoint,
            isMultipleAOSPdf: formValues.isMultipleAOSPdf === "multiple" ? true : false
         }
         // Attempt to delete the county

         const response = await CountyService.updateCounty(payload);

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record updated successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setShowCountyForm(false);
            setIsEditMode(false);
            getCounties(counties.currentPage, counties.pageSize);
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
      data: ICountyItems,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         countyName: () => formattedCell(cellValue),
         stateName: () => formattedCell(cellValue),
         action: () => formatActionCell(rowIndex, data),
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

   const handleCreateCounty = async (formValues: ICountyFormValues) => {
      try {
         // Display spinner while processing
         setShowSpinner(true);

         const payload: ICountyItems = {
            stateName: formValues.stateName,
            countyName: formValues.countyName,
            method: formValues.method,
            endPoint: formValues.endPoint,
            isMultipleAOSPdf: formValues.isMultipleAOSPdf === "multiple" ? true : false
         }
         // Attempt to delete the county
         const response = await CountyService.createCounty(payload);

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record added successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setShowCountyForm(false);
            getCounties(counties.currentPage, counties.pageSize);
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

   const formatActionCell = (rowIndex: number, rowData: ICountyItems) => {
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
                  setShowCountyForm(true);
                  setSelectedRowData(rowData); // Set the selected row data
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
      if (counties.currentPage < counties.totalPages) {
         const updatedCurrentPage = counties.currentPage + 1;
         setCounties({
            ...counties,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getCounties(updatedCurrentPage, counties.pageSize);
      }
   };

   // Event handler for the 'Back' button
   const handleBackButton = () => {
      if (
         counties.currentPage > 1 &&
         counties.currentPage <= counties.totalPages
      ) {
         const updatedCurrentPage = counties.currentPage - 1;
         setCounties({
            ...counties,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(counties.currentPage > 1);
         // back button get late notices
         getCounties(updatedCurrentPage, counties.pageSize);
      }
   };
   return (
      <div className="pt-2.5">
         <div className="text-right mb-2">
            <Button
               isRounded={false}
               classes="bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-semibold text-xs text-white rounded shadow-lg inline-flex items-center"
               title={"Add New"}
               handleClick={() => {
                  setIsEditMode(false);
                  setShowCountyForm(true);
                  setSelectedRowData({
                     stateName: "",
                     countyName: "",
                     method: "",
                     endPoint: "",
                     isMultipleAOSPdf: false
                  });
               }}
               icon={<FaPlus className="mr-1.5"></FaPlus>}
               type={"button"}
            ></Button>
         </div>
            <div className="relative -mr-0.5">
               {/* Render the Grid component with column headings and grid data */}
               {showSpinner ? (
               <Spinner />
            ) : (
               <>
                    <Grid
                  columnHeading={visibleColumns}
                  rows={counties?.items}
                  cellRenderer={(
                     data: ICountyItems,
                     rowIndex: number,
                     cellIndex: number
                  ) => {
                     return handleCellRendered(cellIndex, data, rowIndex);
                  }}
               />
               {counties && (
                  <Pagination
                     numberOfItemsPerPage={counties.pageSize}
                     currentPage={counties.currentPage}
                     totalPages={counties.totalPages}
                     totalRecords={counties.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               )}
               </>
            )}
               {/* {showSpinner === true && <Spinner />}
               <Grid
                  columnHeading={visibleColumns}
                  rows={counties?.items}
                  cellRenderer={(
                     data: ICountyItems,
                     rowIndex: number,
                     cellIndex: number
                  ) => {
                     return handleCellRendered(cellIndex, data, rowIndex);
                  }}
               />
               {counties && (
                  <Pagination
                     numberOfItemsPerPage={counties.pageSize}
                     currentPage={counties.currentPage}
                     totalPages={counties.totalPages}
                     totalRecords={counties.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               )} */}
            </div>
            {showCountyForm && (
               <CountyFormPopup
                  showPopup={showCountyForm}
                  closePopup={(shouldRefresh: string) => {
                     if (shouldRefresh === "refresh") {
                        getCounties(counties.currentPage, counties.totalPages);
                     }
                     setShowCountyForm(false);
                  }}
                  isEditMode={isEditMode}
                  initialValues={selectedRowData}
                  onSubmit={(formValues: ICountyFormValues) => {
                     if (isEditMode) {
                        handleEditCounty(formValues);
                     } else {
                        handleCreateCounty(formValues);
                     }
                  }}
                  showSpinner={showSpinner}
               ></CountyFormPopup>
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
                        handleDeleteCounty();
                     }}
                  ></ConfirmationBox>
               </div>
            )}
      </div>
   );
};
export default County;
