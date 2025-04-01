import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import "react-datepicker/dist/react-datepicker.css";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import GridCheckbox from "components/formik/GridCheckBox";
import { IGridHeader } from "interfaces/grid-interface";
import { ISelectOptions } from "interfaces/late-notices.interface";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import { StateCode } from "utils/constants";
import { formatZip, handlePostalCodeKeyDown, toCssClassName } from "utils/helper";
import CommonValidations from "utils/common-validations";
import FileEvictionService from "services/file-evictions.service";
import dollarImage from "assets/images/dollar-sign.svg";
import { useFileEvictionsTXContext } from "../FileEvictionsTXContext";
import { IFileEvictionsTXItems } from "interfaces/file-evictions-tx.interface";
import { FaAmericanSignLanguageInterpreting, FaTimes } from "react-icons/fa";
import HelperViewPdfService from "services/helperViewPdfService";
import { useAuth } from "context/AuthContext";
import Drawer from "components/common/drawer/Drawer";

type FileEvictionTXBulkEditProps = {
   showFileEvictionPopup: boolean;
   handleClose: () => void;
   counties: string[];
   courts: string[];
};

const initialColumnMapping: IGridHeader[] = [
   {
      columnName: "isChecked",
      label: "Bulk Edit",
      controlType: "checkbox",
      toolTipInfo: "This checkbox represents bulk update only",
   },
   { columnName: "county", label: "County" },
   { columnName: "court", label: "Court" },
   { columnName: "tenant1Last", label: "Tenant1Last" },
   { columnName: "tenant1First", label: "Tenant1First" },
   { columnName: "tenant1MI", label: "Tenant1MI" },
   { columnName: "tenant1Phone", label: "Tenant1Phone" },
   { columnName: "tenant1Email", label: "Tenant1Email" },
   { columnName: "andAllOtherOccupants", label: "AndAllOtherOccupants" },
   {
      columnName: "tenantAddress",
      label: "tenantAddress",
      className: "tenantAddress",
   },
   { columnName: "tenantUnit", label: "TenantUnit" },
   { columnName: "tenantCity", label: "TenantCity" },
   { columnName: "tenantState", label: "TenantState" },
   { columnName: "tenantZip", label: "TenantZip" },
   { columnName: "tenant2Last", label: "Tenant2Last" },
   { columnName: "tenant2First", label: "Tenant2First" },
   { columnName: "tenant2MI", label: "Tenant2MI" },
   { columnName: "tenant2Phone", label: "Tenant2Phone" },
   { columnName: "tenant2Email", label: "Tenant2Email" },
   { columnName: "tenant3Last", label: "Tenant3Last" },
   { columnName: "tenant3First", label: "Tenant3First" },
   { columnName: "tenant3MI", label: "Tenant3MI" },
   { columnName: "tenant3Phone", label: "Tenant3Phone" },
   { columnName: "tenant3Email", label: "Tenant3Email" },
   { columnName: "tenant4Last", label: "Tenant4Last" },
   { columnName: "tenant4First", label: "Tenant4First" },
   { columnName: "tenant4MI", label: "Tenant4MI" },
   { columnName: "tenant4Phone", label: "Tenant4Phone" },
   { columnName: "tenant4Email", label: "Tenant4Email" },
   { columnName: "tenant5Last", label: "Tenant5Last" },
   { columnName: "tenant5First", label: "Tenant5First" },
   { columnName: "tenant5MI", label: "Tenant5MI" },
   { columnName: "tenant5Phone", label: "Tenant5Phone" },
   { columnName: "tenant5Email", label: "Tenant5Email" },
   { columnName: "propertyName", label: "PropertyName" },
   { columnName: "propertyPhone", label: "PropertyPhone" },
   {
      columnName: "propertyEmail",
      label: "PropertyEmail",
      className: "PropertyEmail",
   },
   {
      columnName: "propertyAddress",
      label: "PropertyAddress",
      className: "PropertyAddress",
   },
   { columnName: "propertyCity", label: "PropertyCity" },
   { columnName: "propertyState", label: "PropertyState" },
   { columnName: "propertyZip", label: "PropertyZip" },
   { columnName: "attorneyName", label: "AttorneyName" },
   { columnName: "attorneyBarNo", label: "AttorneyBarNo" },
   { columnName: "filerBusinessName", label: "FilerBusinessName" },
   { columnName: "evictionFilerEMail", label: "EvictionFilerEmail" },
   { columnName: "clientReferenceId", label: "ClientReferenceId" },
   { columnName: "courtesyCopies", label: "CourtesyCopies" },
   { columnName: "BatchUpload", label: "BatchUpload" },
   { columnName: "Petition", label: "Petition" },
   { columnName: "Notice", label: "Notice" },
   { columnName: "SCRAReport", label: "SCRAReport" },
   { columnName: "SCRAAffidavit", label: "SCRAAffidavit" },
   { columnName: "Lease", label: "Lease" },
   { columnName: "SupplementalDocuments1", label: "SupplementalDocuments1" },
   { columnName: "SupplementalDocuments2", label: "SupplementalDocuments2" },
];

const FileEvictionsTX_BulkEdit = (props: FileEvictionTXBulkEditProps) => {
   const {
      fileEvictions,
      setShowSpinner,
      showSpinner,
      selectedFileEvictionId,
      setSelectedFilteredFileEvictionId,
      getFileEvictions,
      bulkRecords,
      setBulkRecords,
      setSelectedFileEvictionId
   } = useFileEvictionsTXContext();
   const { selectedStateValue } = useAuth();
   const validationSchema = yup.object({
      county: CommonValidations.countyValidation(props.counties),
      court: yup.string().required("Please enter court").when('county', {
         is: (county: string) => !!county,
         then: schema =>
            schema
               .test(
                  "valid-court",
                  "Court is not supported in County",
                  function (value) {

                     const county = this.parent.county;
                     const trimmedValue = value?.trim();

                     if (!trimmedValue) return true;

                     //  const jpPattern = /JP (\d+)-(\d+)/i;
                     //  const match = trimmedValue.match(jpPattern);

                     //  if (match) {
                     //      const precinct = match[1];
                     //      const place = match[2];
                     //      const transformedValue = `${county.toLowerCase()} county - jp - precinct ${precinct}, place ${place}`;

                     //      return props.courts.some(
                     //          (court: string) =>
                     //              court.toLowerCase().includes(county.toLowerCase()) &&
                     //              court.toLowerCase() === transformedValue.toLowerCase()
                     //      );
                     //  } else {
                     return props.courts.some(
                        (court: string) =>
                           court.toLowerCase().includes(county.toLowerCase()) &&
                           court.toLowerCase() === trimmedValue.toLowerCase()
                     );
                     //  }
                  }
               ),
         otherwise: schema => schema.optional(),
      }),
      tenant1Phone: yup
         .string()
         .nullable()
         .test('is-valid-phone', 'Please enter a valid phone number', (value) => {
            if (!value || value.trim() === '') {
               return true; // Allow null or empty values
            }
            return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value); // Phone number format
         })
         .test('at-least-one-contact', 'Phone is required.', function (value) {
            const { tenant1Email } = this.parent; // Access the other field
            if (!value && !tenant1Email) {
               return false; // Neither phone nor email is filled
            }
            return true; // Validation passes if either field has a value
         }),
         tenant2Phone: yup
         .string()
         .nullable()
         .test('is-valid-phone', 'Please enter a valid phone number', (value) => {
            if (!value || value.trim() === '') {
               return true; // Allow null or empty values
            }
            return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value); // Phone number format
         }),         
         tenant3Phone: yup
         .string()
         .nullable()
         .test('is-valid-phone', 'Please enter a valid phone number', (value) => {
            if (!value || value.trim() === '') {
               return true; // Allow null or empty values
            }
            return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value); // Phone number format
         }),        
         tenant4Phone: yup
         .string()
         .nullable()
         .test('is-valid-phone', 'Please enter a valid phone number', (value) => {
            if (!value || value.trim() === '') {
               return true; // Allow null or empty values
            }
            return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value); // Phone number format
         }),         
         tenant5Phone: yup
         .string()
         .nullable()
         .test('is-valid-phone', 'Please enter a valid phone number', (value) => {
            if (!value || value.trim() === '') {
               return true; // Allow null or empty values
            }
            return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value); // Phone number format
         }),        
      tenant1Email: yup
         .string()
         .nullable()
         .email('Must be a valid email.')
         .max(50, 'Cannot exceed 50 characters')
         .test('at-least-one-contact', 'Email is required.', function (value) {
            const { tenant1Phone } = this.parent; // Access the other field
            if (!value && !tenant1Phone) {
               return false; // Neither phone nor email is filled
            }
            return true; // Validation passes if either field has a value
         }),
      tenant2Email: yup.string()
         .email('Must be a valid email.')
         .max(50, "Cannot exceed 50 characters"),
      tenant3Email: yup.string()
         .email('Must be a valid email.')
         .max(50, "Cannot exceed 50 characters"),
      tenant4Email: yup.string()
         .email('Must be a valid email.')
         .max(50, "Cannot exceed 50 characters"),
      tenant5Email: yup.string()
         .email('Must be a valid email.')
         .max(50, "Cannot exceed 50 characters"),
      tenant1First: yup
         .string()
         .required("Please enter tenant1 first name.")
         .max(50, "Tenant1 first name must not exceed 50 characters."),
      tenant1MI: yup
         .string()
         .max(50, "Tenant1 middle name must not exceed 50 characters."),
      tenant1Last: yup
         .string()
         .required("Please enter tenant1 last name.")
         .max(50, "Tenant1 last name must not exceed 50 characters."),
      tenant2First: yup
         .string()
         .max(50, "Tenant2 first name must not exceed 50 characters."),
      tenant2MI: yup
         .string()
         .max(50, "Tenant2 middle name must not exceed 50 characters."),
      tenant2Last: yup
         .string()
         .max(50, "Tenant2 last name must not exceed 50 characters."),
      tenant3First: yup
         .string()
         .max(50, "Tenant3 first name must not exceed 50 characters."),
      tenant3MI: yup
         .string()
         .max(50, "Tenant3 middle name must not exceed 50 characters."),
      tenant3Last: yup
         .string()
         .max(50, "Tenant3 last name must not exceed 50 characters."),
      tenant4First: yup
         .string()
         .max(50, "Tenant4 first name must not exceed 50 characters."),
      tenant4MI: yup
         .string()
         .max(50, "Tenant4 middle name must not exceed 50 characters."),
      tenant4Last: yup
         .string()
         .max(50, "Tenant4 last name must not exceed 50 characters."),
      tenant5First: yup
         .string()
         .max(50, "Tenant5 first name must not exceed 50 characters."),
      tenant5MI: yup
         .string()
         .max(50, "Tenant5 middle name must not exceed 50 characters."),
      tenant5Last: yup
         .string()
         .max(50, "Tenant5 last name must not exceed 50 characters."),
      tenantAddress: yup
         .string()
         .required("Please enter address")
         .min(3, "Address must be at least 3 characters")
         .max(300, "Address must not exceed 300 characters"),
      tenantUnit: yup.string().required("Please enter tenant unit."),
      tenantCity: yup
         .string()
         .required("Please enter city")
         .max(50, "City must not exceed 50 characters"),
      attorneyName: yup
         .string()
         .max(50, "Cannot exceed 50 characters")
         .test('AttorneyName-Required', 'Attorney name is required.', function (value) {
            const { attorneyBarNo } = this.parent; // Access sibling field
            if (attorneyBarNo && !value) {
               return false; // Fail validation if AttorneyBarNo is filled but AttorneyName is empty
            }
            return true; // Pass validation otherwise
         }),
      attorneyBarNo: yup
         .string()
         .test('BarNo-Required', 'Attorney bar no. is required.', function (value) {
            const { attorneyName } = this.parent; // Access sibling field
            if (attorneyName && !value) {
               return false; // Fail validation if AttorneyName is filled but AttorneyBarNo is empty
            }
            return true; // Pass validation otherwise
         }),
      propertyState: yup
         .string()
         .max(2, "State Code must be of 2 characters.")
         .required("Please enter state code."),
      tenantState: yup
         .string()
         .required("Please enter state code.")
         .max(2, "State Code must be of 2 characters.")
         .test(
            "is-selected-state",
            `State Code must be ${selectedStateValue}.`,
            (value) => value === selectedStateValue
         ),
      propertyName: yup
         .string()
         .required("Please enter property")
         .max(100, "Property must not exceed 100 characters"),
      tenantZip: yup
         .string()
         .required("Please enter ZIP code."),
      propertyEmail: yup.string().required("Please enter property email.").email("Please enter a valid Email address"),
      propertyPhone: yup
         .string()
         .nullable()
         .required("Please enter property phone.")
         .test('is-valid-phone', 'Please enter a valid phone number', value => {
            if (!value || value.trim() === '') {
               return true; // Allow null or empty values
            }
            return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value);
         }),
      propertyAddress: yup.string().required("Please enter Property Address"),
      propertyCity: yup.string().required("Please enter Property City"),
      filerBusinessName: yup.string().required("Please enter Filer Business Name"),
      evictionFilerEMail: yup
         .string()
         .email("Please enter a valid Email address")
         .required("Please enter Eviction Filer EMail"),
      propertyZip: yup
         .string()
         .required("Please enter ZIP code."),
      // BatchUpload: yup.string().when('attachments', {
      //    is: (attachments: { type: string }[] | undefined) => {
      //      // Check if 'attachments' is an array and contains either 'BatchUpload' or 'Petition'
      //      return Array.isArray(attachments) && 
      //             attachments.some((attachment) => attachment.type === 'BatchUpload' || attachment.type === 'Petition');
      //    },
      //    then: (schema) =>
      //      schema.notRequired(), // If either 'BatchUpload' or 'Petition' exists, make it not required
      //    otherwise: (schema) =>
      //      schema.required('BatchUpload is required'), // Otherwise, require it
      //  }),


      //   Petition:  yup.string().when('attachments', {
      //    is: (attachments: { type: string }[] | undefined) => {
      //      // Check if 'attachments' is an array and contains either 'BatchUpload' or 'Petition'
      //      return Array.isArray(attachments) && 
      //             attachments.some((attachment) => attachment.type === 'BatchUpload' || attachment.type === 'Petition');
      //    },
      //    then: (schema) =>
      //      schema.notRequired(), // If either 'BatchUpload' or 'Petition' exists, make it not required
      //    otherwise: (schema) =>
      //      schema.required('Petition is required'), // Otherwise, require it
      //  }), 
   })

   const [showConfirm, setShowConfirm] = useState<boolean>(false);
   const [showConfirmText, setShowConfirmText] = useState<string>("");
   const [visibleColumns] =
      useState<IGridHeader[]>(initialColumnMapping);
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
   >(Array(bulkRecords?.length).fill(false));

   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      fileEvictions.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      fileEvictions.totalPages > 1
   );
   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] =
      useState<number>(-1);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [selectedService, setSelectedService] = useState<ISelectOptions>({
      id: "",
      value: "",
   });
   const [newSelectedRows] = useState<boolean[]>([]);

   useEffect(() => {
      const records = bulkRecords.filter((item) =>
         selectedFileEvictionId.includes(item.id || "")
      );
      // records.forEach((element,index) => {
      //    validateRow(element,index);
      // });
      setBulkRecords(records);
      setSelectedFilteredRows(Array(bulkRecords?.length).fill(false));
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
      ;
      
      // Check if rows are selected for bulk edit
      if (selectedFilteredRows[selectedRowIndex]) {
         setBulkRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               // Update only the selected rows
               if (selectedFilteredRows[rowIndex]) {
                  const updatedRow = {
                     ...row,
                     [columnName]: updatedValue, // Set the new value for the field
                  };
   
                  // Perform validation for each selected row
                  validateField(updatedValue, columnName, rowIndex, updatedRow);
   
                  // Apply additional validation logic based on the column name
                  switch (columnName) {
                     case "attorneyName":
                        validateField(updatedRow.attorneyBarNo, "attorneyBarNo", rowIndex, updatedRow);
                        break;
                     case "attorneyBarNo":
                        validateField(updatedRow.attorneyName, "attorneyName", rowIndex, updatedRow);
                        break;
                     case "tenant1Email":
                        validateField(updatedRow.tenant1Phone, "tenant1Phone", rowIndex, updatedRow);
                        break;
                     case "tenant1Phone":
                        validateField(updatedRow.tenant1Email, "tenant1Email", rowIndex, updatedRow);
                        break;
                     default:
                        break;
                  }
   
                  return updatedRow;
               } else {
                  return row;
               }
            })
         );
      } else {
         // If no row is selected, update only the selected row
         setBulkRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               const updatedRow =
                  rowIndex === selectedRowIndex
                     ? {
                          ...row,
                          [columnName]: updatedValue, // Update value for the selected row
                       }
                     : row;
   
               // Perform validation for the updated row
               if (rowIndex === selectedRowIndex) {
                  validateField(updatedValue, columnName, rowIndex, updatedRow);
                  switch (columnName) {
                     case "attorneyName":
                        validateField(updatedRow.attorneyBarNo, "attorneyBarNo", rowIndex, updatedRow);
                        break;
                     case "attorneyBarNo":
                        validateField(updatedRow.attorneyName, "attorneyName", rowIndex, updatedRow);
                        break;
                     case "tenant1Email":
                        validateField(updatedRow.tenant1Phone, "tenant1Phone", rowIndex, updatedRow);
                        break;
                     case "tenant1Phone":
                        validateField(updatedRow.tenant1Email, "tenant1Email", rowIndex, updatedRow);
                        break;
                     default:
                        break;
                  }
               }
   
               return updatedRow;
            })
         );
      }
   };
   
   
   

   const handleAttachmentChange = (
      attachmentType: string,
      event: React.ChangeEvent<HTMLInputElement>, // Assuming the event is from an input element
      rowIndex: number
   ) => {
      const file = event.target.files?.[0]; // Get the first selected file
      if (file) {
         const reader = new FileReader();
         reader.onload = (e) => {
            const pdfBase64 = e.target?.result as string;
            const base64Data = pdfBase64.split(",")[1]; // Extracting only the base64 data part
            const fileName = file.name;
            const fileNameWithoutExtension = fileName;
            //.split('.').slice(0, -1).join('.'); // Extract file name without extension

            setBulkRecords((prevRows) =>
               prevRows.map((row, index) => {
                  if (index === rowIndex) {
                     const updatedAttachments = row.attachments ? [...row.attachments] : [];

                     const existingAttachmentIndex = updatedAttachments.findIndex(
                        (att) => att.type === attachmentType
                     );

                     const newAttachment = {
                        type: attachmentType,
                        fileName: fileNameWithoutExtension, // Using file name without extension
                        pdfData: base64Data, // Store only the base64 data
                        uri: existingAttachmentIndex !== -1 ? updatedAttachments[existingAttachmentIndex].uri ?? '' : '',
                        id: existingAttachmentIndex !== -1 ? updatedAttachments[existingAttachmentIndex].id ?? '' : '',
                     };

                     if (existingAttachmentIndex !== -1) {
                        updatedAttachments[existingAttachmentIndex] = newAttachment;
                     } else {
                        // Add the new attachment
                        updatedAttachments.push(newAttachment);
                     }
                     var updateRow = { ...row, attachments: updatedAttachments };
                     //validateRow(updateRow, index);
                     return { ...row, attachments: updatedAttachments };
                  }
                  return row;
               })
            );
         };
         reader.readAsDataURL(file); // Convert file to base64
      }
   };
   const handleCrossClick = (
      attachmentType: string,  // The type of the attachment (e.g., 'document', 'photo')
      rowIndex: number,        // The index of the row in which the attachment should be removed
   ) => {

      // Update the bulk records state to remove the attachment from the specific row and attachmentType
      setBulkRecords((prevRows) =>
         prevRows.map((row, index) => {
            if (index === rowIndex) {
               const updatedAttachments = row.attachments
                  ? row.attachments.filter((att: any) => att.type !== attachmentType)
                  : [];
               var updatedRow = { ...row, attachments: updatedAttachments }
               //validateRow(updatedRow, index);
               return { ...row, attachments: updatedAttachments };
            }
            return row;
         })
      );
   };
  
   const validateField = (
      fieldValue: any,
      fieldName: string,
      rowIndex: number,
      rowData: IFileEvictionsTXItems
   ) => {
      const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};
      const fields: IImportCsvFieldError[] = [];
   
      ;
      try {
         // Validate the individual field using the validation schema
         validationSchema.validateSyncAt(fieldName, rowData, { abortEarly: false });
   
         // If validation passes, clear any previous errors for this field in this row
         setColumnErrors((prevErrors) => {
            const updatedErrors = [...prevErrors]; // Clone the errors array
   
            // Find the row index that matches and clear errors for this field
            const rowErrorIndex = updatedErrors.findIndex(
               (errorGroup) => Object.keys(errorGroup).some((key) => errorGroup[key].some((error) => error.rowIndex === rowIndex))
            );
   
            // If errors exist for this row, update them
            if (rowErrorIndex !== -1) {
               const rowErrors = updatedErrors[rowErrorIndex];
               // Clear errors for the specific field in this row
               if (rowErrors[fieldName]) {
                  delete rowErrors[fieldName]; // Remove the errors for the field
               }
   
               // If no errors remain for this row, remove the entire error group
               if (Object.keys(rowErrors).length === 0) {
                  updatedErrors.splice(rowErrorIndex, 1);
               }
            }
   
            return updatedErrors; // Return the updated errors array
         });
   
         return { recordErrors: {}, fields: [] }; // No errors to return
      } catch (error: any) {
         if (error.inner) {
            // Collect validation errors for the specific field
            error.inner.forEach((detailError: any) => {
               const errorMessage = `${detailError.message}`;
               fields.push({
                  fieldName,
                  message: errorMessage,
               });
   
               if (!recordErrors[fieldName]) {
                  recordErrors[fieldName] = [];
               }
   
               recordErrors[fieldName].push({
                  rowIndex,
                  errorMessage,
               });
            });
         }
   
         // Update the column errors with the new error
         setColumnErrors((prevErrors) => {
            const updatedErrors = [...prevErrors]; // Clone the previous errors array
   
            // Check if the row already has errors
            let rowErrorIndex = updatedErrors.findIndex(
               (errorGroup) => Object.keys(errorGroup).some((key) => errorGroup[key].some((error) => error.rowIndex === rowIndex))
            );
   
            if (rowErrorIndex === -1) {
               const errorDetails = recordErrors[fieldName]?.[0];
               if (errorDetails) {
                   updatedErrors.push({
                       [fieldName]: [{ rowIndex, errorMessage: errorDetails.errorMessage }],
                   });
                   rowErrorIndex = updatedErrors.length - 1; // Set the new error index
               } else {
                   console.error(`recordErrors[fieldName] is not properly initialized for field: ${fieldName}`);
               }
            } else {
               // If errors exist, update the existing error group
               const rowErrors = updatedErrors[rowErrorIndex];
   
               // Add the new error for the specific field
               if (!rowErrors[fieldName]) {
                   rowErrors[fieldName] = [];
               }
   
               // Clear previous errors for this field before pushing the new one
               rowErrors[fieldName] = rowErrors[fieldName].filter(
                   (error) => error.rowIndex !== rowIndex // Remove old errors for this row
               );
   
               const fieldError = recordErrors[fieldName]?.[0];
               if (fieldError) {
                   rowErrors[fieldName].push({
                       rowIndex,
                       errorMessage: fieldError.errorMessage,
                   });
               } else {
                   console.error(
                       `recordErrors[fieldName] is undefined or not an array for field: ${fieldName}`
                   );
               }
            }
   
            return updatedErrors; // Return the updated errors array
         });
   
         return { recordErrors, fields }; // Return the errors
      }
   };
   

   // const validateRow = (row: IFileEvictionsTXItems, rowIndex: number) => {
   //    const recordErrors: Record<
   //       string,
   //       { rowIndex: number; errorMessage: string }[]
   //    > = {};
   //    const fields: IImportCsvFieldError[] = [];

   //    try {
   //       // Validate the updated row against the schema
   //       validationSchema.validateSync(row, { abortEarly: false });
   //    } catch (error: any) {
   //       if (error.inner) {
   //          // Collect validation errors for each property
   //          error.inner.forEach((detailError: any) => {
   //             const propertyName = detailError.path || "unknown";
   //             const errorMessage = `${detailError.message}`;

   //             // Get the row index from your record, adjust this based on your data structure
   //             const rowIndex = detailError.rowIndex || -1;

   //             fields.push({
   //                fieldName: propertyName,
   //                message: errorMessage,
   //             });

   //             // Check if the property already has errors, if not, initialize an array
   //             if (!recordErrors[propertyName]) {
   //                recordErrors[propertyName] = [];
   //             }

   //             // Push the error object with rowIndex to the array
   //             recordErrors[propertyName].push({
   //                rowIndex,
   //                errorMessage,
   //             });
   //          });
   //       }
   //    }

   //    // Update row errors for the specific row
   //    setRowErrors((prevErrors) => {
   //       const updatedRowErrors = [...prevErrors];
   //       updatedRowErrors[rowIndex] = { rowIndex, fields };
   //       return updatedRowErrors;
   //    });
   //    // If there are errors for the record, update the columnErrors state
   //    setColumnErrors((prevErrors) => [
   //       ...prevErrors.slice(0, rowIndex),
   //       recordErrors,
   //       ...prevErrors.slice(rowIndex + 1),
   //    ]);
   // };

   const handleCheckBoxChange = (index: number, checked: boolean) => {
      if (
         shiftKeyPressed &&
         lastClickedFilteredRowIndex !== -1 &&
         bulkRecords
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
         const selectedIds = (bulkRecords || [])
            .filter((_, rowIndex) => selectedFilteredRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         setSelectedFilteredFileEvictionId(selectedIds);
      } else {
         const updatedSelectedRows = [...selectedFilteredRows];
         updatedSelectedRows[index] = checked;
         setSelectedFilteredRows(updatedSelectedRows);
         if (
            bulkRecords.length ===
            updatedSelectedRows.filter((item) => item).length
         ) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }
         const selectedIds = (bulkRecords || [])
            .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         setSelectedFilteredFileEvictionId(selectedIds);
      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = bulkRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         setSelectedFilteredFileEvictionId(allIds);
      } else {
         setSelectedFilteredFileEvictionId([]);
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedFilteredRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };
   const handleDocumentClick = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
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
      data: IFileEvictionsTXItems,
      rowIndex: number
   ) => {

      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         tenant1Phone: () => (
            <>
               <div className="fields_validation">
                  <InputMask
                     mask="(999) 999-9999"
                     maskChar=" "
                     value={cellValue as any}
                     onChange={(e: any) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     onBlur={(e: any) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     name={propertyName}
                     id={propertyName + rowIndex}
                     className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-[11px] focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]" // Custom class for styling
                  />
                  {getFieldsErrorMessages(rowIndex, propertyName).map(
                     (message, index) => (
                        <div
                           key={index}
                           className="text-red-500 mb-1"
                        >
                           {message}
                        </div>
                     )
                  )}
                  {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))} */}
               </div>
            </>
         ),
         tenant2Phone: () => (
            <>
               <div className="fields_validation">
                  <InputMask
                     mask="(999) 999-9999"
                     maskChar=" "
                     value={cellValue as any}
                     onChange={(e: any) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     onBlur={(e: any) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     name={propertyName}
                     id={propertyName + rowIndex}
                     className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-[11px] focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]" // Custom class for styling
                  />
                  {getFieldsErrorMessages(rowIndex, propertyName).map(
                     (message, index) => (
                        <div
                           key={index}
                           className="text-red-500 mb-1"
                        >
                           {message}
                        </div>
                     )
                  )}
                  {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))} */}
               </div>
            </>
         ),
         tenant3Phone: () => (
            <>
               <div className="fields_validation">
                  <InputMask
                     mask="(999) 999-9999"
                     maskChar=" "
                     value={cellValue as any}
                     onChange={(e: any) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     onBlur={(e: any) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     name={propertyName}
                     id={propertyName + rowIndex}
                     className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-[11px] focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]" // Custom class for styling
                  />
                  {getFieldsErrorMessages(rowIndex, propertyName).map(
                     (message, index) => (
                        <div
                           key={index}
                           className="text-red-500 mb-1"
                        >
                           {message}
                        </div>
                     )
                  )}
                  {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))} */}
               </div>
            </>
         ),
         tenant4Phone: () => (
            <>
               <div className="fields_validation">
                  <InputMask
                     mask="(999) 999-9999"
                     maskChar=" "
                     value={cellValue as any}
                     onChange={(e: any) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     onBlur={(e: any) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     name={propertyName}
                     id={propertyName + rowIndex}
                     className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-[11px] focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]" // Custom class for styling
                  />
                  {getFieldsErrorMessages(rowIndex, propertyName).map(
                     (message, index) => (
                        <div
                           key={index}
                           className="text-red-500 mb-1"
                        >
                           {message}
                        </div>
                     )
                  )}
                  {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))} */}
               </div>
            </>
         ),
         tenant5Phone: () => (
            <>
               <div className="fields_validation">
                  <InputMask
                     mask="(999) 999-9999"
                     maskChar=" "
                     value={cellValue as any}
                     onChange={(e: any) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     onBlur={(e: any) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     name={propertyName}
                     id={propertyName + rowIndex}
                     className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-[11px] focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]" // Custom class for styling
                  />
                  {getFieldsErrorMessages(rowIndex, propertyName).map(
                     (message, index) => (
                        <div
                           key={index}
                           className="text-red-500 mb-1"
                        >
                           {message}
                        </div>
                     )
                  )}
                  {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))} */}
               </div>
            </>
         ),
         tenantZip: () => (
            <div className="fields_validation">
               <input
                  type={"text"}
                  value={cellValue as string}
                  className={
                     "peer outline-none p-2 py-1 block border w-full rounded-md text-[11px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
                  }
                  onChange={(e) =>
                     handleInputChange?.(propertyName, e.target.value, rowIndex)
                  }
               // maxLength={5}
               // onKeyDown={handlePostalCodeKeyDown}
               />
               {getFieldsErrorMessages(rowIndex, propertyName).map(
                     (message, index) => (
                        <div
                           key={index}
                           className="text-red-500 mb-1"
                        >
                           {message}
                        </div>
                     )
                  )}
               {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                  <div key={index} className="text-red-500">
                     {error.errorMessage}
                  </div>
               ))} */}
            </div>
         ),
         propertyZip: () => (
            <div className="fields_validation">
               <input
                  type={"text"}
                  value={cellValue as string}
                  className={
                     "peer outline-none p-2 py-1 block border w-full rounded-md text-[11px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
                  }
                  onChange={(e) =>
                     handleInputChange?.(propertyName, e.target.value, rowIndex)
                  }
               // maxLength={5}
               // onKeyDown={handlePostalCodeKeyDown}
               />
               {getFieldsErrorMessages(rowIndex, propertyName).map(
                     (message, index) => (
                        <div
                           key={index}
                           className="text-red-500 mb-1"
                        >
                           {message}
                        </div>
                     )
                  )}
               {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                  <div key={index} className="text-red-500">
                     {error.errorMessage}
                  </div>
               ))} */}
            </div>
         ),
         propertyPhone: () => (
            <>
               <div className="fields_validation">
                  <InputMask
                     mask="(999) 999-9999"
                     maskChar=" "
                     value={cellValue as any}
                     onChange={(e: any) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     onBlur={(e: any) =>
                        handleInputChange?.(propertyName, e.target.value, rowIndex)
                     }
                     name={propertyName}
                     id={propertyName + rowIndex}
                     className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-[11px] focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]" // Custom class for styling
                  />
                  {getFieldsErrorMessages(rowIndex, propertyName).map(
                     (message, index) => (
                        <div
                           key={index}
                           className="text-red-500 mb-1"
                        >
                           {message}
                        </div>
                     )
                  )}
                  {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))} */}
               </div>
            </>
         ),
         tenantState: () => (
            <>
               <div className="relative text-left max-w-[120px] fields_validation">
                  <select
                     className={
                        "peer outline-none p-2 py-1 block border w-full rounded-md text-[11px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
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
                  {getFieldsErrorMessages(rowIndex, propertyName).map(
                     (message, index) => (
                        <div
                           key={index}
                           className="text-red-500 mb-1"
                        >
                           {message}
                        </div>
                     )
                  )}
                  {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500 mb-1">
                        {error.errorMessage}
                     </div>
                  ))} */}
               </div>
            </>
         ),
         propertyState: () => (
            <>
               <div className="relative text-left max-w-[120px] fields_validation">
                  <select
                     className={
                        "peer outline-none p-2 py-1 block border w-full rounded-md text-[11px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
                     }
                     name="PropertyState"
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
                  {getFieldsErrorMessages(rowIndex, propertyName).map(
                     (message, index) => (
                        <div
                           key={index}
                           className="text-red-500 mb-1"
                        >
                           {message}
                        </div>
                     )
                  )}
                  {/* {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500 mb-1">
                        {error.errorMessage}
                     </div>
                  ))} */}
               </div>
            </>
         ),
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
         // attachments: () => {

         //    if (["BatchUpload", "Petition", "Notice", "SCRAReport", "SCRAAffidavit", "Lease"].includes(columnName)) {
         //       return (
         //          <td key={cellIndex} className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap " style={{
         //             display: "flex",
         //             alignItems: "center",
         //             verticalAlign: "middle"
         //          }}>
         //             {data.attachments.some(x => x.type === columnName && x.uri) && (
         //                <>
         //                   <button
         //                      type="button"
         //                      onClick={() => {
         //                         const attachment = data.attachments.find(x => x.type === columnName);
         //                         if (attachment) {
         //                            handleDocumentClick(attachment.uri ?? "");
         //                         }
         //                      }}
         //                      className="underline text-[#3b82f6] mr-1.5 py-2 px-1"
         //                      style={{ cursor: 'pointer' }}
         //                   >
         //                      <i className="fas fa-eye"></i> {/* Changed to view icon */}
         //                   </button>
         //                   <button
         //                      type="button"
         //                      className="underline text-[#3b82f6] mr-1.5 py-2 px-1"
         //                      onClick={() => handleCrossClick(columnName, rowIndex)}
         //                      style={{ cursor: 'pointer' }}
         //                   >
         //                      <i className="fas fa-times"></i> {/* Changed to cross icon */}
         //                   </button>
         //                </>
         //             )}
         //             <input type="file"
         //                accept="application/pdf"
         //                onChange={(e) => {
         //                   const file = e.target.files?.[0];
         //                   if (file) {
         //                      handleAttachmentChange(columnName, e, rowIndex);
         //                   }
         //                }}
         //             />
         //          </td>
         //       )
         //    }
         //    else {
         //       return <></>
         //    }
         // },

      };

      const renderer =
         renderers[propertyName] ||
         (() => formattedCell(data, cellValue, columnName, propertyName, rowIndex));

      if (visibleColumns.find((x) => x.label === columnName)) {
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

   const handleSubmit = async () => {
      try {
         setShowSpinner(true);
         var data = bulkRecords.map((item) => ({
            ...item,
         }));
         const response = await FileEvictionService.editFileEvictionTXBulk(data);
         if (response.status === HttpStatusCode.Ok) {
            // Display a success toast message
            toast.success("Eviction info successfully updated.");
            setSelectAll(false);
            setSelectedFileEvictionId([]);
            setBulkRecords([]);

            getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, fileEvictions.searchParam, fileEvictions.clientId);

            // Close the popup
            props.handleClose();
         } else {
            setShowConfirm(false);
            setShowSpinner(false);
         }
      } finally {
         setShowSpinner(false);
      }
   };

   const handleConfirmModalClose = () => {
      setShowConfirm(false);
   };

   const handleModalClose = () => {
      props.handleClose();
      getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, fileEvictions.searchParam, fileEvictions.clientId);
      setBulkRecords([]);
      setSelectedFileEvictionId([]);
   };

   const formattedTenantValue = (data: IFileEvictionsTXItems, index: number) => {
      if (data.tenantNames && data.tenantNames.length >= 0)
         return data.tenantNames[index];
      else return null;
   };

   // const getFieldsErrorMessages = (rowIndex: number, propertyName: string) => {
   //    const errorMessages: string[] = [];
   //    rowErrors.filter((error) => {
   //       if (!error.fields.length) return null;
   //       if (error.rowIndex === rowIndex && error.fields.length) {
   //          error.fields.forEach((f) => {
   //             if (f.fieldName.toLowerCase() === propertyName.toLowerCase()) {
   //                errorMessages.push(f.message);
   //             }
   //          });
   //       }
   //    });

   //    return errorMessages;
   // };
   const getFieldsErrorMessages = (rowIndex: number, propertyName: string) => {
      const errorMessages: string[] = [];

      columnErrors.forEach((recordError) => {
         // Ensure recordError exists and has the propertyName
         if (recordError && recordError[propertyName]) {
            recordError[propertyName].forEach((errorDetail) => {
               if (errorDetail.rowIndex === rowIndex) {
                  errorMessages.push(errorDetail.errorMessage);
               }
            });
         }
      });

      return errorMessages;
   };

   const isSeprateDocCourt = (court: string) => {

      switch (court.trim().toLowerCase()) {
         case "harris county - jp - precinct 1, place 2":
            return true;
         case "harris county - jp - precinct 4, place 1":
            return true;
         default:
            return false;
      }

   };

   const formattedCell = (
      data: IFileEvictionsTXItems,
      value: any,
      columnName: any,
      propertyName: any,
      rowIndex: number
   ) => {

      const fileAttachment = bulkRecords[rowIndex]?.attachments?.find(att => att.type === columnName);
      var isSeperateDocCourt = isSeprateDocCourt(bulkRecords[rowIndex].court?.toLowerCase());
      const isError = isSeperateDocCourt && !fileAttachment && columnName != "BatchUpload";
      if (["BatchUpload", "Petition", "Notice", "SCRAReport", "SCRAAffidavit", "Lease","SupplementalDocuments1","SupplementalDocuments2"].includes(columnName)) {
         return (
            <div className="fields_validation" style={{
               display: "flex",
               alignItems: "center",
               verticalAlign: "middle"
            }}>
               {data.attachments.some(x => x.type === columnName && x.uri) && (
                  <>
                     <button
                        type="button"
                        onClick={() => {
                           const attachment = data.attachments.find(x => x.type === columnName);
                           if (attachment) {
                              handleDocumentClick(attachment.uri ?? "");
                           }
                        }}
                        className="underline text-[#3b82f6] mr-1.5 py-2 px-1"
                        style={{ cursor: 'pointer' }}
                     >
                        <i className="fas fa-eye"></i> {/* Changed to view icon */}
                     </button>

                  </>
               )}
               {fileAttachment ? <div className="flex items-center">
                  <span className="mr-2">{fileAttachment.fileName}</span>
                  <FaTimes
                     onClick={() => handleCrossClick(columnName, rowIndex)}
                     className="text-red-500 hover:text-red-700 !min-w-2 !static"
                  />
               </div> : <div className={`${isError ? " border p-1 border-red-500 rounded-md" : ""}`}>
                  <input
                     type="file"
                     accept="application/pdf"
                     onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                           handleAttachmentChange(columnName, e, rowIndex);
                     }}>
                  </input>
                  {getFieldsErrorMessages(rowIndex, propertyName).map(
                     (message, index) => (
                        <div
                           key={index}
                           className="text-red-500 mb-1"
                        >
                           {message}
                        </div>
                     )
                  )}
               </div>}

            </div>
         )

      }
      //console.log(fieldName, " fieldname ");
      return (
         <div className="fields_validation">
            <input
               type={"text"}
               value={value as string}
               name={columnName}
               className={
                  "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-[11px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
               }
               onChange={(e) =>
                  handleInputChange?.(propertyName, e.target.value, rowIndex)
               }
            />
            {/* {columnErrors[rowIndex]?.[fieldName]?.map((error, index) => (
               <div key={index} className="text-red-500">
                  {error.errorMessage}
               </div>
            ))} */}
            {getFieldsErrorMessages(rowIndex, propertyName).map(
               (message, index) => (
                  <div
                     key={index}
                     className="text-red-500 mb-1"
                  >
                     {message}
                  </div>
               )
            )}
         </div>
      );
   };

   return (
      <>
         <Drawer
            openDrawer={props.showFileEvictionPopup}
            onClose={handleModalClose}             
         >
            {showSpinner && <Spinner />}
            {/* Container for the content */}
            <div id="fullPageContent">
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3
                           className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                           id="modal-title"
                        >
                           Edit File Eviction
                        </h3>
                     </div>
                  </div>

                  {/* Display the grid*/}
                  <div className="relative pt-2 writlabor-writofpossession-grid">
                     <Grid
                        columnHeading={visibleColumns}
                        rows={bulkRecords}
                        handleSelectAllChange={handleSelectAllChange}
                        selectAll={selectAll}
                        showInPopUp={true}
                        cellRenderer={(
                           data: IFileEvictionsTXItems,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                     ></Grid>
                     <div className="py-2.5 flex justify-between mt-1.5 items-center relative z-[1]">
                        <p className="font-semibold text-[10px] md:text-xs">
                           Total records: {selectedFileEvictionId.length}
                        </p>

                        <Button
                           handleClick={() => {
                              const errors: Record<
                                 string,
                                 { rowIndex: number; errorMessage: string }[]
                              >[] = [];
                              const rowErrors: IImportCsvRowError[] = [];
                              // Iterate through gridData with index
                              bulkRecords.forEach((record, index: number) => {
                                 const recordErrors: Record<
                                    string,
                                    { rowIndex: number; errorMessage: string }[]
                                 > = {};
                                 const fields: IImportCsvFieldError[] = [];
                                 try {
                                    validationSchema.validateSync(record, { abortEarly: false });
                                 } catch (error: any) {
                                    if (error.inner) {
                                       error.inner.forEach((detailError: any, i: number) => {
                                          const propertyName = detailError.path || "unknown";
                                          const errorMessage = `${detailError.message}`;

                                          // Use original index for rowIndex
                                          const rowIndex: number = index;
                                          // const rowIndex = detailError.rowIndex || -1;

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
                              if (
                                 errors.length === 0
                                 // columnErrors.length === 0 ||
                                 // columnErrors.every(
                                 //    (errors) => Object.keys(errors).length === 0
                                 // )
                              ) {
                                 const hasRequiredAttachmentType = bulkRecords.some(item =>
                                    !(item.attachments?.some(attachment =>
                                       attachment.type === 'BatchUpload' || attachment.type === 'Petition'
                                    ))
                                 );
                                 if (hasRequiredAttachmentType) {
                                    toast.error("Need to upload either a BatchUpload or Petition file.");
                                 }
                                 else {
                                    const data = bulkRecords.filter(x =>
                                       isSeprateDocCourt(x.court.toLowerCase()) &&
                                       x.attachments &&
                                       x.attachments.filter(att => att.type !== "BatchUpload").length !== 5
                                    );

                                    // If matching data exists, show confirmation, otherwise, handle submit
                                    if (data.length > 0) {
                                       setShowConfirmText("You may have more documents to upload, are you sure you want to proceed?");
                                       setShowConfirm(true);
                                    } else {
                                       setShowConfirmText("Are you sure you want to update the eviction information ?");
                                       setShowConfirm(true);
                                    }
                                 }
                              }
                           }}
                           title="Save"
                           isRounded={false}
                           type={"button"}
                        ></Button>
                     </div>
                     {columnErrors.some((errors) => Object.keys(errors).length > 0) && (
                        <p className="text-red-500 text-center absolute inset-x-0 -bottom-1 md:bottom-2 text-sm md:text-base">
                           Please validate your data
                        </p>
                     )}
                  </div>

               </div>
            </div>
            <div>
               <Modal
                  showModal={showConfirm}
                  onClose={handleConfirmModalClose}
                  width="max-w-md"
               >
                  {showSpinner && <Spinner />}
                  {/* Container for the content */}
                  <div id="fullPageContent">
                     <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                        <div className="text-center pr-4 sm:text-left">
                           <h3
                              className="text-sm font-semibold leading-5 text-gray-900"
                              id="modal-title"
                           >
                              {showConfirmText}
                           </h3>
                        </div>
                     </div>
                     <div className="flex justify-end m-2">
                        <Button
                           type="button"
                           isRounded={false}
                           title="No"
                           handleClick={handleConfirmModalClose}
                           classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                        ></Button>
                        <Button
                           handleClick={() => handleSubmit()}
                           title="Yes"
                           isRounded={false}
                           type={"button"}
                           classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        ></Button>
                     </div>
                  </div>
               </Modal>
            </div>
         </Drawer>



      </>
   );
};

export default FileEvictionsTX_BulkEdit;
