import React from "react";
import { useEffect, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import ConfirmationBox from "../../../components/common/deleteConfirmation/DeleteConfirmation";
import Spinner from "../../../components/common/spinner/Spinner";
import Grid from "../../../components/common/grid/GridWithToolTip";
import Button from "../../../components/common/button/Button";
import Pagination from "../../../components/common/pagination/Pagination";
import { INotaryItems } from "../../../interfaces/notary.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { INotary } from "interfaces/notary.interface";
import NotaryService from "../../../services/notary.service";
import NotaryFormPopup from "./NotaryFromPopup";
import { adjustDateToSystemTimezone, convertUtcToEst, formattedDate, toCssClassName } from "utils/helper";
import moment from "moment";

const initialColumnMapping : IGridHeader[]= [
   {columnName:"action",label:"Action", className: "action" },
  {columnName:"notaryName",label:"Notary Name"},
  {columnName:"notaryExpDate",label:"Notary ExpDate"},
  {columnName:"notaryCountyName",label:"Notary County"},
  {columnName:"qualifiedInCountyName",label:"Qualified in County"},
  // "Court Name": "courtName",
  // County: "countyName",
  // "": "action",
];

const Notary = () => {
  // show spinner
  const [showSpinner, setShowSpinner] = useState<Boolean>(false);
  // get list of courts
  const [notary, setNotary] = useState<INotary>({
    items: [
      {
        id: "",
        notaryName:"",
        notaryExpDate:null,
        notaryCountyId: 0,
        qualifiedInCountyId:0,
        // : "",
        // county: {
        //   countyId: 0,
        //   countyName: "",
        //   stateName: "",
        //   createdBy: "",
        // },
      },
    ],
    currentPage: 1,
    pageSize: 100,
    totalCount: 1,
    totalPages: 1,
  });
  const [showCourtForm, setShowCourtForm] = useState<Boolean>(false);
  // delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  // State variables for pagination for next and previous button
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    notary.currentPage > 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    notary.totalPages > 1
  );
  // State variable to store the selected row data
  const [selectedRowData, setSelectedRowData] = useState<INotaryItems>({
    notaryCountyId: 0,
    notaryName: "",
    notaryExpDate:new Date(),
    notaryCountyName:"",
    qualifiedInCountyId:0,
  qualifiedInCountyName:""
  });
  //visible columns
  const [visibleColumns] = useState<IGridHeader[]>(
    initialColumnMapping
  );

  // get list of courts
  const getNotary = async (pageNumber: number, pageSize: number) => {
    try {
      setShowSpinner(true);
      const response = await NotaryService.getAllNotary(pageNumber, pageSize);
      if (response.status === HttpStatusCode.Ok) {
        setNotary(response.data);
        setCanPaginateBack(notary.currentPage > 1);
        setCanPaginateFront(notary.totalPages > 1);
      }
    } finally {
      setShowSpinner(false);
    }
  };

  // get list of counties
  useEffect(() => {
    getNotary(1, 100);
  }, []);

  // on press ok from delete confirmation
  const handleDeleteNotary = async () => {
    try {
      // Check if countyId is available
      if (!selectedRowData.notaryCountyId) {
        // If not available, exit early
        return;
      }

      // Display spinner while processing
      setShowSpinner(true);

      // Attempt to delete the county
      const response = await NotaryService.removeNotary(selectedRowData.id||"");

      // Check if the deletion was successful
      if (response.status === HttpStatusCode.Ok) {
        // Show success message
        toast.success("Record removed successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });

        // Close the confirmation pop-up and refresh the list
        setDeleteConfirmation(false);
        getNotary(notary.currentPage, notary.pageSize);
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
  const handleEditNotary = async (formValues: INotaryItems) => {
    
    try {
      
      // Display spinner while processing
      setShowSpinner(true);
      formValues.notaryExpDate= adjustDateToSystemTimezone(formValues.notaryExpDate as string);
      // formValues.notaryExpDate = formValues.notaryExpDate ? moment(formValues.notaryExpDate, 'MM/DD/YYYY').toISOString() : null;

      // Attempt to delete the court
      const response = await NotaryService.updateNotary(formValues);

      // Check if the deletion was successful
      if (response.status === HttpStatusCode.Ok) {
        // Show success message
        toast.success("Record updated successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });

        // Close the confirmation pop-up and refresh the list
        setShowCourtForm(false);
        setIsEditMode(false);
        getNotary(notary.currentPage, notary.pageSize);
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
    data: INotaryItems,
    rowIndex: number
  ) => {
    const columnName = visibleColumns[cellIndex]?.label;
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
    const renderers: Record<string, () => JSX.Element> = {
        notaryExpDate:()=>formattedDateCell(cellValue),
      action: () => formatActionCell(rowIndex, data),
    };
    const renderer =
      renderers[propertyName] || (() => formattedCell(cellValue));
      if (visibleColumns.find(x=>x.label===columnName)){
        
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
  // const formattedDateCell = (value: any) => (
  //   <span>{value !== null ? formattedDate(value) : ""}</span>
  // );
  const formattedDateCell = (value: any) => (
    <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
 //   <span>{value !== null ? formattedDate(value) : ""}</span>
 );
  const handleCreateNotary = async (formValues: INotaryItems) => {
    
    try {
      
      // Display spinner while processing
      setShowSpinner(true);

      // Attempt to delete the county
      const response = await NotaryService.createNotary(formValues);

      // Check if the deletion was successful
      if (response.status === HttpStatusCode.Ok) {
        // Show success message
        toast.success("Record added successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });

        // Close the confirmation pop-up and refresh the list
        setShowCourtForm(false);
        getNotary(notary.currentPage, notary.pageSize);
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

  const formatActionCell = (rowIndex: number, rowData: INotaryItems) => {
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
            setShowCourtForm(true);
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
    if (notary.currentPage < notary.totalPages) {
      const updatedCurrentPage = notary.currentPage + 1;
      setNotary({
        ...notary,
        currentPage: updatedCurrentPage,
      });
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get late notices
      getNotary(updatedCurrentPage, notary.pageSize);
    }
  };

  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (notary.currentPage > 1 && notary.currentPage <= notary.totalPages) {
      const updatedCurrentPage = notary.currentPage - 1;
      setNotary({
        ...notary,
        currentPage: updatedCurrentPage,
      });
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(notary.currentPage > 1);
      // back button get late notices
      getNotary(updatedCurrentPage, notary.pageSize);
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
                notaryCountyId: 0,
                notaryName: "",
                notaryExpDate:null,   
                notaryCountyName:"",  
                qualifiedInCountyId:0,
                qualifiedInCountyName:""           
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
            rows={notary?.items}
            cellRenderer={(
              data: INotaryItems,
              rowIndex: number,
              cellIndex: number
            ) => {
              return handleCellRendered(cellIndex, data, rowIndex);
            }}
          />
          {notary && (
            <Pagination
              numberOfItemsPerPage={notary.pageSize}
              currentPage={notary.currentPage}
              totalPages={notary.totalPages}
              totalRecords={notary.totalCount}
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
          <NotaryFormPopup
            showPopup={showCourtForm}
            closePopup={(shouldRefresh: string) => {
              if (shouldRefresh === "refresh") {
                getNotary(notary.currentPage, notary.totalPages);
              }
              setShowCourtForm(false);
            }}
            isEditMode={isEditMode}
            initialValues={selectedRowData}
            onSubmit={(formValues: INotaryItems) => {
              if (isEditMode) {
                handleEditNotary(formValues);
              } else {
                handleCreateNotary(formValues);
              }
            }}
            showSpinner={showSpinner}
          ></NotaryFormPopup>
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
                handleDeleteNotary();
              }}
            ></ConfirmationBox>
          </div>
        )}
    </div>
  );
};
export default Notary;
