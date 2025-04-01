import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import { AxiosError, HttpStatusCode } from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import GridCheckbox from "components/formik/GridCheckBox";
import DropdownPresentation from "components/common/dropdown/DropDown";
import { IGridHeader } from "interfaces/grid-interface";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import { IEmailQueueItem } from "interfaces/email-queue.interface";
import { ISelectOptions } from "interfaces/all-cases.interface";
import { PaymentMethodOption, StateCode, TaskStatusList } from "utils/constants";
import { adjustDateSystemTimezoneDate, adjustDateToSystemTimezone, adjustDateToSystemTimezoneDate, convertAndFormatDate, convertToEasternDate, convertUtcToEst, fileToBase64, formattedDate, formatZip, getDate, handlePostalCodeKeyDown, toCssClassName } from "utils/helper";
import vm from "utils/validationMessages";
import { useEmailQueueContext } from "pages/email-queue/EmailQueueContext";
import EmailQueueService from "services/email-queue.service";
import dollarImage from "assets/images/dollar-sign.svg";
import CommonValidations from "utils/common-validations";
import { useAuth } from "context/AuthContext";

type EmailQueueBulkEditProps = {
   showEmailQueuePopup: boolean;
   handleClose: () => void;
   handleCloseConfirm: () => void;
   counties: string[];
};

const defaultPageSize = 300;

const EmailQueue_BulkEdit = (props: EmailQueueBulkEditProps) => {
   //    const {
   //       showSpinner,
   //       setShowSpinner,
   //       setFilteredRecords,
   //       filteredRecords,
   //       setSelectedProcessServerId,
   //       selectedProcessServerId,
   //       setSelectedFilteredProcessServerId,
   //       getProcessServerCases,
   //       bulkRecords,
   //       setBulkRecords
   //    } = useProcessServerContext();
   const validationSchema = yup.object({
      processServerEmail: yup.string().email(vm.email.email),
      // filerEmail: yup.string().email(vm.email.email).required(vm.email.required),
      filerEmail: yup
         .string()
         .required("Please enter filer email.")
         .test("valid-emails", "Invalid email format. Enter in johndoe@gmail.com, sarahjane@yahoo.com, etc format", (value) => {
            if (!value) return true; // Allow empty value
            const emails = value.split(",").map((email) => email.trim());
            const isValid = emails.every((email) =>
               yup.string().email().isValidSync(email)
            );
            return isValid;
         }),
      // caseNo: yup
      //    .string()
      //    .required(vm.caseNo.required),
      tenantAddress: yup
         .string()
         .required("Please enter address")
         .min(3, "Address must be at least 3 characters")
         .max(300, "Address must not exceed 300 characters"),
      tenantUnit: yup.string(),
      tenantCity: yup
         .string()
         .required("Please enter city")
         .max(50, "City must not exceed 50 characters"),
      tenantState: yup
         .string()
         .required("Please enter state code.")
         .max(2, "State Code must be of 2 characters."),
      propertyName: yup
         .string()
         .required("Please enter property")
         .max(100, "Property must not exceed 100 characters"),
      evictionReason: yup
         .string()
         .required("Please enter reason")
         .max(200, "Reason must not exceed 50 characters"),
      tenant1FirstName: yup
         .string()
         .required(vm.tenant1First.required)
         .max(50, vm.tenant1First.max),
      tenant1MiddleName: yup
         .string()
         .max(50, vm.tenant1MI.max),
      tenant1LastName: yup
         .string()
         .required(vm.tenant1Last.required)
         .max(50, vm.tenant1Last.max),
      expedited: yup.string(),
      county: CommonValidations.countyValidation(props.counties),
      // tenantZip: yup
      //    .string()
      //    .required(vm.zip.required)
      //    .min(5, vm.zip.min)
      //    .max(5, vm.zip.max),
      tenantZip: yup
         .string()
         .required(vm.zip.required),
      referenceId: yup.string()
         .matches(/^[0-9]+$/, vm.referenceId.matches),
      evictionCourtFee: yup
         .string()
         .test(
            "isCurrency",
            vm.evictionCourtFee.test,
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         )
         .test(
            "maxAmount",
            vm.evictionCourtFee.testAmount,
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
               return numericValue <= 9999;
            }
         ),
      eFileFeeClient: yup
         .string()
         .test(
            "isCurrency",
            vm.eFileFeeClient.test,
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         )
         .test(
            "maxAmount",
            vm.eFileFeeClient.testAmount,
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
               return numericValue <= 9999;
            }
         ),
      transactionfee: yup
         .string()
         .test(
            "isCurrency",
            vm.transactionfee.test,
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         )
         .test(
            "maxAmount",
            vm.transactionfee.testAmount,
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
               return numericValue <= 9999;
            }
         ),
   });
   const {
      showSpinner,
      setShowSpinner,
      setFilteredRecords,
      filteredRecords,
      setSelectedEmailQueueIds,
      selectedEmailQueueIds,
      setSelectedFilteredEmailQueueId,
      getEmailQueues,
      emailQueues,
      bulkRecords,
      setBulkRecords,
      selectedEmailTaskIds,
      setSelectedEmailTaskIds,
      setEmailQueues
   } = useEmailQueueContext();

   const { selectedStateValue } = useAuth();
   const initialColumnMapping: IGridHeader[] = [
      { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
      { columnName: "caseNo", label: "CaseNo" },
      { columnName: "referenceId", label: "CaseReferenceID" },
      { columnName: "tenant1FirstName", label: "Tenant1FirstName" },
      { columnName: "tenant1MiddleName", label: "Tenant1MiddleName" },
      { columnName: "tenant1LastName", label: "Tenant1LastName" },
      { columnName: "processServerEmail", label: "ProcessServerEmail" },
      { columnName: "caseCreatedDate", label: "CaseCreatedDate" },
      { columnName: "taskStatus", label: "TaskStatus" },
      { columnName: "description", label: "Description " },
      ...selectedStateValue.toLowerCase().trim() == "tx" ? [] : [{ columnName: "expedited", label: "Expedited" }],
      { columnName: "county", label: "County" },
      { columnName: "eFileMethod", label: "eFileMethod" },
      { columnName: "paymentAccount", label: "PaymentAccount" },
      { columnName: "evictionPaymentMethod", label: "EvictionPaymentMethod" },
      { columnName: "eFileFeeClient", label: "EfileFee" },
      { columnName: "evictionCourtFee", label: "CourtFee" },
      { columnName: "transactionfee", label: "CourtTransAmt" },
      { columnName: "tenantZip", label: "TenantZip" },
      { columnName: "tenantAddress", label: "TenantAddress" },
      { columnName: "tenantCity", label: "TenantCity" },
      { columnName: "tenantUnit", label: "TenantUnit" },
      { columnName: "tenantState", label: "TenantState" },
      { columnName: "propertyName", label: "PropertyName" },
      // { columnName: "referenceId", label: "UniqueID" },
      // { columnName: "evictionCourtFee", label: "EvictionCourtFee" },
      // { columnName: "evictionEnvelopeID", label: "EvictionEnvelopeID" },
      { columnName: "evictionDateFiled", label: "DateFiled" },
      { columnName: "attorneyName", label: "AttorneyName" },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo" },
      { columnName: "evictionReason", label: "EvictionReason" },
      { columnName: "filerEmail", label: "EvictionFilerEmail" },
      ...selectedStateValue == "TX" ? [{ columnName: "stateCourt", label: "CourtName" }] : [{ columnName: "stateCourt", label: "StateCourt" }],
      { columnName: "document", label: "Document" },

      //    { columnName: "serviceMethod", label: "ServiceType" },
      //    { columnName: "personServed", label: "PersonServed" },
      //    { columnName: "height", label: "Height" },
      //    { columnName: "weight", label: "Weight" },
      //    { columnName: "age", label: "Age" },
      //    { columnName: "serverName", label: "ServerName" },
      //    { columnName: "serviceNotes", label: "ServiceNotes" },
      //    { columnName: "serviceDate", label: "ServiceDate" },
      //    { columnName: "dateScanned", label: "DateScanned" },
      //    // { columnName: "defendantName", label: "DefendantName" },
      //    { columnName: "comments", label: "Comments" },
   ];
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
      bulkRecords.forEach(item => {
         item.eFileMethod = item.methodName
         item.eFileFeeClient = item.eFileFeeClient ?? ""
         item.evictionCourtFee = item.evictionCourtFee ?? ""
         item.transactionfee = item.transactionfee ?? ""
         item.processServerEmail = item.processServerEmail ?? ""
         item.caseNo = item.caseNo ?? ""
         item.expedited = item.expedited ?? ""
         item.tenant1MiddleName = item.tenant1MiddleName ?? ""
      });
      // const records = bulkRecords.filter((item) =>
      //   selectedEmailQueueIds.includes(item.id || "")
      // );
      // let uniqueRecords: { [key: string]: any } = {};
      // let records = bulkRecords.filter((item) => {
      //    const id = item.id || "";
      //    if (!selectedEmailQueueIds.includes(id) || uniqueRecords[id]) {
      //       return false;
      //    }
      //    uniqueRecords[id] = true;
      //    return true;
      // });
      // setFilteredRecords(records);
      let uniqueRecords: { [key: string]: any } = {};
      let records = bulkRecords.filter((item) => {
         const id = item.taskId || "";
         if (!selectedEmailTaskIds.includes(id) || uniqueRecords[id]) {
            return false;
         }
         uniqueRecords[id] = true;
         return true;
      }).map((item) => {
         // Create a deep copy of each item to prevent modification of bulkRecords
         return JSON.parse(JSON.stringify(item));
      });

      records.forEach(item => {
         item.evictionDateFiled = convertAndFormatDate(item.evictionDateFiled);
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
      updatedValue: string | boolean | React.ChangeEvent<HTMLInputElement>,
      selectedRowIndex: number
   ) => {

      setNameMismatchError(null);

      // Check if the input is a file input change event
      if (
         columnName === 'document' &&
         typeof updatedValue !== 'string' &&
         typeof updatedValue !== 'boolean' &&
         'target' in updatedValue &&
         updatedValue.target instanceof HTMLInputElement
      ) {

         const fileInput = updatedValue.target as HTMLInputElement;
         const file = fileInput.files ? fileInput.files[0] : null;

         if (file) {
            // Convert the file to Base64
            const fileBase64 = await fileToBase64(file);

            // Perform the bulk update with the Base64 value for all selected records
            setFilteredRecords((prevRows) =>
               prevRows.map((row, rowIndex) => {
                  if (selectedFilteredRows[rowIndex]) {
                     // Update the document property for selected rows
                     const updatedRow = { ...row, [columnName]: fileBase64 };
                     // Perform validation for the updated row
                     validateRow(updatedRow, rowIndex);
                     return updatedRow;
                  } else {
                     return row;
                  }
               })
            );
         }
      } else {
         // Regular update for non-file inputs
         if (selectedFilteredRows[selectedRowIndex]) {
            // Update all selected rows for non-file inputs
            setFilteredRecords((prevRows) =>
               prevRows.map((row, rowIndex) => {
                  if (selectedFilteredRows[rowIndex]) {
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
            taskStatus: "taskStatus",
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
         if (columnName === "paymentAccount" || columnName === "taskStatus") {
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

   const validateRow = (row: IEmailQueueItem, rowIndex: number) => {
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
         setSelectedFilteredEmailQueueId(selectedIds);
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

         setSelectedFilteredEmailQueueId(selectedIds);
      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = filteredRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         setSelectedFilteredEmailQueueId(allIds);
      } else {
         setSelectedFilteredEmailQueueId([]);
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
      ;
      setNameMismatchError(null);
      try {
         setShowSpinner(true);
         for (const element of filteredRecords) {
            const fileInput = document.getElementById(element.id) as HTMLInputElement | null;
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
               const file = fileInput.files[0];
               const fileBase64 = await fileToBase64(file);
               element.document = fileBase64;
               // Call the API with the updated form values
            }
         }

         const formattedPayload = filteredRecords.map((item) => {
            return {
               ...item,
               evictionTransactionAmt: item.transactionfee,
               caseNo: item.caseNo == null ? "" : item.caseNo,
               eFileMethod: item.eFileMethod,
               evictionPaymentMethod: item.evictionPaymentMethod,
               taskStatus: item.taskStatus,
               tenantZip: item.tenantZip != null ? formatZip(item.tenantZip) : "",
               evictionDateFiled: item.evictionDateFiled ?
                  adjustDateSystemTimezoneDate(
                     typeof item.evictionDateFiled === 'string' ?
                        item.evictionDateFiled :
                        item.evictionDateFiled.toISOString()
                  )
                  : null,
               caseType: item.status
            }
         });
         const response = await EmailQueueService.editEmailQueueCaseInfoBulk(
            formattedPayload
         );
         if (response.status === HttpStatusCode.Ok) {
            setShowSpinner(false);
            // Display a success toast message
            toast.success("Case info successfully updated.");
            // Close the popup
            // setFilteredRecords([]);
            setFilteredRecords([]);
            setSelectAll(false);
            setSelectedEmailQueueIds([]);
            setSelectedEmailTaskIds([]); 
            setEmailQueues((prev) => ({ ...prev, searchParam: '' }));           
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
               setSelectedEmailQueueIds([]);
               toast.error("Failed to update case info.");
               props.handleClose();
            }
         }
      } finally {
         getEmailQueues(1, defaultPageSize, emailQueues.searchParam, emailQueues.companyId, emailQueues.county, emailQueues.serverId, emailQueues.isExpedited, emailQueues.isStateCourt, emailQueues.status, emailQueues.taskStatus, emailQueues.court ?? "");
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
         setSelectedEmailQueueIds([]);
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
      data: IEmailQueueItem,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      let cellValue = (data as any)[propertyName];
      if (propertyName == "taskStatus") {
         if (TaskStatusList.some(x => x.value === cellValue))
            cellValue = TaskStatusList.find(option => option.value === cellValue)?.id;
      }
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
         tenant1FirstName: () => (

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
         tenant1MiddleName: () => (
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
         tenant1LastName: () => (

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

         caseNumber: () => (
            <>
               <input
                  type={"text"}
                  value={cellValue as string}
                  className={
                     "peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
                  }
                  onChange={(e) =>
                     handleInputChange?.(propertyName, e.target.value, rowIndex)
                  }
               //   disabled={true}
               />
               {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                  <div key={index} className="text-red-500">
                     {error.errorMessage}
                  </div>
               ))}
            </>
         ),
         processServerEmail: () => (

            <>
               <div>
                  <input
                     type={"text"}
                     value={cellValue}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]`}
                     onChange={(e) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     placeholder={"Enter Process Server Email"}
                  />
                  {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         caseCreatedDate: () => (

            <>
               <div className="datePicker">
                  {/* <DatePicker
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
               /> */}
                  <div>
                     <input
                        type={"text"}
                        value={formattedDate(cellValue)}
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
         taskStatus: () => {
            // const selectedOption = TaskStatusList.find(option => option.value === cellValue);
            return (
               <div>
                  {(
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
         description: () => (

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
         expedited: () => (

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
         county: () => (

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
         transactionfee: () => (
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

         tenantZip: () => (

            <>
               <div>
                  <input
                     type={"text"}
                     value={cellValue}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]`}
                     onChange={(e) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                  // maxLength={5}
                  // onKeyDown={handlePostalCodeKeyDown}
                  />
                  {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         tenantAddress: () => (

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
         tenantCity: () => (

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
         tenantUnit: () => (

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
         tenantState: () => (

            <>
               <div className="relative text-left max-w-[120px]">
                  <select
                     className={
                        "peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
                     }
                     name="TenantState"
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
         propertyName: () => (
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
         referenceId: () => (

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
            </>
         ),
         eFileFeeClient: () => (
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
         evictionCourtFee: () => (
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
         evictionDateFiled: () => (
            <>
               {/* <div className="datePicker">
   <DatePicker
      selected={
         cellValue && Date.parse(cellValue as string)
            ? new Date(convertUtcToEst(cellValue as string).date) // Convert to EST
            : null
      }
      onChange={(date: any) => {
         const convertedDateTime = convertUtcToEst(date); // Convert selected date to EST
         const estDate = new Date(convertedDateTime.date);
         const currDateTime = new Date();
         const estDateTime = new Date(estDate.getFullYear(), estDate.getMonth(), estDate.getDate(), currDateTime.getHours(), currDateTime.getMinutes());
         handleInputChange?.(propertyName, estDateTime.toISOString(), rowIndex); // Pass the EST date
         handleSetOutCompletedDateChange(estDate, rowIndex); // Handle the EST date
      }}
      dateFormat="MM/dd/yyyy"
      placeholderText="mm/dd/yyyy"
      className="bg-calendar bg-no-repeat bg-[center_right_13px] peer placeholder-gray-500 outline-none p-2.5 py-1.5 pr-7 min-w-32 block border w-full border-gray-200 rounded-md text-xs  focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
   />
</div> */}
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
         attorneyName: () => (
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
         attorneyBarNo: () => (
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
         evictionReason: () => (
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
         filerEmail: () => (
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
         stateCourt: () => (
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
         document: () => (
            <div className="relative max-w-[250px]">
               <input
                  // id="fileUpload"
                  id={data.id}
                  name="file"
                  type="file"
                  accept=".pdf"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full border w-full border-gray-200 rounded-md text-xs px-[6px] py-[3.5px]"
                  onChange={(event) => handleInputChange(propertyName, event, rowIndex)}
               />
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
      propertyName: any,
      rowIndex: number
   ) => {
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
            showModal={props.showEmailQueuePopup}
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
                        rows={filteredRecords}
                        handleSelectAllChange={handleSelectAllChange}
                        selectAll={selectAll}
                        showInPopUp={true}
                        cellRenderer={(
                           data: IEmailQueueItem,
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
                           Total records: {selectedEmailTaskIds.length}
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