import React, { useEffect, useRef, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import ConfirmationBox from "../../../components/common/deleteConfirmation/DeleteConfirmation";
import Spinner from "../../../components/common/spinner/Spinner";
import Grid from "../../../components/common/grid/GridWithToolTip";
import Button from "../../../components/common/button/Button";
import Pagination from "../../../components/common/pagination/Pagination";
import AttorneyFormPopup from "./AttorneyFormPopup";
import { IGridHeader } from "interfaces/grid-interface";
import { IAddAttorney, IAttorney, IAttorneyItem } from "interfaces/attorney.interface";
import AttorneyService from "services/attorney.service";
import { toCssClassName } from "utils/helper";

const initialColumnMapping: IGridHeader[] = [
   { columnName: "action", label: "Action", className: "action" },
   { columnName: "firstName", label: "FirstName" },
   { columnName: "lastName", label: "LastName" },
   { columnName: "barNumber", label: "BarNumber" },
   { columnName: "firmName", label: "FirmName" },
   { columnName: "email", label: "Email" },
   { columnName: "address", label: "Address" },
   { columnName: "unit", label: "Unit" },
   { columnName: "city", label: "City" },
   { columnName: "state", label: "State" },
   { columnName: "zipCode", label: "ZipCode", className:'text-right' }
];

const initialAttorney: IAttorney = {
   items: [
      {
         id: "",
         firstName: "",
         lastName: "",
         barNumber: "",
         email: "",
         firmName: "",
         address: "",
         unit: "",
         city: "",
         state: "",
         zipCode: ""
      }
   ],
   currentPage: 1,
   pageSize: 100,
   totalCount: 0,
   totalPages: 0,
};

const Attorney = () => {
   const isMounted = useRef(false);
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [attorneys, setAttorneys] = useState<IAttorney>(initialAttorney);
   const [showAttorneyForm, setShowAttorneyForm] = useState<boolean>(false);
   const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
   const [isEditMode, setIsEditMode] = useState<boolean>(false);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      attorneys.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      attorneys.totalPages > 1
   );
   const [selectedAttorney, setSelectedAttorney] = useState<IAttorneyItem>(initialAttorney.items[0]);
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);

   const getAttorneys = async (pageNumber: number, pageSize: number) => {
      try {
         setShowSpinner(true);
         const response = await AttorneyService.getAttorneys(pageNumber, pageSize, "");
         if (response.status === HttpStatusCode.Ok) {
            setAttorneys(response.data);
            setCanPaginateBack(attorneys.currentPage > 1);
            setCanPaginateFront(attorneys.totalPages > 1);
         }
      } finally {
         setShowSpinner(false);
      }
   };

   useEffect(() => {
      if (!isMounted.current) {
         getAttorneys(1, 100);
         isMounted.current = true;
      }

   }, []);

   const handleCreateAttorney = async (formValues: IAttorneyItem) => {
      try {
         
         const attorneyDto: IAddAttorney = {
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            barNumber: formValues.barNumber,
            email: formValues.email,
            firmName: formValues.firmName,
            address: formValues.address,
            unit: formValues.unit,
            city: formValues.city,
            state: formValues.state,
            zipCode: formValues.zipCode
         };
         setShowSpinner(true);
         const response = await AttorneyService.addAttorney(attorneyDto);
         if (response.status === HttpStatusCode.Ok) {
            toast.success("Record updated successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });
            
            // Close the confirmation pop-up and refresh the list
            setShowAttorneyForm(false);
            setIsEditMode(false);
            getAttorneys(attorneys.currentPage, attorneys.pageSize);
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error adding filing type:", error);
      } finally {
         setShowSpinner(false);
         // Hide the spinner regardless of the outcome
      }
   };

   const handleEditAttorney = async (formValues: IAttorneyItem) => {
      try {
         setShowSpinner(true);
         const response = await AttorneyService.updateAttorney(formValues.id, formValues);
         if (response.status === HttpStatusCode.Ok) {
            toast.success("Record updated successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setShowAttorneyForm(false);
            setIsEditMode(false);
            getAttorneys(attorneys.currentPage, attorneys.pageSize);
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error updating filing type:", error);
      } finally {
         setShowSpinner(false);
         // Hide the spinner regardless of the outcome
      }
   };

   const handleDeleteAttorney = async () => {
      try {
         if (!selectedAttorney.id) {
            return;
         }

         const response = await AttorneyService.deleteAttorney(selectedAttorney.id);
         if (response.status === HttpStatusCode.Ok) {
            toast.success("Record removed successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setDeleteConfirmation(false);
            getAttorneys(attorneys.currentPage, attorneys.pageSize);
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
      data: IAttorneyItem,
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

   const formatActionCell = (rowIndex: number, row: IAttorneyItem) => {
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
                  setSelectedAttorney(row);
                  setShowAttorneyForm(true);
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
                  setSelectedAttorney(row);
               }}
            ></FaTrash>
         </div>
      );
   };

   const handleFrontButton = () => {
      if (attorneys.currentPage < attorneys.totalPages) {
         const updatedCurrentPage = attorneys.currentPage + 1;
         setAttorneys({
            ...attorneys,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getAttorneys(updatedCurrentPage, attorneys.pageSize);
      }
   };

   const handleBackButton = () => {
      if (attorneys.currentPage > 1 && attorneys.currentPage <= attorneys.totalPages) {
         const updatedCurrentPage = attorneys.currentPage - 1;
         setAttorneys({
            ...attorneys,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(attorneys.currentPage > 1);
         // back button get late notices
         getAttorneys(updatedCurrentPage, attorneys.pageSize);
      }
   };

   return (
      <div className="pt-2.5">
            <div className="text-right mb-2">
               <Button
                  isRounded={false}
                  classes="bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-semibold text-xs text-white rounded shadow-lg inline-flex items-center"
                  title={"Add New Attorney"}
                  handleClick={() => {
                     setIsEditMode(false);
                     setShowAttorneyForm(true);
                     setSelectedAttorney(initialAttorney.items[0]);
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
                        rows={attorneys.totalCount ? attorneys.items : []}
                        cellRenderer={(
                           data: IAttorneyItem,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                     />
                     {attorneys && (
                        <Pagination
                           numberOfItemsPerPage={attorneys.pageSize}
                           currentPage={attorneys.currentPage}
                           totalPages={attorneys.totalPages}
                           totalRecords={attorneys.totalCount}
                           handleFrontButton={handleFrontButton}
                           handleBackButton={handleBackButton}
                           canPaginateBack={canPaginateBack}
                           canPaginateFront={canPaginateFront}
                        />
                     )}
                  </>
               )}
            </div>
            {showAttorneyForm && (
               <AttorneyFormPopup
                  showPopup={showAttorneyForm}
                  closePopup={(shouldRefresh: string) => {
                     if (shouldRefresh === "refresh") {
                        getAttorneys(attorneys.currentPage, attorneys.totalPages);
                     }
                     setShowAttorneyForm(false);
                  }}
                  isEditMode={isEditMode}
                  initialValues={selectedAttorney}
                  onSubmit={(formValues: IAttorneyItem) => {
                     if (isEditMode) {
                        handleEditAttorney(formValues);
                     } else {
                        handleCreateAttorney(formValues);
                     }
                  }}
                  showSpinner={showSpinner}
               ></AttorneyFormPopup>
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
                        handleDeleteAttorney();
                     }}
                  ></ConfirmationBox>
               </div>
            )}
      </div>
   );
};

export default Attorney;
