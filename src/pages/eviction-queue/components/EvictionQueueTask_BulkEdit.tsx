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
import { adjustDateSystemTimezone, convertAndFormatDate, convertToEST, convertToUTCISOString, formatZip, toCssClassName } from "utils/helper";
import { PaymentMethodOption, ServiceMethodList, StateCode, TaskActionList, TaskStatusList } from "utils/constants";
import dollarImage from "assets/images/dollar-sign.svg";
import TenantNames from "components/common/generic/TenantNames";
import moment from "moment-timezone";
import { EvictionQueueType } from "./EvictionQueueButtons";

type CasesQueueBulkEditProps = {
   showProcessServerPopup: boolean;
   handleClose: () => void;
   handleCloseConfirm: () => void;
};

const CasesQueue_BulkEdit = (props: CasesQueueBulkEditProps) => {
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
      
   },[evictionQueue1Tasks,evictionQueue2Tasks,evictionQueue3Tasks,evictionQueue4Tasks])

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

   const baseColumns: IGridHeader[] = [
      { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
      { columnName: "caseReferenceId", label: "CaseReferenceId" },
      { columnName: "dateFiled", label: "DateFiled" },
      { columnName: "evictionCourtAmount", label: "CourtTransAmt" },
      { columnName: "evictionPaymentMethod", label: "PaymentMethod" },
      { columnName: "paymentAccount", label: "PaymentAccount" },
   ];
   
   // Conditionally included columns for selectEvictionQueueId === 2
   const GAevictionQueueColumns: IGridHeader[] = [
      { columnName: "actionType", label: "ActionType" },
      { columnName: "status", label: "Status" },
      { columnName: "caseNumber", label: "CaseNo" },     
      { columnName: "envelopeID", label: "EnvelopeID" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "county", label: "County" },
      { columnName: "tenant1Last", label: "Tenant1Last" },
      { columnName: "tenant1First", label: "Tenant1First" },
      { columnName: "tenant1MI", label: "Tenant1MI" },
      { columnName: "tenant2Last", label: "Tenant2Last" },
      { columnName: "tenant2First", label: "Tenant2First" },
      { columnName: "tenant2MI", label: "Tenant2MI" },
      { columnName: "tenant3Last", label: "Tenant3Last" },
      { columnName: "tenant3First", label: "Tenant3First" },
      { columnName: "tenant3MI", label: "Tenant3MI" },
      { columnName: "tenant4Last", label: "Tenant4Last" },
      { columnName: "tenant4First", label: "Tenant4First" },
      { columnName: "tenant4MI", label: "Tenant4MI" },
      { columnName: "tenant5Last", label: "Tenant5Last" },
      { columnName: "tenant5First", label: "Tenant5First" },
      { columnName: "tenant5MI", label: "Tenant5MI" },
      { columnName: "address", label: "Address" },
      { columnName: "unit", label: "Unit" },
      { columnName: "city", label: "City" },
      { columnName: "state", label: "State" },
      { columnName: "zip", label: "Zip" },
      { columnName: "attorneyName", label: "AttorneyName" },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo" },
      { columnName: "eFileMethod", label: "eFileMethod" },    
      { columnName: "evictionServiceDate", label: "EvictionServiceDate" },
      { columnName: "answerBy", label: "EvictionLastDayToAnswer" },
      { columnName: "evictionServiceMethod", label: "EvictionServiceMethod" },
      { columnName: "evictionServedToName", label: "EvictionServedToName" },
      { columnName: "evictionServiceNotes", label: "EvictionServiceNotes" },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "answerDate", label: "AnswerDate" },
      { columnName: "courtDate", label: "CourtDate" },
      // { columnName: "writSignDate", label: "WritSignDate" }
   ];
   const TXevictionQueueColumns: IGridHeader[] = [
      { columnName: "actionType", label: "ActionType" },
      { columnName: "status", label: "Status" },
      { columnName: "caseNumber", label: "CaseNo" },     
      { columnName: "envelopeID", label: "EnvelopeID" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "county", label: "County" },
      { columnName: "tenant1Last", label: "Tenant1Last" },
      { columnName: "tenant1First", label: "Tenant1First" },
      { columnName: "tenant1MI", label: "Tenant1MI" },
      { columnName: "tenant2Last", label: "Tenant2Last" },
      { columnName: "tenant2First", label: "Tenant2First" },
      { columnName: "tenant2MI", label: "Tenant2MI" },
      { columnName: "tenant3Last", label: "Tenant3Last" },
      { columnName: "tenant3First", label: "Tenant3First" },
      { columnName: "tenant3MI", label: "Tenant3MI" },
      { columnName: "tenant4Last", label: "Tenant4Last" },
      { columnName: "tenant4First", label: "Tenant4First" },
      { columnName: "tenant4MI", label: "Tenant4MI" },
      { columnName: "tenant5Last", label: "Tenant5Last" },
      { columnName: "tenant5First", label: "Tenant5First" },
      { columnName: "tenant5MI", label: "Tenant5MI" },
      { columnName: "address", label: "Address" },
      { columnName: "unit", label: "Unit" },
      { columnName: "city", label: "City" },
      { columnName: "state", label: "State" },
      { columnName: "zip", label: "Zip" },
      { columnName: "attorneyName", label: "AttorneyName" },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo" },
      { columnName: "eFileMethod", label: "eFileMethod" },    
      { columnName: "evictionServiceDate", label: "EvictionServiceDate" },
      { columnName: "answerBy", label: "EvictionLastDayToAnswer" },
      { columnName: "evictionServiceMethod", label: "EvictionServiceMethod" },
      { columnName: "evictionServedToName", label: "EvictionServedToName" },
      { columnName: "evictionServiceNotes", label: "EvictionServiceNotes" },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "answerDate", label: "AnswerDate" },
      { columnName: "courtDate", label: "CourtDate" },
      // { columnName: "writSignDate", label: "WritSignDate" }
   ];
   const ManualEvictionQueueColumns: IGridHeader[] = [
      { columnName: "actionType", label: "ActionType" },
      { columnName: "status", label: "Status" },
      { columnName: "caseNumber", label: "CaseNo" },     
      { columnName: "envelopeID", label: "EnvelopeID" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "county", label: "County" },
      { columnName: "tenant1Last", label: "Tenant1Last" },
      { columnName: "tenant1First", label: "Tenant1First" },
      { columnName: "tenant1MI", label: "Tenant1MI" },
      { columnName: "tenant2Last", label: "Tenant2Last" },
      { columnName: "tenant2First", label: "Tenant2First" },
      { columnName: "tenant2MI", label: "Tenant2MI" },
      { columnName: "tenant3Last", label: "Tenant3Last" },
      { columnName: "tenant3First", label: "Tenant3First" },
      { columnName: "tenant3MI", label: "Tenant3MI" },
      { columnName: "tenant4Last", label: "Tenant4Last" },
      { columnName: "tenant4First", label: "Tenant4First" },
      { columnName: "tenant4MI", label: "Tenant4MI" },
      { columnName: "tenant5Last", label: "Tenant5Last" },
      { columnName: "tenant5First", label: "Tenant5First" },
      { columnName: "tenant5MI", label: "Tenant5MI" },
      { columnName: "address", label: "Address" },
      { columnName: "unit", label: "Unit" },
      { columnName: "city", label: "City" },
      { columnName: "state", label: "State" },
      { columnName: "zip", label: "Zip" },
      { columnName: "attorneyName", label: "AttorneyName" },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo" },
      { columnName: "eFileMethod", label: "eFileMethod" },    
      { columnName: "evictionServiceDate", label: "EvictionServiceDate" },
      { columnName: "answerBy", label: "EvictionLastDayToAnswer" },
      { columnName: "evictionServiceMethod", label: "EvictionServiceMethod" },
      { columnName: "evictionServedToName", label: "EvictionServedToName" },
      { columnName: "evictionServiceNotes", label: "EvictionServiceNotes" },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "answerDate", label: "AnswerDate" },
      { columnName: "courtDate", label: "CourtDate" },
      // { columnName: "writSignDate", label: "WritSignDate" }
   ];
   
   const initialColumnMapping: IGridHeader[] = [
      ...baseColumns,
      ...(selectEvictionQueueId === EvictionQueueType.eFileGA ? GAevictionQueueColumns : []),
      ...(selectEvictionQueueId === EvictionQueueType.Manual ? ManualEvictionQueueColumns : []),
      ...(selectEvictionQueueId === EvictionQueueType.eFileTX ? TXevictionQueueColumns : []),
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
         item.caseNumber = item.caseNumber ?? ""
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
  item.dateFiled = convertAndFormatDate(item.dateFiled);
  item.evictionDateFiled = convertAndFormatDate(item.evictionDateFiled);
  item.evictionServiceDate = convertAndFormatDate(item.evictionServiceDate);
  item.answerBy = convertAndFormatDate(item.answerBy);
  item.answerDate = convertAndFormatDate(item.answerDate);
  item.courtDate = convertAndFormatDate(item.courtDate);
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
   
   // const handleInputChange = async (
   //    columnName: string,
   //    updatedValue: string | boolean,
   //    selectedRowIndex: number
   // ) => {
   //    setNameMismatchError(null);
   //    // If any row is selected, perform bulk update
   //    if (selectedFilteredRows[selectedRowIndex]) {
   //       setFilteredRecords((prevRows) =>
   //          prevRows.map((row, rowIndex) => {
   //             if (
   //                selectedFilteredRows[rowIndex] ===
   //                selectedFilteredRows[selectedRowIndex]
   //             ) {
   //                // If the row is selected, update the specified column
   //                const updatedRow = { ...row, [columnName]: updatedValue };
   //                // Perform validation for the updated row
   //                validateRow(updatedRow, rowIndex);
   //                return updatedRow;
   //             } else {
   //                // If the row is not selected, return the original row
   //                return row;
   //             }
   //          })
   //       );
   //    } else {
   //       // If no row is selected, update only the selected row
   //       setFilteredRecords((prevRows) =>
   //          prevRows.map((row, rowIndex) => {
   //             const updatedRow =
   //                rowIndex === selectedRowIndex
   //                   ? { ...row, [columnName]: updatedValue }
   //                   : row;
   //             // Perform validation for the updated row
   //             validateRow(updatedRow, rowIndex);
   //             return updatedRow;
   //          })
   //       );
   //    }
   // };

   const handleInputChange = async (
      columnName: string,
      updatedValue: string | boolean,
      selectedRowIndex: number,
      tenantIndex?: number, // Add tenantIndex to handle tenant name updates
      tenantField?: string  // Add tenantField to specify which tenant field (first/last)
   ) => {
      setNameMismatchError(null);
   
      // Check if the row is selected for bulk update
      if (selectedFilteredRows[selectedRowIndex]) {
         // If bulk update is needed, update all selected rows
         setFilteredRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               if (selectedFilteredRows[rowIndex]) {
                  // Update tenant names if tenantIndex and tenantField are provided
                  if (tenantIndex !== undefined && tenantField) {
                     const updatedTenantNames = [...row.tenantNames]; // Copy the existing tenantNames array
                     updatedTenantNames[tenantIndex] = {
                        ...updatedTenantNames[tenantIndex],
                        [tenantField]: updatedValue, // Update the specific field for the tenant
                     };
                     // Return the updated row with modified tenantNames
                     const updatedRow = { ...row, tenantNames: updatedTenantNames };
                     validateRow(updatedRow, rowIndex);
                     return updatedRow;
                  } else {
                     // If not updating tenantNames, update the specified column for the selected row
                     const updatedRow = { ...row, [columnName]: updatedValue };
                     validateRow(updatedRow, rowIndex);
                     return updatedRow;
                  }
               } else {
                  // If the row is not selected, return the original row
                  return row;
               }
            })
         );
      } else {
         // If no row is selected (individual row update), update only the selected row
         setFilteredRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               if (rowIndex === selectedRowIndex) {
                  if (tenantIndex !== undefined && tenantField) {
                     // Update tenantNames for a single row
                     const updatedTenantNames = [...row.tenantNames];
                     updatedTenantNames[tenantIndex] = {
                        ...updatedTenantNames[tenantIndex],
                        [tenantField]: updatedValue,
                     };
                     const updatedRow = { ...row, tenantNames: updatedTenantNames };
                     validateRow(updatedRow, rowIndex);
                     return updatedRow;
                  } else {
                     // Update the specified column for the individual row
                     const updatedRow = { ...row, [columnName]: updatedValue };
                     validateRow(updatedRow, rowIndex);
                     return updatedRow;
                  }
               }
               return row;
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
               // evictionDateFiled:item.dateFiled!=null?convertToEST(item.dateFiled as Date):null,
               // evictionDateFiled:item.dateFiled!=null? adjustDateSystemTimezone(item.dateFiled as Date):null,
               evictionDateFiled: item.dateFiled != null 
    ? (adjustDateSystemTimezone(item.dateFiled as Date) || null) 
    : null,
    dateFiled: item.dateFiled != null 
    ? (adjustDateSystemTimezone(item.dateFiled as Date) || null) 
    : null,
               evictionCourtAmount: item.evictionCourtAmount ?? "",
               eFileMethod: item.eFileMethod ?? "",
               evictionPaymentMethod: item.evictionPaymentMethod,
               paymentAccount: item.paymentAccount,
               status: item.status,
               envelopeID: item.envelopeID,
               attorneyBarNo: item.attorneyBarNo ?? "",
               caseNumber: item.caseNumber == null ? "" : item.caseNumber,
               actionType: item.actionType,
               // evictionServiceDate: item.evictionServiceDate!=null?adjustDateSystemTimezone(item.evictionServiceDate as Date): null,
               // // evictionServiceDate:item.evictionServiceDate!=null?convertToEST(item.evictionServiceDate as Date):null,
               // answerBy:item.answerBy!=null? adjustDateSystemTimezone(item.answerBy as Date): null,
               // answerDate:item.answerDate!=null? adjustDateSystemTimezone(item.answerDate as Date): null,
               // courtDate:item.courtDate!=null? adjustDateSystemTimezone(item.courtDate as Date):null,

               evictionServiceDate: item.evictionServiceDate != null 
    ? (adjustDateSystemTimezone(item.evictionServiceDate as Date) || null) 
    : null,
answerBy: item.answerBy != null 
    ? (adjustDateSystemTimezone(item.answerBy as Date) || null) 
    : null,
answerDate: item.answerDate != null 
    ? (adjustDateSystemTimezone(item.answerDate as Date) || null) 
    : null,
courtDate: item.courtDate != null 
    ? (adjustDateSystemTimezone(item.courtDate as Date) || null) 
    : null,
               // answerBy:item.answerBy!=null?convertToEST(item.answerBy as Date):null,
               // answerDate:item.answerDate!=null?convertToEST(item.answerDate as Date):null,
               // courtDate:item.courtDate!=null?convertToEST(item.courtDate as Date):null,
               zip: item.zip != null ? formatZip(item.zip) : "", // Format zip to only digits and max 5
               tenantNames : item.tenantNames ?? []

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
            // setBulkRecords(filteredRecords);
            //testing
           // setBulkRecords(filteredRecords);
         //   const updatedBulkRecords = filteredRecords.map((item) => {
         //    // Find the matching status object in TaskStatusList by id
         //    const statusObj = TaskStatusList.find(status => status.id.toString() === item.status);
            
         //    return {
         //      ...item,
         //      // Replace item.status (id) with the status value from TaskStatusList, or keep the id if no match is found
         //      status: statusObj ? statusObj.value : item.status
         //    };
         //  });
        
         //  // Set the bulk records state
         //  setBulkRecords(updatedBulkRecords);
         //  const updatedSelectedEvictionId = updatedBulkRecords
         //  .filter(item => item.status !== "Accepted") // Exclude "Accepted" status records
         //  .map(item => item.id); // Keep only the ids of non-"Accepted" records
      
        // Set the filtered ids to selectedEvictionId
      //   setSelectedEvictionId(updatedSelectedEvictionId);
      setFilteredRecords([]);
            setSelectAll(false);
            setSelectedEvictionId([]);
            setBulkRecords([]);
            setFilteredRecords([]);
         getEvictionQueueTasks(1, 100, selectEvictionQueueId, evictionQueueTasks.actiontype ?? 0,
            evictionQueueTasks.status ?? 0,
            evictionQueueTasks.searchParam,
            evictionQueueTasks.county,
            evictionQueueTasks.company);
         // hide spinner
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
      } finally {
         // setShowSpinner(false);
      }
   };

   const handleModalClose = () => {
       setFilteredRecords([]);
      // setSelectedProcessServerId([]);
      props.handleClose();
   };

   const handleModalCloseConfirmation = () => {
      if (nameMismatchError?.length) {
         setShowConfirm(false);
         // props.handleCloseConfirm();
      } else {
         setShowConfirm(false);
         //setFilteredRecords([]);
         // setSelectedEvictionId([]);
         //props.handleClose();
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
            paymentAccount: "paymentAccount",
            actionType: "actionType"
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
         if (columnName === "status" || columnName === "paymentAccount" || columnName === "actionType") {
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
      if (propertyName == "status") {
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
         caseNumber: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={cellValue}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
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
         status: () => {
            // const selectedOption = TaskStatusList.find(option => option.value === cellValue);
            return (
               <div>
                  {(selectEvictionQueueId == EvictionQueueType.eFileGA || selectEvictionQueueId == EvictionQueueType.eFileTX ) && (
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
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
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
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
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
         attorneyBarNo: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={cellValue}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
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
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
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
         actionType: () => (
            <>
               <div>
                  <DropdownPresentation
                        heading=""
                        selectedOption={
                           {
                              id: cellValue,
                              value: cellValue,
                           } as ISelectOptions
                        }
                        handleSelect={(event) => { handleDropdownChange(event, data.id, rowIndex, "actionType"); handleInputChange?.(propertyName, event.target.value, rowIndex) }}
                        options={TaskActionList}
                        placeholder="Action Type"
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
         // caseReferenceId:()=><span>{cellValue ?? ""}</span>,
         caseReferenceId: () =>
            <>
               <div>
                  <input
                     type={"text"}
                     value={cellValue}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
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
                     //dateFormat="MM/dd/yyyy"
                     dateFormat="MM/dd/yyyy"
                     placeholderText="mm/dd/yyyy"
                     className="bg-calendar bg-no-repeat bg-[center_right_13px] peer placeholder-gray-500 outline-none p-2.5 py-1.5 pr-7 min-w-32 block border w-full border-gray-200 rounded-md text-xs  focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                  />
               </div>
               {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                      <div key={index} className="text-red-500">
                         {error.errorMessage}
                      </div>
                   ))} */}
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
         tenant1Last: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[0]?.lastName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant1Last", e.target.value, rowIndex, 0, "lastName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant1Last"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenant1First: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[0]?.firstName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant1First", e.target.value, rowIndex, 0, "firstName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant1First"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenant1MI: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[0]?.middleName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant1MI", e.target.value, rowIndex, 0, "middleName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant1MI"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenant2Last: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[1]?.lastName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant2Last", e.target.value, rowIndex,1,"lastName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant2Last"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenant2First: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[1]?.firstName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant2First", e.target.value, rowIndex,1,"firstName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant2First"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenant2MI: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[1]?.middleName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant2MI", e.target.value, rowIndex,1,"middleName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant2MI"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenant3Last: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[2]?.lastName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant3Last", e.target.value, rowIndex,2,"lastName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant3Last"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenant3First: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[2]?.firstName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant3First", e.target.value, rowIndex,2,"firstName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant3First"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenant3MI: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[2]?.middleName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant3MI", e.target.value, rowIndex,2,"middleName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant3MI"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),

         tenant4Last: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[3]?.lastName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant4Last", e.target.value, rowIndex,3,"lastName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant4Last"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenant4First: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[3]?.firstName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant4First", e.target.value, rowIndex,3,"firstName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant4First"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenant4MI: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[3]?.middleName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant4MI", e.target.value, rowIndex,3,"middleName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant4MI"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),

         tenant5Last: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[4]?.lastName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant5Last", e.target.value, rowIndex,4,"lastName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant5Last"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenant5First: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[4]?.firstName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant5First", e.target.value, rowIndex,4,"firstName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant5First"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenant5MI: () => (
            <>
               <div>
                  <input
                     type={"text"}
                     value={data.tenantNames?.[4]?.middleName || ""}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.("tenant5MI", e.target.value, rowIndex,4,"middleName")
                     }
                  />
                  {columnErrors[rowIndex]?.["tenant5MI"]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         evictionServiceDate: () => (
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
                     //dateFormat="MM/dd/yyyy"
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
         answerBy: () => (
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
                     //dateFormat="MM/dd/yyyy"
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
         answerDate: () => (
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
                     //dateFormat="MM/dd/yyyy"
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
         courtDate: () => (
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
                     //dateFormat="MM/dd/yyyy"
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
         // writSignDate: () => (
         //    <>
         //       <div className="datePicker">
         //          <DatePicker
         //             selected={
         //                cellValue && Date.parse(cellValue as string)
         //                   ? new Date(cellValue as string)
         //                   : null // new Date()
         //             }
         //             onChange={(date: any) => {
         //                handleInputChange?.(propertyName, date, rowIndex);
         //                handleSetOutCompletedDateChange(date, rowIndex);
         //             }}
         //             //dateFormat="MM/dd/yyyy"
         //             dateFormat="MM/dd/yyyy"
         //             placeholderText="mm/dd/yyyy"
         //             className="bg-calendar bg-no-repeat bg-[center_right_13px] peer placeholder-gray-500 outline-none p-2.5 py-1.5 pr-7 min-w-32 block border w-full border-gray-200 rounded-md text-xs  focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
         //          />
         //       </div>
         //       {getFieldsErrorMessages(rowIndex, columnName).map(
         //          (message, index) => (
         //             <div
         //                key={index}
         //                className="text-red-500 whitespace-normal"
         //             >
         //                {message}
         //             </div>
         //          )
         //       )}
         //    </>
         // ),
         state: () => (
            <>
               <div className="relative text-left max-w-[120px]">
                  <select
                     className={
                        "peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
                     }
                     name="state"
                     value={cellValue}
                     onChange={(e) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                  >
                     {!StateCode.some((state) => state.value === cellValue) && (
                        <option value="" disabled hidden>
                           Select an option
                        </option>
                     )}
                     {/* Set the default selected option from the cellValue */}
                     <option value={cellValue}>{cellValue}</option>

                     {/* Populate other options with the values from StateCode array */}
                     {StateCode.map(
                        (state) =>
                           // Exclude the default selected option
                           state.value !== cellValue && (
                              <option key={state.id} value={state.value}>
                                 {state.value}
                              </option>
                           )
                     )}
                  </select>
                  {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500 whitespace-normal">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         evictionServiceMethod: () => (
            <div>
               {" "}
               <DropdownPresentation
                  heading={""}
                  selectedOption={{ id: cellValue, value: cellValue }}
                  handleSelect={(event) => {
                     handleInputChange?.(propertyName, event.target.value, rowIndex);
                     // handleServiceTypeChange(event, rowIndex, columnName)
                  }}
                  options={ServiceMethodList}
                  placeholder="Select"
               />
               {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                  <div key={index} className="text-red-500">
                     {error.errorMessage}
                  </div>
               ))} */}
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
            </div>
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

export default CasesQueue_BulkEdit;