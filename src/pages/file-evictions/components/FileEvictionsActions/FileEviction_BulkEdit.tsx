import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import "react-datepicker/dist/react-datepicker.css";
import { useFileEvictionsContext } from "pages/file-evictions/FileEvictionsContext";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import GridCheckbox from "components/formik/GridCheckBox";
import { IGridHeader } from "interfaces/grid-interface";
import { ISelectOptions } from "interfaces/late-notices.interface";
import {
   IFileEvictionsItems,
   IFileEvictionImportCsv,
} from "interfaces/file-evictions.interface";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import { StateCode } from "utils/constants";
import { formatZip, handlePostalCodeKeyDown, toCssClassName } from "utils/helper";
import CommonValidations from "utils/common-validations";
import FileEvictionService from "services/file-evictions.service";
import dollarImage from "assets/images/dollar-sign.svg";

type FileEvictionBulkEditProps = {
   showFileEvictionPopup: boolean;
   handleClose: () => void;
   counties: string[];
};

const initialColumnMapping: IGridHeader[] = [
   {
      columnName: "isChecked",
      label: "Bulk Edit",
      controlType: "checkbox",
      toolTipInfo: "This checkbox represents bulk update only",
   },
   { columnName: "County", label: "County" },
   { columnName: "Tenant1Last", label: "Tenant1Last" },
   { columnName: "Tenant1First", label: "Tenant1First" },
   { columnName: "Tenant1MI", label: "Tenant1MI" },
   { columnName: "AndAllOtherOccupants", label: "AndAllOtherOccupants" },
   {
      columnName: "TenantAddress",
      label: "TenantAddress",
      className: "TenantAddress",
   },
   { columnName: "TenantUnit", label: "TenantUnit" },
   { columnName: "TenantCity", label: "TenantCity" },
   { columnName: "TenantState", label: "TenantState" },
   { columnName: "TenantZip", label: "TenantZip" },
   { columnName: "Tenant2Last", label: "Tenant2Last" },
   { columnName: "Tenant2First", label: "Tenant2First" },
   { columnName: "Tenant2MI", label: "Tenant2MI" },
   { columnName: "Tenant3Last", label: "Tenant3Last" },
   { columnName: "Tenant3First", label: "Tenant3First" },
   { columnName: "Tenant3MI", label: "Tenant3MI" },
   { columnName: "Tenant4Last", label: "Tenant4Last" },
   { columnName: "Tenant4First", label: "Tenant4First" },
   { columnName: "Tenant4MI", label: "Tenant4MI" },
   { columnName: "Tenant5Last", label: "Tenant5Last" },
   { columnName: "Tenant5First", label: "Tenant5First" },
   { columnName: "Tenant5MI", label: "Tenant5MI" },
   {
      columnName: "EvictionReason",
      label: "EvictionReason",
      className: "EvictionReason",
   },
   { columnName: "EvictionTotalRentDue", label: "EvictionTotalRentDue" },
   { columnName: "MonthlyRent", label: "MonthlyRent" },
   { columnName: "AllMonths", label: "AllMonths" },
   { columnName: "EvictionOtherFees", label: "EvictionOtherFees" },
   { columnName: "OwnerName", label: "OwnerName" },
   { columnName: "PropertyCode", label: "PropertyCode" },
   { columnName: "PropertyName", label: "PropertyName" },
   { columnName: "PropertyPhone", label: "PropertyPhone" },
   {
      columnName: "PropertyEmail",
      label: "PropertyEmail",
      className: "PropertyEmail",
   },
   {
      columnName: "PropertyAddress",
      label: "PropertyAddress",
      className: "PropertyAddress",
   },
   { columnName: "PropertyCity", label: "PropertyCity" },
   { columnName: "PropertyState", label: "PropertyState" },
   { columnName: "PropertyZip", label: "PropertyZip" },
   { columnName: "AttorneyName", label: "AttorneyName" },
   { columnName: "AttorneyBarNo", label: "AttorneyBarNo" },
   {
      columnName: "AttorneyEmail",
      label: "AttorneyEmail",
      className: "AttorneyEmail",
   },
   { columnName: "FilerBusinessName", label: "FilerBusinessName" },
   { columnName: "EvictionAffiantIs", label: "EvictionAffiantIs" },
   { columnName: "EvictionFilerPhone", label: "EvictionFilerPhone" },
   { columnName: "EvictionFilerEMail", label: "EvictionFilerEmail" },
   { columnName: "Expedited", label: "Expedited" },
   { columnName: "StateCourt", label: "StateCourt", className: "StateCourt" },
   { columnName: "ClientReferenceId", label: "ClientReferenceId" },
   { columnName: "ProcessServerCompany", label: "ProcessServerCompany" },
];

const FileEviction_BulkEdit = (props: FileEvictionBulkEditProps) => {
   const {
      fileEvictions,
      setShowSpinner,
      showSpinner,
      setFilteredRecords,
      filteredRecords,
      selectedFileEvictionId,
      setSelectedFilteredFileEvictionId,
      getFileEvictions,
      bulkRecords,
      setBulkRecords,
      setSelectedFileEvictionId
   } = useFileEvictionsContext();

   const validationSchema = yup.object({
      County: CommonValidations.countyValidation(props.counties),
      Tenant1First: yup
         .string()
         .required("Please enter tenant1 first name.")
         .max(50, "Tenant1 first name must not exceed 50 characters."),
      Tenant1MI: yup
         .string()
         .max(50, "Tenant1 middle name must not exceed 50 characters."),
      Tenant1Last: yup
         .string()
         .required("Please enter tenant1 last name.")
         .max(50, "Tenant1 last name must not exceed 50 characters."),
      Tenant2First: yup
         .string()
         .max(50, "Tenant2 first name must not exceed 50 characters."),
      Tenant2MI: yup
         .string()
         .max(50, "Tenant2 middle name must not exceed 50 characters."),
      Tenant2Last: yup
         .string()
         .max(50, "Tenant2 last name must not exceed 50 characters."),
      Tenant3First: yup
         .string()
         .max(50, "Tenant3 first name must not exceed 50 characters."),
      Tenant3MI: yup
         .string()
         .max(50, "Tenant3 middle name must not exceed 50 characters."),
      Tenant3Last: yup
         .string()
         .max(50, "Tenant3 last name must not exceed 50 characters."),
      Tenant4First: yup
         .string()
         .max(50, "Tenant4 first name must not exceed 50 characters."),
      Tenant4MI: yup
         .string()
         .max(50, "Tenant4 middle name must not exceed 50 characters."),
      Tenant4Last: yup
         .string()
         .max(50, "Tenant4 last name must not exceed 50 characters."),
      Tenant5First: yup
         .string()
         .max(50, "Tenant5 first name must not exceed 50 characters."),
      Tenant5MI: yup
         .string()
         .max(50, "Tenant5 middle name must not exceed 50 characters."),
      Tenant5Last: yup
         .string()
         .max(50, "Tenant5 last name must not exceed 50 characters."),
      TenantAddress: yup
         .string()
         .required("Please enter address")
         .min(3, "Address must be at least 3 characters")
         .max(300, "Address must not exceed 300 characters"),
      TenantUnit: yup.string(),
      TenantCity: yup
         .string()
         .required("Please enter city")
         .max(50, "City must not exceed 50 characters"),
      AttorneyName: yup
         .string()
         .max(50, "Attorney name must not exceed 50 characters"),
      PropertyState: yup
         .string()
         .required("Please enter state code.")
         .max(2, "State Code must be of 2 characters."),
      TenantState: yup
         .string()
         .required("Please enter state code.")
         .max(2, "State Code must be of 2 characters."),
      PropertyName: yup
         .string()
         .required("Please enter property")
         .max(100, "Property must not exceed 100 characters"),
      // TenantZip: yup
      //    .string()
      //    .required("Please enter Zip code.")
      //    .min(5, "Zip code must be 5 digits.")
      //    .max(5, "Zip code must be 5 digits."),
         TenantZip: yup
         .string()
         .required("Please enter ZIP code."),
      OwnerName: yup.string().max(100, "Owner name must not exceed 100 characters"),
      EvictionReason: yup
         .string()
         .required("Please enter reason")
         .max(200, "Reason must not exceed 50 characters"),
      AllMonths: yup.string().max(50, "All Months must not exceed 50 characters"),
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
      PropertyEmail: yup.string().email("Please enter a valid Email address"),
      PropertyAddress: yup.string().required("Please enter Property Address"),
      PropertyCity: yup.string().required("Please enter Property City"),
      BarNo: yup.string().max(50, "Cannot exceed 50 characters"),
      AttorneyEmail: yup.string().email("Please enter a valid Email address"),
      FilerBusinessName: yup.string().required("Please enter Filer Business Name"),
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
      EvictionFilerEMail: yup
         .string()
         .email("Please enter a valid Email address")
         .required("Please enter Eviction Filer EMail"),
      Expedited: yup.string(),
      EvictionAffiantIs: yup.string().required("Please enter evictionAffiantIs"),
      // PropertyZip: yup
      //    .string()
      //    .min(5, "Zip code must be 5 digits.")
      //    .max(5, "Zip code must be 5 digits.")
      //    .required("Please enter Zip code."),
         PropertyZip: yup
         .string()
         .required("Please enter ZIP code."),
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
      EvictionOtherFees: yup.string(),
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
      )
   });

   const [showConfirm, setShowConfirm] = useState<boolean>(false);
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
   >(Array(filteredRecords?.length).fill(false));

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

   // const settingData = async (records: IFileEvictionsItems[]) => {
   //   var checkList = records.map((item: IFileEvictionsItems) => {
   //     return {
   //       id: item.id,
   //       County: item.county,
   //       Tenant1Last:
   //         formattedTenantValue(item, 0) != null
   //           ? formattedTenantValue(item, 0)?.lastName || ""
   //           : "",
   //       Tenant1First:
   //         formattedTenantValue(item, 0) != null
   //           ? formattedTenantValue(item, 0)?.firstName || ""
   //           : "",
   //       Tenant1MI:
   //         formattedTenantValue(item, 0) != null
   //           ? formattedTenantValue(item, 0)?.middleName || ""
   //           : "",
   //       Tenant2Last:
   //         formattedTenantValue(item, 1) != null
   //           ? formattedTenantValue(item, 1)?.lastName || ""
   //           : "",
   //       Tenant2First:
   //         formattedTenantValue(item, 1) != null
   //           ? formattedTenantValue(item, 1)?.firstName || ""
   //           : "",
   //       Tenant2MI:
   //         formattedTenantValue(item, 1) != null
   //           ? formattedTenantValue(item, 1)?.middleName || ""
   //           : "",
   //       Tenant3Last:
   //         formattedTenantValue(item, 2) != null
   //           ? formattedTenantValue(item, 2)?.lastName || ""
   //           : "",
   //       Tenant3First:
   //         formattedTenantValue(item, 2) != null
   //           ? formattedTenantValue(item, 2)?.lastName || ""
   //           : "",
   //       Tenant3MI:
   //         formattedTenantValue(item, 2) != null
   //           ? formattedTenantValue(item, 2)?.middleName || ""
   //           : "",
   //       Tenant4Last:
   //         formattedTenantValue(item, 3) != null
   //           ? formattedTenantValue(item, 3)?.lastName || ""
   //           : "",
   //       Tenant4First:
   //         formattedTenantValue(item, 3) != null
   //           ? formattedTenantValue(item, 3)?.firstName || ""
   //           : "",
   //       Tenant4MI:
   //         formattedTenantValue(item, 3) != null
   //           ? formattedTenantValue(item, 3)?.middleName || ""
   //           : "",
   //       Tenant5Last:
   //         formattedTenantValue(item, 4) != null
   //           ? formattedTenantValue(item, 4)?.lastName || ""
   //           : "",
   //       Tenant5First:
   //         formattedTenantValue(item, 4) != null
   //           ? formattedTenantValue(item, 4)?.firstName || ""
   //           : "",
   //       Tenant5MI:
   //         formattedTenantValue(item, 4) != null
   //           ? formattedTenantValue(item, 4)?.middleName || ""
   //           : "",
   //       AndAllOtherOccupants: item.andAllOtherTenants ?? "",

   //       TenantAddress: item.tenantAddress ?? "",
   //       TenantUnit: item.tenantUnit ?? "",
   //       TenantCity: item.tenantCity ?? "",
   //       TenantZip: item.tenantZip ?? "",
   //       TenantState: item.tenantState ?? "",
   //       EvictionReason: item.reason ?? "",
   //       EvictionTotalRentDue: item.evictionTotalRentDue ?? "",
   //       MonthlyRent: item.monthlyRent ?? "",
   //       AllMonths: item.allMonths ?? "",
   //       EvictionOtherFees: item.evictionOtherFees ?? "",
   //       OwnerName: item.ownerName ?? "",
   //       PropertyName: item.propertyName ?? "",
   //       PropertyPhone: item.propertyPhone ?? "",
   //       PropertyEmail: item.propertyEmail ?? "",
   //       PropertyAddress: item.propertyAddress ?? "",
   //       PropertyCity: item.propertyCity ?? "",
   //       PropertyState: item.propertyState ?? "",
   //       PropertyZip: item.propertyZip ?? "",
   //       AttorneyName: item.attorneyName ?? "",
   //       AttorneyBarNo: item.attorneyBarNo ?? "",
   //       AttorneyEmail: item.attorneyEmail ?? "",
   //       FilerBusinessName: item.filerBusinessName ?? "",
   //       EvictionAffiantIs: item.evictionAffiantIs ?? "",
   //       EvictionFilerPhone: item.filerPhone ?? "",
   //       EvictionFilerEMail: item.filerEmail ?? "",
   //       ProcessServer: "",
   //       ProcessServerEmail: "",
   //       Expedited: item.expedited ? "Expedited" : "",
   //       StateCourt: item.stateCourt ?? "",
   //     };
   //   });
   //   setFilteredRecords(checkList);
   // };

   // Update handleInputChange to use the validateField function
   const handleInputChange = async (
      columnName: string,
      updatedValue: string | boolean,
      selectedRowIndex: number
   ) => {
      // If any row is selected, perform bulk update
      if (selectedFilteredRows[selectedRowIndex]) {
         setFilteredRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               if (
                  selectedFilteredRows[rowIndex] ===
                  selectedFilteredRows[selectedRowIndex]
               ) {
                  // If the row is selected, update the specified column
                  const updatedRow = {
                     ...row,
                     [columnName]: updatedValue,
                  };
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
                     ? {
                        ...row,
                        [columnName]: updatedValue,
                     }
                     : row;
               // Perform validation for the updated row
               validateRow(updatedRow, rowIndex);
               return updatedRow;
            })
         );
      }
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
         setSelectedFilteredFileEvictionId(selectedIds);
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

         setSelectedFilteredFileEvictionId(selectedIds);
      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = filteredRecords
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

   /**
    * Render each cell of a table
    * @param cellIndex  : cell of table
    * @param data  :data of cell
    * @param rowIndex : row index
    * @returns render cell
    */
   const handleCellRendered = (
      cellIndex: number,
      data: IFileEvictionImportCsv,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         TenantZip: () => (
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
                  // maxLength={5}
                  // onKeyDown={handlePostalCodeKeyDown}
               />
               {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                  <div key={index} className="text-red-500">
                     {error.errorMessage}
                  </div>
               ))}
            </>
         ),
         PropertyZip: () => (
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
                  // maxLength={5}
                  // onKeyDown={handlePostalCodeKeyDown}
               />
               {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                  <div key={index} className="text-red-500">
                     {error.errorMessage}
                  </div>
               ))}
            </>
         ),
         BarNo: () => (
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
         MonthlyRent: () => (
            <>
               <div>
                  <input
                     type={"number"}
                     value={cellValue}
                     className={`peer outline-none p-2.5 py-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_left_11px] !pl-7`}
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
         EvictionTotalRentDue: () => (
            <>
               <div>
                  <input
                     type={"number"}
                     value={cellValue}
                     className={`peer outline-none p-2.5 py-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_left_11px] !pl-7`}
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
         PropertyPhone: () => (
            <>
               <div>
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
                     className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]" // Custom class for styling
                  />
                  {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         EvictionFilerPhone: () => (
            <>
               <div>
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
                     className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]" // Custom class for styling
                  />
                  {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500">
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            </>
         ),
         TenantState: () => (
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
         PropertyState: () => (
            <>
               <div className="relative text-left max-w-[120px]">
                  <select
                     className={
                        "peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
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
                  {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                     <div key={index} className="text-red-500 whitespace-normal">
                        {error.errorMessage}
                     </div>
                  ))}
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
      }
      return <></>;
   };

   const handleSubmit = async () => {
      try {
         var data = filteredRecords.map((item) => ({
            ...item,
            MonthlyRent: item.MonthlyRent.toString() === "" ? 0 : item.MonthlyRent,
            BarNo: item.AttorneyBarNo,
            Expedited: item.Expedited.length > 0 ? "Expedited" : "",
            AndAllOtherOccupants: item.AndAllOtherOccupants,
            TenantZip: item.TenantZip != null ? formatZip(item.TenantZip) : "",
            PropertyZip: item.PropertyZip != null ? formatZip(item.PropertyZip) : "",
         }));
         const response = await FileEvictionService.editFileEvictionBulk(data);
         if (response.status === HttpStatusCode.Ok) {
            // Display a success toast message
            toast.success("Eviction info successfully updated.");

            setFilteredRecords([]);
            setSelectAll(false);
            setSelectedFileEvictionId([]);
            setBulkRecords([]);

            getFileEvictions(1, 100,fileEvictions.isViewAll??true,fileEvictions.searchParam,fileEvictions.companyId);

            // Close the popup
            props.handleClose();
         } else {
            setShowConfirm(false);
         }
         // else {
         //    // Handle other status codes if needed
         //    // For example, display an error message toast
         //    //toast.error("Failed to update eviction info.");
         //    //props.handleClose();
         // }
         // setBulkRecords(filteredRecords);
      } finally {
         setShowSpinner(false);
      }
   };

   const handleConfirmModalClose = () => {
      setShowConfirm(false);
      // setFilteredRecords([]);
      // setSelectedFileEvictionId([]);
      //props.handleClose();
   };

   const handleModalClose = () => {
      // setFilteredRecords([]);
      // setSelectedFileEvictionId([]);
      props.handleClose();
   };

   const formattedTenantValue = (data: IFileEvictionsItems, index: number) => {
      if (data.tenantNames && data.tenantNames.length >= 0)
         return data.tenantNames[index];
      else return null;
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

   const formattedCell = (
      value: any,
      columnName: any,
      propertyName: any,
      rowIndex: number
   ) => {
      //console.log(fieldName, " fieldname ");
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
            {/* {columnErrors[rowIndex]?.[fieldName]?.map((error, index) => (
               <div key={index} className="text-red-500">
                  {error.errorMessage}
               </div>
            ))} */}
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
            showModal={props.showFileEvictionPopup}
            onClose={handleModalClose}
            width="max-w-5xl bulkEditModal"
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
                        rows={filteredRecords}
                        handleSelectAllChange={handleSelectAllChange}
                        selectAll={selectAll}
                        showInPopUp={true}
                        cellRenderer={(
                           data: IFileEvictionImportCsv,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                     ></Grid>
                     <div className="py-2.5 flex justify-between mt-1.5 items-center">
                        <p className="font-semibold text-[10px] md:text-xs">
                           Total records: {selectedFileEvictionId.length}
                        </p>

                        <Button
                           handleClick={() => {
                              if (
                                 columnErrors.length === 0 ||
                                 columnErrors.every(
                                    (errors) => Object.keys(errors).length === 0
                                 )
                              )
                                 setShowConfirm(true);
                           }}
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
                           Are you sure you want to update the eviction information ?
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
      </>
   );
};

export default FileEviction_BulkEdit;
