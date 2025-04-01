import React, { useEffect, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import ConfirmationBox from "../../../components/common/deleteConfirmation/DeleteConfirmation";
import Spinner from "../../../components/common/spinner/Spinner";
import Grid from "../../../components/common/grid/GridWithToolTip";
import Button from "../../../components/common/button/Button";
import Pagination from "../../../components/common/pagination/Pagination";
import CourtService from "../../../services/court.service";
import CourtFormPopup from "./CourtFormPopup";
import { IGridHeader } from "interfaces/grid-interface";
import { ICommonSelectOptions } from "interfaces/common.interface";
import { ICourt, ICourtDropdownList, ICourtItems } from "../../../interfaces/court.interface";
import { toCssClassName } from "utils/helper";

const initialColumnMapping: IGridHeader[] = [
   { columnName: "action", label: "Action", className: "action" },
   { columnName: "courtName", label: "Court" },
   { columnName: "countyName", label: "County" },
];

const Court = () => {
   const [showSpinner, setShowSpinner] = useState<Boolean>(false);

   const [courts, setCourts] = useState<ICourt>({
      items: [
         {
            isChecked: false,
            id: "",
            countyId: 0,
            courtName: "",
            courtCode: "",
            county: {
               countyId: 0,
               countyName: "",
               stateName: "",
               createdBy: "",
            },
         },
      ],
      currentPage: 1,
      pageSize: 100,
      totalCount: 1,
      totalPages: 1,
   });
   const [showCourtForm, setShowCourtForm] = useState<Boolean>(false);
   const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
   const [isEditMode, setIsEditMode] = useState<boolean>(false);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      courts.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      courts.totalPages > 1
   );
   const [selectedRowData, setSelectedRowData] = useState<ICourtItems>({
      countyId: 0,
      courtId: 0,
      courtName: "",
      courtCode: "",
      county: {
         countyId: 0,
         countyName: "",
         stateName: "",
         createdBy: "",
      },
   });
   const [courtOptions, setCourtOptions] = useState<ICommonSelectOptions[]>([]);

   const [visibleColumns] = useState<IGridHeader[]>(
      initialColumnMapping
   );

   const getCourts = async (pageNumber: number, pageSize: number) => {
      try {
         setShowSpinner(true);
         const response = await CourtService.getAllCourt(pageNumber, pageSize);
         if (response.status === HttpStatusCode.Ok) {
            setCourts(response.data);
            setCanPaginateBack(courts.currentPage > 1);
            setCanPaginateFront(courts.totalPages > 1);
         }
      } finally {
         setShowSpinner(false);
      }
   };

   useEffect(() => {
      getCourts(1, 100);

   }, []);

   const getCourtDropdownValues = async (state: string) => {
      const apiResponse = await CourtService.getCourtsByState(state);
      if (apiResponse.status === HttpStatusCode.Ok) {
         return apiResponse.data as ICourtDropdownList[];
      }
      else
         return [];
   }

   const setCourtDropdownValues = async (state: string) => {
      try {
         const data = await getCourtDropdownValues(state);
         const courtOptions = data.map((item) => ({
            id: item.code,
            value: item.name,
         }));
         setCourtOptions(courtOptions);
      } catch (error) {
         console.error("Error setting court dropdown values:", error);
      }
   }

   const handleEditCourt = async (formValues: ICourtItems) => {
      try {
         // Attempt to delete the court
         setShowSpinner(true)
         const response = await CourtService.updateCourt(formValues);

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record updated successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setShowCourtForm(false);
            setIsEditMode(false);
            getCourts(courts.currentPage, courts.pageSize);
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error deleting county:", error);
      } finally {
         setShowSpinner(false)
         // Hide the spinner regardless of the outcome
         // setShowSpinner(false);
      }
   };

   const handleCreateCourt = async (formValues: ICourtItems) => {
      try {
         // Display spinner while processing
         // setShowSpinner(true);

         setShowSpinner(true)
         // Attempt to delete the county
         const response = await CourtService.createCourt(formValues);

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record added successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setShowCourtForm(false);
            getCourts(courts.currentPage, courts.pageSize);
         }
      } catch (error) {

         // Handle errors if needed
         console.error("Error deleting county:", error);
      } finally {
         setShowSpinner(false)
         // Hide the spinner regardless of the outcome
         // setShowSpinner(false);
      }
   };

   const handleDeleteCourt = async () => {
      try {
         // Check if countyId is available
         if (!selectedRowData.id) {
            // If not available, exit early
            return;
         }

         // Display spinner while processing
         setShowSpinner(true);

         // Attempt to delete the county
         const response = await CourtService.removeCourt(selectedRowData.id);

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record removed successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setDeleteConfirmation(false);
            getCourts(courts.currentPage, courts.pageSize);
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
      data: ICourtItems,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         courtName: () => formattedCell(cellValue),
         countyName: () => formattedCell(data.county.countyName),
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

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   const formatActionCell = (rowIndex: number, rowData: ICourtItems) => {
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
               onClick={async () => {
                  setIsEditMode(true);
                  await setCourtDropdownValues(rowData.county.stateName);
                  setSelectedRowData(rowData); // Set the selected row data
                  setShowCourtForm(true);
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

   const handleFrontButton = () => {
      if (courts.currentPage < courts.totalPages) {
         const updatedCurrentPage = courts.currentPage + 1;
         setCourts({
            ...courts,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getCourts(updatedCurrentPage, courts.pageSize);
      }
   };

   const handleBackButton = () => {
      if (courts.currentPage > 1 && courts.currentPage <= courts.totalPages) {
         const updatedCurrentPage = courts.currentPage - 1;
         setCourts({
            ...courts,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(courts.currentPage > 1);
         // back button get late notices
         getCourts(updatedCurrentPage, courts.pageSize);
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
                     setShowCourtForm(true);
                     setSelectedRowData({
                        countyId: 0,
                        courtId: 0,
                        courtName: "",
                        courtCode: "",
                        county: {
                           countyId: 0,
                           countyName: "",
                           stateName: "",
                           createdBy: "",
                        },
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
                        rows={courts?.items}
                        cellRenderer={(
                           data: ICourtItems,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                     />
                     {courts && (
                        <Pagination
                           numberOfItemsPerPage={courts.pageSize}
                           currentPage={courts.currentPage}
                           totalPages={courts.totalPages}
                           totalRecords={courts.totalCount}
                           handleFrontButton={handleFrontButton}
                           handleBackButton={handleBackButton}
                           canPaginateBack={canPaginateBack}
                           canPaginateFront={canPaginateFront}
                        />
                     )}
                  </>
               )}
            </div>
            {showCourtForm && (
               <CourtFormPopup
                  showPopup={showCourtForm}
                  closePopup={(shouldRefresh: string) => {
                     if (shouldRefresh === "refresh") {
                        getCourts(courts.currentPage, courts.totalPages);
                     }
                     setShowCourtForm(false);
                  }}
                  isEditMode={isEditMode}
                  initialValues={selectedRowData}
                  initialCourtOptions={courtOptions}
                  onSubmit={(formValues: ICourtItems) => {
                     if (isEditMode) {
                        handleEditCourt(formValues);
                     } else {
                        handleCreateCourt(formValues);
                     }
                  }}
                  showSpinner= {showSpinner}
               ></CourtFormPopup>
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
                        handleDeleteCourt();
                     }}
                  ></ConfirmationBox>
               </div>
            )}
      </div>
   );
};

export default Court;
