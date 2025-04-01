import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import { HttpStatusCode } from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import GridCheckbox from "components/formik/GridCheckBox";
import { IGridHeader } from "interfaces/grid-interface";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import { IServerEmailLogItem } from "interfaces/email-queue.interface";
import { useEmailQueueContext } from "pages/email-queue/EmailQueueContext";
import EmailQueueService from "services/email-queue.service";
import dollarImage from "assets/images/dollar-sign.svg";
import { adjustDateSystemTimezoneDate, adjustDateToSystemTimezoneDate, convertAndFormatDate, toCssClassName } from "utils/helper";

type ServerEmailLogBulkEditProps = {
   showPopup: boolean;
   handleClose: () => void;
   handleCloseConfirm: () => void;
};

const validationSchema = yup.object({

});


const initialColumnMapping: IGridHeader[] = [
   { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
   { columnName: "createdDate", label: "CreatedDate" },
   { columnName: "county", label: "County" },
   { columnName: "serverEmail", label: "ServerEmail" },
   //{columnName:"documentUrl",label:"Document"},
   { columnName: "verificationCheck", label: "VerificationCheck" },
   { columnName: "checkedBy", label: "CheckedBy" },
   { columnName: "mailDate", label: "MailDate" },
   { columnName: "mailTotal", label: "MailTotal" },
   { columnName: "mailWeight", label: "MailWeight" },
   { columnName: "mailTracking", label: "MailTracking#" },
   { columnName: "mailManager", label: "MailManager" },
   { columnName: "notes", label: "Notes" },
   { columnName: "c2CCheck", label: "C2CCheck#" },
   { columnName: "c2CCheckTotal", label: "C2CCheckTotal" },
   { columnName: "serviceTotal", label: "ServiceTotal" }
];

const EmailQueue_BulkEdit = (props: ServerEmailLogBulkEditProps) => {
   const {
      showSpinner,
      setShowSpinner,
      filteredServerLogRecords,
      setFilteredServerLogRecords,
      bulkServerLogRecords,
      setBulkServerLogRecords,
      setselectedServerLogIdsIds,
      selectedServerLogIds,
      setSelectedFilteredServerEmailQueueId,
      getServerEmailLogs,
      serverEmailLogs
   } = useEmailQueueContext();

   const [showConfirm, setShowConfirm] = useState<boolean>(false);
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [columnErrors, setColumnErrors] = useState<
      Record<string, { rowIndex: number; errorMessage: string }[]>[]
   >([]);
   const [rowErrors, setRowErrors] = useState<IImportCsvRowError[]>([]);
   const [selectFilteredAll, setSelectFilteredAll] = useState<boolean>(false);

   const [selectedFilteredRows, setSelectedFilteredRows] = useState<
      Array<boolean>
   >(Array(filteredServerLogRecords?.length).fill(false));

   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [nameMismatchError, setNameMismatchError] = useState<string | null>("");
   const [setOutCompletedDateSelected, setSetOutCompletedDateSelected] = useState<boolean>(false);
   const [newSelectedRows] = useState<boolean[]>([]);

   useEffect(() => {
      
      bulkServerLogRecords.forEach(item => {

      });
      // const records = bulkServerLogRecords.filter((item) =>
      //   selectedServerLogIds.includes(item.id || "")
      // );
      // let uniqueRecords: { [key: string]: any } = {};
      // let records = bulkServerLogRecords.filter((item) => {
      //    const id = item.id || "";
      //    if (!selectedServerLogIds.includes(id) || uniqueRecords[id]) {
      //       return false;
      //    }
      //    uniqueRecords[id] = true;
      //    return true;
      // });
      // setFilteredServerLogRecords(records);
      let uniqueRecords: { [key: string]: any } = {};
let records = bulkServerLogRecords.filter((item) => {
  const id = item.id || "";
  if (!selectedServerLogIds.includes(id) || uniqueRecords[id]) {
    return false;
  }
  uniqueRecords[id] = true;
  return true;
}).map((item) => {
  // Create a deep copy of each item to prevent modification of bulkRecords
  return JSON.parse(JSON.stringify(item));
});

records.forEach(item => {
  item.verificationCheck = convertAndFormatDate(item.verificationCheck);
  item.mailDate = convertAndFormatDate(item.mailDate);
});

setFilteredServerLogRecords(records);
      setSelectedFilteredRows(Array(filteredServerLogRecords?.length).fill(false));
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


   const handleInputChange = async (
      columnName: string,
      updatedValue: string | boolean | React.ChangeEvent<HTMLInputElement>,
      selectedRowIndex: number
   ) => {
      setNameMismatchError(null);

      // Regular update for non-file inputs
      if (selectedFilteredRows[selectedRowIndex]) {
         setFilteredServerLogRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               if (
                  selectedFilteredRows[rowIndex] ===
                  selectedFilteredRows[selectedRowIndex]
               ) {
                  // Update the specified column
                  const updatedRow = { ...row, [columnName]: updatedValue };
                  // Perform validation for the updated row
                  validateRow(updatedRow, rowIndex);
                  return updatedRow;
               } else {
                  return row;
               }
            })
         );
      } else {
         // Update only the selected row
         setFilteredServerLogRecords((prevRows) =>
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

   const validateRow = (row: IServerEmailLogItem, rowIndex: number) => {
      const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};
      const fields: IImportCsvFieldError[] = [];
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

               fields.push({
                  fieldName: propertyName,
                  message: errorMessage,
               });

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

      // Update row errors for the specific row
      setRowErrors((prevErrors) => {
         const updatedRowErrors = [...prevErrors];
         updatedRowErrors[rowIndex] = { rowIndex, fields };
         return updatedRowErrors;
      });

      // If there are errors for the record, update the columnErrors state
      setColumnErrors((prevErrors) => [
         ...prevErrors.slice(0, rowIndex),
         recordErrors,
         ...prevErrors.slice(rowIndex + 1),
      ]);
   };

   const handleCheckBoxChange = (index: number, checked: boolean) => {
      if (
         shiftKeyPressed &&
         lastClickedFilteredRowIndex !== -1 &&
         filteredServerLogRecords
      ) {
         const start = Math.min(index, lastClickedFilteredRowIndex);
         const end = Math.max(index, lastClickedFilteredRowIndex);
         setSelectedFilteredRows(
            Array.from({ length: end + 1 }, (_, i) =>
               i >= start && i <= end
                  ? (selectedFilteredRows[i] = true)
                  : newSelectedRows[i]
            )
         );
         setSelectedFilteredRows(selectedFilteredRows);
         const selectedIds = (filteredServerLogRecords || [])
            .filter((_, rowIndex) => selectedFilteredRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         setSelectedFilteredServerEmailQueueId(selectedIds);
      } else {
         const updatedSelectedRows = [...selectedFilteredRows];
         updatedSelectedRows[index] = checked;
         setSelectedFilteredRows(updatedSelectedRows);
         if (
            filteredServerLogRecords.length ===
            updatedSelectedRows.filter((item) => item).length
         ) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }
         const selectedIds = (filteredServerLogRecords || [])
            .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         setSelectedFilteredServerEmailQueueId(selectedIds);
      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = filteredServerLogRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         setSelectedFilteredServerEmailQueueId(allIds);
      } else {
         setSelectedFilteredServerEmailQueueId([]);
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedFilteredRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

   // Handler to toggle SetOutCompleted checkbox based on SetOutCompletedDate selection
   const handleSetOutCompletedDateChange = (
      date: Date | null,
      rowIndex: number
   ) => {
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

   const handleConfirmBulkEdit = () => {
      const errors: Record<string, { rowIndex: number; errorMessage: string }[]>[] = [];
      const rowErrors: IImportCsvRowError[] = [];

      filteredServerLogRecords.forEach((record, index: number) => {
         const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};
         const fields: IImportCsvFieldError[] = [];

         try {
            validationSchema.validateSync(record, { abortEarly: false });
         } catch (error: any) {
            if (error.inner) {
               error.inner.forEach((detailError: any) => {
                  const propertyName = detailError.path || "unknown";
                  const errorMessage = `${detailError.message}`;
                  // const rowIndex = detailError?.rowIndex ?? -1;
                  const rowIndex = index;

                  fields.push({
                     fieldName: propertyName,
                     message: errorMessage,
                  });

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

         rowErrors.push({
            rowIndex: index, // here index is rowIndex
            fields: fields,
         });

      });

      setRowErrors(rowErrors);
      setColumnErrors(errors);

      if (!errors.length) {
         setShowConfirm(true);
      }
   };

   const getFieldsErrorMessages = (rowIndex: number, propertyName: string) => {
      const errorMessages: string[] = [];
      rowErrors.filter((error) => {
         if (!error.fields.length) return null;
         if (error.rowIndex === rowIndex && error.fields.length) {
            error.fields.forEach((f) => {
               if (f.fieldName.toLowerCase() === propertyName.toLowerCase()) {
                  errorMessages.push(f.message);
               }
            });
         }
      });

      return errorMessages;
   };

   const handleSubmit = async () => {

      setNameMismatchError(null);
      try {
         setShowSpinner(true);
         //  for (const element of filteredServerLogRecords) {
         //     const fileInput = document.getElementById(element.id) as HTMLInputElement | null;
         //     if (fileInput && fileInput.files && fileInput.files.length > 0) {
         //       const file = fileInput.files[0];
         //       const fileBase64 = await fileToBase64(file);
         //       element.documentUrl = fileBase64;
         //       // Call the API with the updated form values
         //     }
         //   }
         
         const formattedPayload = filteredServerLogRecords.map((item) => {
            return {
               ...item,
               verificationCheck: item.verificationCheck ? 
               adjustDateSystemTimezoneDate(
        typeof item.verificationCheck === 'string' ? 
          item.verificationCheck : 
          item.verificationCheck.toISOString()
      ) 
      : null,
      mailDate: item.mailDate ? 
      adjustDateSystemTimezoneDate(
        typeof item.mailDate === 'string' ? 
          item.mailDate : 
          item.mailDate.toISOString()
      ) 
      : null,
            }
         });
         const response = await EmailQueueService.editServerEmailLogInfoBulk(
            formattedPayload
         );
         if (response.status === HttpStatusCode.Ok) {
            setShowSpinner(false);
            toast.success("Case info successfully updated.");
            setBulkServerLogRecords(filteredServerLogRecords);
            props.handleClose();
         }
         //   else {
         //     setShowSpinner(false);
         //     const error = response as unknown as AxiosError<any>;
         //     if (error && error.response) {
         //        const { data } = error.response;
         //        if (
         //           data.message.includes(
         //              "The person served does not match to the tenant names associated with case number"
         //           )
         //        )
         //           setNameMismatchError(data.message);
         //        setShowConfirm(false);
         //        // props.handleCloseConfirm();
         //     } else {
         //        setFilteredServerLogRecords([]);
         //        setSelectAll(false);
         //        setselectedServerLogIdsIds([]);
         //        toast.error("Failed to update case info.");
         //        props.handleClose();
         //     }
         //  }
      } finally {
         //   getServerEmailLogs(1, 100, '');
         getServerEmailLogs(1, 100, serverEmailLogs.searchParam);
         setShowSpinner(false);
      }
   };

   const handleModalClose = () => {
      // setFilteredRecords([]);
      // setSelectedProcessServerId([]);
      props.handleClose();
   };

   const handleModalCloseConfirmation = () => {
      if (nameMismatchError?.length) {
         setShowConfirm(false);
         // props.handleCloseConfirm();
      } else {
         setFilteredServerLogRecords([]);
         setselectedServerLogIdsIds([]);
         props.handleClose();
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
      data: IServerEmailLogItem,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      //   const isServiceTypePersonalOrNotorious =
      //      data.serviceMethod === ServiceMethod.PERSONALLY ||
      //      data.serviceMethod === ServiceMethod.NOTORIOUSLY;

      const renderers: Record<string, () => JSX.Element> = {
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
         createdDate: () => <span>{cellValue ? new Date(cellValue).toLocaleString() : ""}</span>,
         serverEmail: () => <span>{cellValue}</span>,
         county: () => <span>{cellValue}</span>,
         mailDate: () => (
            <>
               <div className="datePicker">
                  <DatePicker
                     selected={
                        cellValue && Date.parse(cellValue as string)
                           ? new Date(cellValue as string)
                           : null // new Date()
                     }
                     onChange={(date: any) => {
                        handleInputChange?.(propertyName, date, rowIndex);
                        // handleSetOutCompletedDateChange(date, rowIndex);
                     }}
                     //dateFormat="MM/dd/yyyy"
                     dateFormat="MM/dd/yyyy"
                     placeholderText="mm/dd/yyyy"
                     className="bg-calendar bg-no-repeat bg-[center_right_11px] peer placeholder-gray-500 outline-none p-1.5 pr-7 min-w-28 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                  />
               </div>
               {getFieldsErrorMessages(rowIndex, columnName).map(
                  (message, index) => (
                     <div
                        key={index}
                        className="text-red-500 whitespace-normal"
                     >
                        {message}
                     </div>
                  )
               )}
            </>
         ),
         verificationCheck: () => (
            <>
               <div className="datePicker">
                  <DatePicker
                     selected={
                        cellValue && Date.parse(cellValue as string)
                           ? new Date(cellValue as string)
                           : null // new Date()
                     }
                     onChange={(date: any) => {
                        handleInputChange?.(propertyName, date, rowIndex);
                        //  handleSetOutCompletedDateChange(date, rowIndex);
                     }}
                     //dateFormat="MM/dd/yyyy"
                     dateFormat="MM/dd/yyyy"
                     placeholderText="mm/dd/yyyy"
                     className="bg-calendar bg-no-repeat bg-[center_right_11px] peer placeholder-gray-500 outline-none p-1.5 pr-7 min-w-28 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                  />
               </div>
               {getFieldsErrorMessages(rowIndex, columnName).map(
                  (message, index) => (
                     <div
                        key={index}
                        className="text-red-500 whitespace-normal"
                     >
                        {message}
                     </div>
                  )
               )}
            </>
         ),

      };
      const renderer =
         renderers[propertyName] ||
         (() => formattedCell(cellValue, columnName, propertyName, rowIndex));

      if (visibleColumns.find((x) => x.label === columnName)) {
         return (
            <td
               key={cellIndex}
               className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929]  ${toCssClassName(columnName)}`}
            >
               {renderer()}
            </td>
         );
      };
      return <></>;
   };

   const formattedCell = (
      value: any,
      columnName: any,
      propertyName: any,
      rowIndex: number
   ) => {

      if (propertyName === "c2CCheckTotal" || propertyName === "serviceTotal" || propertyName === "mailTotal") {
         return (
            <div>
               <input
                  type={"number"}
                  value={value}
                  className={`peer outline-none px-2.5 py-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_left_10px] !pl-7 number_filed`}
                  onChange={(e) =>
                     handleInputChange?.(propertyName, e.target.value, rowIndex)
                  }
                  style={{
                     backgroundImage: `url(${dollarImage})`,
                  }}
               />
               {getFieldsErrorMessages(rowIndex, propertyName).map(
                  (message, index) => (
                     <div
                        key={index}
                        className="text-red-500 whitespace-normal"
                     >
                        {message}
                     </div>
                  )
               )}
            </div>
         );
      }

      if (propertyName === "mailTracking") {
         return (
            <div>
               <input
                  type={"number"}
                  value={value}
                  className={`peer outline-none px-2.5 py-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_left_10px] number_filed`}
                  onChange={(e) => {
                     const newValue = e.target.value;
                     // Only allow digits (0-9) and empty string
                     if (/^\d*$/.test(newValue)) {
                        handleInputChange?.(propertyName, newValue, rowIndex);
                    }
                  }}
                  onKeyDown={(e) => {
                     // Prevent non-digit input
                     if (!/^\d$/.test(e.key) && e.key !== "Backspace") {
                         e.preventDefault(); // Prevent default action if key is not a digit or Backspace
                     }
                 }}
               />
               {getFieldsErrorMessages(rowIndex, propertyName).map(
                  (message, index) => (
                     <div
                        key={index}
                        className="text-red-500 whitespace-normal"
                     >
                        {message}
                     </div>
                  )
               )}
            </div>
         );
      }

      return (
         <>
            <input
               type={"text"}
               value={value as string}
               name={columnName}
               className={
                  "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
               }
               onChange={(e) =>
                  handleInputChange?.(propertyName, e.target.value, rowIndex)
               }
            />
            {getFieldsErrorMessages(rowIndex, propertyName).map(
               (message, index) => (
                  <div
                     key={index}
                     className="text-red-500 whitespace-normal"
                  >
                     {message}
                  </div>
               )
            )}
         </>
      );
   };

   return (
      <>
         <Modal
            showModal={props.showPopup}
            onClose={handleModalClose}
            width="max-w-5xl bulkEditModal"
         >
            {/* Container for the content */}
            <div id="fullPageContent">
               <div className="rounded-lg bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3
                           className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                           id="modal-title"
                        >
                           Edit Case Information
                        </h3>
                     </div>
                  </div>

                  {/* Display the grid*/}
                  <div className="relative pt-2 writlabor-writofpossession-grid">
                     <Grid
                        columnHeading={visibleColumns}
                        rows={filteredServerLogRecords}
                        handleSelectAllChange={handleSelectAllChange}
                        selectAll={selectAll}
                        showInPopUp={true}
                        cellRenderer={(
                           data: IServerEmailLogItem,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                     ></Grid>
                     <div className="text-center mt-2 text-[#E61818]">
                        {nameMismatchError}
                     </div>
                     <div className="py-2.5 flex justify-between mt-1.5 items-center">
                        <p className="font-semibold text-[10px] md:text-xs">
                           Total records: {selectedServerLogIds.length}
                        </p>
                        <Button
                           handleClick={handleConfirmBulkEdit}
                           title="Save"
                           isRounded={false}
                           type={"button"}
                        ></Button>
                     </div>
                  </div>
                  {columnErrors.some((errors) => Object.keys(errors).length > 0) && (
                     <p className="text-red-500 text-center">
                        Please validate your data
                     </p>
                  )}
               </div>
            </div>
         </Modal>
         {showConfirm && (
            <div>
               <Modal
                  showModal={showConfirm}
                  onClose={handleModalCloseConfirmation}
                  width="max-w-md"
               >
                  {/* Container for the content */}
                  <div id="fullPageContent">
                     <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                        <div className="text-center pr-4 sm:text-left">
                           <h3
                              className="text-sm font-semibold leading-5 text-gray-900"
                              id="modal-title"
                           >
                              Are you sure you want to update the information?
                           </h3>
                        </div>
                     </div>
                     <div className="flex justify-end m-2">
                        <Button
                           type="button"
                           isRounded={false}
                           title="No"
                           handleClick={handleModalClose}
                           disabled={showSpinner}
                           classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                        ></Button>
                        <Button
                           handleClick={() => handleSubmit()}
                           title="Yes"
                           isRounded={false}
                           type={"button"}
                           disabled={showSpinner}
                           classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        ></Button>
                     </div>
                  </div>
               </Modal>
            </div>
         )}
      </>
   );
};

export default EmailQueue_BulkEdit;
