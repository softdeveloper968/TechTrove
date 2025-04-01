import React, { useEffect, useRef, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import ConfirmationBox from "../../../components/common/deleteConfirmation/DeleteConfirmation";
import Spinner from "../../../components/common/spinner/Spinner";
import Grid from "../../../components/common/grid/GridWithToolTip";
import Button from "../../../components/common/button/Button";
import Pagination from "../../../components/common/pagination/Pagination";
import FilingTypeFormPopup from "./FilingTypeFormPopup";
import { IGridHeader } from "interfaces/grid-interface";
import { IAddFilingType, IFilingType, IFilingTypeItem } from "interfaces/filing-type.interface";
import FilingTypeService from "services/filing-type.service";
import { toCssClassName } from "utils/helper";

const initialColumnMapping: IGridHeader[] = [
   { columnName: "action", label: "Action", className: "action" },
   { columnName: "name", label: "FilingName" }
];

const initialFilingType: IFilingType = {
   items: [
      {
         id: "",
         name: "",
         description: ""
      }
   ],
   currentPage: 1,
   pageSize: 100,
   totalCount: 0,
   totalPages: 0,
};

const FilingType = () => {
   const isMounted = useRef(false);
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [filingTypes, setFilingTypes] = useState<IFilingType>(initialFilingType);
   const [showFilingTypeForm, setShowFilingTypeForm] = useState<boolean>(false);
   const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
   const [isEditMode, setIsEditMode] = useState<boolean>(false);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      filingTypes.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      filingTypes.totalPages > 1
   );
   const [selectedFilingType, setSelectedFilingType] = useState<IFilingTypeItem>(initialFilingType.items[0]);
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);

   const getFilingTypes = async (pageNumber: number, pageSize: number) => {
      try {
         setShowSpinner(true);
         const response = await FilingTypeService.getFilingTypes(pageNumber, pageSize, "");
         if (response.status === HttpStatusCode.Ok) {
            setFilingTypes(response.data);
            setCanPaginateBack(filingTypes.currentPage > 1);
            setCanPaginateFront(filingTypes.totalPages > 1);
         }
      } finally {
         setShowSpinner(false);
      }
   };

   useEffect(() => {
      if (!isMounted.current) {
         getFilingTypes(1, 100);
         isMounted.current = true;
      }

   }, []);

   const handleCreateFilingType = async (formValues: IFilingTypeItem) => {
      try {
         const filingTypeDto: IAddFilingType = {
            name: formValues.name,
            description: formValues.description
         };

         setShowSpinner(true);
         const response = await FilingTypeService.addFilingType(filingTypeDto);
         if (response.status === HttpStatusCode.Ok) {
            toast.success("Record updated successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setShowFilingTypeForm(false);
            setIsEditMode(false);
            getFilingTypes(filingTypes.currentPage, filingTypes.pageSize);
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error adding filing type:", error);
      } finally {
         setShowSpinner(false);
         // Hide the spinner regardless of the outcome
      }
   };

   const handleEditFilingType = async (formValues: IFilingTypeItem) => {
      try {
         setShowSpinner(true);
         const response = await FilingTypeService.updateFilingType(formValues);
         if (response.status === HttpStatusCode.Ok) {
            toast.success("Record updated successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setShowFilingTypeForm(false);
            setIsEditMode(false);
            getFilingTypes(filingTypes.currentPage, filingTypes.pageSize);
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error updating filing type:", error);
      } finally {
         setShowSpinner(false);
         // Hide the spinner regardless of the outcome
      }
   };

   const handleDeleteFilingType = async () => {
      try {
         if (!selectedFilingType.id) {
            return;
         }

         const response = await FilingTypeService.deleteFilingType(selectedFilingType.id);
         if (response.status === HttpStatusCode.Ok) {
            toast.success("Record removed successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setDeleteConfirmation(false);
            getFilingTypes(filingTypes.currentPage, filingTypes.pageSize);
         }

      } catch (error) {
         // Handle errors if needed
         console.error("Error deleting filing type:", error);
      } finally {
         // Hide the spinner regardless of the outcome
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
      data: IFilingTypeItem,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         action: () => formatActionCell(rowIndex, data),
         ame: () => formattedCell(cellValue),
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

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   const formatActionCell = (rowIndex: number, row: IFilingTypeItem) => {
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
                  setSelectedFilingType(row);
                  setShowFilingTypeForm(true);
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
                  setSelectedFilingType(row);
               }}
            ></FaTrash>
         </div>
      );
   };

   const handleFrontButton = () => {
      if (filingTypes.currentPage < filingTypes.totalPages) {
         const updatedCurrentPage = filingTypes.currentPage + 1;
         setFilingTypes({
            ...filingTypes,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getFilingTypes(updatedCurrentPage, filingTypes.pageSize);
      }
   };

   const handleBackButton = () => {
      if (filingTypes.currentPage > 1 && filingTypes.currentPage <= filingTypes.totalPages) {
         const updatedCurrentPage = filingTypes.currentPage - 1;
         setFilingTypes({
            ...filingTypes,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(filingTypes.currentPage > 1);
         // back button get late notices
         getFilingTypes(updatedCurrentPage, filingTypes.pageSize);
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
                     setShowFilingTypeForm(true);
                     setSelectedFilingType(initialFilingType.items[0]);
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
                        rows={filingTypes.items}
                        cellRenderer={(
                           data: IFilingTypeItem,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                     />
                     {filingTypes && (
                        <Pagination
                           numberOfItemsPerPage={filingTypes.pageSize}
                           currentPage={filingTypes.currentPage}
                           totalPages={filingTypes.totalPages}
                           totalRecords={filingTypes.totalCount}
                           handleFrontButton={handleFrontButton}
                           handleBackButton={handleBackButton}
                           canPaginateBack={canPaginateBack}
                           canPaginateFront={canPaginateFront}
                        />
                     )}
                  </>
               )}
            </div>
            {showFilingTypeForm && (
               <FilingTypeFormPopup
                  showPopup={showFilingTypeForm}
                  closePopup={(shouldRefresh: string) => {
                     if (shouldRefresh === "refresh") {
                        getFilingTypes(filingTypes.currentPage, filingTypes.totalPages);
                     }
                     setShowFilingTypeForm(false);
                  }}
                  isEditMode={isEditMode}
                  initialValues={selectedFilingType}
                  onSubmit={(formValues: IFilingTypeItem) => {
                     if (isEditMode) {
                        handleEditFilingType(formValues);
                     } else {
                        handleCreateFilingType(formValues);
                     }
                  }}
                  showSpinner={showSpinner}
               ></FilingTypeFormPopup>
            )}
            {deleteConfirmation && (
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
                        handleDeleteFilingType();
                     }}
                  ></ConfirmationBox>
               </div>
            )}
      </div>
   );
};

export default FilingType;
