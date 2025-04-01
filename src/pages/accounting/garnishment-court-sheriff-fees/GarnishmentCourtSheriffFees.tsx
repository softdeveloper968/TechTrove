import React, { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import Grid from "components/common/grid/GridWithToolTip";
import GarnishmentCourtSheriffFeesFormPopup from "./GarnishmentCourtSheriffFeesFormPopup";
import { convertToPrice, toCssClassName } from "utils/helper";
import GarnishmentCourtSheriffFeesService from "services/garnishment-court-sheriff-fees.service";
import {
  IGarnishmentCourtSheriffFeesItems
} from "interfaces/garnishment-court-sheriff-fees.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { useAccountingContext } from "../AccountingContext";

const initialColumnMapping:IGridHeader[] = [
   {columnName:"actions",label:"Action", className: "action" },
  {columnName:"countyName",label:"County"},
  {columnName:"courtName",label:"Court"},
  {columnName:"garnishmentType",label:"GarnishmentType", className:'text-right'},
  {columnName:"sheriffFeeFirstTenant",label:"SheriffFeeFirstTenant", className:'text-right'},
  {columnName:"sheriffFeeSecondTenant",label:"SheriffFeeSecondTenant", className:'text-right'},
  {columnName:"courtFee",label:"CourtFee", className:'text-right'},
  {columnName:"efileFee",label:"EfileFee", className:'text-right'},
  {columnName:"efileServiceCharge",label:"EfileServiceCharge", className:'text-right'},
  {columnName:"otherEfileCharge",label:"OtherEfileCharge", className:'text-right'},
  {columnName:"courtfeeSecondTenant",label:"CourtFeeSecondTenant", className:'text-right'},
  {columnName:"courtFeeAndAllOthers",label:"CourtFeeAndAllOthers", className:'text-right'},
  { columnName: "pogmService1stTime", label: "POGMServiceAtt1", className:'text-right' },  
   { columnName: "pogmService2ndTime", label: "POGMServiceAtt2", className:'text-right' },  
  // "County Name": "countyName",
  // "Court Name": "courtName",
  // "Garnishment Type": "garnishmentType",
  // "Sheriff Fee First Tenant": "sheriffFeeFirstTenant",
  // "Sheriff Fee Second Tenant": "sheriffFeeSecondTenant",
  // "Court Fee": "courtFee",
  // "Efile Fee": "efileFee",
  // "Efile Service Charge": "efileServiceCharge",
  // "Other Efile Charge": "otherEfileCharge",
  // "Court Fee Second Tenant": "courtfeeSecondTenant",
  // "Court Fee And All Others": "courtFeeAndAllOthers",
  // "Actions": "action",
];

const GarnishmentCourtSheriffFees = () => {
    const {garnishmentCourtSheriffFees,getAllGarnishmentCourtSheriffFees,setAllGarnishmentCourtSheriffFees}=useAccountingContext();
  // show spinner
  const [showSpinner, setShowSpinner] = useState<Boolean>(false);
  // get list of garnishments
 
  const [
    showGarnishmentCourtSheriffFeesForm,
    setShowGarnishmentCourtSheriffFeesForm,
  ] = useState<Boolean>(false);
  // delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  // State variables for pagination for next and previous button
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    garnishmentCourtSheriffFees.currentPage > 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    garnishmentCourtSheriffFees.totalPages > 1
  );
  // State variable to store the selected row data
  const [selectedRowData, setSelectedRowData] =
    useState<IGarnishmentCourtSheriffFeesItems>({
      id: "",
      countyId: 0,
      courtId: 0,
      garnishmentType: 0,
      sheriffFeeFirstTenant: 0,
      sheriffFeeSecondTenant: 0,
      courtFee: 0,
      efileFee: 0,
      efileServiceCharge: 0,
      otherEfileCharge: 0,
      courtfeeSecondTenant: 0,
      courtFeeAndAllOthers: 0,
      pogmService1stTime: 0,
      pogmService2ndTime: 0,
      court: {
        id: 0,
        courtName: "",
        county: {
          countyId: 0,
          stateName: "",
          countyName: "",
        },
        countyId: 0,
      },
    });
  //visible columns
  const [visibleColumns] = useState<IGridHeader[]>(
    initialColumnMapping
  );

  useEffect(() => {
    getAllGarnishmentCourtSheriffFees(1, 100, "");
  }, []);

  // on press ok from delete confirmation
  const handleDeleteGarnishmentCourtSheriffFees = async () => {
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
        await GarnishmentCourtSheriffFeesService.removeGarnishmentCourtSheriffFees(
          selectedRowData.id
        );

      // Check if the deletion was successful
      if (response.status === HttpStatusCode.Ok) {
        // Show success message
        toast.success("Record removed successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });

        // Close the confirmation pop-up and refresh the list
        setDeleteConfirmation(false);
        getAllGarnishmentCourtSheriffFees(
          garnishmentCourtSheriffFees.currentPage,
          garnishmentCourtSheriffFees.pageSize
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
  const convertToNumber = (value: string | number | null) => {
    return (value == null || value === "") ? 0 : Number(value);
  };
  // on press ok from edit pop up
  const handleEditGarnishmentCourtSheriffFeesFees = async (
    formValues: IGarnishmentCourtSheriffFeesItems
  ) => {
    try {
      // Display spinner while processing
      setShowSpinner(true);
      formValues.garnishmentType = convertToNumber(formValues.garnishmentType);

      formValues.sheriffFeeFirstTenant = convertToNumber(formValues.sheriffFeeFirstTenant);
      formValues.sheriffFeeSecondTenant = convertToNumber(formValues.sheriffFeeSecondTenant);
      formValues.courtFee = convertToNumber(formValues.courtFee);
      formValues.efileFee = convertToNumber(formValues.efileFee);
      formValues.efileServiceCharge = convertToNumber(formValues.efileServiceCharge);
      formValues.otherEfileCharge = convertToNumber(formValues.otherEfileCharge);
      formValues.courtfeeSecondTenant = convertToNumber(formValues.courtfeeSecondTenant);
      formValues.courtFeeAndAllOthers = convertToNumber(formValues.courtFeeAndAllOthers);
      formValues.pogmService1stTime = convertToNumber(formValues.pogmService1stTime);
      formValues.pogmService2ndTime = convertToNumber(formValues.pogmService2ndTime);
      // Attempt to delete the county
      const response =
        await GarnishmentCourtSheriffFeesService.updateGarnishmentCourtSheriffFees(
          formValues
        );

      // Check if the deletion was successful
      if (response.status === HttpStatusCode.Ok) {
        // Show success message
        toast.success("Record updated successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });

        // Close the confirmation pop-up and refresh the list
        setShowGarnishmentCourtSheriffFeesForm(false);
        setIsEditMode(false);
        getAllGarnishmentCourtSheriffFees(
          garnishmentCourtSheriffFees.currentPage,
          garnishmentCourtSheriffFees.pageSize
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
    data: IGarnishmentCourtSheriffFeesItems,
    rowIndex: number
  ) => {
    const columnName = visibleColumns[cellIndex]?.label;
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
    const renderers: Record<string, () => JSX.Element> = {
      countyName: () => formattedCell(data.court.county.countyName),
      courtName: () => formattedCell(data.court.courtName),
      garnishmentType: () => formattedCurrencyCell(cellValue),
      sheriffFeeFirstTenant: () => formattedCurrencyCell(cellValue),
      sheriffFeeSecondTenant: () => formattedCurrencyCell(cellValue),
      courtFee: () => formattedCurrencyCell(cellValue),
      efileFee: () => formattedCurrencyCell(cellValue),
      efileServiceCharge: () => formattedCurrencyCell(cellValue),
      otherEfileCharge: () => formattedCurrencyCell(cellValue),
      courtfeeSecondTenant: () => formattedCurrencyCell(cellValue),
      courtFeeAndAllOthers: () => formattedCurrencyCell(cellValue),
      pogmService1stTime: () => formattedCurrencyCell(cellValue),
      pogmService2ndTime: () => formattedCurrencyCell(cellValue),
      actions: () => formatActionCell(rowIndex, data),
    };
    const renderer =
      renderers[propertyName] || (() => formattedCell(cellValue));
    if (visibleColumns.find(x=>x.label===columnName)) {
      return (
        <td
          key={`${cellIndex}_${rowIndex}`}
          className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929]  ${toCssClassName(columnName)}`}
        >
          {renderer()}
        </td>
      );
    }
    return <></>;
  };

  const handleCreateGarnishmentCourtSheriffFees = async (
    formValues: IGarnishmentCourtSheriffFeesItems
  ) => {
    try {
      formValues.garnishmentType = convertToNumber(formValues.garnishmentType);

      formValues.sheriffFeeFirstTenant = convertToNumber(formValues.sheriffFeeFirstTenant);
      formValues.sheriffFeeSecondTenant = convertToNumber(formValues.sheriffFeeSecondTenant);
      formValues.courtFee = convertToNumber(formValues.courtFee);
      formValues.efileFee = convertToNumber(formValues.efileFee);
      formValues.efileServiceCharge = convertToNumber(formValues.efileServiceCharge);
      formValues.otherEfileCharge = convertToNumber(formValues.otherEfileCharge);
      formValues.courtfeeSecondTenant = convertToNumber(formValues.courtfeeSecondTenant);
      formValues.courtFeeAndAllOthers = convertToNumber(formValues.courtFeeAndAllOthers);
      formValues.pogmService1stTime = convertToNumber(formValues.pogmService1stTime);
      formValues.pogmService2ndTime = convertToNumber(formValues.pogmService2ndTime);
      // Display spinner while processing
      setShowSpinner(true);
      //Attempt to delete the county
      const response =
        await GarnishmentCourtSheriffFeesService.createGarnishmentCourtSheriffFees(
          formValues
        );
      // Check if the deletion was successful
      if (response.status === HttpStatusCode.Ok) {
        // Show success message
        toast.success("Record added successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });
        // Close the confirmation pop-up and refresh the list
        setShowGarnishmentCourtSheriffFeesForm(false);
        getAllGarnishmentCourtSheriffFees(
          garnishmentCourtSheriffFees.currentPage,
          garnishmentCourtSheriffFees.pageSize
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
  const formattedCurrencyCell = (value: any) => (
    <span>${value !== null ? convertToPrice(value) : ""}</span>
  );
  const formatActionCell = (
    rowIndex: number,
    rowData: IGarnishmentCourtSheriffFeesItems
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
            setShowGarnishmentCourtSheriffFeesForm(true);
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

  // // Event handler for the 'Next' button
  const handleFrontButton = () => {
    if (
      garnishmentCourtSheriffFees.currentPage <
      garnishmentCourtSheriffFees.totalPages
    ) {
      const updatedCurrentPage = garnishmentCourtSheriffFees.currentPage + 1;
      setAllGarnishmentCourtSheriffFees({
        ...garnishmentCourtSheriffFees,
        currentPage: updatedCurrentPage,
      });
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get late notices
      getAllGarnishmentCourtSheriffFees(
        updatedCurrentPage,
        garnishmentCourtSheriffFees.pageSize
      );
    }
  };

  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (
      garnishmentCourtSheriffFees.currentPage > 1 &&
      garnishmentCourtSheriffFees.currentPage <=
        garnishmentCourtSheriffFees.totalPages
    ) {
      const updatedCurrentPage = garnishmentCourtSheriffFees.currentPage - 1;
      setAllGarnishmentCourtSheriffFees({
        ...garnishmentCourtSheriffFees,
        currentPage: updatedCurrentPage,
      });
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(garnishmentCourtSheriffFees.currentPage > 1);
      // back button get late notices
      getAllGarnishmentCourtSheriffFees(
        updatedCurrentPage,
        garnishmentCourtSheriffFees.pageSize
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
              setShowGarnishmentCourtSheriffFeesForm(true);
              setSelectedRowData({
                id: "",
                countyId: 0,
                courtId: 0,
                garnishmentType: 0,
                sheriffFeeFirstTenant: 0,
                sheriffFeeSecondTenant: 0,
                courtFee: 0,
                efileFee: 0,
                efileServiceCharge: 0,
                otherEfileCharge: 0,
                courtfeeSecondTenant: 0,
                courtFeeAndAllOthers: 0,
                pogmService1stTime: 0,
                pogmService2ndTime: 0,
                court: {
                  id: 0,
                  courtName: "",
                  county: {
                    countyId: 0,
                    stateName: "",
                    countyName: "",
                  },
                  countyId: 0,
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
            rows={garnishmentCourtSheriffFees?.items}
            cellRenderer={(
              data: IGarnishmentCourtSheriffFeesItems,
              rowIndex: number,
              cellIndex: number
            ) => {
              return handleCellRendered(cellIndex, data, rowIndex);
            }}
          />
          {garnishmentCourtSheriffFees && (
            <Pagination
              numberOfItemsPerPage={garnishmentCourtSheriffFees.pageSize}
              currentPage={garnishmentCourtSheriffFees.currentPage}
              totalPages={garnishmentCourtSheriffFees.totalPages}
              totalRecords={garnishmentCourtSheriffFees.totalCount}
              handleFrontButton={handleFrontButton}
              handleBackButton={handleBackButton}
              canPaginateBack={canPaginateBack}
              canPaginateFront={canPaginateFront}
            />
          )}
        </div>
        {showGarnishmentCourtSheriffFeesForm && (
          <GarnishmentCourtSheriffFeesFormPopup
            showPopup={showGarnishmentCourtSheriffFeesForm}
            closePopup={(shouldRefresh: string) => {
              if (shouldRefresh === "refresh") {
                getAllGarnishmentCourtSheriffFees(
                  garnishmentCourtSheriffFees.currentPage,
                  garnishmentCourtSheriffFees.totalPages
                );
              }
              setShowGarnishmentCourtSheriffFeesForm(false);
            }}
            isEditMode={isEditMode}
            initialValues={selectedRowData}
            onSubmit={(formValues: IGarnishmentCourtSheriffFeesItems) => {
              if (isEditMode) {
                handleEditGarnishmentCourtSheriffFeesFees(formValues);
              } else {
                handleCreateGarnishmentCourtSheriffFees(formValues);
              }
            }}
            showSpinner= {showSpinner}
          ></GarnishmentCourtSheriffFeesFormPopup>
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
                handleDeleteGarnishmentCourtSheriffFees();
              }}
            ></ConfirmationBox>
          </div>
        )}
      </div>
    </div>
  );
};
export default GarnishmentCourtSheriffFees;
