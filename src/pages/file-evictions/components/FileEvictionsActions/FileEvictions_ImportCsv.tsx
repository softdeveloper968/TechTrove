import React, { ChangeEvent, useEffect, useState } from "react";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import InputMask from "react-input-mask";
import FormikControl from "components/formik/FormikControl";
import DownloadButton from "components/common/button/DownloadButton";
import Grid from "components/common/grid/Grid";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import Modal from "components/common/popup/PopUp";
import DropdownPresentation from "components/common/dropdown/DropDown";
import { useFileEvictionsContext } from "pages/file-evictions/FileEvictionsContext";
import { useAuth } from "context/AuthContext";
import { IFileEvictionImportCsv, IFileEvictionsItems } from "interfaces/file-evictions.interface";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import { ISelectOptions } from "interfaces/late-notices.interface";
import fileUpload from "assets/svg/file-upload.svg";
import dollarImage from "assets/images/dollar-sign.svg";
import FileEvictionService from "services/file-evictions.service";
import { HttpStatusCode, UserRole } from "utils/enum";
import { formatCurrency, formatZip, handlePostalCodeKeyDown, toCssClassName } from "utils/helper";
import { FileEvictionCSVHeader, StateCode } from "utils/constants";
import CommonValidations from "utils/common-validations";

type SetImportCsvPopUp = (
   value: React.SetStateAction<boolean>,
   resetGrid: boolean
) => void;

type FileEvictionsImportCsvProps = {
   importCsvPopUp: boolean;
   setImportCsvPopUp: SetImportCsvPopUp;
   counties: string[];
};

const initialSelectOption: ISelectOptions = { id: '', value: '' };

const FileEvictions_ImportCsv = (props: FileEvictionsImportCsvProps) => {
   const {
      selectedFileEvictionId,
      setSelectedFileEvictionId,
      fileEvictions,
      setFileEvictions,
      getFileEvictions,
      allCompanies,
   } = useFileEvictionsContext();
   const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
   const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);
   const [isSelectedCompany, setIsSelectedCompany] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         try {
            var list = allCompanies.map((item) => ({
               id: item.id,
               value: item.companyName
            }));
            const userInfo= JSON.parse(localStorage.getItem("userDetail")??"")
    const clientID = (`${userInfo?.ClientID}`).toLowerCase();
            // var newList = list.filter((item) => item.value != "Super Company");
            var newList = list.filter((item) => item.id.toLowerCase() != clientID);
            setCompanyList(newList);
         } catch (error) {
            console.error("Error fetching data:", error);
         }
      };

      fetchData();
   }, [allCompanies]);

   const validationSchema: yup.ObjectSchema<any> = yup.object({
      County: CommonValidations.countyValidation(props.counties),
      Tenant1Last: yup
         .string()
        // .max(50, "Cannot exceed 50 characters")
         .required("Please enter Tenant1 last name."),
      Tenant1First: yup
         .string()
         //.max(50, "Cannot exceed 50 characters")
         .required("Please enter Tenant1 first name."),
      // Tenant1MI: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // AndAllOtherOccupants: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      TenantAddress: yup
         .string()
         .required("Please enter address")
         .min(3, "Address must be at least 3 characters"),
        // .max(100, "Cannot exceed 100 characters"),
      // TenantUnit: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      TenantCity: yup
         .string()
        // .max(50, "Cannot exceed 50 characters")
         .required("Please enter city"),
      TenantState: yup
         .string()
         .max(2, "State Code must be of 2 characters.")
         .required("Please enter state code."),
      TenantZip: yup
         .string()
         .required("Please enter ZIP code."),
         //.min(5, "ZIP code must be 5 digits.")
         //.max(5, "ZIP code must be 5 digits."),
      // Tenant2Last: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // Tenant2First: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // Tenant2MI: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // Tenant3Last: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // Tenant3First: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // Tenant3MI: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // Tenant4Last: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // Tenant4First: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // Tenant4MI: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // Tenant5Last: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // Tenant5First: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // Tenant5MI: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      EvictionReason: yup
         .string()
         .required("Please enter reason"),
        // .max(500, "Cannot exceed 500 characters"),
      // EvictionTotalRentDue: yup
      //    .string(),
      EvictionTotalRentDue: yup
         .string()
         .test(
            "isCurrency",
            "EvictionTotalRentDue must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "EvictionTotalRentDue must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // )
         // .required("Please enter EvictionTotalRentDue"),
      MonthlyRent: yup
         .string()
         .test(
            "isCurrency",
            "Monthly rent must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "Monthly rent must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // )
         // .required("Please enter monthly rent"),
      // AllMonths: yup
      //    .string()
      //    .max(500, "Cannot exceed 500 characters"),
      // EvictionOtherFees: yup
      //    .string()
      //    .max(500, "Cannot exceed 500 characters"),
      // OwnerName: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      PropertyName: yup
         .string()
        // .max(50, "Cannot exceed 50 characters")
         .required("Please enter property name"),
      // PropertyPhone: yup
      //    .string()
      //    .matches(
      //       /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/,
      //       "Please enter a valid phone number"
      //    ),
   PropertyPhone: yup
.string()
.nullable()
.notRequired()
.test('is-valid-phone', 'Please enter a valid phone number', value => {
   if (!value || value.trim() === '') {
      return true; // Allow null or empty values
   }
   return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value);
}),
      PropertyEmail: yup
         .string()
         .email("Please enter a valid email address")
         .max(50, "Cannot exceed 50 characters"),
      PropertyAddress: yup
         .string()
         .required("Please enter property address"),
         // .max(100, "Cannot exceed 100 characters"),
      PropertyCity: yup
         .string()
         .required("Please enter property city"),
         // .max(50, "Cannot exceed 50 characters"),
      PropertyState: yup
         .string()
         .max(2, "State Code must be of 2 characters.")
         .required("Please enter state code."),
      PropertyZip: yup
         .string()
         .required("Please enter ZIP code."),
         //.min(5, "ZIP Code must be 5 digits only.")
        // .max(5, "ZIP Code must be 5 digits only."),
      // AttorneyBarNo: yup
      //    .string()
      //    // .test(
      //    //    'required-if-name-or-email',
      //    //    'Required if Attorney Name or Attorney Email is provided.',
      //    //    function (value) {
      //    //       const { AttorneyName, AttorneyEmail } = this.parent;
      //    //       return !AttorneyName && !AttorneyEmail ? true : !!value;
      //    //    }
      //    // )
      //    .max(50, "Cannot exceed 50 characters"),
      // AttorneyName: yup
      //    .string()
      //    // .test(
      //    //    'required-if-barno',
      //    //    'Required if Attorney Bar No is provided.',
      //    //    function (value) {
      //    //       const { AttorneyBarNo } = this.parent;
      //    //       return !AttorneyBarNo ? true : !!value;
      //    //    }
      //    // )
      //    .max(50, "Cannot exceed 50 characters"),
      AttorneyEmail: yup
         .string()
         // .test(
         //    'required-if-barno',
         //    'Required if Attorney Bar No is provided.',
         //    function (value) {
         //       const { AttorneyBarNo } = this.parent;
         //       return !AttorneyBarNo ? true : !!value;
         //    }
         // )
         .email('Must be a valid email.')
         .max(50, "Cannot exceed 50 characters"),
      FilerBusinessName: yup
         .string()
         .required("Please enter Filer Business Name"),
        // .max(50, "Cannot exceed 50 characters"),
      EvictionAffiantIs: yup
         .string()
         .required("Please enter Eviction Affiant Is"),
        // .max(50, "Cannot exceed 50 characters"),
      // EvictionFilerPhone: yup
      //    .string()
      //    .matches(
      //       /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/,
      //       "Please enter a valid phone number"
      //    ),
         EvictionFilerPhone: yup
   .string()
   .nullable()
   .notRequired()
   .test('is-valid-phone', 'Please enter a valid phone number', value => {
      if (!value || value.trim() === '') {
         return true; // Allow null or empty values
      }
      return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value);
   }),
   EvictionFilerEmail: yup
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
      // EvictionFilerEmail: yup
      //    .string()
      //    .email("Please enter a valid email address")
      //    .required("Please enter eviction filer email"),
        // .max(50, "Cannot exceed 50 characters"),
      // Expedited: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // StateCourt: yup
      //    .string()
      //    .test(
      //       "County",
      //       "State Court filing is available in Fulton County only",
      //       function (value) {
      //          const countyValue = this.parent.County;
      //          if (countyValue && countyValue.toLowerCase() !== "fulton") {
      //             return !value; // StateCourt must be empty if County is Fulton
      //          }
      //          return true; // Validation passes if County is not Fulton or StateCourt is empty
      //       }
      //    )
      //    .max(50, "Cannot exceed 50 characters"),
         StateCourt: yup
         .string()
         .test(
            "County",
            "State Court filing is available in Fulton County only",
            function (value) {
               const countyValue = this.parent.County;
               if (countyValue && countyValue.toLowerCase() !== "fulton") {
                  return !value; // StateCourt must be empty if County is Fulton
               }
               return true; // Validation passes if County is not Fulton or StateCourt is empty
            }
         ),
      // ClientReferenceId: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
      // ProcessServerCompany: yup
      //    .string()
      //    .max(50, "Cannot exceed 50 characters"),
   });

   // const [gridData, setGridData] = useState<ICreateFileEviction[]>([]);
   const [gridData, setGridData] = useState<IFileEvictionImportCsv[]>([]);
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
   const { userRole,selectedStateValue } = useAuth();

   // this is used to show error when csv is invalid
   const [showInvalidCSVMessage, setShowInvalidCSVMessage] =
      useState<boolean>(false);

   // this is used to show error when csv is invalid
   const [showMaxRecords, setshowMaxRecords] = useState<boolean>(false);
   // set spinner
   const [toggleSpinner, setToggleSpinner] = useState<boolean>(false);
   const [filteredRecords, setFilteredRecords] = useState<IFileEvictionsItems[]>([]);
   const [totalRecord, setTotalRecord] = useState<number>(0);

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
         try {
            setToggleSpinner(true);
            const formattedData = gridData.map((item: IFileEvictionImportCsv) => ({
               ...item,
               MonthlyRent: parseFloat(
                  item.MonthlyRent.toString()
                     .replace(/[^0-9.]/g, "")
                     .replace("$", "")
               ),
               EvictionTotalRentDue:
                  item.EvictionTotalRentDue.toString()
                     .replace(/[^0-9.]/g, "")
                     .replace("$", "")
               ,
               BarNo: item.AttorneyBarNo ?? "",
               TenantZip: item.TenantZip != null ? formatZip(item.TenantZip) : "",
               PropertyZip: item.PropertyZip != null ? formatZip(item.PropertyZip) : "",
               AndAllOtherOccupants: item.AndAllOtherOccupants,
               PropertyPhone: item.PropertyPhone.replace(/[^\d-]/g, "").replace(
                  /(\d{3})(\d{3})(\d{4})/,
                  "$1-$2-$3"
               ),
               EvictionFilerPhone: item.EvictionFilerPhone.replace(
                  /[^\d-]/g,
                  ""
               ).replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"),
               FilingState:selectedStateValue,
               // EvictionTotalRentDue: parseFloat(
               //   item.EvictionTotalRentDue.toString().replace(/[^0-9.]/g, "").replace('$', '')
               // ).toString(),
            }));
            if (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) {
               ;
               if (selectedCompany.id != '' && selectedCompany.value != '') {
                  formattedData.forEach(item => {
                     // Adding the clientId property to each object
                     item.ClientId = selectedCompany.id.toString();
                  });
                  const response = await FileEvictionService.createFileEvictionForImport(
                     formattedData
                  );
                  if (response.status === HttpStatusCode.OK) {
                     toast.success("Successfully Imported CSV");
                     getFileEvictions(1, 100,fileEvictions.isViewAll??true);
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
               const response = await FileEvictionService.createFileEvictionForImport(
                  formattedData
               );

               if (response.status === HttpStatusCode.OK) {
                  toast.success("Successfully Imported CSV");
                  getFileEvictions(1, 100,fileEvictions.isViewAll??true);
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
   };

   const getErrorMessages = (rowIndex: number, propertyName: string) => {
      const errorMessages: string[] = [];
      rowErrors.filter((error) => {
         if (!error.fields.length) return null;
         if (error.rowIndex === rowIndex && error.fields.length) {
            error.fields.forEach((f) => {
               if (f.fieldName === propertyName) {
                  errorMessages.push(f.message);
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
   const handleInputChange = (
      columnName: string,
      updatedBValue: string,
      selectedRowIndex: number
   ) => {
      let sanitizedValue =
         columnName === "monthlyRent" || columnName === "totalRentDue"
            ? formatCurrency(
               parseFloat(updatedBValue.toString().replace(/[^0-9.]/g, ""))
            )
            : updatedBValue;
      // Update the state based on the column index and row index
      setGridData((prevRows) =>
         prevRows.map((row, rowIndex) => {
            const updatedRow =
               rowIndex === selectedRowIndex
                  ? { ...row, [columnName]: updatedBValue }
                  : row;
            // Perform validation for the updated row
            validateRow(updatedRow, rowIndex);

            return updatedRow;
         })
      );
   };

   const validateRow = (row: IFileEvictionImportCsv, rowIndex: number) => {
      const recordErrors: Record<
         string,
         { rowIndex: number; errorMessage: string }[]
      > = {};
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

   /**
    *
    * @param data imported data from csv
    */
   const loadUserData = (data: IFileEvictionImportCsv[]) => {
      
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

         const formattedData = data.map((item: IFileEvictionImportCsv) => {
            return {
               Remove: "",
               ...item,
               TenantUnit: item.TenantUnit
                  ? item.TenantUnit.toString()
                  : item.TenantUnit,
               TenantZip: item.TenantZip
                  ? item.TenantZip.toString()
                  : item.TenantZip,
               // EvictionTotalRentDue: item.EvictionTotalRentDue
               //    ? item.EvictionTotalRentDue.toString()
               //    : item.EvictionTotalRentDue,
               PropertyZip: item.PropertyZip
                  ? item.PropertyZip.toString()
                  : item.PropertyZip,
               // AttorneyBarNo: item.AttorneyBarNo ? item.AttorneyBarNo.toString() : item.AttorneyBarNo,
               // expedited:item.expedited == "X" ? true :false
               MonthlyRent: item.MonthlyRent
                  ? parseFloat(item.MonthlyRent.toString().replace(/[^0-9.]/g, ""))
                  : item.MonthlyRent,
               EvictionTotalRentDue: item.EvictionTotalRentDue.toString().replace(/[^0-9.]/g, ""),
               // BarNo:parseFloat(
               //   item.BarNo.toString().replace(/[^0-9.]/g, "")
               // ),
               // EvictionTotalRentDue: parseFloat(
               //   item.EvictionTotalRentDue.toString().replace(/[^0-9.]/g, "")
               // ),
               // EvictionOtherFees: parseFloat(
               //   item.EvictionOtherFees.toString().replace(/[^0-9.]/g, "")
               // ),
               PropertyPhone: item.PropertyPhone.toString().trim(),
               EvictionFilerPhone: item.EvictionFilerPhone.toString().trim(),
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

   const handleFileUpload = (data: IFileEvictionImportCsv[]) => {
      if (data.length === 0) {
         setToggleSpinner(false);
         toast.error(
            "The uploaded file is empty. Please make sure the file is not empty and try again."
         );
         return;
      }
      // Trim spaces from each cell in the data and remove entries with empty string keys
      const trimmedData = data.map(record => {
         const trimmedRecord: Partial<IFileEvictionImportCsv> = {};
         for (const key in record) {
             if (record.hasOwnProperty(key)) {
                 const trimmedKey = key.trim();
                 if (trimmedKey !== "") {
                     const value = record[key as keyof IFileEvictionImportCsv];
                     if (typeof value === 'string') {
                         trimmedRecord[trimmedKey as keyof IFileEvictionImportCsv] = value.trim() as any;
                     } else {
                         trimmedRecord[trimmedKey as keyof IFileEvictionImportCsv] = value?.toString() as any;
                     }
                 }
             }
         }
         return trimmedRecord as IFileEvictionImportCsv;
     });
     
     
      const keys = Object.keys(trimmedData[0]);
      const headerMatches = keys.every((key) =>
         FileEvictionCSVHeader.includes(key)
      );

      if (headerMatches && FileEvictionCSVHeader.length === keys?.length) {
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

   return (
      <>
         <Modal
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
                                 headers={FileEvictionCSVHeader}
                                 fileName={"fileEvictions"}
                                 title={"Click here to download a blank template"}
                              />
                           </p>
                        </div>
                     </div>
                  </div>
               )}
               {gridData?.length > 0 ? (
                  <>
                     <div className="sm:flex sm:items-start">
                        <div className="my-2.5 text-center md:my-0 sm:text-left">
                           <h3
                              className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                              id="modal-title"
                           >
                              Preview
                           </h3>
                           {(userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)? (
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
                              "Tenant1Last",
                              "Tenant1First",
                              "Tenant1MI",
                              "AndAllOtherOccupants",
                              "TenantAddress",
                              "TenantUnit",
                              "TenantCity",
                              "TenantState",
                              "TenantZip",
                              "Tenant2Last",
                              "Tenant2First",
                              "Tenant2MI",
                              "Tenant3Last",
                              "Tenant3First",
                              "Tenant3MI",
                              "Tenant4Last",
                              "Tenant4First",
                              "Tenant4MI",
                              "Tenant5Last",
                              "Tenant5First",
                              "Tenant5MI",
                              "EvictionReason",
                              "EvictionTotalRentDue",
                              "MonthlyRent",
                              "AllMonths",
                              "EvictionOtherFees",
                              "OwnerName",
                              "PropertyName",
                              "PropertyPhone",
                              "PropertyEmail",
                              "PropertyAddress",
                              "PropertyCity",
                              "PropertyState",
                              "PropertyZip",
                              "AttorneyName",
                              "AttorneyBarNo",
                              "AttorneyEmail",
                              "FilerBusinessName",
                              "EvictionAffiantIs",
                              "EvictionFilerPhone",
                              "EvictionFilerEmail",
                              "Expedited",
                              "StateCourt",
                              "ClientReferenceId",
                              "ProcessServerCompany",
                              "PropertyCode"
                           ]}
                           rows={gridData}
                           showInPopUp={true}
                           cellRenderer={(
                              data: IFileEvictionImportCsv,
                              rowIndex: number,
                              cellIndex: number
                           ) => {
                              const columnNames = Object.keys(data);
                              const columnName = columnNames[cellIndex];
                              const cellValue =
                                 data[columnName as keyof IFileEvictionImportCsv];

                              if (columnName === "PropertyState") {
                                 return (
                                    <td
                                       key={cellIndex}
                                       className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
                                    >
                                       {/* Use a regular HTML select element */}
                                       <div className="relative text-left max-w-[120px]">
                                          <select
                                             className={
                                                "peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]"
                                             }
                                             name="PropertyState"
                                             value={cellValue}
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
                                          {getErrorMessages(rowIndex, columnName).map(
                                             (message, index) => (
                                                <div
                                                   key={index}
                                                   className="text-red-500 whitespace-normal"
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
                                       className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
                                    >
                                       {/* Use a regular HTML select element */}
                                       <div className="relative text-left max-w-[120px]">
                                          <select
                                             className={
                                                "peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]"
                                             }
                                             name="TenantState"
                                             value={cellValue}
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
                                          {getErrorMessages(rowIndex, columnName).map(
                                             (message, index) => (
                                                <div
                                                   key={index}
                                                   className="text-red-500 whitespace-normal"
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
                                       className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
                                    >
                                       {/* Use a regular HTML select element */}
                                       <div className="relative text-left max-w-[120px]">
                                          <select
                                             className={
                                                "peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]"
                                             }
                                             name="TenantState"
                                             value={cellValue}
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
                                          {getErrorMessages(rowIndex, columnName).map(
                                             (message, index) => (
                                                <div
                                                   key={index}
                                                   className="text-red-500 whitespace-normal"
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
                                       className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
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
                              if (
                                 columnName === "TenantZip" ||
                                 columnName === "PropertyZip"
                              ) {
                                 return (
                                    <td
                                       key={cellIndex}
                                       className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
                                    >
                                       <input
                                          type={"text"}
                                          value={cellValue}
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
                                                className="text-red-500 whitespace-normal"
                                             >
                                                {message}
                                             </div>
                                          )
                                       )}
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
                                 columnName === "EvictionFilerPhone"
                              ) {
                                 
                                 return (
                                    <td
                                       key={cellIndex}
                                       className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
                                    >
                                       <div>
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
                                             className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]" // Custom class for styling
                                          />
                                          {getErrorMessages(rowIndex, columnName).map(
                                             (message, index) => (
                                                <div
                                                   key={index}
                                                   className="text-red-500 whitespace-normal"
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
                               
                              if (columnName === "BarNo") {
                                 return (
                                    <td
                                       key={cellIndex}
                                       className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
                                    >
                                       <div>
                                          <input
                                             type={"number"}
                                             value={cellValue}
                                             className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
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
                                                   className="text-red-500 whitespace-normal"
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
                              if (columnName=="EvictionTotalRentDue" || columnName=="MonthlyRent") {
                                 return (
                                    <td
                                       key={cellIndex}
                                       className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
                                    >
                                       <div>
                                          <input
                                             type={"number"}
                                             value={cellValue}
                                             style={{
                                                backgroundImage: `url(${dollarImage})`,
                                             }}
                                             className={`peer outline-none py-1.5 px-2 block border w-full border-gray-200 rounded-md text-[10.5px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_left_10px] !pl-6 number_filed `}
                                             onChange={(e) =>
                                                handleInputChange?.(columnName, e.target.value, rowIndex)
                                             }
                                          />
                                          {getErrorMessages(rowIndex, columnName).map(
                                             (message, index) => (
                                                <div
                                                   key={index}
                                                   className="text-red-500 whitespace-normal"
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
                              return (
                                 <td
                                    key={cellIndex}
                                    className={
                                       "px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
                                    }
                                 >
                                    <input
                                       type={"text"}
                                       value={
                                          typeof cellValue === "number"
                                             ? formatCurrency(cellValue)
                                             : (cellValue as any)
                                       }
                                       className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10.5px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px] ${columnName === "Expedited" ? "font-bold" : ""
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
                                             className="text-red-500 whitespace-normal"
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
                                 </td>
                              );
                           }}
                        ></Grid>
                     </div>
                     <div className="flex items-center justify-between mt-3.5">
                        <div className="text-xs sm:text-sm font-semibold text-slate-900">
                           Total No. of Records : {totalRecord}
                        </div>
                        <div className="mt-1.5 flex justify-end">
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
                              disabled={toggleSpinner}
                              classes="text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-4 md:px-5 text-white"
                           ></Button>
                        </div>
                     </div>
                  </>
               ) : null}
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
               {columnErrors.some((errors) => Object.keys(errors).length > 0) && (
                  <p className="text-red-500 text-center">
                     Please validate your data
                  </p>
               )}
            </div>
         </Modal>
      </>
   );
};

export default FileEvictions_ImportCsv;
