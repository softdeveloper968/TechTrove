import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import { AxiosError, HttpStatusCode } from "axios";
import DatePicker from "react-datepicker";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import GridCheckbox from "components/formik/GridCheckBox";
import DropdownPresentation from "components/common/dropdown/DropDown";
import { IGridHeader } from "interfaces/grid-interface";
import { IEvictionQueueTaskItem, IEvictionQueueTasks } from "interfaces/eviction-queue.intreface";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import { ISelectOptions } from "interfaces/all-cases.interface";
import { useEvictionQueueContext } from "../EvictionQueueContext";
import "react-datepicker/dist/react-datepicker.css";
import EvictionQueuesService from "services/eviction-queue.service";
import { adjustDateSystemTimezone, convertAndFormatDate, convertToUTCISOString, toCssClassName } from "utils/helper";
import { PaymentMethodOption, TaskStatusList } from "utils/constants";
import dollarImage from "assets/images/dollar-sign.svg";

type CasesQueueBulkEditProps = {
   showProcessServerPopup: boolean;
   handleClose: () => void;
   handleCloseConfirm: () => void;
};

const EvictionQueueTask_BulkEditManual = (props: CasesQueueBulkEditProps) => {
   const {
      showSpinner,
      setShowSpinner,
      setFilteredRecords,
      filteredRecords,
      setSelectedEvictionId,
      selectedEvictionId,
      setSelectedFilteredEvictionId,
      getEvictionQueueTasks,
      selectEvictionQueueId,
      evictionQueue1Tasks,
      evictionQueue2Tasks,
      evictionQueue3Tasks,
      evictionQueue4Tasks,
      bulkRecords,
      setBulkRecords,
   } = useEvictionQueueContext();

   const [evictionQueueTasks,setEvictionQueueTasks]=useState<IEvictionQueueTasks>({
      items: [],
      currentPage: 0,
      pageSize: 0,
      totalCount: 0,
      totalPages: 0,
      actiontype: 0,
      status: 0,
      searchParam: "",
      county: "",
      company: "",
      sortings:[]
  });

  useEffect(()=>{
   switch(selectEvictionQueueId){
      case 1:
         setEvictionQueueTasks(evictionQueue1Tasks)
         break;
         case 2:
         setEvictionQueueTasks(evictionQueue2Tasks)
         break;
         case 3:
         setEvictionQueueTasks(evictionQueue3Tasks)
         break;
         case 4:
         setEvictionQueueTasks(evictionQueue4Tasks)
         break;

   }

  },[evictionQueue1Tasks,evictionQueue2Tasks,evictionQueue3Tasks,evictionQueue4Tasks,]);
   // const initialColumnMapping: IGridHeader[] = [
   //    { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
   //    { columnName: "caseReferenceId", label: "CaseReferenceId" },
   //    { columnName: "evictionPaymentMethod", label: "eFileEvictionPaymentMethod" },
   //    { columnName: "eFileEvictionDatePaid", label: "eFileEvictionDatePaid" },
   //    { columnName: "eFileMethod", label: "eFileMethod" },
   //    { columnName: "evictionCourtAmount", label: "EvictionCourtTransAmount" },
   //    { columnName: "adminNotes", label: "AdminNotes" },
   // ];

   const initialColumnMapping: IGridHeader[] = [
      { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
      { columnName: "caseReferenceId", label: "CaseReferenceId" },
      { columnName:"action", label:"ActionType" },
      { columnName: "eFileMethod", label: "eFileMethod" },
      //{ columnName: "paymentAccount", label: "PaymentAccount" },
      { columnName: "evictionCourtAmount", label: "CourtTransAmt" },
      { columnName: "evictionPaymentMethod", label: "PaymentMethod" },
      { columnName: "dateFiled", label: "DateFiled" },
      { columnName: "adminNotes", label: "AdminNotes" }
   ];

   const validationSchema = yup.object({
      evictionCourtAmount: yup
         .string()
         .test(
            "isCurrency",
            "EvictionCourtAmount must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         )
         // .test(
         //    "maxAmount",
         //    "EvictionCourtAmount must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),
   });

   const [showConfirm, setShowConfirm] = useState<boolean>(false);
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [selectAll, setSelectAll] = useState<boolean>(false);
   // const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
   //   Array(signedWrits.items?.length).fill(false)
   // );
   const [columnErrors, setColumnErrors] = useState<
      Record<string, { rowIndex: number; errorMessage: string }[]>[]
   >([]);
   const [rowErrors, setRowErrors] = useState<IImportCsvRowError[]>([]);
   // const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectFilteredAll, setSelectFilteredAll] = useState<boolean>(false);

   const [selectedFilteredRows, setSelectedFilteredRows] = useState<
      Array<boolean>
   >(Array(filteredRecords?.length).fill(false));

   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [nameMismatchError, setNameMismatchError] = useState<string | null>("");
   const [setOutCompletedDateSelected, setSetOutCompletedDateSelected] = useState<boolean>(false);
   const [newSelectedRows] = useState<boolean[]>([]);

   useEffect(() => {
      setFilteredRecords([]);
      console.log(selectedEvictionId);
      bulkRecords.forEach(item => {
         item.evictionCourtAmount = item.evictionCourtAmount ?? ""
      });
      // const records = bulkRecords.filter((item) =>
      //    selectedEvictionId.includes(item.id || "")
      // );

      // if (selectEvictionQueueId == 2) {
      //     if (!initialColumnMapping.some(x => x.columnName === "status")) {
      //         initialColumnMapping.push({ columnName: "status", label: "Status" });
      //     }
      // } else {
      //      initialColumnMapping.filter(x => x.columnName !== "status");
      // }
      // let uniqueRecords: { [key: string]: any } = {};
      // let records = bulkRecords.filter((item) => {
      //    const id = item.id || "";
      //    if (!selectedEvictionId.includes(id) || uniqueRecords[id]) {
      //       return false;
      //    }
      //    uniqueRecords[id] = true;
      //    return true;
      // });
      // setFilteredRecords(records);
      
      let uniqueRecords: { [key: string]: any } = {};
let records = bulkRecords.filter((item) => {
  const id = item.id || "";
  if (!selectedEvictionId.includes(id) || uniqueRecords[id]) {
    return false;
  }
  uniqueRecords[id] = true;
  return true;
}).map((item) => {
  // Create a deep copy of each item to prevent modification of bulkRecords
  return JSON.parse(JSON.stringify(item));
});

records.forEach(item => {
   item.dateFiled = convertAndFormatDate(item.dateFiled) || null;
   item.evictionDateFiled = convertAndFormatDate(item.evictionDateFiled) || null;
   item.evictionServiceDate = convertAndFormatDate(item.evictionServiceDate) || null;
   item.answerBy = convertAndFormatDate(item.answerBy) || null;
   item.answerDate = convertAndFormatDate(item.answerDate) || null;
   item.courtDate = convertAndFormatDate(item.courtDate) || null;
 });

setFilteredRecords(records);
      setSelectedFilteredRows(Array(filteredRecords?.length).fill(false));
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
      updatedValue: string | boolean,
      selectedRowIndex: number
   ) => {
      setNameMismatchError(null);
      // If any row is selected, perform bulk update
      if (selectedFilteredRows[selectedRowIndex]) {
         setFilteredRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               if (
                  selectedFilteredRows[rowIndex] ===
                  selectedFilteredRows[selectedRowIndex]
               ) {
                  // If the row is selected, update the specified column
                  const updatedRow = { ...row, [columnName]: updatedValue };
                  // Perform validation for the updated row
                  validateRow(updatedRow, rowIndex);
                  return updatedRow;
               } else {
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

   const validateRow = (row: IEvictionQueueTaskItem, rowIndex: number) => {
      const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};
      const fields: IImportCsvFieldError[] = [];
      try {
         // Validate the updated row against the schema
         //validationSchema.validateSync(row, { abortEarly: false });
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
         filteredRecords
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
         const selectedIds = (filteredRecords || [])
            .filter((_, rowIndex) => selectedFilteredRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         setSelectedFilteredEvictionId(selectedIds);
      } else {
         const updatedSelectedRows = [...selectedFilteredRows];
         updatedSelectedRows[index] = checked;
         setSelectedFilteredRows(updatedSelectedRows);
         if (
            filteredRecords.length ===
            updatedSelectedRows.filter((item) => item).length
         ) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }
         const selectedIds = (filteredRecords || [])
            .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         setSelectedFilteredEvictionId(selectedIds);
      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = filteredRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");

      if (checked) {
         setSelectedFilteredEvictionId(allIds);
      } else {
         setSelectedFilteredEvictionId([]);
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

      filteredRecords.forEach((record, index: number) => {
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
         const formattedPayload = filteredRecords.map((item) => {
            return {
               ...item,
               evictionDateFiled: item.dateFiled != null 
    ? adjustDateSystemTimezone(item.dateFiled as string) 
    : null,
               // evictionDateFiled: convertToUTCISOString(item.dateFiled as string),
               evictionCourtAmount: item.evictionCourtAmount,
               eFileMethod: item.eFileMethod,
               evictionPaymentMethod: item.evictionPaymentMethod,
               status: item.status,
               envelopeID: item.envelopeID,
               adminNotes: item.adminNotes
            }
         });
         
         const response = await EvictionQueuesService.editEviction(
            formattedPayload
         );
         if (response.status === HttpStatusCode.Ok) {
            setShowSpinner(false);
            // Display a success toast message
            toast.success("Case info successfully updated.");
            // Close the popup
            // setFilteredRecords([]);
            // setBulkRecords(filteredRecords);
            setFilteredRecords([]);
            setSelectAll(false);
            setSelectedEvictionId([]);
            setBulkRecords([]);
            // setBulkRecords(filteredRecords);
            // hide spinner
            setShowSpinner(false);
            // setSelectAll(false);
            // setSelectedProcessServerId([]);
            props.handleClose();
         } else {
            setShowSpinner(false);
            const error = response as unknown as AxiosError<any>;
            if (error && error.response) {
               const { data } = error.response
               // setFilteredRecords([]);
               // setSelectAll(false);
               // setSelectedEvictionId([]);
               toast.error("Failed to update case info.");
               props.handleClose();
            }
         }
         // if (response.status === HttpStatusCode.Ok) {
         //    setShowSpinner(false);
         //    // Display a success toast message
         //    toast.success("Case info successfully updated.");
         //    // Close the popup
         //    // setFilteredRecords([]);
         //    // setBulkRecords(filteredRecords);
         //    setFilteredRecords([]);
         //    setSelectAll(false);
         //    setSelectedEvictionId([]);
         //    setBulkRecords([]);
         //    // setSelectAll(false);
         //    // setSelectedProcessServerId([]);
         //    props.handleClose();
         // } else {
         //    setShowSpinner(false);
         //    const error = response as unknown as AxiosError<any>;
         //    if (error && error.response) {
         //       const { data } = error.response
         //       setFilteredRecords([]);
         //       setSelectAll(false);
         //       setSelectedEvictionId([]);
         //       toast.error("Failed to update case info.");
         //       props.handleClose();
         //    }
         // }
      } finally {
         // getEvictionQueueTasks(1, 100, selectEvictionQueueId, evictionQueueTasks.actiontype ?? 0,
         //     evictionQueueTasks.status ?? 0,
         //     evictionQueueTasks.searchParam,
         //     evictionQueueTasks.county,
         //     evictionQueueTasks.company);
         // setFilteredRecords([]);
         getEvictionQueueTasks(1, 100, selectEvictionQueueId, evictionQueueTasks.actiontype ?? 0,
            evictionQueueTasks.status ?? 0,
            evictionQueueTasks.searchParam,
            evictionQueueTasks.county,
            evictionQueueTasks.company);
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
         setFilteredRecords([]);
         setSelectedEvictionId([]);
         props.handleClose();
      }
   };

   const resetValuesOnReasonChange = (rowIndex: number, selectedOption: string, columnName: string) => {
      const updatedGridData = filteredRecords.map((record, index) => {
         if (index === rowIndex) {
            return {
               ...record,
               [columnName]: selectedOption,
            };
         }
         return record;
      });

      setFilteredRecords(updatedGridData);
   };

   const handleDropdownChange = (
      event: React.ChangeEvent<HTMLSelectElement>,
      rowId: string | undefined | null,
      rowIndex: number,
      dropdownType: string  // Add dropdownType as a parameter
   ) => {

      try {
         setShowSpinner(true);
         const selectedOption = event.target.value as string;

         // Map dropdownType to the corresponding column name
         const columnNameMap: Record<string, string> = {
            status: "status",
            paymentAccount: "paymentAccount"
            // Add other dropdown types as needed
         };

         const columnName = columnNameMap[dropdownType];

         // Update only the specific row where the dropdown is changed
         const updatedGridData = filteredRecords.map((record, index) => {
            if (record.id === rowId) {
               return {
                  ...record,
                  [columnName]: selectedOption, // Update selectedReason for this row
               };
            }
            return record;
         });

         setFilteredRecords(updatedGridData);

         // Reset values for specific fields if the status is changed
         if (columnName === "status" || columnName === "paymentAccount") {
            resetValuesOnReasonChange(rowIndex, selectedOption, columnName);
         };


         // Perform validation for the updated row
         validateRow(updatedGridData[rowIndex], rowIndex);

      } catch (error) {
         toast.error("Something went wrong");
      } finally {
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
      data: IEvictionQueueTaskItem,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      var cellValue = (data as any)[propertyName];
      if (propertyName === "status") {
         if (TaskStatusList.some(x => x.value === cellValue))
            cellValue = TaskStatusList.find(option => option.value === cellValue)?.id;
      }
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
         caseNumber: () => <span>{cellValue ?? ""}</span>,
         status: () => {
            // const selectedOption = TaskStatusList.find(option => option.value === cellValue);
            return (
               <div>
                  {selectEvictionQueueId == 2 && (
                     <DropdownPresentation
                        heading=""
                        selectedOption={
                           {
                              id: cellValue,
                              value: cellValue,
                           } as ISelectOptions
                        }
                        handleSelect={(event) => { handleDropdownChange(event, data.id, rowIndex, "status"); handleInputChange?.(propertyName, event.target.value, rowIndex) }}
                        options={TaskStatusList.filter(x => x.value != "Error")}
                        placeholder="Status"
                     />
                  )}
               </div>
            );
         },
         envelopeID: () => (
            //   <div className="relative">
            //      <FormikControl
            //         control="input"
            //         type="number"
            //         label={"EvictionEnvelopeID"}
            //         name={"evictionEnvelopeID"}
            //         placeholder={"Enter EvictionEnvelopeID"}
            //      />
            //   </div>
            <>
               <div>
                  <input
                     type={"number"}
                     value={cellValue}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]`}
                     onChange={(e) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                  />
                  {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         eFileMethod: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={cellValue}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]`}
                     onChange={(e) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                  />
                  {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         evictionPaymentMethod: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={cellValue}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]`}
                     onChange={(e) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                  />
                  {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         action: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={cellValue}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]`}
                     disabled={true}
                  />
               </div>
            </>
         ),
         paymentAccount: () => (
            <>
               <DropdownPresentation
                  heading=""
                  selectedOption={
                     {
                        id: cellValue,
                        value: cellValue,
                     } as ISelectOptions
                  }
                  handleSelect={(event) => { handleDropdownChange(event, data.id, rowIndex, "paymentAccount"); handleInputChange?.(propertyName, event.target.value, rowIndex) }}
                  options={PaymentMethodOption}
                  placeholder="paymentAccount"
               />
            </>
         ),
         caseReferenceId: () =>
            <>
               <div>
                  <input
                     type={"text"}
                     value={cellValue}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]`}
                     onChange={(e) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     disabled={true}
                  />
                  {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>,
         evictionCourtAmount: () => (
            <>
               <div>
                  <input
                     type={"number"}
                     value={cellValue}
                     className={`peer outline-none p-2.5 py-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_left_12px] !pl-8`}
                     onChange={(e) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     style={{
                        backgroundImage: `url(${dollarImage})`,
                     }}
                  />
                  {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         dateFiled: () => (
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
                        handleSetOutCompletedDateChange(date, rowIndex);
                     }}
                     dateFormat="MM/dd/yyyy"
                     placeholderText="mm/dd/yyyy"
                     className="bg-calendar bg-no-repeat bg-[center_right_13px] peer placeholder-gray-500 outline-none p-2.5 py-1.5 pr-7 min-w-32 block border w-full border-gray-200 rounded-md text-xs  focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
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
      fieldName: any,
      rowIndex: number,
   ) => {
      return (
         <>
            <input
               type={"text"}
               value={value as string}
               name={columnName}
               className={
                  "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
               }
               onChange={(e) =>
                  handleInputChange?.(fieldName, e.target.value, rowIndex)
               }
            />
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
      );
   };

   return (
      <>
         <Modal
            showModal={props.showProcessServerPopup}
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
                           Edit Case Details
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
                           data: IEvictionQueueTaskItem,
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
                           Total records: {selectedEvictionId.length}
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
                              Are you sure you want to update?
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

export default EvictionQueueTask_BulkEditManual;