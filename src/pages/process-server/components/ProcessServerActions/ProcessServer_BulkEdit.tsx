import React, { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { AxiosError, HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useProcessServerContext } from "pages/process-server/ProcessServerContext";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import GridCheckbox from "components/formik/GridCheckBox";
import DropdownPresentation from "components/common/dropdown/DropDown";
import { IGridHeader } from "interfaces/grid-interface";
import { IProcessServerCaseInfoItem, ITypeValidateResource, TypeValidateResponse } from "interfaces/process-server.interface";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import ProcessServerService from "services/process-server.service";
import { FilingType, ServiceMethod } from "utils/enum";
import { FilingTypeList, ServiceMethodList } from "utils/constants";
import { adjustDateSystemTimezone, adjustDateToSystemTimezone, convertAndFormatDate, convertToEasternISOString, convertToUTCISOString, convertUtcToEst, normalizeDate, toCssClassName } from "utils/helper";
import vm from "utils/validationMessages";
import { ISelectOptions } from "interfaces/all-cases.interface";

type ProcessServerBulkEditProps = {
   showProcessServerPopup: boolean;
   handleClose: () => void;
   handleCloseConfirm: () => void;
};

const validationSchema = yup.object({
   caseNumber: yup
      .string()
      .required("Case number is required"),
   serviceMethod: yup.string().required("Service Type is required"),
   // personServed: yup.string().when("serviceMethod", {
   //    is: (val: string) =>
   //       val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
   //    then(schema) {
   //       return schema.required("This is a required field");
   //    },
   //    otherwise(schema) {
   //       return schema.optional();
   //    },
   // }),
   height: yup.string().when("serviceMethod", {
      is: (val: string) =>
         val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
      then(schema) {
         return schema.required("Height is required");
      },
      otherwise(schema) {
         return schema.optional();
      },
   }),
   weight: yup.string().when("serviceMethod", {
      is: (val: string) =>
         val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
      then(schema) {
         return schema.required("Weight is required");
      },
      otherwise(schema) {
         return schema.optional();
      },
   }),
   age: yup.string().when("serviceMethod", {
      is: (val: string) =>
         val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
      then(schema) {
         return schema.required("Age is required");
      },
      otherwise(schema) {
         return schema.optional();
      },
   }),
   serviceNotes: yup.string().when("serviceMethod", {
      is: ServiceMethod.NON_EST,
      then(schema) {
         return schema.required("Service notes is required");
      },
      otherwise(schema) {
         return schema.optional();
      },
   }),
   serverEmail: yup.string().nullable().email(vm.email.email)
});

const initialColumnMapping: IGridHeader[] = [
   { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
   { columnName: "caseNumber", label: "CaseNo" },
   { columnName: "serverEmail", label: "ProcessServerEmail" },
   { columnName: "serviceMethod", label: "EvictionServiceMethod" },
   { columnName: "personServed", label: "PersonServed" },
   { columnName: "height", label: "Height" },
   { columnName: "weight", label: "Weight" },
   { columnName: "age", label: "Age" },
   { columnName: "serverName", label: "ServerName" },
   { columnName: "serviceNotes", label: "ServiceNotes" },
   { columnName: "serviceDate", label: "EvictionServiceDate" },
   { columnName: "dateScanned", label: "DateScanned" },
   { columnName: "locationCoord", label: "Location Coord" },
   { columnName: "comments", label: "ServiceComments" },
   { columnName: "filingType", label: "FilingType" },
];

const ProcessServer_BulkEdit = (props: ProcessServerBulkEditProps) => {
   const {
      showSpinner,
      setShowSpinner,
      setFilteredRecords,
      filteredRecords,
      setSelectedProcessServerId,
      selectedProcessServerId,
      setSelectedFilteredProcessServerId,
      getProcessServerCases,
      processServerCases,
      bulkRecords,
      setBulkRecords
   } = useProcessServerContext();

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
   const [isFilingOptionsUpdated, setIsFilingOptionsUpdated] = useState(true);
   useEffect(() => {      
      setShowSpinner(true);
      // const records = bulkRecords.filter((item) =>
      //    selectedProcessServerId.includes(item.id || "")
      // );
      let uniqueRecords: { [key: string]: any } = {};
      let records = bulkRecords.filter((item) => {
         const id = item.id || "";
         if (!selectedProcessServerId.includes(id) || uniqueRecords[id]) {
            return false;
         }
         uniqueRecords[id] = true;
         return true;
      }).map((item) => {
         // Create a deep copy of each item to prevent modification of bulkRecords
         return JSON.parse(JSON.stringify(item));
      });

      records.forEach(item => {
         item.serviceDate = convertAndFormatDate(item.serviceDate);
         item.dateScanned = convertAndFormatDate(item.dateScanned);
         item.filingType = item.filingType.split("_")[0];
      });
      handleGetFilingTypeOptions(records);
      //setFilteredRecords(records);
      setSelectedFilteredRows(Array(filteredRecords?.length).fill(false));
      setSelectFilteredAll(false); 
      setIsFilingOptionsUpdated(true);  
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

   // Update handleInputChange to use the validateField function
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

   const validateRow = (row: IProcessServerCaseInfoItem, rowIndex: number) => {
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
         setSelectedFilteredProcessServerId(selectedIds);
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

         setSelectedFilteredProcessServerId(selectedIds);
      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = filteredRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         setSelectedFilteredProcessServerId(allIds);
      } else {
         setSelectedFilteredProcessServerId([]);
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

   const handleConfirmBulkEdit = async () => {
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
         handleSubmit()
         // setShowConfirm(true);
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
      console.log(errorMessages)
      return errorMessages;
   };

   const checkValidation = async (data: TypeValidateResponse[]) => {
      const errors: Record<string, { rowIndex: number; errorMessage: string }[]>[] = [];
      const rowErrors: IImportCsvRowError[] = [];
      const eviction = FilingType.Eviction;
      let totalError = 0;

      filteredRecords.forEach((record, index: number) => {
         const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};
         const fields: IImportCsvFieldError[] = [];
         data.forEach(x => {
            x.serviceDate = convertUtcToEst(x.serviceDate.toLocaleString()).date
         });
         // Step 1: Find the corresponding caseNumber in the data
         const caseNumber = record.caseNumber;
         const matchingData = data.find((item) => item.caseNumber.trim().toLowerCase() === caseNumber.trim().toLowerCase() && item.serverName.toLowerCase() === record.serverName.toLowerCase()
            && item.serviceMethod.toLowerCase() === record.serviceMethod.toLowerCase() && normalizeDate(item.serviceDate) === normalizeDate(record.serviceDate));

         // Step 2: If a matching caseNumber is found, validate the FilingType
         if (matchingData) {
            // Scenario 1: If matchingData.filingType not exists(no AOS), check for taskStatus
            if (matchingData.filingType && matchingData.filingType.length == 0) {
               //if not entered filing type in import
               if (matchingData.selectedFilingType == null || matchingData.selectedFilingType == "") {
                  if (matchingData.taskStatus && matchingData.taskStatus.length === 1) {
                     // If there is only one status, set the FilingType to that value
                     const statusValue = matchingData.taskStatus[0];
                     record.filingType = statusValue;

                  } else if (matchingData.taskStatus && matchingData.taskStatus.length > 1) {
                     // Scenario 3: If there are two statuses, check both against FilingTypeList
                     const matchingStatuses = matchingData.taskStatus.filter((status: string) =>
                        FilingTypeList.some((item) => item.value === status)
                     );

                     if (matchingStatuses.length === 2) {
                     } else if (matchingStatuses.length === 1) {
                        // If only one status matches, set FilingType to that value
                        const matchedStatus = matchingStatuses[0];
                        record.filingType = matchedStatus;

                     }
                  }
               }
               //if filing type entered for this case in import
               if (matchingData.selectedFilingType != null && matchingData.selectedFilingType != "") {
                  const selectedFilingType = matchingData.selectedFilingType;

                  // Scenario 1: If there is only one status in matchingData.status
                  if (matchingData.taskStatus && matchingData.taskStatus.length === 1) {
                     const taskStatus = matchingData.taskStatus[0];

                     // Check if the selectedFilingType matches the taskStatus
                     if (taskStatus !== selectedFilingType) {
                        const errorMessage = `Filing Type mismatch Expected: ${taskStatus}, but found: ${selectedFilingType}.`;
                        fields.push({
                           fieldName: "FilingType",
                           message: errorMessage,
                        });
                        totalError++;

                     }
                  }
                  // Scenario 2: If there are two statuses in matchingData.status
                  else if (matchingData.taskStatus && matchingData.taskStatus.length > 1) {
                     const taskStatuses = matchingData.taskStatus;

                     // Check if both statuses match any in FilingTypeList
                     const matchingStatuses = taskStatuses.filter((status: string) =>
                        FilingTypeList.some((item) => item.value === status)
                     );

                     // If both statuses match FilingTypeList, do nothing
                     if (matchingStatuses.length === 2) {
                        // No action needed, both statuses match
                     } else if (matchingStatuses.length === 1) {
                        // If only one status matches, check if the selectedFilingType matches
                        const matchedStatus = matchingStatuses[0];

                        if (matchedStatus !== selectedFilingType) {
                           const errorMessage = `Filing Type mismatch Expected: ${matchedStatus}, but found: ${selectedFilingType}.`;
                           fields.push({
                              fieldName: "FilingType",
                              message: errorMessage,
                           });
                           totalError++;

                           if (!recordErrors["FilingType"]) {
                              recordErrors["FilingType"] = [];
                           }
                           recordErrors["FilingType"].push({
                              rowIndex: index,
                              errorMessage: errorMessage,
                           });
                        }
                     }
                  }
               }
            }
            // Scenario 1: If case is imported already
            else if (matchingData.filingType && matchingData.filingType.length > 0) {
               //if not entered filing type in import
               if (matchingData.selectedFilingType == null || matchingData.selectedFilingType === "") {
                  if (matchingData.taskStatus && matchingData.taskStatus.length === 1) {
                     // If there is only one taskStatus "Eviction" filing                
                     // Check if Eviction AOS document is signed (not in unsignedFilingType) then set
                     if (matchingData.unsignedFilingType.includes("File Eviction") === false) {
                        const statusValue = matchingData.taskStatus[0];
                        record.filingType = statusValue;
                     } else {
                        // If the Eviction AOS document is not signed and is in unsignedFilingType
                        const errorMessage = `Already exists. Cannot import this case.`;
                        fields.push({
                           fieldName: "FilingType",
                           message: errorMessage,
                        });
                        totalError++;
                     }
                  } else if (matchingData.taskStatus && matchingData.taskStatus.length > 1) {
                     const matchingStatuses = matchingData.taskStatus.filter((status) =>
                        FilingTypeList.some((item) => item.value === status)
                     );

                     if (matchingStatuses.length === 2) {
                        // Both statuses are present, need to check the if signed
                        const isEvictionSigned = matchingData.unsignedFilingType.includes("File Eviction") === false;
                        const isAmendmentSigned = matchingData.unsignedFilingType.includes("Amendments") === false;
                        if (isEvictionSigned && !isAmendmentSigned) {
                           //If Eviction is signed and Amendment not then set Eviction by dafault
                           record.filingType = "File Eviction";
                        }
                        else if (!isEvictionSigned && isAmendmentSigned) {
                           //If Amendment is signed and Eviction not then set Amendment by default
                           record.filingType = "Amendments";
                        }
                        else if (isEvictionSigned && isAmendmentSigned) {
                           //if both Eviction and Amendment signed then validation need to select
                           // const errorMessage = `Please select a FilingType.`;
                           // fields.push({
                           //    fieldName: "FilingType",
                           //    message: errorMessage,
                           // });
                           // totalError++;
                        }
                        else if (!isEvictionSigned && !isAmendmentSigned) {
                           //If both are unsigned cannot be imported
                           const errorMessage = `Already exists for both type. Cannot import this case.`;
                           fields.push({
                              fieldName: "FilingType",
                              message: errorMessage,
                           });
                           totalError++;
                        }

                     } else if (matchingStatuses.length === 1) {
                        // If only one status matches, that can be File Eviction only
                        //Check if unsigned document is there or not
                        if (matchingData.unsignedFilingType.includes("File Eviction") === false) {
                           const matchedStatus = matchingStatuses[0];
                           record.filingType = matchedStatus;
                        } else {
                           // If the Eviction AOS document is not signed and is in unsignedFilingType
                           const errorMessage = `Already exists. Cannot import this case.`;
                           fields.push({
                              fieldName: "FilingType",
                              message: errorMessage,
                           });
                           totalError++;
                        }
                     }
                  }
               }
               //if filing type entered for this case in import
               if (matchingData.selectedFilingType != null && matchingData.selectedFilingType != "") {
                  const selectedFilingType = matchingData.selectedFilingType;

                  // Scenario 1: If there is only one action performed Eviction filed
                  if (matchingData.taskStatus && matchingData.taskStatus.length === 1) {
                     const taskStatus = matchingData.taskStatus[0];

                     // Check if the selectedFilingType matches the taskStatus if not mismatch error
                     if (taskStatus !== selectedFilingType) {
                        //again check if document is signed or not if unsigned cannot be imported again
                        if (matchingData.unsignedFilingType.includes("File Eviction")) {
                           const errorMessage = `Already exists. Cannot import this case.`;
                           fields.push({
                              fieldName: "FilingType",
                              message: errorMessage,
                           });
                           totalError++;
                        } else {
                           const errorMessage = `Filing Type mismatch Expected: ${taskStatus}, but found: ${selectedFilingType}.`;
                           fields.push({
                              fieldName: "FilingType",
                              message: errorMessage,
                           });
                           totalError++;
                           // if (!recordErrors["FilingType"]) {
                           //    recordErrors["FilingType"] = [];
                           // }
                           // recordErrors["FilingType"].push({
                           //    rowIndex: index,
                           //    errorMessage: errorMessage,
                           // });
                        }
                     }
                     else if (taskStatus === selectedFilingType) {
                        // Check if Eviction AOS document is unsigned then error
                        if (matchingData.unsignedFilingType.includes("File Eviction")) {
                           const errorMessage = `Already exists. Cannot import this case.`;
                           fields.push({
                              fieldName: "FilingType",
                              message: errorMessage,
                           });
                           totalError++;
                        } else {
                           // do nothing as can be reimported for File Eviction
                        }
                     }
                  }
                  // Scenario 2: If there are two statuses in matchingData.status
                  else if (matchingData.taskStatus && matchingData.taskStatus.length > 1) {
                     const taskStatuses = matchingData.taskStatus;

                     // Check if both statuses match any in FilingTypeList
                     const matchingStatuses = taskStatuses.filter((status: string) =>
                        FilingTypeList.some((item) => item.value === status)
                     );

                     // If both statuses match FilingTypeList, do nothing
                     if (matchingStatuses.length === 2) {
                        // Both statuses are present, need to check the if signed
                        const isEvictionSigned = matchingData.unsignedFilingType.includes("File Eviction") === false;
                        const isAmendmentSigned = matchingData.unsignedFilingType.includes("Amendments") === false;
                        if (!isEvictionSigned && !isAmendmentSigned) {
                           //If both are unsigned cannot be imported
                           const errorMessage = `Already exists for both type. Cannot import this case.`;
                           fields.push({
                              fieldName: "FilingType",
                              message: errorMessage,
                           });
                           totalError++;
                        }
                        else if (isEvictionSigned && !isAmendmentSigned) {
                           //If Eviction is signed and Amendment not 
                           //if not mismatch error here otherwise correct
                           if (selectedFilingType != "File Eviction") {
                              const errorMessage = `Filing Type mismatch Expected: ${"FileEviction"}, but found: ${selectedFilingType}.`;
                              fields.push({
                                 fieldName: "FilingType",
                                 message: errorMessage,
                              });
                              totalError++;
                           }
                        }
                        else if (!isEvictionSigned && isAmendmentSigned) {
                           //If Amendment is signed and Eviction not 
                           //if not mismatch error here otherwise correct
                           if (selectedFilingType != "Amendments") {
                              const errorMessage = `Filing Type mismatch Expected: ${"Amendments"}, but found: ${selectedFilingType}.`;
                              fields.push({
                                 fieldName: "FilingType",
                                 message: errorMessage,
                              });
                              totalError++;
                           }
                        }
                        else if (isEvictionSigned && isAmendmentSigned) {
                           //if both Eviction and Amendment signed then selected is correct
                        }
                     } else if (matchingStatuses.length === 1) {
                        // If only one status matches, check if the selectedFilingType matches
                        const matchedStatus = matchingStatuses[0];

                        if (matchedStatus !== selectedFilingType) {
                           if (matchingData.unsignedFilingType.includes("File Eviction")) {
                              const errorMessage = `Already exists. Cannot import this case.`;
                              fields.push({
                                 fieldName: "FilingType",
                                 message: errorMessage,
                              });
                              totalError++;
                           } else {
                              const errorMessage = `Filing Type mismatch Expected: ${matchedStatus}, but found: ${selectedFilingType}.`;
                              fields.push({
                                 fieldName: "FilingType",
                                 message: errorMessage,
                              });
                              totalError++;
                              // if (!recordErrors["FilingType"]) {
                              //    recordErrors["FilingType"] = [];
                              // }
                              // recordErrors["FilingType"].push({
                              //    rowIndex: index,
                              //    errorMessage: errorMessage,
                              // });
                           }
                        }
                        else if (matchedStatus === selectedFilingType) {
                           // Check if Eviction AOS document is unsigned then error
                           if (matchingData.unsignedFilingType.includes("File Eviction")) {
                              const errorMessage = `Already exists. Cannot import this case.`;
                              fields.push({
                                 fieldName: "FilingType",
                                 message: errorMessage,
                              });
                              totalError++;
                           } else {
                              // do nothing as can be reimported for File Eviction
                           }
                        }
                     }
                  }
               }
            }
         }

         // Collect errors for this record
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
      return totalError
   };

   const getTypeValidation = async () => {
      try {
         // setToggleSpinner(true);
         const formattedPayload = filteredRecords.map((item) => {
            return {
               ...item,
               serviceDate: adjustDateSystemTimezone(item.serviceDate as string),
               dateScanned: adjustDateSystemTimezone(item.dateScanned as string),
               personServed: (item.serviceMethod === ServiceMethod.PERSONALLY || item.serviceMethod === ServiceMethod.NOTORIOUSLY) ? item.personServed : "",
               weight: (item.serviceMethod === ServiceMethod.PERSONALLY || item.serviceMethod === ServiceMethod.NOTORIOUSLY) ? item.weight : "",
               height: (item.serviceMethod === ServiceMethod.PERSONALLY || item.serviceMethod === ServiceMethod.NOTORIOUSLY) ? item.height : "",
               age: (item.serviceMethod === ServiceMethod.PERSONALLY || item.serviceMethod === ServiceMethod.NOTORIOUSLY) ? item.age : "",
            }
         });
         // const formattedData = formatDataForServerCaseInfo(gridData);
         const request: ITypeValidateResource[] = formattedPayload.map((dataItem) => ({
            caseNumber: dataItem.caseNumber ?? "",
            filingType: dataItem.filingType ?? "",
            serviceMethod: dataItem.serviceMethod,
            serviceDate: dataItem.serviceDate,
            serverName: dataItem.serverName,
         }));

         const response = await ProcessServerService.validateProcessServerCaseType(request);
         return response;
      } catch (error) {
         console.error("An error occurred:", error);
      } finally {
         // setToggleSpinner(false);
      }
   };

   const handleSubmit = async () => {
      setNameMismatchError(null);
      try {
         setShowSpinner(true);
         const formattedPayload = filteredRecords.map((item) => {
            return {
               ...item,
               serviceDate: adjustDateSystemTimezone(item.serviceDate as string),
               dateScanned: adjustDateSystemTimezone(item.dateScanned as string),
               personServed: (item.serviceMethod === ServiceMethod.PERSONALLY || item.serviceMethod === ServiceMethod.NOTORIOUSLY) ? item.personServed : "",
               weight: (item.serviceMethod === ServiceMethod.PERSONALLY || item.serviceMethod === ServiceMethod.NOTORIOUSLY) ? item.weight : "",
               height: (item.serviceMethod === ServiceMethod.PERSONALLY || item.serviceMethod === ServiceMethod.NOTORIOUSLY) ? item.height : "",
               age: (item.serviceMethod === ServiceMethod.PERSONALLY || item.serviceMethod === ServiceMethod.NOTORIOUSLY) ? item.age : "",
            }
         });

         const response = await ProcessServerService.editProcessServerCaseInfoBulk(
            formattedPayload
         );
         if (response.status === HttpStatusCode.Ok) {
            setShowSpinner(false);
            // Display a success toast message
            toast.success("Process server case info successfully updated.");
            // Close the popup
            setFilteredRecords([]);
            setSelectAll(false);
            setSelectedProcessServerId([]);
            setBulkRecords([]);
            // setBulkRecords(filteredRecords);
            // setSelectAll(false);
            // setSelectedProcessServerId([]);
            props.handleClose();
         } else {
            setShowSpinner(false);
            const error = response as unknown as AxiosError<any>;
            if (error && error.response) {
               const { data } = error.response;
               if (
                  data.message.includes(
                     "The person served does not match to the tenant names associated with case number"
                  )
               )
                  setNameMismatchError(data.message);
               setShowConfirm(false);
               // props.handleCloseConfirm();
            } else {
               setFilteredRecords([]);
               setSelectAll(false);
               setSelectedProcessServerId([]);
               toast.error("Failed to update Process server case info.");
               props.handleClose();
            }
         }
      } finally {
         // getProcessServerCases(1, 10);
         getProcessServerCases(
            1,
            100,
            processServerCases.searchParam,
            processServerCases.serverName,
            processServerCases.serviceMethod,
            processServerCases.dateRange
         );
         setShowSpinner(false);
      }
   };

   const handleModalClose = () => {
      //setFilteredRecords([]);
      //setBulkRecords([]);
      props.handleClose();
   };

   const handleModalCloseConfirmation = () => {
      if (nameMismatchError?.length) {
         setShowConfirm(false);
         // props.handleCloseConfirm();
      } else {
         setFilteredRecords([]);
         setSelectedProcessServerId([]);
         props.handleClose();
      }
   };

   const handleGetFilingTypeOptions = async (filteredRecords:IProcessServerCaseInfoItem[]) => {
      try {
         setIsFilingOptionsUpdated(false);
        const response = await ProcessServerService.getAmendmentVersionByDispoId(
          filteredRecords.map((record) => record.caseNumber)
        );
        
        const updatedRecords = filteredRecords.map((record) => {
          // Get responses matching the current record's dispoId
          const matchingResponses = response.filter(
            (item: IProcessServerCaseInfoItem) =>
              item.caseNumber.toLowerCase().trim() === record.caseNumber.toLowerCase().trim()
          );
    
          // Generate the amendment options
          const amendmentOptions: ISelectOptions[] = (() => {
            if (matchingResponses.length === 0) return [];
    
            // Find the maximum version
            const maxVersion = Math.max(
              ...matchingResponses.map((item: any) => Number(item.dispoVersion))
            );
    
            // Create an array for versions
            return Array.from({ length: maxVersion + 1 }, (_, index) => ({
              id: `Amendment${index !== 0 ? index + 1 : ""}`,
              value: `Amendment${index !== 0 ? index + 1 : ""}`,
            }));
          })();    
          // Explicitly order options with "Eviction" first
          const filingTypeOptions: ISelectOptions[] = [
            { id: "Eviction", value: "Eviction" }, // Add "Eviction" first
            ...amendmentOptions, // Append all amendments
          ];
    
          return {
            ...record,
            filingTypeOptions,
          };
        });
    
        // Update the state with reordered records
        setFilteredRecords(updatedRecords);
    
        // Debug: Log the final records
        setShowSpinner(false);
      } catch (error) {
        console.error("Error fetching filing type options:", error);
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
      data: IProcessServerCaseInfoItem,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const isServiceTypePersonalOrNotorious =
         data.serviceMethod === ServiceMethod.PERSONALLY ||
         data.serviceMethod === ServiceMethod.NOTORIOUSLY;

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
         serviceMethod: () => (
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
         dateScanned: () => (
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
                     className="bg-calendar bg-no-repeat bg-[center_right_11px] peer placeholder-gray-500 outline-none p-1.5 pr-7 min-w-28 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
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
         serviceDate: () => (
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
                     className="bg-calendar bg-no-repeat bg-[center_right_11px] peer placeholder-gray-500 outline-none p-1.5 pr-7 min-w-28 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
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
         // filingType: () => (
         //    <div>
         //       {" "}
         //       <DropdownPresentation
         //          heading={""}
         //          selectedOption={{ id: cellValue, value: cellValue }}
         //          handleSelect={(event) => {
         //             handleInputChange?.(propertyName, event.target.value, rowIndex);
         //             // handleServiceTypeChange(event, rowIndex, columnName)
         //          }}
         //          options={FilingTypeList}
         //          placeholder="Select"
         //       />
         //       {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
         //          <div key={index} className="text-red-500">
         //             {error.errorMessage}
         //          </div>
         //       ))} */}
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
         //    </div>
         // ),

         // filingType: () => (
         //    <div>
         //       <input
         //          type={"text"}
         //          name={columnName}
         //          value={cellValue}
         //          className={
         //             "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
         //          }
         //          onChange={(e) =>
         //             handleInputChange?.(propertyName, e.target.value, rowIndex)
         //          }
         //          disabled={!isServiceTypePersonalOrNotorious}
         //       />
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
         //    </div>
         // ),
         filingType: () => (
            <div>
               {" "}
               <DropdownPresentation
                  heading={""}
                  selectedOption={{id:cellValue,value:cellValue}}
                  handleSelect={(event) => {
                     // 
                     // data.selectedFilingOption={id:event.target.value,value:event.target.value};
                     // data.filingType=event.target.value;
                     handleInputChange?.(propertyName, event.target.value, rowIndex)
                  }}
                 // handleClick={handleGetFilingTypeOptions}
                  options={data.filingTypeOptions??[]}
                  placeholder="Select"
                  sort={false}               
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
         (() => formattedCell(cellValue, columnName, propertyName, rowIndex, isServiceTypePersonalOrNotorious));

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
      isServiceTypePersonalOrNotorious: boolean
   ) => {
      if (columnName === 'PersonServed' || columnName === 'Height' || columnName === 'Weight' || columnName === 'Age') {
         return (
            <>
               <input
                  type={"text"}
                  name={columnName}
                  value={isServiceTypePersonalOrNotorious ? value as string : "N/A"}
                  className={
                     "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                  }
                  onChange={(e) =>
                     handleInputChange?.(fieldName, e.target.value, rowIndex)
                  }
                  disabled={!isServiceTypePersonalOrNotorious}
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
         )
      }
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
            {getFieldsErrorMessages(rowIndex, fieldName).map(
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
                           Edit Process Server
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
                           data: IProcessServerCaseInfoItem,
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
                           Total records: {selectedProcessServerId.length}
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
                              Are you sure you want to update the affidavit information
                              and submit a new affidavit to the court?
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

export default ProcessServer_BulkEdit;
