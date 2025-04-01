import React, { ChangeEvent, useEffect, useState } from "react";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { toast } from "react-toastify";
import { FaCross, FaTimes, FaTrash } from "react-icons/fa";
import InputMask from "react-input-mask";
import FormikControl from "components/formik/FormikControl";
import DownloadButton from "components/common/button/DownloadButton";
import Grid from "components/common/grid/Grid";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import Modal from "components/common/popup/PopUp";
import DropdownPresentation from "components/common/dropdown/DropDown";
import { useAuth } from "context/AuthContext";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import { ISelectOptions } from "interfaces/late-notices.interface";
import fileUpload from "assets/svg/file-upload.svg";
import dollarImage from "assets/images/dollar-sign.svg";
import FileEvictionService from "services/file-evictions.service";
import { HttpStatusCode, UserRole } from "utils/enum";
import { formatCurrency, formatZip, handlePostalCodeKeyDown } from "utils/helper";
import CommonValidations from "utils/common-validations";
import { useFileEvictionsTXContext } from "../FileEvictionsTXContext";
import { IFileEvictionsTXItems, IFileEvictionTXImportCsv } from "interfaces/file-evictions-tx.interface";
import { FileEvictionTXCSVHeader, StateCode } from "utils/constants";
import Drawer from "components/common/drawer/Drawer";

type SetImportCsvPopUp = (
   value: React.SetStateAction<boolean>,
   resetGrid: boolean
) => void;

type FileEvictionsTXImportCsvProps = {
   importCsvPopUp: boolean;
   setImportCsvPopUp: SetImportCsvPopUp;
   counties: string[];
   courts: string[];
};

const initialSelectOption: ISelectOptions = { id: '', value: '' };

const FileEvictionsTX_ImportCsv = (props: FileEvictionsTXImportCsvProps) => {
   const {
      selectedFileEvictionId,
      setSelectedFileEvictionId,
      fileEvictions,
      setFileEvictions,
      allCompanies,
      getFileEvictions
   } = useFileEvictionsTXContext();
   const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
   const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);
   const [isSelectedCompany, setIsSelectedCompany] = useState(true);
   const [showConfirm, setShowConfirm] = useState(false);
   const { userRole, selectedStateValue } = useAuth();
   useEffect(() => {
      const fetchData = async () => {
         try {
            var list = allCompanies.map((item) => ({
               id: item.id,
               value: item.companyName
            }));
            var newList = list.filter((item) => item.value !== "Super Company");
            setCompanyList(newList);
         } catch (error) {
            console.error("Error fetching data:", error);
         }
      };

      fetchData();
   }, [allCompanies]);

   const validationSchema: yup.ObjectSchema<any> = yup.object({
      County: CommonValidations.countyValidation(props.counties),

      Court: yup.string() .required("Please enter court").when('County', {
         is: (county: string) => !!county,
         then: schema =>
            schema              
               .test(
                  "valid-court",
                  "Court is not supported in County",
                  function (value) {
                     const county = this.parent.County;
                     const trimmedValue = value?.trim();

                     if (!trimmedValue) return true;

                     //   const jpPattern = /JP (\d+)-(\d+)/i;
                     //   const match = trimmedValue.match(jpPattern);

                     //   if (match) {
                     //       const precinct = match[1];
                     //       const place = match[2];
                     //       const transformedValue = `${county.toLowerCase()} county - jp - precinct ${precinct}, place ${place}`;

                     //       return props.courts.some(
                     //           (court: string) =>
                     //               court.toLowerCase().includes(county.toLowerCase()) &&
                     //               court.toLowerCase() === transformedValue.toLowerCase()
                     //       );
                     //   } else {
                     return props.courts.some(
                        (court: string) =>
                           court.toLowerCase().includes(county.toLowerCase()) &&
                           court.toLowerCase() === trimmedValue.toLowerCase()
                     );
                     //   }
                  }
               ),
         otherwise: schema => schema.optional(),
      }),

      Tenant1Phone: yup
         .string()
         .nullable()
         .test('is-valid-phone', 'Please enter a valid phone number', (value) => {
            if (!value || value.trim() === '') {
               return true; // Allow null or empty values
            }
            return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value); // Phone number format
         })
         .test('at-least-one-contact', 'Phone is required.', function (value) {
            const { Tenant1Email } = this.parent; // Access the other field
            if (!value && !Tenant1Email) {
               return false; // Neither phone nor email is filled
            }
            return true; // Validation passes if either field has a value
         }),
         Tenant2Phone: yup
         .string()
         .nullable()
         .test('is-valid-phone', 'Please enter a valid phone number', (value) => {
            if (!value || value.trim() === '') {
               return true; // Allow null or empty values
            }
            return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value); // Phone number format
         }),         
         Tenant3Phone: yup
         .string()
         .nullable()
         .test('is-valid-phone', 'Please enter a valid phone number', (value) => {
            if (!value || value.trim() === '') {
               return true; // Allow null or empty values
            }
            return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value); // Phone number format
         }),         
         Tenant4Phone: yup
         .string()
         .nullable()
         .test('is-valid-phone', 'Please enter a valid phone number', (value) => {
            if (!value || value.trim() === '') {
               return true; // Allow null or empty values
            }
            return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value); // Phone number format
         }),         
         Tenant5Phone: yup
         .string()
         .nullable()
         .test('is-valid-phone', 'Please enter a valid phone number', (value) => {
            if (!value || value.trim() === '') {
               return true; // Allow null or empty values
            }
            return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value); // Phone number format
         }),

      Tenant1Email: yup
         .string()
         .nullable()
         .email('Must be a valid email.')
         .max(50, 'Cannot exceed 50 characters')
         .test('at-least-one-contact', 'Email is required.', function (value) {
            const { Tenant1Phone } = this.parent; // Access the other field
            if (!value && !Tenant1Phone) {
               return false; // Neither phone nor email is filled
            }
            return true; // Validation passes if either field has a value
         }),

      Tenant2Email: yup.string().email("Must be a valid email.").max(50, "Cannot exceed 50 characters"),
      Tenant3Email: yup.string().email("Must be a valid email.").max(50, "Cannot exceed 50 characters"),
      Tenant4Email: yup.string().email("Must be a valid email.").max(50, "Cannot exceed 50 characters"),
      Tenant5Email: yup.string().email("Must be a valid email.").max(50, "Cannot exceed 50 characters"),

      Tenant1Last: yup.string().required("Please enter Tenant1 last name."),
      Tenant1First: yup.string().required("Please enter Tenant1 first name."),
      TenantAddress: yup.string().required("Please enter address").min(3, "Address must be at least 3 characters"),
      TenantUnit: yup.string().required("Please enter tenant unit."),
      TenantCity: yup.string().required("Please enter city"),
      TenantState: yup
         .string()
         .max(2, "State Code must be of 2 characters.")
         .required("Please enter state code.")
         .test(
            "is-selected-state",
            `State Code must be ${selectedStateValue}.`,
            (value) => value === selectedStateValue
         ),
      TenantZip: yup.string().required("Please enter ZIP code."),

      PropertyName: yup.string().required("Please enter property name"),
      PropertyPhone: yup
         .string()
         .required("Please enter property phone.")
         .test('is-valid-phone', 'Please enter a valid phone number', (value) => {
            if (!value || value.trim() === '') return true;
            return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value);
         }),

      PropertyEmail: yup
         .string()
         .required("Please enter property email")
         .email("Please enter a valid email address")
         .max(50, "Cannot exceed 50 characters"),
      PropertyAddress: yup.string().required("Please enter property address"),
      PropertyCity: yup.string().required("Please enter property city"),
      PropertyState: yup
         .string()
         .max(2, "State Code must be of 2 characters.")
         .required("Please enter state code."),
      PropertyZip: yup.string().required("Please enter ZIP code."),

      AttorneyName: yup
         .string()
         .max(50, "Cannot exceed 50 characters")
         .test('AttorneyName-Required', 'Attorney name is required.', function (value) {
            const { AttorneyBarNo } = this.parent; // Access sibling field
            
            if (AttorneyBarNo && !value) {
               return false; // Fail validation if AttorneyBarNo is filled but AttorneyName is empty
            }
            return true; // Pass validation otherwise
         }),
      AttorneyBarNo: yup
         .string()
         .test('BarNo-Required', 'Attorney bar no. is required.', function (value) {
            
            const { AttorneyName } = this.parent; // Access sibling field
            if (AttorneyName && !value) {
               return false; // Fail validation if AttorneyName is filled but AttorneyBarNo is empty
            }
            return true; // Pass validation otherwise
         }),

      FilerBusinessName: yup.string().required("Please enter Filer Business Name"),
      EvictionFilerEmail: yup
         .string()
         .required("Please enter filer email.")
         .test(
            "valid-emails",
            "Invalid email format. Enter in johndoe@gmail.com, sarahjane@yahoo.com, etc format",
            (value) => {
               if (!value) return true;
               const emails = value.split(",").map((email) => email.trim());
               return emails.every((email) => yup.string().email().isValidSync(email));
            }
         ),

      //  Attachments: yup.array().of(
      //    yup.object({
      //      url: yup.string().url().required('URL is required'),
      //      type: yup.string().oneOf(['BatchUpload', 'Petition']).required('Type is required'),
      //    })
      //  )
      //  .test('at-least-one-required', 'At least one of BatchUpload or Petition is required.', function(value) {
      //    
      //    const hasBatchUpload = value?.some((attachment) => attachment.type === 'BatchUpload');
      //    const hasPetition = value?.some((attachment) => attachment.type === 'Petition');
      //    return hasBatchUpload || hasPetition;
      //  }),

      // BatchUpload: yup.string().when('Attachments', {
      //    is: (attachments: { type: string }[] | undefined) => {
      //       // Check if 'attachments' is an array and contains either 'BatchUpload' or 'Petition'
      //       return Array.isArray(attachments) &&
      //          attachments.some((attachment) => attachment.type === 'BatchUpload' || attachment.type === 'Petition');
      //    },
      //    then: (schema) =>
      //       schema.notRequired(), // If either 'BatchUpload' or 'Petition' exists, make it not required
      //    otherwise: (schema) =>
      //       schema.required('BatchUpload is required'), // Otherwise, require it
      // }),


      // Petition: yup.string().when('Attachments', {
      //    is: (attachments: { type: string }[] | undefined) => {
      //       // Check if 'attachments' is an array and contains either 'BatchUpload' or 'Petition'
      //       return Array.isArray(attachments) &&
      //          attachments.some((attachment) => attachment.type === 'BatchUpload' || attachment.type === 'Petition');
      //    },
      //    then: (schema) =>
      //       schema.notRequired(), // If either 'BatchUpload' or 'Petition' exists, make it not required
      //    otherwise: (schema) =>
      //       schema.required('Petition is required'), // Otherwise, require it
      // }),
   });


   // const [gridData, setGridData] = useState<ICreateFileEviction[]>([]);
   const [gridData, setGridData] = useState<IFileEvictionTXImportCsv[]>([]);
   // this is used to show upload csv button on the pop up
   const [showUploadCsv, setShowUploadCsv] = useState<boolean>(true);
   // this is to show message when user upload empty csv
   const [showEmptyRecordMessage, setShowEmptyRecordMessage] =
      useState<boolean>(false);
   // show validation error on the columns
   const [columnErrors, setColumnErrors] = useState<
      Record<string, { rowIndex: number; errorMessage: string }[]>[]
   >([]);

   const [rowErrors, setRowErrors] = useState<IImportCsvRowError[]>([]);


   // this is used to show error when csv is invalid
   const [showInvalidCSVMessage, setShowInvalidCSVMessage] =
      useState<boolean>(false);

   // this is used to show error when csv is invalid
   const [showMaxRecords, setshowMaxRecords] = useState<boolean>(false);
   // set spinner
   const [toggleSpinner, setToggleSpinner] = useState<boolean>(false);
   const [filteredRecords, setFilteredRecords] = useState<IFileEvictionsTXItems[]>([]);
   const [totalRecord, setTotalRecord] = useState<number>(0);
   const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
   const initialValues = {
      UploadFile: "",
   };

   useEffect(() => {
      setFilteredRecords(
         fileEvictions.items.filter((item) =>
            selectedFileEvictionId.includes(item.id || "")
         )
      );
   }, [fileEvictions.items, selectedFileEvictionId]);

   const resetSelectedRows = () => {
      setFilteredRecords([]);
      setSelectedFileEvictionId([]);
      setFileEvictions((prev) => {
         return {
            ...prev,
            items: prev.items.map((item) => ({
               ...item,
               isChecked: false,
            })),
         };
      });
   };

   /**
    * Handles the creation of file evictions based on the provided form values.
    * Displays a success toast message upon successful creation.
    * Closes the popup on success.
    *
    * @param {ICreateFileEviction} formValues - The form values for creating a late notice.
    */
   const handleFileEvictions = async () => {

      const errors: Record<
         string,
         { rowIndex: number; errorMessage: string }[]
      >[] = [];
      const rowErrors: IImportCsvRowError[] = [];
      // Iterate through gridData with index
      gridData.forEach((record, index: number) => {
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

      if (errors.length === 0) {
         const hasRequiredAttachmentType = gridData.some(item =>
            !(item.Attachments?.some(attachment =>
               attachment.type === 'BatchUpload' || attachment.type === 'Petition'
            ))
         );
         if (hasRequiredAttachmentType) {
               toast.error("Need to upload either a BatchUpload or Petition file.");
         }
         else {
            // Filter the records where Court is "JP 1-2" and Attachments length excluding "BatchUpload" is not 5
            const data = gridData.filter(x =>
               isSeprateDocCourt(x.Court.toLowerCase()) &&
               x.Attachments &&
               x.Attachments.filter(att => att.type !== "BatchUpload").length !== 5
            );

            // If matching data exists, show confirmation, otherwise, handle submit
            if (userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)) {
               if (selectedCompany.id == '' && selectedCompany.value == '') {
                  setIsSelectedCompany(false);
                  return;
               }
            }
            if (data.length > 0)
               setShowConfirm(true);
            else
               handleSubmit();
         }


      }
   };

   const handleSubmit = async () => {
      try {
         setToggleSpinner(true);
         const formattedData = gridData.map((item: IFileEvictionTXImportCsv) => ({
            ...item,
            TenantZip: item.TenantZip != null ? formatZip(item.TenantZip) : "",
            PropertyZip: item.PropertyZip != null ? formatZip(item.PropertyZip) : "",
            AndAllOtherOccupants: item.AndAllOtherOccupants,
            PropertyPhone: item.PropertyPhone.replace(/[^\d-]/g, "").replace(
               /(\d{3})(\d{3})(\d{4})/,
               "$1-$2-$3"
            ),
            FilingState: selectedStateValue,
         }));

         if (userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)) {
            if (selectedCompany.id != '' && selectedCompany.value != '') {
               formattedData.forEach(item => {
                  // Adding the clientId property to each object
                  item.ClientId = selectedCompany.id.toString();
               });
               const response = await FileEvictionService.createFileEvictionTXForImport(
                  formattedData
               );
               if (response.status === HttpStatusCode.OK) {
                  toast.success("Successfully Imported CSV");
                  getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, fileEvictions.searchParam, fileEvictions.clientId);
                  props.setImportCsvPopUp(false, true);
               }
               // else {
               //    toast.error("Failed to create file eviction.");
               // }
            }
            else {
               // toast.error("Select a company!!");
               setIsSelectedCompany(false);
            }
         }
         else {
            ;
            const response = await FileEvictionService.createFileEvictionTXForImport(
               formattedData
            );

            if (response.status === HttpStatusCode.OK) {
               toast.success("Successfully Imported CSV");
               getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, fileEvictions.searchParam, fileEvictions.clientId);
               props.setImportCsvPopUp(false, true);
            }
            //  else {
            //    toast.error("Failed to create file eviction.");
            // }
         }
      } catch (error) {
         console.error("An error occurred:", error);
      } finally {
         setToggleSpinner(false);
      }
   }

   // const getErrorMessages = (rowIndex: number, propertyName: string) => {
   //    
   //    const errorMessages: string[] = [];

   //    rowErrors.forEach((error) => {
   //       // Ensure `error` and `error.fields` are defined and valid
   //       if (error && Array.isArray(error.fields) && error.rowIndex === rowIndex) {
   //          error.fields.forEach((f) => {
   //             if (f?.fieldName === propertyName) {
   //                errorMessages.push(f.message);
   //             }
   //          });
   //       }
   //    });

   //    return errorMessages;
   // };

   const getErrorMessages = (rowIndex: number, propertyName: string) => {
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

   /**
    *  handle cross click
    */
   const handleCrossClick = (rowIndex: number) => {
      let filteredRecords = gridData.filter((_, index) => index !== rowIndex);
      const newColumnErrors = [...columnErrors];
      newColumnErrors.splice(rowIndex, 1);
      setColumnErrors(newColumnErrors);
      // Set the updated array to the state or wherever you store the data
      setTotalRecord(filteredRecords.length);
      setGridData(filteredRecords);
   };

   /**
    *  * setting updated value in the editable grdi
    * @param columnName editable column name
    * @param updatedBValue updated value in the text box
    * @param selectedRowIndex selected row
    */
   // const handleInputChange = (
   //    columnName: string,
   //    updatedBValue: string,
   //    selectedRowIndex: number
   // ) => {
   //    
   //    let sanitizedValue =
   //       columnName === "monthlyRent" || columnName === "totalRentDue"
   //          ? formatCurrency(
   //             parseFloat(updatedBValue.toString().replace(/[^0-9.]/g, ""))
   //          )
   //          : updatedBValue;
   //    // Update the state based on the column index and row index
   //    setGridData((prevRows) =>
   //       prevRows.map((row, rowIndex) => {
   //          const updatedRow =
   //             rowIndex === selectedRowIndex
   //                ? { ...row, [columnName]: updatedBValue }
   //                : row;
   //          // Perform validation for the updated row
   //          if(rowIndex === selectedRowIndex)
   //             validateField(updatedBValue,columnName, rowIndex,updatedRow);
   //          return updatedRow;
   //       })
   //    );
   // };


   const handleInputChange = (
      columnName: string,
      updatedBValue: string,
      selectedRowIndex: number
   ) => {
      
      // Sanitize the value based on the column being edited
      let sanitizedValue =
         columnName === "monthlyRent" || columnName === "totalRentDue"
            ? formatCurrency(parseFloat(updatedBValue.toString().replace(/[^0-9.]/g, "")))
            : updatedBValue;
   
      // Update the state based on the column and row index
      setGridData((prevRows) =>
         prevRows.map((row, rowIndex) => {
            // Update the row at selected index with the new value
            const updatedRow =
               rowIndex === selectedRowIndex
                  ? { ...row, [columnName]: sanitizedValue }
                  : row;
   
            // Perform validation for the updated row if it's the selected row
            if (rowIndex === selectedRowIndex) {
               // You should pass the sanitized value to validateField here
               validateField(sanitizedValue, columnName, rowIndex, updatedRow);
               switch(columnName){
                  case "AttorneyName":
                     validateField(updatedRow.AttorneyBarNo, "AttorneyBarNo", rowIndex, updatedRow);
                     break;
                  case "AttorneyBarNo":
                     validateField(updatedRow.AttorneyName, "AttorneyName", rowIndex, updatedRow);
                     break;
                  case "Tenant1Email":
                        validateField(updatedRow.Tenant1Phone, "Tenant1Phone", rowIndex, updatedRow);
                        break;
                  case "Tenant1Phone":
                        validateField(updatedRow.Tenant1Email, "Tenant1Email", rowIndex, updatedRow);
                        break;
                  default:
                     break;
               }
            }
   
            return updatedRow;
         })
      );
   };
   

   // const validateField = (fieldValue: any, fieldName: string, rowIndex: number, rowData: IFileEvictionTXImportCsv) => {
      
   //    const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};
   //    const fields: IImportCsvFieldError[] = [];
   
   //    try {
   //       // First, validate the individual field using the validation schema
   //       validationSchema.validateSyncAt(fieldName, rowData, { abortEarly: false });         
   
   //       // If validation passes, clear the error for the specific field (remove previous errors)
   //       setColumnErrors((prevErrors) => {
   //          const updatedErrors = [...prevErrors];
   
   //          // Clear the specific field's error for this row
   //          if (updatedErrors[rowIndex]) {
   //             const { [fieldName]: _, ...remainingErrors } = updatedErrors[rowIndex];
   //             updatedErrors[rowIndex] = remainingErrors;
   //          }
   
   //          return updatedErrors;
   //       });
   
   //       return { recordErrors: {}, fields: [] }; // No errors to return
   //    } catch (error: any) {
   //       if (error.inner) {
   //          // Collect validation errors for the specific field
   //          error.inner.forEach((detailError: any) => {
   //             const errorMessage = `${detailError.message}`;
   
   //             fields.push({
   //                fieldName,
   //                message: errorMessage,
   //             });
   
   //             if (!recordErrors[fieldName]) {
   //                recordErrors[fieldName] = [];
   //             }
   
   //             recordErrors[fieldName].push({
   //                rowIndex,
   //                errorMessage,
   //             });
   //          });
   //       }
   
        
   //       setColumnErrors((prevErrors) => {
   //          const updatedErrors = [...prevErrors];
   
   //          const existingErrors = prevErrors[rowIndex] || {};
   
   //          updatedErrors[rowIndex] = {
   //             ...existingErrors,
   //             ...recordErrors, // Merge new errors for the current row
   //          };
   
   //          return updatedErrors;
   //       });
   
   //       return { recordErrors, fields };
   //    }
   // };
   

   const validateField = (
      fieldValue: any,
      fieldName: string,
      rowIndex: number,
      rowData: IFileEvictionTXImportCsv
   ) => {
      const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};
      const fields: IImportCsvFieldError[] = [];
   
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
           }else {
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
        
            // Safely access recordErrors[fieldName] and its first element
            const fieldError = recordErrors[fieldName]?.[0];
            if (fieldError) {
                // Add the new error for this field
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

   

   // const validateRow = (row: IFileEvictionTXImportCsv, rowIndex: number) => {

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

   // const validateRow = (row: IFileEvictionTXImportCsv, rowIndex: number) => {
   //    const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};
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
   //    setColumnErrors((prevErrors) => {
   //       const updatedErrors = [...prevErrors];
         
   //       // Clear previous errors for the current row and property if they exist
   //       updatedErrors[rowIndex] = {
   //          ...updatedErrors[rowIndex],
   //          ...recordErrors, // Replace or update the errors for this row
   //       };
   
   //       return updatedErrors;
   //    });
   // };
   
   

   /**
    *
    * @param data imported data from csv
    */
   const loadUserData = (data: IFileEvictionTXImportCsv[]) => {
      try {
         if (data.length === 0) {
            setShowUploadCsv(true);
            setToggleSpinner(false);
            setShowEmptyRecordMessage(true);
            return;
         }
         setTotalRecord(data.length);
         setShowUploadCsv(false);
         setShowEmptyRecordMessage(false);
         setShowInvalidCSVMessage(false);

         const formattedData = data.map((item: IFileEvictionTXImportCsv) => {
            return {
               Remove: "",
               ...item,
               TenantUnit: item.TenantUnit
                  ? item.TenantUnit.toString()
                  : item.TenantUnit,
               TenantZip: item.TenantZip
                  ? item.TenantZip.toString()
                  : item.TenantZip,
               PropertyZip: item.PropertyZip
                  ? item.PropertyZip.toString()
                  : item.PropertyZip,
               PropertyPhone: item.PropertyPhone.toString().trim(), 
               FilingDescription:"",
               BatchUpload: null,
               Petition: null,
               Notice: null,
               SCRAReport: null,
               SCRAAffidavit: null,
               Lease: null,
               SupplementalDocuments1:null,
               SupplementalDocuments2:null,
               Attachments: [],
            };
         });
         setGridData(formattedData);
         setToggleSpinner(false);
      } catch (error) {
         setShowUploadCsv(true);
         setToggleSpinner(false);
         setShowInvalidCSVMessage(true);
      }
   };

   const handleFileUpload = (data: IFileEvictionTXImportCsv[]) => {
      if (data.length === 0) {
         setToggleSpinner(false);
         toast.error(
            "The uploaded file is empty. Please make sure the file is not empty and try again."
         );
         return;
      }

      // Trim spaces from each cell in the data and remove entries with empty string keys
      const trimmedData = data.map(record => {
         const trimmedRecord: Partial<IFileEvictionTXImportCsv> = {};
         for (const key in record) {
            if (record.hasOwnProperty(key)) {
               const trimmedKey = key.trim();
               if (trimmedKey !== "") {
                  const value = record[key as keyof IFileEvictionTXImportCsv];
                  if (typeof value === 'string') {
                     trimmedRecord[trimmedKey as keyof IFileEvictionTXImportCsv] = value.trim() as any;
                  }
                  // else {
                  //     trimmedRecord[trimmedKey as keyof IFileEvictionTXImportCsv] = value?.toString() as any;
                  // }
               }
            }
         }
         return trimmedRecord as IFileEvictionTXImportCsv;
      });


      const keys = Object.keys(trimmedData[0]);
      const headerMatches = keys.every((key) =>
         FileEvictionTXCSVHeader.includes(key)
      );

      if (headerMatches && FileEvictionTXCSVHeader.length === keys?.length) {
         loadUserData(trimmedData);
      } else {
         setToggleSpinner(false);
         toast.error(
            "The uploaded file header does not match. Please download the template, and try uploading again."
         );
      }
   };

   const handleFileUploadError = (error: Error) => {
      if (error.message === "File size exceeds the maximum allowed size.") {
         setshowMaxRecords(true);
      } else {
         setshowMaxRecords(false);
      }
      setToggleSpinner(false);
   };

   const handleCompanyChange = (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedCompany({ id: event.target.value, value: companyList.find(x => x.id === event.target.value)?.value || '' });
      if (event.target.value != '') {
         setIsSelectedCompany(true);
      }
   };
   const handleAttachmentChange = (
      attachmentType: string,
      event: React.ChangeEvent<HTMLInputElement>, // Assuming the event is from an input element
      rowIndex: number
   ) => {
      const file = event.target.files?.[0]; // Get the first selected file
      if (file) {
         // Check if the selected file is of type PDF
         if (file.type === "application/pdf") {
            // Convert the selected file to base64
            const reader = new FileReader();
            reader.onload = () => {
               const pdfBase64 = reader.result as string;
               const base64Data = pdfBase64.split(",")[1]; // Extracting only the base64 data part
               const fileName = file.name; // Get the file name
               const fileNameWithoutExtension = fileName;
               //.split('.').slice(0, -1).join('.'); // Extract file name without extension

               // Now update the grid data with the base64 data and other file info
               setGridData((prevRows) =>
                  prevRows.map((row, index) => {
                     if (index === rowIndex) {
                        const updatedAttachments = row.Attachments ? [...row.Attachments] : [];

                        const existingAttachmentIndex = updatedAttachments.findIndex(
                           (att) => att.type === attachmentType
                        );

                        const newAttachment = {
                           type: attachmentType,
                           fileName: fileNameWithoutExtension, // Using the file name without extension
                           pdfData: base64Data,
                        };

                        if (existingAttachmentIndex !== -1) {
                           // Replace the existing attachment
                           updatedAttachments[existingAttachmentIndex] = newAttachment;
                        } else {
                           // Add the new attachment
                           updatedAttachments.push(newAttachment);
                        }
                        var updatedRow = { ...row, Attachments: updatedAttachments };
                        //validateRow(updatedRow, rowIndex);
                        return { ...row, Attachments: updatedAttachments }; // Ensure consistency with 'Attachments'
                     }
                     return row;
                  })
               );

            };
            reader.readAsDataURL(file); // Trigger file reading as base64
         } else {
            console.error("Please select a PDF file."); // Optional: handle non-PDF files
         }
      }
   };

   const handleRemoveAttachment = (attachmentType: string, rowIndex: number) => {
      setGridData(prevRows =>
         prevRows.map((row, index) => {
            if (index === rowIndex) {
               const updatedAttachments = row.Attachments?.filter(att => att.type !== attachmentType) || [];
               var updatedRow = { ...row, Attachments: updatedAttachments };
               //validateRow(updatedRow, rowIndex);
               return { ...row, Attachments: updatedAttachments };
            }
            return row;
         })
      );
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


   return (
      <>
         {gridData?.length > 0 ? (
            <Drawer
               openDrawer={props.importCsvPopUp}
               onClose={() => {
                  props.setImportCsvPopUp(false, false);
                  resetSelectedRows();
               }}
            >
               <div className="bg-white pb-1.5 pt-4 p-3.5 md:p-5 !pb-1">
                  <div className="sm:flex sm:items-start">
                     <div className="my-2.5 text-center md:my-0 sm:text-left">
                        <h3
                           className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5 -mt-1.5"
                           id="modal-title"
                        >
                           Preview
                        </h3>
                        {(userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin) ? (
                           <div className="mb-1.5">
                              <DropdownPresentation
                                 heading=""
                                 selectedOption={selectedCompany}
                                 handleSelect={handleCompanyChange}
                                 options={companyList}
                                 placeholder="Select Company"
                              />
                              {!isSelectedCompany && (
                                 <p className="text-red-500 text-xs mt-1.5" style={{ marginLeft: "12px" }}>Select a Company</p>
                              )}
                           </div>
                        ) : (
                           <h2></h2>
                        )
                        )}
                     </div>
                  </div>
                  <div className="preview-data">
                     {toggleSpinner && <Spinner />}
                     <Grid
                        columnHeading={[
                           "",
                           "County",
                           "Court",
                           "Tenant1Last",
                           "Tenant1First",
                           "Tenant1MI",
                           "Tenant1Phone",
                           "Tenant1Email",
                           "AndAllOtherOccupants",
                           "TenantAddress",
                           "TenantUnit",
                           "TenantCity",
                           "TenantState",
                           "TenantZip",
                           "Tenant2Last",
                           "Tenant2First",
                           "Tenant2MI",
                           "Tenant2Phone",
                           "Tenant2Email",
                           "Tenant3Last",
                           "Tenant3First",
                           "Tenant3MI",
                           "Tenant3Phone",
                           "Tenant3Email",
                           "Tenant4Last",
                           "Tenant4First",
                           "Tenant4MI",
                           "Tenant4Phone",
                           "Tenant4Email",
                           "Tenant5Last",
                           "Tenant5First",
                           "Tenant5MI",
                           "Tenant5Phone",
                           "Tenant5Email",
                           "PropertyName",                           
                           "PropertyPhone",
                           "PropertyEmail",
                           "PropertyAddress",
                           "PropertyCity",
                           "PropertyState",
                           "PropertyZip",   
                           "AttorneyName",
                           "AttorneyBarNo",
                           "FilerBusinessName",
                           "EvictionFilerEmail",
                           "ClientReferenceId",
                           "CourtesyCopies",
                           "FilingDescription",   
                           "BatchUpload",
                           "Petition",
                           "Notice",
                           "SCRAReport",
                           "SCRAAffidavit",
                           "Lease",  
                           "SupplementalDocuments1",
                           "SupplementalDocuments2",
                        ]}
                        rows={gridData}
                        showInPopUp={true}
                        cellRenderer={(
                           data: IFileEvictionTXImportCsv,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           const columnNames = Object.keys(data);
                           const columnName = columnNames[cellIndex];
                           const cellValue =
                              data[columnName as keyof IFileEvictionTXImportCsv];

                           if (columnName === "PropertyState") {
                              return (
                                 <td
                                    key={cellIndex}
                                    className="px-1.5 py-2 md:py-2.5 font-normal text-[11px] text-gray-900 whitespace-nowrap "
                                 >
                                    {/* Use a regular HTML select element */}
                                    <div className="relative text-left max-w-[120px] fields_validation">
                                       <select
                                          className={
                                             "peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]"
                                          }
                                          name="PropertyState"
                                          value={cellValue?.toString()}
                                          onChange={(e) =>
                                             handleInputChange?.(
                                                columnName,
                                                e.target.value,
                                                rowIndex
                                             )
                                          }
                                       >
                                          {!StateCode.some(
                                             (state) => state.value === cellValue
                                          ) && (
                                                <option value="" disabled hidden>
                                                   Select
                                                </option>
                                             )}
                                          {/* Set the default selected option from the cellValue */}
                                          <option value={cellValue?.toString()}>{cellValue?.toString()}</option>

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
                                       {getErrorMessages(rowIndex, columnName).map(
                                          (message, index) => (
                                             <div
                                                key={index}
                                                className="text-red-500 mb-1"
                                             >
                                                {message}
                                             </div>
                                          )
                                       )}
                                       {/* {columnErrors[rowIndex]?.[columnName]?.map((error, index) => (
                                             <div key={index} className="text-red-500 whitespace-normal">
                                             {error.errorMessage}
                                             </div>
                                          ))} */}
                                    </div>
                                 </td>
                              );
                           }
                           if (columnName === "TenantState") {
                              return (
                                 <td
                                    key={cellIndex}
                                    className="px-1.5 py-2 md:py-2.5 font-normal text-[11px] text-gray-900 whitespace-nowrap "
                                 >
                                    {/* Use a regular HTML select element */}
                                    <div className="relative text-left max-w-[120px] fields_validation">
                                       <select
                                          className={
                                             "peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]"
                                          }
                                          name="TenantState"
                                          value={cellValue?.toString()}
                                          onChange={(e) =>
                                             handleInputChange?.(
                                                columnName,
                                                e.target.value,
                                                rowIndex
                                             )
                                          }
                                       >
                                          {!StateCode.some(
                                             (state) => state.value === cellValue
                                          ) && (
                                                <option value="" disabled hidden>
                                                   Select
                                                </option>
                                             )}
                                          {/* Set the default selected option from the cellValue */}
                                          <option value={cellValue?.toString()}>{cellValue?.toString()}</option>
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
                                       {getErrorMessages(rowIndex, columnName).map(
                                          (message, index) => (
                                             <div
                                                key={index}
                                                className="text-red-500 mb-1"
                                             >
                                                {message}
                                             </div>
                                          )
                                       )}
                                       {/* {columnErrors[rowIndex]?.[columnName]?.map((error, index) => (
                              <div key={index} className="text-red-500 whitespace-normal">
                                {error.errorMessage}
                              </div>
                            ))} */}
                                    </div>
                                 </td>
                              );
                           }
                           if (columnName === "TenantState") {
                              return (
                                 <td
                                    key={cellIndex}
                                    className="px-1.5 py-2 md:py-2.5 font-normal text-[11px] text-gray-900 whitespace-nowrap "
                                 >
                                    {/* Use a regular HTML select element */}
                                    <div className="relative text-left max-w-[120px] fields_validation">
                                       <select
                                          className={
                                             "peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]"
                                          }
                                          name="TenantState"
                                          value={cellValue?.toString()}
                                          onChange={(e) =>
                                             handleInputChange?.(
                                                columnName,
                                                e.target.value,
                                                rowIndex
                                             )
                                          }
                                       >
                                          {!StateCode.some(
                                             (state) => state.value === cellValue
                                          ) && (
                                                <option value="" disabled hidden>
                                                   Select
                                                </option>
                                             )}
                                          {/* Set the default selected option from the cellValue */}
                                          <option value={cellValue?.toString()}>{cellValue?.toString()}</option>

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
                                       {getErrorMessages(rowIndex, columnName).map(
                                          (message, index) => (
                                             <div
                                                key={index}
                                                className="text-red-500 mb-1"
                                             >
                                                {message}
                                             </div>
                                          )
                                       )}
                                       {/* {columnErrors[rowIndex]?.[columnName]?.map((error, index) => (
                                             <div key={index} className="text-red-500 whitespace-normal">
                                             {error.errorMessage}
                                             </div>
                                          ))} */}
                                    </div>
                                 </td>
                              );
                           }
                           if (columnName === "Remove") {
                              return (
                                 <td
                                    key={cellIndex}
                                    className="px-1.5 py-2 md:py-2.5 font-normal text-[11px] text-gray-900 whitespace-nowrap "
                                 >
                                    <div
                                       className="cursor-pointer trash-icon"
                                       key={`${rowIndex}_cross`}
                                    >
                                       <FaTrash
                                          style={{
                                             height: 14,
                                             width: 14,
                                             color: "#E61818",
                                          }}
                                          onClick={() => handleCrossClick(rowIndex)}
                                       ></FaTrash>
                                    </div>
                                 </td>
                              );
                           }
                           // if (["BatchUpload", "Petition", "Notice", "SCRAReport", "SCRAAffidavit", "Lease"].includes(columnName)) {
                           //    return (
                           //       <td key={cellIndex} className="px-1.5 py-2 md:py-2.5 font-normal text-[11px] text-gray-900 whitespace-nowrap "  style={{ verticalAlign: "middle"}}>
                           //          <input type="file"
                           //             accept="application/pdf"
                           //             onChange={(e) => {
                           //                const file = e.target.files?.[0];
                           //                if (file)
                           //                   handleAttachmentChange(columnName, e, rowIndex);
                           //             }}
                           //          />
                           //       </td>
                           //    );
                           // }

                           if (["BatchUpload", "Petition", "Notice", "SCRAReport", "SCRAAffidavit", "Lease","SupplementalDocuments1","SupplementalDocuments2"].includes(columnName)) {
                             
                              const fileAttachment = gridData[rowIndex]?.Attachments?.find(att => att.type === columnName);
                              var isSeperateDocCourt = isSeprateDocCourt(gridData[rowIndex].Court.toLowerCase());
                              const isError = isSeperateDocCourt && !fileAttachment && columnName != "BatchUpload";

                              return (
                                 <td key={cellIndex} className={`px-1.5 py-2 md:py-2.5 font-normal text-[11px] text-gray-900 whitespace-nowrap`}
                                    style={{ verticalAlign: "middle" }}>
                                    {!fileAttachment ? (
                                       <div className={`${isError ? " border p-1 border-red-500 rounded-md" : ""}`}>
                                          <input
                                             type="file"
                                             accept="application/pdf"
                                             onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                   handleAttachmentChange(columnName, e, rowIndex);
                                                   //validateFileAttachments(rowIndex, columnName);
                                                }
                                             }}
                                          />
                                          {/* {getErrorMessages(rowIndex, columnName).map(
                                             (message, index) => (
                                                <div
                                                   key={index}
                                                   className="text-red-500 whitespace-normal"
                                                >
                                                   {message}
                                                </div>
                                             )
                                          )} */}
                                       </div>
                                    ) : (
                                       <div className="flex items-center fields_validation">
                                          <span className="mr-2">{fileAttachment.fileName}</span>
                                          <FaTimes
                                             onClick={() => { handleRemoveAttachment(columnName, rowIndex) }}
                                             className="text-red-500 hover:text-red-700 !min-w-2 !static"
                                          />
                                       </div>
                                    )}
                                 </td>
                              );
                           }

                           if(columnName=="FilingDescription"){
                              
                              return(<td
                                 key={cellIndex}
                                 className="px-1.5 py-2 md:py-2.5 font-normal text-[11px] text-gray-900 whitespace-nowrap "
                              >
                                 <div className="fields_validation">
                                    <span>{data?.PropertyName?.toUpperCase()+" vs. "+data?.Tenant1First?.toUpperCase()+" "+data?.Tenant1Last?.toUpperCase()}</span>                                                                            
                                 </div>
                              </td>);
                              
                           }

                           if (
                              columnName === "TenantZip" ||
                              columnName === "PropertyZip"
                           ) {
                              return (
                                 <td
                                    key={cellIndex}
                                    className="px-1.5 py-2 md:py-2.5 font-normal text-[11px] text-gray-900 whitespace-nowrap "
                                 >
                                    <div className="fields_validation">


                                       <input
                                          type={"text"}
                                          value={cellValue?.toString()}
                                          className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                                          onChange={(e) =>
                                             handleInputChange?.(columnName, e.target.value, rowIndex)
                                          }
                                       //maxLength={5}
                                       // onKeyDown={handlePostalCodeKeyDown}
                                       />
                                       {getErrorMessages(rowIndex, columnName).map(
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
                                    {/* {columnErrors[rowIndex]?.[columnName]?.map((error, index) => (
                                          <div key={index} className="text-red-500">
                                             {error.errorMessage}
                                          </div>
                                       ))} */}
                                 </td>
                              );
                           }
                           if (
                              columnName === "PropertyPhone" ||
                              columnName === "EvictionFilerPhone" || columnName === "Tenant1Phone" || columnName === "Tenant2Phone" ||
                              columnName === "Tenant3Phone" || columnName === "Tenant4Phone" || columnName === "Tenant5Phone"
                           ) {

                              return (
                                 <td
                                    key={cellIndex}
                                    className="px-1.5 py-2 md:py-2.5 font-normal text-[11px] text-gray-900 whitespace-nowrap "
                                 >
                                    <div className="fields_validation">
                                       <InputMask
                                          mask="(999) 999-9999"
                                          maskChar=" "
                                          value={cellValue as any}
                                          onChange={(e: any) =>
                                             handleInputChange?.(
                                                columnName,
                                                e.target.value,
                                                rowIndex
                                             )
                                          }
                                          onBlur={(e: any) =>
                                             handleInputChange?.(
                                                columnName,
                                                e.target.value,
                                                rowIndex
                                             )
                                          }
                                          name={columnName}
                                          id={columnName + rowIndex}
                                          className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-[11px] focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]" // Custom class for styling
                                       />
                                       {getErrorMessages(rowIndex, columnName).map(
                                          (message, index) => (
                                             <div
                                                key={index}
                                                className="text-red-500 mb-1"
                                             >
                                                {message}
                                             </div>
                                          )
                                       )}
                                       {/* {columnErrors[rowIndex]?.[columnName]?.map(
                                             (error, index) => (
                                             <div key={index} className="text-red-500">
                                                {error.errorMessage}
                                             </div>
                                             )
                                          )} */}
                                    </div>
                                 </td>
                              );
                           }
                           if (columnName === "Attachments") {
                              return;
                           }
                           return (
                              <td
                                 key={cellIndex}
                                 className={
                                    "px-1.5 py-2 md:py-2.5 font-normal text-[11px] text-gray-900 whitespace-nowrap "
                                 }
                              >
                                 <div className="fields_validation">


                                    <input
                                       type={"text"}
                                       value={
                                          typeof cellValue === "number"
                                             ? formatCurrency(cellValue)
                                             : (cellValue as any)
                                       }
                                       className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[11px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px] ${columnName === "Expedited" ? "font-bold" : ""
                                          }`}
                                       onChange={(e) =>
                                          handleInputChange?.(
                                             columnName,
                                             e.target.value,
                                             rowIndex
                                          )
                                       }
                                    />
                                    {getErrorMessages(rowIndex, columnName).map(
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
                                 {/* {columnErrors[rowIndex]?.[columnName]?.map(
                                       (error, index) => (
                                          <div key={index} className="text-red-500">
                                             {error.errorMessage}
                                          </div>
                                       )
                                    )} */}
                              </td>
                           );
                        }}
                     ></Grid>
                  </div>
                  <div className="py-2.5 flex justify-between mt-1 items-center relative z-[1]">
                     <div className="text-xs sm:text-sm font-semibold text-slate-900">
                        Total No. of Records : {totalRecord}
                     </div>
                     <div className="flex justify-end">
                        <Button
                           type="button"
                           isRounded={false}
                           title="Cancel"
                           handleClick={() => props.setImportCsvPopUp(false, false)}
                           classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg "
                        ></Button>
                        <Button
                           type="button"
                           isRounded={false}
                           handleClick={() => {
                              handleFileEvictions();
                           }}
                           title="Confirm"
                           classes="text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-4 md:px-5 text-white"
                        ></Button>
                     </div>
                  </div>

                  {columnErrors.some((errors) => Object.keys(errors).length > 0) && (
                     <p className="text-red-500 text-center absolute inset-x-0 -bottom-1 md:bottom-4 text-sm md:text-base">
                        Please validate your data
                     </p>
                  )}
               </div>

               <div>
                  <Modal
                     showModal={showConfirm}
                     onClose={() => setShowConfirm(false)}
                     width="max-w-md"
                  >
                     {/* Container for the content */}
                     <div id="fullPageContent">
                        <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                           <div className="text-center pr-4 sm:text-left">
                              <h3
                                 className="text-sm font-semibold leading-5 text-gray-900"
                                 id="modal-title"
                              >
                                 You may have more documents to upload, are you sure you want to proceed?
                              </h3>
                           </div>
                        </div>
                        <div className="flex justify-end m-2">
                           <Button
                              type="button"
                              isRounded={false}
                              title="No"
                              handleClick={() => setShowConfirm(false)}
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

         ) : <Modal
            showModal={props.importCsvPopUp}
            onClose={() => {
               props.setImportCsvPopUp(false, false);
               resetSelectedRows();
            }}
            width="max-w-5xl importCsv"
         >
            <div className="rounded-md bg-white text-left transition-all w-full py-4 px-3.5 md:p-5 m-auto">
               {(showUploadCsv === true || totalRecord == 0) && (
                  <div className="flex w-full my-1.5 md:my-2 justify-center rounded-md border border-dashed border-gray-900/25 px-3.5 py-3.5 md:px-5 md:py-5">
                     <div className="text-center">
                        <img
                           src={fileUpload}
                           className="mx-auto h-10 w-10 text-gray-300"
                           color="red"
                           alt="file upload icon"
                        />
                        <div className="mt-1.5 text-xs leading-5 text-[#2472db]">
                           <Formik initialValues={initialValues} onSubmit={() => { }}>
                              {(formik) => (
                                 <Form>
                                    <FormikControl
                                       control="fileUpload"
                                       type="file"
                                       label={"Click here to upload .csv or .xlsx file"}
                                       name={"UploadFile"}
                                       accept={
                                          ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                       }
                                       showSpinner={(value: boolean) =>
                                          setToggleSpinner(value)
                                       }
                                       onDataLoaded={handleFileUpload}
                                       onError={(error: Error) =>
                                          handleFileUploadError(error)
                                       }
                                       filingType={"FE"}
                                       className="sr-only"
                                    />
                                 </Form>
                              )}
                           </Formik>
                           <p className="w-full text-xs mt-3 text-[#2472db]">
                              <DownloadButton
                                 headers={FileEvictionTXCSVHeader}
                                 fileName={"fileEvictions"}
                                 title={"Click here to download a blank template"}
                              />
                           </p>
                        </div>
                     </div>
                  </div>
               )}

               {showEmptyRecordMessage && (
                  <p className="text-center text-red-500	">No record found </p>
               )}
               {showInvalidCSVMessage && (
                  <p className="text-center text-red-500	">
                     Invalid format. Please download the template and re-upload your
                     records.
                  </p>
               )}
               {showMaxRecords && (
                  <p className="text-center text-red-500	">
                     File size exceeds the maximum allowed size.
                  </p>
               )}

            </div>
         </Modal>}
      </>
   );
};

export default FileEvictionsTX_ImportCsv;
