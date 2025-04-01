import React from "react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { useWritsOfPossessionContext } from "../../WritsOfPossessionContext";
import { useAuth } from "context/AuthContext";
import { IWritsOfPossessionItems } from "interfaces/writs-of-possession.interface";
import { IGridHeader } from "interfaces/grid-interface";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import GridCheckbox from "components/formik/GridCheckBox";
import { formattedDate, toCssClassName } from "utils/helper";
import "react-datepicker/dist/react-datepicker.css";
import WritsOfPossessionService from "services/writs-of-possesson.service";

type AddtoWritLaborModalProps = {
  showAddtoWritLaborModalPopup: boolean;
  handleClose: () => void;
//   handleReviewSign: () => void;
 // handleFinish: () => void;
};

const validationSchema: yup.ObjectSchema<any> = yup.object({

});

const initialColumnMapping:IGridHeader[] = [
  {columnName:"isChecked",label:"Edit",controlType:"checkbox",toolTipInfo:"This checkbox represents bulk update only"},
  {columnName:"caseNo",label:"CaseNo",toolTipInfo:"The unique number or code associated with your case, as assigned by the court. "},
  {columnName:"propertyName",label:"PropertyName"},
  {columnName:"county",label:"County"},
  {columnName:"name",label:"TenantOne"},
  {columnName:"address",label:"TenantAddressCombined",toolTipInfo:"TenantAddressCombined"},
  {columnName:"setOutCompleted",label:"SetOutCompleted"},
  {columnName:"setOutCompletedDate",label:"SetOutCompletedDate"},
  {columnName:"setOutNotes",label:"SetOutNotes"},
  {columnName:"setOutScheduled",label:"SetOutScheduled"},
  {columnName:"writCancelled",label:"WritCancelled"},
  // isChecked: "isChecked",
  // "Case No": "caseNo",
  // Property: "propertyName",
  // County: "county",
  // "Tenant Name": "name",
  // "SetOut Notes":"setOutNotes",
  // "SetOut Scheduled":"setOutScheduled",
  // "SetOut Completed":"setOutCompleted",
  // "SetOut Completed Date":"setOutCompletedDate",
  // "Writ Cancelled":"writCancelled"  
];

const WritsOfPossession_AddtoWritLaborModal = (props: AddtoWritLaborModalProps)=> {
  const { userRole } = useAuth();
  const buttonClasses: string = "text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
  const {
    signedWrits,
    setShowSpinner,
    setAllSignedWrits,
    //setAllUnsignedWrits,
    getAllWritsOfPossession,
    showSpinner,
    setFilteredRecords,
    filteredRecords,
    setSelectedSignedWritsId,
    selectedWritsOfPossessionId,
    selectedSignedWritsId,
    setSelectedWritsOfPossessionId,
    setSelectedFilteredWritOfPossessionId,
    bulkRecords,
    setBulkRecords,
  } = useWritsOfPossessionContext();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showSignInPopup, setShowSignInPopup] = useState<boolean>(false);
  const [disableReviewSign, setDisableReviewSign] = useState<boolean>(true);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
    initialColumnMapping
  );
  const [selectAll, setSelectAll] = useState<boolean>(false);
  // const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
  //   Array(signedWrits.items?.length).fill(false)
  // );
  const [columnErrors, setColumnErrors] = useState<
    Record<string, { rowIndex: number; errorMessage: string }[]>[]
  >([]);
  // const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectFilteredAll, setSelectFilteredAll] = useState<boolean>(false);

  const [selectedFilteredRows, setSelectedFilteredRows] = useState<Array<boolean>>(
    Array(filteredRecords?.length).fill(false)
  );

  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    signedWrits.currentPage > 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    signedWrits.totalPages > 1
  );
  const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
  const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);

  useEffect(() => {  
    
  //   const records = bulkRecords.filter((item) =>
  //   selectedWritsOfPossessionId.includes(item.id || "")
  // );
  let uniqueRecords: { [key: string]: any } = {};
      let records = bulkRecords.filter((item) => {
         const id = item.id || "";
         if (!selectedWritsOfPossessionId.includes(id) || uniqueRecords[id]) {
            return false;
         }
         uniqueRecords[id] = true;
         return true;
      });
      setFilteredRecords(records);
    setFilteredRecords(records);
    setSelectedFilteredRows(Array(filteredRecords?.length).fill(false));
  }, []);


  useEffect(() => {
    setSelectFilteredAll(false);
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
  }, []);

  // set the state of selected dropdown
  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    rowId: string | undefined | null
  ) => {
    try {
      setShowSpinner(true);

      // Update only the specific row where the dropdown is changed
      const updatedGridData = filteredRecords.map((record) => {
        if (record.id === rowId) {
          return {
            ...record,
            reason: event.target.value,
          };
        }
        return record;
      });
      setFilteredRecords(updatedGridData);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setShowSpinner(false);
    }
  };

  const validateField = async () => {
    const errors: Record<
      string,
      { rowIndex: number; errorMessage: string }[]
    >[] = [];
    filteredRecords.forEach((record, rowIndex) => {
      const recordErrors: Record<
        string,
        { rowIndex: number; errorMessage: string }[]
      > = {};

      try {
        validationSchema.validateSync(record, { abortEarly: false });
      } catch (error: any) {
        if (error.inner) {
          error.inner.forEach((detailError: any) => {
            const propertyName = detailError.path || "unknown";
            const errorMessage = `${detailError.message}`; // Corrected syntax
            const rowIndex = detailError?.rowIndex ?? -1;

            if (!recordErrors[propertyName]) {
              recordErrors[propertyName] = [];
            }

            recordErrors[propertyName].push({
              rowIndex,
              errorMessage,
            });
          });
        }
      }

      if (Object.keys(recordErrors).length > 0) {
        errors.push(recordErrors);
      }
    });
    setColumnErrors(errors);
  }

  const handleSignature = async () => {
    // try {
    //   setShowSpinner(true);
    //   const updatedReasonList: IAmendmentsReason[] = filteredRecords
    //     .filter((record) => record.id && record.reason) // Filter out records with undefined id or reason
    //     .map((record) => ({
    //       dispoId: record.id || "", // Assign a default value for undefined id
    //       reason: record.reason || "", // Assign a default value for undefined reason
    //     }));
    //   setSelectedReason(updatedReasonList);
    //   props.handleReviewSign();
    // } finally {
    //   setShowSpinner(false);
    // }
  };

  // Update handleInputChange to use the validateField function
  const handleInputChange = async (
    columnName: string,
    updatedValue: string|boolean,
    selectedRowIndex: number
  ) => {
    
    // setDisableReviewSign(false);
    // If any row is selected, perform bulk update
    if (selectedFilteredRows[selectedRowIndex]) {
      setFilteredRecords((prevRows) =>
        prevRows.map((row, rowIndex) => {
          if (selectedFilteredRows[rowIndex] === selectedFilteredRows[selectedRowIndex]) {
            // If the row is selected, update the specified column
            const updatedRow = { ...row, [columnName]: updatedValue };
            // Perform validation for the updated row
            validateRow(updatedRow, rowIndex);
            return updatedRow;
          }

          else {
            // If the row is not selected, return the original row
            return row;
          }

        })
      );
    } else {

      // If no row is selected, update only the selected row
      setFilteredRecords((prevRows) =>
        prevRows.map((row, rowIndex) => {
          const updatedRow =
            rowIndex === selectedRowIndex
              ? { ...row, [columnName]: updatedValue }
              : row;
          // Perform validation for the updated row
          validateRow(updatedRow, rowIndex);
          return updatedRow;
        })
      );
    }        
  };

    // Update handleInputChange to use the validateField function
    const handleFieldCheckBoxChange = async (
      columnName: string,
      updatedValue: string|boolean,
      selectedRowIndex: number
    ) => {
      
      // setDisableReviewSign(false);
      // If any row is selected, perform bulk update
      if (selectedFilteredRows[selectedRowIndex]) {
        setFilteredRecords((prevRows) =>
          prevRows.map((row, rowIndex) => {
            if (selectedFilteredRows[rowIndex] === selectedFilteredRows[selectedRowIndex]) {
              // If the row is selected, update the specified column
              const updatedRow = { ...row, [columnName]: updatedValue };
              // Perform validation for the updated row
              validateRow(updatedRow, rowIndex);
              return updatedRow;
            }
  
            else {
              // If the row is not selected, return the original row
              return row;
            }
  
          })
        );
      } else {
  
        // If no row is selected, update only the selected row
        setFilteredRecords((prevRows) =>
          prevRows.map((row, rowIndex) => {
            const updatedRow =
              rowIndex === selectedRowIndex
                ? { ...row, [columnName]: updatedValue }
                : row;
            // Perform validation for the updated row
            validateRow(updatedRow, rowIndex);
            return updatedRow;
          })
        );
      }
    };

  const validateRow = (row: IWritsOfPossessionItems, rowIndex: number) => {
    const recordErrors: Record<
      string,
      { rowIndex: number; errorMessage: string }[]
    > = {};

    try {
      // Validate the updated row against the schema
      validationSchema.validateSync(row, { abortEarly: false });
    } catch (error: any) {
      if (error.inner) {
        // Collect validation errors for each property
        error.inner.forEach((detailError: any) => {
          const propertyName = detailError.path || "unknown";
          const errorMessage = `${detailError.message}`;

          // Get the row index from your record, adjust this based on your data structure
          const rowIndex = detailError.rowIndex || -1;

          // Check if the property already has errors, if not, initialize an array
          if (!recordErrors[propertyName]) {
            recordErrors[propertyName] = [];
          }

          // Push the error object with rowIndex to the array
          recordErrors[propertyName].push({
            rowIndex,
            errorMessage,
          });
        });
      }
    }

    // If there are errors for the record, update the columnErrors state
    setColumnErrors((prevErrors) => [
      ...prevErrors.slice(0, rowIndex),
      recordErrors,
      ...prevErrors.slice(rowIndex + 1),
    ]);
  };

  const convertToNumber = (value: string): string => {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? "" : parsedValue.toString();
  };

  const [newSelectedRows] = useState<boolean[]>([]);

  const handleCheckBoxChange = (index: number, checked: boolean) => {
    
    if (shiftKeyPressed && lastClickedFilteredRowIndex !== -1 && filteredRecords) {
      const start = Math.min(index, lastClickedFilteredRowIndex);
      const end = Math.max(index, lastClickedFilteredRowIndex);
      setSelectedFilteredRows(Array.from({ length: end + 1 }, (_, i) =>
        i >= start && i <= end ? selectedFilteredRows[i] = true : newSelectedRows[i]
      ));
      setSelectedFilteredRows(selectedFilteredRows);
      const selectedIds = (filteredRecords || [])
        .filter((_, rowIndex) => selectedFilteredRows[rowIndex])
        .map((item) => item.id)
        .filter((id): id is string => typeof id === "string");
        setSelectedFilteredWritOfPossessionId(selectedIds);
    }
    else {
      const updatedSelectedRows = [...selectedFilteredRows];
      updatedSelectedRows[index] = checked;
      setSelectedFilteredRows(updatedSelectedRows);

      const selectedIds = (filteredRecords || [])
        .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
        .map((item) => item.id)
        .filter((id): id is string => typeof id === "string");

        setSelectedFilteredWritOfPossessionId(selectedIds);
    }
    setLastClickedFilteredRowIndex(index);
  };
  const handleSelectAllChange = (checked: boolean) => {    
    const newSelectAll = !selectAll;
    const allIds: string[] = filteredRecords
      .map((item) => item.id)
      .filter((id): id is string => typeof id === "string");
    if (checked) {
      setSelectedFilteredWritOfPossessionId(allIds);
    } else {
      setSelectedFilteredWritOfPossessionId([]);
    }

    setSelectAll((prevSelectAll) => {
      // Update selectedRows state
      setSelectedFilteredRows(Array(allIds.length).fill(newSelectAll));
      return newSelectAll;
    });
  };

  const [setOutCompletedDateSelected, setSetOutCompletedDateSelected] = useState<boolean>(false);

  // Handler to toggle SetOutCompleted checkbox based on SetOutCompletedDate selection
  const handleSetOutCompletedDateChange = (date: Date | null, rowIndex: number) => {
    
    // Check if date is selected
    if (date !== null) {
      // Date is selected, check SetOutCompleted and disable it
      handleInputChange("setOutCompleted", true, rowIndex);
      setSetOutCompletedDateSelected(true);
    } else {
      // Date is not selected, uncheck SetOutCompleted and enable it
      handleInputChange("setOutCompleted", false, rowIndex);
      setSetOutCompletedDateSelected(false);
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
    data: IWritsOfPossessionItems,
    rowIndex: number
  ) => {  
    const columnName = visibleColumns[cellIndex]?.label;
    const propertyName =visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
    const renderers: Record<string, () => JSX.Element> = {
    caseNo:()=><span>{cellValue !== null ? cellValue : ""}</span>,
    propertyName:()=><span>{cellValue !== null ? cellValue : ""}</span>,
    county:()=><span>{cellValue !== null ? cellValue : ""}</span>,
    name: () => formattedFullNameCell(data.firstName, data.lastName),
    address: () => formattedAddressCell(data),
    setOutCompletedDate:()=><div className="datePicker"><DatePicker
    selected={
      cellValue && Date.parse(cellValue as string)
        ? new Date(cellValue as string)
        :null// new Date()
    }
    onChange={(date: any) =>
      {handleInputChange?.(propertyName, date, rowIndex);
      handleSetOutCompletedDateChange(date, rowIndex)}
    }
    minDate={new Date("2000-12-12")}
    maxDate={new Date()}
    //dateFormat="MM/dd/yyyy"
    dateFormat="MM/dd/yyyy"
    placeholderText="mm/dd/yyyy"
    className="bg-calendar bg-no-repeat bg-[center_right_1rem] peer placeholder-gray-500 outline-none p-3 block border w-full border-gray-200 rounded-lg text-sm  focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
  /></div>,

  setOutScheduled:()=><div className="ml-5 flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            name={propertyName}
            checked={cellValue} // Set checked attribute based on state
            onChange={(event) => handleInputChange(propertyName,event.target.checked,rowIndex)}  // Handle change event
          />
          <span className="text-gray-600 text-sm font-medium ml-2">Yes</span>
        </div>,
  setOutCompleted:()=><div className="ml-5 flex items-center">
          <input
            type="checkbox"
            className="form-checkbox "
            name={propertyName}
            disabled={!cellValue}
            checked={cellValue} // Set checked attribute based on state            
          //  onChange={(event) => handleInputChange(propertyName,event.target.checked,rowIndex)} // Handle change event
          />
          <span className="text-gray-600 text-sm font-medium ml-2">Yes</span>
        </div>,
  writCancelled:()=><div className="ml-5 flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            name={propertyName}
            checked={cellValue} // Set checked attribute based on state
            onChange={(event) => handleInputChange(propertyName,event.target.checked,rowIndex)} // Handle change event
          />
          <span className="text-gray-600 text-sm font-medium ml-2">Yes</span>
        </div>,
      isChecked: () => (
       <div className="selectRowCheckbox">
         <GridCheckbox
          checked={selectedFilteredRows[rowIndex]}
          onChange={(checked: boolean) =>
            handleCheckBoxChange(rowIndex, checked)
          }
          label=""
        />
       </div>
      ),
    
    };
  

    const renderer = renderers[propertyName] || (() => formattedCell(cellValue, columnName, propertyName, rowIndex));

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

  const formattedDateCell = (value: any) => (
    <span>{value != null && value !== "" ? formattedDate(value) : ""}</span>
  );

  const formattedFullNameCell = (firstName: string, lastName: string) => (
    <span>{`${firstName} ${lastName}`}</span>
  );

  const formattedAddressCell = (value: any) => (
    <span>
      {value !== null ? `${value.tenantAddress ?? ''} ${value.tenantUnit ?? ''} ${value.tenantCity ?? ''} ${value.tenantState ?? ''} ${value.tenantZip ?? ''}` : ''}
    </span>
  );

  // const haveChangesInAmendments = () => {
  //   const previousCases: IAllCasesItems[] = allCases.items.filter((item) => selectedAllCasesId.includes(item.id || ""));
  //   const changesExist = compareChanges(previousCases, filteredRecords);

  //   if (changesExist) {
  //     setValidationMessage('');
  //     props.handleReviewSign();
  //   } else {
  //     const message = 'No records have been amended for review';
  //     setValidationMessage(message);
  //   }
  // };

  // const haveChangesInAmendmentsForNonSigner = () => {
  //   const previousCases: IAllCasesItems[] = allCases.items.filter((item) => selectedAllCasesId.includes(item.id || ""));
  //   const changesExist = compareChanges(previousCases, filteredRecords);

  //   if (changesExist) {
  //     setValidationMessage('');
  //     props.handleFinish();
  //   } else {
  //     const message = 'No records have been amended for confirmation';
  //     setValidationMessage(message);
  //   }
  // };

  const handleSubmit=async()=>{     
    try {
      //setFilteredRecords([]);
  
     // setSelectedWritsOfPossessionId([]);
    const response = await WritsOfPossessionService.editWritOfPossessionByWritLabor(
      filteredRecords
    );
    if (response.status === HttpStatusCode.Ok) {
      // Display a success toast message
     toast.success("Writs of possession successfully updated.");
     setBulkRecords(filteredRecords);
      // Close the popup
      props.handleClose();
      
    } else {
      // Handle other status codes if needed
      // For example, display an error message toast
      toast.error("Failed to update writs of possession.");
      props.handleClose();
    }
  }finally {
    // hide spinner
    setShowSpinner(false);
  }

  };

  const handleModalClose = () => {
   // setFilteredRecords([]);
    //setSelectedWritsOfPossessionId([]);
    props.handleClose();   
  };

  const formattedCell = (
    value: any,
    columnName: any,
    fieldName: any,
    rowIndex: number
  ) => (
    // <span>{value !== null ? value : ""}</span>
    <>
      <input
        type={"text"}
        value={value as string}
        className={
          "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
        }
        onChange={(e) =>
          handleInputChange?.(fieldName, e.target.value, rowIndex)
        }
      />
      {columnErrors[rowIndex]?.[columnName]?.map(
        (error, index) => (
          <div key={index} className="text-red-500">
            {error.errorMessage}
          </div>
        )
      )}
    </>
  );
  return (
    <>
      <Modal
        showModal={props.showAddtoWritLaborModalPopup}
        onClose={handleModalClose}
        width="max-w-4xl"
      >
        {showSpinner && <Spinner />}
        {/* Container for the content */}
        <div id="fullPageContent">
          <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
            <div className="sm:flex sm:items-start">
              <div className="text-center sm:text-left">
                <h3
                  className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                  id="modal-title"
                >
                  Writs Of Possession
                </h3>
              </div>
            </div>

            {/* Display the grid*/}
            <div className="relative pt-2 writlabor-writofpossession-grid">
              <Grid
                columnHeading={visibleColumns}
                rows={filteredRecords}
                handleSelectAllChange={handleSelectAllChange}
                selectAll={selectAll}
                showInPopUp={true}
                cellRenderer={(
                  data: IWritsOfPossessionItems,
                  rowIndex: number,
                  cellIndex: number
                ) => {
                  return handleCellRendered(cellIndex, data, rowIndex);

                }}
              ></Grid>
              <div className="py-2.5 flex justify-between mt-1.5 items-center">
                <p className="font-semibold text-[10px] md:text-xs">Total records: {selectedWritsOfPossessionId.length}</p>

                <Button
                    handleClick={()=>setShowConfirm(true)}
                    title="Confirm"
                    isRounded={false}
                    type={"button"} 
                  ></Button>
                {/* {!disableReviewSign && validationMessage.length ? <p className="text-aidonicRed text-red-500">{validationMessage}</p> : <></>}
                
                {(userRole.includes(UserRole.Admin) ||
                  userRole.includes(UserRole.C2CAdmin) ||
                  userRole.includes(UserRole.Signer)) &&
                  !userRole.includes(UserRole.NonSigner) ? (
                  <Button
                    handleClick={haveChangesInAmendments}
                    title="Review & Sign"
                    isRounded={false}
                    type={"button"}
                    classes={disableReviewSign ? `${buttonClasses} opacity-55` : buttonClasses}
                    disabled={disableReviewSign}
                  ></Button>
                ) : (
                  <Button
                    handleClick={haveChangesInAmendmentsForNonSigner}
                    title="Confirm"
                    isRounded={false}
                    type={"button"}
                    classes={disableReviewSign ? `${buttonClasses} opacity-55` : buttonClasses}
                    disabled={disableReviewSign}
                  ></Button>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <div>
        <Modal
          showModal={showConfirm}
          onClose={handleModalClose}
          width="max-w-md"
        >
          {showSpinner && <Spinner />}
          {/* Container for the content */}
          <div id="fullPageContent">
            <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
              <div className="text-center pr-4 sm:text-left">
                <h3
                  className="text-sm font-semibold leading-5 text-gray-900"
                  id="modal-title"
                >
                 Are you sure you want to save the Information for Writs of Possession
                </h3>
              </div>
            </div>
            <div className="flex justify-end m-2">
              <Button
                type="button"
                isRounded={false}
                title="No"
                handleClick={handleModalClose}
                classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
              ></Button>
              <Button
                handleClick={()=>handleSubmit()}
                title="Yes"
                isRounded={false}
                type={"button"}
                classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
              ></Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default WritsOfPossession_AddtoWritLaborModal;
