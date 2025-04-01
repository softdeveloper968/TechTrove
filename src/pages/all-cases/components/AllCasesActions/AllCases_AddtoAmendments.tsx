import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as yup from "yup";
import InputMask from "react-input-mask";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import GridCheckbox from "components/formik/GridCheckBox";
import { useAuth } from "context/AuthContext";
import { useAllCasesContext } from "../../AllCasesContext";
import { UserRole } from "utils/enum";
import { StateCode } from "utils/constants";
import { compareChanges, formattedDate, toCssClassName } from "utils/helper";
import vm from "utils/validationMessages";
import { IGridHeader } from "interfaces/grid-interface";
import { IAllCasesItems } from "interfaces/all-cases.interface";
import dollarImage from "assets/images/dollar-sign.svg";

type AddtoAmendmentsProps = {
   showAddtoAmendmentsPopup: boolean;
   handleClose: () => void;
   handleReviewSign: () => void;
   handleFinish: () => void;
   errorMsg: string;
   handleShowUnFindCases: () => void;
};

const validationSchema = yup.object({
   tenant1First: yup
      .string()
      .required(vm.tenant1First.required),
   // .max(50, vm.tenant1First.max),
   // tenant1MI: yup
   //    .string()
   //    .max(50, vm.tenant1MI.max),
   tenant1Last: yup
      .string()
      .required(vm.tenant1Last.required),
   // .max(50, vm.tenant1Last.max),
   // tenant2First: yup
   //    .string()
   //    .max(50, vm.tenant2First.max),
   // tenant2MI: yup
   //    .string()
   //    .max(50, vm.tenant2MI.max),
   // tenant2Last: yup
   //    .string()
   //    .max(50, vm.tenant2Last.max),
   // tenant3First: yup
   //    .string()
   //    .max(50, vm.tenant3First.max),
   // tenant3MI: yup
   //    .string()
   //    .max(50, vm.tenant3MI.max),
   // tenant3Last: yup
   //    .string()
   //    .max(50, vm.tenant3Last.max),
   // tenant4First: yup
   //    .string()
   //    .max(50, vm.tenant4First.max),
   // tenant4MI: yup
   //    .string()
   //    .max(50, vm.tenant4MI.max),
   // tenant4Last: yup
   //    .string()
   //    .max(50, vm.tenant4Last.max),
   // tenant5First: yup
   //    .string()
   //    .max(50, vm.tenant5First.max),
   // tenant5MI: yup
   //    .string()
   //    .max(50, vm.tenant5MI.max),
   // tenant5Last: yup
   //    .string()
   //    .max(50, vm.tenant5Last.max),
   address: yup
      .string()
      .required(vm.address.required)
      .min(3, vm.address.min),
   // .max(300, vm.address.max),
   unit: yup.string(),
   city: yup
      .string()
      .required(vm.city.required),
   // .max(50, vm.city.max),
   // attorneyName: yup
   //    .string()
   //    .max(50, vm.attorneyName.max),
   propertyState: yup
      .string()
      .required(vm.propertyState.required)
      .max(2, vm.propertyState.max),
   state: yup
      .string()
      .required(vm.stateCode.required)
      .max(2, vm.stateCode.max),
   propertyName: yup
      .string()
      .required(vm.propertyName.required)
      .max(100, vm.propertyName.max),
   // zip: yup
   //    .string()
   //    .required(vm.zip.required)
   //    .min(5, vm.zip.min)
   //    .max(5, vm.zip.max),
   zip: yup
      .string()
      .required(vm.zip.required),
   // ownerName: yup.string().max(50, vm.ownerName.max),
   reason: yup
      .string()
      .required(vm.reason.required),
   // .max(200, vm.reason.max),
   allMonths: yup.string()
      .max(50, vm.allMonths.max),
   // propertyPhone: yup
   //    .string()
   //    .matches(
   //       /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/,
   //       vm.phone.matches
   //    ),
   propertyPhone: yup
      .string()
      .nullable()
      .notRequired()
      .test('is-valid-phone', 'Please enter a valid phone number', value => {
         if (!value || value.trim() === '') {
            return true; // Allow null or empty values
         }
         return /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/.test(value);
      }),
   propertyEmail: yup.string().email(vm.email.email),
   propertyAddress: yup.string().required(vm.propertyAddress.required),
   propertyCity: yup.string().required(vm.propertyCity.required),
   barNo: yup.string(),
   attorneyEmail: yup.string().email(vm.email.email),
   filerBusinessName: yup.string()
   // .required(vm.filerBusinessName.required)
   ,
   filerPhone: yup
      .string()
      .matches(
         /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/,
         { message: vm.filerphone.matches, excludeEmptyString: true }
      )
      .nullable()
      .notRequired(),
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
   // filerEmail: yup
   //    .string()
   //    .email(vm.email.email)
   //    .required(vm.filerEmail.required),
   expedited: yup.string(),
   evictionAffiantIs: yup.string().required(vm.evictionAffiantIs.required),
   // propertyZip: yup
   //    .string()
   //    .min(5, vm.zip.min)
   //    .max(5, vm.zip.max)
   //    .required(vm.zip.required),
   propertyZip: yup
      .string()
      .required(vm.zip.required),
   evictionTotalRentDue: yup
      .string()
      .test(
         vm.evictionTotalRentDue.testIsCurrency,
         vm.evictionTotalRentDue.testValidCurrency,
         (value) => {
            if (!value) return true; // Skip if undefined or empty
            const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
            return regex.test(value);
         }
      ),
   // .test(
   //    vm.evictionTotalRentDue.testMaxAmount,
   //    vm.evictionTotalRentDue.testMonthlyRent,
   //    (value) => {
   //       if (!value) return true; // Skip if undefined or empty
   //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
   //       return numericValue <= 9999;
   //    }
   // )
   // .required(vm.evictionTotalRentDue.required),
   monthlyRent: yup
      .string()
      .test(
         vm.monthlyRent.testIsCurrency,
         vm.monthlyRent.testValidCurrency,
         (value) => {
            if (!value) return true; // Skip if undefined or empty
            const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
            return regex.test(value);
         }
      ),
   // .test(
   //    vm.monthlyRent.testMaxAmount,
   //    vm.monthlyRent.testMonthlyRent,
   //    (value) => {
   //       if (!value) return true; // Skip if undefined or empty
   //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
   //       return numericValue <= 9999;
   //    }
   // )
   // .required(vm.monthlyRent.required),
   evictionOtherFees: yup.string(),
   stateCourt: yup.string(),
});

const initialColumnMapping: IGridHeader[] = [
   { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
   // {columnName:"county",label: "County"},
   // {columnName:"caseNo",label:"CaseNo"},
   // {columnName:"propertyName",label: "PropertyName"},
   // {columnName:"tenantLastName",label: "Tenant1Last"},
   // {columnName:"tenantFirstName",label: "Tenant1First"},
   // {columnName:"unit",label: "TenantUnit"},
   // {columnName:"address",label: "TenantAddress"},
   // {columnName:"city",label: "TenantCity"},
   // {columnName:"state",label: "TenantState"},
   // {columnName:"zip",label: "TenantZip"},
   // {columnName:"attorneyName",label: "AttorneyName"},
   // {columnName:"attorneyBarNo",label:"AttorneyBarNo"},
   // {columnName:"ownerName",label: "OwnerName"},
   // {columnName:"reason",label: "Reason"},
   // {columnName:"monthlyRent",label: "MonthlyRent"},
   // {columnName:"totalRent",label: "TotalRent"},
   // {columnName:"evictionAffiantIs",label: "EvictionAffiantIs"},

   { columnName: "county", label: "County" },
   { columnName: "tenant1Last", label: "Tenant1Last" },
   { columnName: "tenant1First", label: "Tenant1First" },
   { columnName: "tenant1MI", label: "Tenant1MI" },
   { columnName: "andAllOtherOccupants", label: "AndAllOtherOccupants" },
   { columnName: "address", label: "TenantAddress", className: "TenantAddress" },
   { columnName: "unit", label: "TenantUnit" },
   { columnName: "city", label: "TenantCity" },
   { columnName: "state", label: "TenantState" },
   { columnName: "zip", label: "TenantZip" },
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
   { columnName: "reason", label: "EvictionReason", className: "EvictionReason", },
   { columnName: "evictionTotalRentDue", label: "EvictionTotalRentDue" },
   { columnName: "monthlyRent", label: "MonthlyRent" },
   { columnName: "allMonths", label: "AllMonths" },
   { columnName: "evictionOtherFees", label: "EvictionOtherFees" },
   { columnName: "ownerName", label: "OwnerName" },
   { columnName: "propertyName", label: "PropertyName" },
   { columnName: "propertyPhone", label: "PropertyPhone" },
   { columnName: "propertyEmail", label: "PropertyEmail", className: "PropertyEmail", },
   { columnName: "propertyAddress", label: "PropertyAddress", className: "PropertyAddress", },
   { columnName: "propertyCity", label: "PropertyCity" },
   { columnName: "propertyState", label: "PropertyState" },
   { columnName: "propertyZip", label: "PropertyZip" },
   { columnName: "attorneyName", label: "AttorneyName" },
   { columnName: "attorneyBarNo", label: "AttorneyBarNo" },
   { columnName: "attorneyEmail", label: "AttorneyEmail", className: "AttorneyEmail", },
   { columnName: "filerBusinessName", label: "FilerBusinessName" },
   { columnName: "evictionAffiantIs", label: "EvictionAffiantIs" },
   { columnName: "filerPhone", label: "EvictionFilerPhone" },
   { columnName: "filerEmail", label: "EvictionFilerEmail" },
   { columnName: "expedited", label: "Expedited" },
   { columnName: "stateCourt", label: "StateCourt" },
];

const AllCases_AddtoAmendments = (props: AddtoAmendmentsProps) => {
   const { userRole } = useAuth();
   const buttonClasses: string = "text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
   const {
      allCases,
      setAllCases,
      selectedAllCasesId,
      filteredRecords,
      setFilteredRecords,
      setSelectedFilteredCasesId,
      bulkRecords,
      selectedCaseIdsForFiling,
      showSpinner,
      proceedWithDismissals
   } = useAllCasesContext();
   const [showConfirm, setShowConfirm] = useState<boolean>(false);
   const [showSignInPopup, setShowSignInPopup] = useState<boolean>(false);
   const [disableReviewSign, setDisableReviewSign] = useState<boolean>(true);
   const [validationMessage, setValidationMessage] = useState<string>('');
   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
      initialColumnMapping
   );
   const [columnErrors, setColumnErrors] = useState<
      Record<string, { rowIndex: number; errorMessage: string }[]>[]
   >([]);
   // const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectFilteredAll, setSelectFilteredAll] = useState<boolean>(false);

   const [selectedFilteredRows, setSelectedFilteredRows] = useState<Array<boolean>>(
      Array(filteredRecords?.length).fill(false)
   );

   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [newSelectedRows] = useState<boolean[]>([]);

   useEffect(() => {
      const selectedIds = selectedCaseIdsForFiling.length
         ? selectedCaseIdsForFiling
         : selectedAllCasesId;

      if (!filteredRecords.length) {
         const filteredCases = bulkRecords.filter((item) =>
            selectedIds.includes(item.id || "") && item.caseNo?.length
            && (proceedWithDismissals || !item.isDismissal)
         );
         // Adding new properties to each item in filteredRecords
         const filteredRecordsWithTenants = filteredCases.map((record) => {
            const tenant1Last = record?.tenantNames[0]?.lastName;
            const tenant1First = record?.tenantNames[0]?.firstName;
            const tenant1MI = record?.tenantNames[0]?.middleName;
            const tenant2Last = record?.tenantNames[1]?.lastName;
            const tenant2First = record?.tenantNames[1]?.firstName;
            const tenant2MI = record?.tenantNames[1]?.middleName;
            const tenant3Last = record?.tenantNames[2]?.lastName;
            const tenant3First = record?.tenantNames[2]?.firstName;
            const tenant3MI = record?.tenantNames[2]?.middleName;
            const tenant4Last = record?.tenantNames[3]?.lastName;
            const tenant4First = record?.tenantNames[3]?.firstName;
            const tenant4MI = record?.tenantNames[3]?.middleName;
            const tenant5Last = record?.tenantNames[4]?.lastName;
            const tenant5First = record?.tenantNames[4]?.firstName;
            const tenant5MI = record?.tenantNames[4]?.middleName;
            const monthlyRent = record?.monthlyRent ?? "";
            // Returning the record with new properties
            return {
               ...record,
               tenant1Last,
               tenant1First,
               tenant1MI,
               tenant2Last,
               tenant2First,
               tenant2MI,
               tenant3Last,
               tenant3First,
               tenant3MI,
               tenant4Last,
               tenant4First,
               tenant4MI,
               tenant5Last,
               tenant5First,
               tenant5MI,
               monthlyRent
            };
         });
         const filtered = filteredRecords;
         setFilteredRecords(filteredRecordsWithTenants);
         setSelectedFilteredRows(Array(filteredCases?.length).fill(false));
      } else {
         setDisableReviewSign(false);
      }

   }, [allCases.items, selectedAllCasesId, selectedCaseIdsForFiling]);


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
         setSelectedFilteredCasesId(selectedIds);
      }
      else {
         const updatedSelectedRows = [...selectedFilteredRows];
         updatedSelectedRows[index] = checked;
         setSelectedFilteredRows(updatedSelectedRows);
         if (filteredRecords.length === updatedSelectedRows.filter(item => item).length) {
            setSelectFilteredAll(true);
         } else {
            setSelectFilteredAll(false);
         }
         const selectedIds = (filteredRecords || [])
            .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         setSelectedFilteredCasesId(selectedIds);
      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectFilteredAll;
      const allIds: string[] = filteredRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");

      if (checked) {
         setSelectedFilteredCasesId(allIds);
      } else {
         setSelectedFilteredCasesId([]);
      }

      setSelectFilteredAll((prevSelectAll) => {
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
   const handleInputChange = async (
      columnName: string,
      updatedValue: string,
      selectedRowIndex: number
   ) => {
      setDisableReviewSign(false);
      // If any row is selected, perform bulk update
      if (selectedFilteredRows[selectedRowIndex]) {
         setFilteredRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               if (selectedFilteredRows[rowIndex] === selectedFilteredRows[selectedRowIndex]) {
                  // If the row is selected, update the specified column
                  const updatedRow = { ...row, [columnName]: updatedValue };
                  updatedRow.allMonths = updatedRow.allMonths ?? "";
                  updatedRow.evictionOtherFees = updatedRow.evictionOtherFees ?? "";
                  updatedRow.propertyPhone = updatedRow.propertyPhone ?? "";
                  updatedRow.propertyEmail = updatedRow.propertyEmail ?? "";
                  updatedRow.expedited = updatedRow.expedited ?? "";
                  updatedRow.evictionAffiantIs = updatedRow.evictionAffiantIs ?? "";
                  updatedRow.attorneyEmail = updatedRow.attorneyEmail ?? "";
                  updatedRow.filerBusinessName = updatedRow.filerBusinessName ?? "";
                  updatedRow.filerPhone = updatedRow.filerPhone ?? "";
                  validateRow(updatedRow, rowIndex);
                  return updatedRow;
               } else {
                  // If the row is not selected, return the original row
                  return row;
               }
            })
         );
         console.log("Updated amount:", filteredRecords.map(item => item.monthlyRent))
      } else {
         // If no row is selected, update only the selected row
         setFilteredRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               const updatedRow =
                  rowIndex === selectedRowIndex
                     ? { ...row, [columnName]: updatedValue }
                     : row;
               updatedRow.allMonths = updatedRow.allMonths ?? "";
               updatedRow.evictionOtherFees = updatedRow.evictionOtherFees ?? "";
               updatedRow.propertyPhone = updatedRow.propertyPhone ?? "";
               updatedRow.propertyEmail = updatedRow.propertyEmail ?? "";
               updatedRow.expedited = updatedRow.expedited ?? "";
               updatedRow.evictionAffiantIs = updatedRow.evictionAffiantIs ?? "";
               updatedRow.attorneyEmail = updatedRow.attorneyEmail ?? "";
               updatedRow.filerBusinessName = updatedRow.filerBusinessName ?? "";
               updatedRow.filerPhone = updatedRow.filerPhone ?? "";
               validateRow(updatedRow, rowIndex);
               return updatedRow;
            })
         );
         console.log("Updated amount:", filteredRecords.map(item => item.monthlyRent))
      }
   };

   const validateRow = (row: IAllCasesItems, rowIndex: number) => {
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
      // setColumnErrors((prevErrors) => [
      //   ...prevErrors.slice(0, rowIndex),
      //   recordErrors,
      //   ...prevErrors.slice(rowIndex + 1),
      // ]);

      setColumnErrors((prevErrors) => [
         ...prevErrors.slice(0, rowIndex),
         recordErrors,
         ...prevErrors.slice(rowIndex + 1),
      ]);

   };

   const handleCellRendered = (
      cellIndex: number,
      data: IAllCasesItems,
      rowIndex: number
   ) => {

      const columnName = visibleColumns[cellIndex]?.label;
      //const propertyName = (initialColumnMapping as any)[columnName];
      var propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         propertyPhone: () => (
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
         filerPhone: () => (
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
         // monthlyRent: () => (
         //    <>
         //       <div>
         //          <input
         //             type={"number"}
         //             value={cellValue}
         //             className={`peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]`}
         //             onChange={(e) =>
         //                handleInputChange?.(propertyName, e.target.value, rowIndex)
         //             }
         //          />
         //          {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
         //             <div key={index} className="text-red-500">
         //                {error.errorMessage}
         //             </div>
         //          ))}
         //       </div>
         //    </>
         // ),
         monthlyRent: () => (
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
         evictionTotalRentDue: () => (
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
         zip: () => (
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
         propertyZip: () => (
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
         propertyState: () => (
            <>
               <div className="relative text-left max-w-[120px]">
                  <select
                     className={
                        "peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
                     }
                     name="propertyState"
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
         // tenant1Last:()=>formattedCell(data?.tenantNames[0].lastName,columnName, propertyName, rowIndex),
         // tenant1First:()=>formattedCell(data?.tenantNames[0].firstName,columnName, propertyName, rowIndex),
         // tenant1MI:()=>formattedCell(data?.tenantNames[0].middleName,columnName, propertyName, rowIndex),
         // tenant2Last:()=>formattedCell(data?.tenantNames[1].lastName,columnName, propertyName, rowIndex),
         // tenant2First:()=>formattedCell(data?.tenantNames[1].firstName,columnName, propertyName, rowIndex),
         // tenant2MI:()=>formattedCell(data?.tenantNames[1].middleName,columnName, propertyName, rowIndex),
         // tenant3Last:()=>formattedCell(data?.tenantNames[2].lastName,columnName, propertyName, rowIndex),
         // tenant3First:()=>formattedCell(data?.tenantNames[2].firstName,columnName, propertyName, rowIndex),
         // tenant3MI:()=>formattedCell(data?.tenantNames[2].middleName,columnName, propertyName, rowIndex),
         // tenant4Last:()=>formattedCell(data?.tenantNames[3].lastName,columnName, propertyName, rowIndex),
         // tenant4First:()=>formattedCell(data?.tenantNames[3].firstName,columnName, propertyName, rowIndex),
         // tenant4MI:()=>formattedCell(data?.tenantNames[3].middleName,columnName, propertyName, rowIndex),
         // tenant5Last:()=>formattedCell(data?.tenantNames[4].lastName,columnName, propertyName, rowIndex),
         // tenant5First:()=>formattedCell(data?.tenantNames[4].firstName,columnName, propertyName, rowIndex),
         // tenant5MI:()=>formattedCell(data?.tenantNames[4].middleName,columnName, propertyName, rowIndex),
         evictionDateFiled: () => formattedDateCell(cellValue),
         evictionServiceDate: () => formattedDateCell(cellValue),
         lastDaytoAnswer: () => formattedDateCell(cellValue),
         courtDate: () => formattedDateCell(cellValue),
         dismissalFileDate: () => formattedDateCell(cellValue),
         writFileDate: () => formattedDateCell(cellValue),
         answerDate: () => formattedDateCell(cellValue),
         writSignDate: () => formattedDateCell(cellValue),
         evictionAffiantSignature: () => (
            <span className="non-editable-class">{cellValue}</span>
         ),
         caseNo: () => (
            <span className="non-editable-class">{cellValue}</span>
         ),
         county: () => (
            <span className="non-editable-class">{cellValue}</span>
         ),
         amendmentAffiantSignature: () => (
            <span className="non-editable-class">{cellValue}</span>
         ),
         isChecked: () => (
            <GridCheckbox
               checked={selectedFilteredRows[rowIndex]}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, checked)
               }
               label=""
            />
         ),
         document: () =>
            cellValue ? (
               <Link to={cellValue} className="underline text-[#2472db]">
                  Download
               </Link>
            ) : (
               <></>
            ),
      };

      const renderer = renderers[propertyName] || (() => formattedCell(cellValue, columnName, propertyName, rowIndex));

      if (visibleColumns.find(x => x.label === columnName)) {

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

   const haveChangesInAmendments = () => {
      const previousCases: IAllCasesItems[] = allCases.items.filter((item) => selectedAllCasesId.includes(item.id || ""));
      const hasChanges = compareChanges(previousCases, filteredRecords);

      if (hasChanges) {
         setValidationMessage('');
         props.handleReviewSign();
      } else {
         const message = 'No records have been amended for review';
         setValidationMessage(message);
      }
   };

   const haveChangesInAmendmentsForNonSigner = () => {
      const previousCases: IAllCasesItems[] = allCases.items.filter((item) => selectedAllCasesId.includes(item.id || ""));
      const changesExist = compareChanges(previousCases, filteredRecords);
      if (changesExist) {
         setValidationMessage('');
         props.handleFinish();
      } else {
         const message = 'No records have been amended for confirmation';
         setValidationMessage(message);
      }
   };

   const handleModalClose = () => {
      props.handleClose();
      setFilteredRecords([]);
      // setSelectedAllCasesId([]);
      setAllCases((prev) => {
         return {
            ...prev,
            items: prev.items.map((item) => ({
               ...item,
               isChecked: false,
            })),
         };
      });
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
         {/* {columnErrors[rowIndex]?.[columnName]?.map(
        (error, index) => (
          <div key={index} className="text-red-500">
            {error.errorMessage}
          </div>
        )
      )} */}

         {columnErrors[rowIndex]?.[fieldName]?.map((error, index) => (
            <div key={index} className="text-red-500">
               {error.errorMessage}
            </div>
         ))}
      </>
   );

   return (
      <>
         <Modal
            showModal={props.showAddtoAmendmentsPopup}
            onClose={handleModalClose}
            classes="relative z-40 modal-box"
            width="max-w-5xl"
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
                           File Amendments
                        </h3>
                     </div>
                  </div>

                  {/* Display the grid*/}
                  <div className="relative pt-2 amendments-grid">
                     <Grid
                        columnHeading={visibleColumns}
                        rows={filteredRecords}
                        handleSelectAllChange={handleSelectAllChange}
                        selectAll={selectFilteredAll}
                        showInPopUp={true}
                        cellRenderer={(
                           data: IAllCasesItems,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           // validateRow(data,rowIndex);
                           return handleCellRendered(cellIndex, data, rowIndex);

                        }}
                     ></Grid>
                     <p className="text-[10px] md:text-xs text-[#E61818] font-medium mt-2">
                        {props.errorMsg && (
                           <>
                              {props.errorMsg}{' '}
                              <a
                                 href="#"
                                 onClick={(e) => {
                                    e.preventDefault();
                                    props.handleShowUnFindCases();
                                 }}
                                 className="cursor-pointer text-blue-600 hover:underline" // Underline only on hover
                                 aria-label="View unmatched cases"
                              >
                                 View
                              </a>
                           </>
                        )}
                     </p>
                     <div className="py-2.5 flex justify-between mt-1.5 items-center">
                        <p className="font-semibold text-[10px] md:text-xs">Total record(s): {filteredRecords?.length}</p>                        {!disableReviewSign && validationMessage.length ? <p className="text-aidonicRed text-red-500">{validationMessage}</p> : <></>}
                        {(userRole.includes(UserRole.Admin) ||
                           userRole.includes(UserRole.C2CAdmin) ||
                           userRole.includes(UserRole.ChiefAdmin) ||
                           userRole.includes(UserRole.Signer)) &&
                           !userRole.includes(UserRole.NonSigner) ? (
                           <Button
                              handleClick={() => {
                                 if (
                                    columnErrors.length === 0 ||
                                    columnErrors.every(
                                       (errors) => Object.keys(errors).length === 0))
                                    haveChangesInAmendments()
                              }}
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
                        )}
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

         <Modal
            showModal={showConfirm || showSignInPopup}
            onClose={handleModalClose}
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
                        {showConfirm
                           ? "Are you sure you like to confirm these cases for amendments?"
                           : "Are you sure you’d like to file amendments?"}
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
                     handleClick={props.handleReviewSign}
                     title={"Yes"}
                     isRounded={false}
                     type={"button"}
                     classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                     disabled={showSpinner}
                  ></Button>
               </div>
            </div>
         </Modal>
      </>
   );
};

export default AllCases_AddtoAmendments;
