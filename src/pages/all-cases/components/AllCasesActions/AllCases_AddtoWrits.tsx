import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "context/AuthContext";
import { useAllCasesContext } from "../../AllCasesContext";
import AuthService from "services/auth.service";
import HelperViewPdfService from "services/helperViewPdfService";
import AllCasesService from "services/all-cases.service";
import { IGridHeader } from "interfaces/grid-interface";
import { IAllCasesItems, ISelectOptions, ISelectedWrit, IWritsLabor, ITenant, IWritsCase } from "interfaces/all-cases.interface";
import { UserRole } from "utils/enum";
import { convertToEasternISOString, formatCountyList, toCssClassName } from "utils/helper";
import { WritApplicantISList, WritsReasonList } from "utils/constants";
import vm from "utils/validationMessages";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import Drawer from "components/common/drawer/Drawer";
import DropdownPresentation from "components/common/dropdown/DropDown";
import GridCheckbox from "components/formik/GridCheckBox";
import AllCasesWritsDocumentsUploader from "./AllCases_WritsDocumentUploader";
import dollarImage from "assets/images/dollar-sign.svg";
import { FaTimes } from "react-icons/fa";
import { Guid } from "guid-typescript";
import moment from "moment";

type AddtoWritsProps = {
   showAddtoWritsPopup: boolean;
   handleClose: () => void;
   handleReviewSign: () => void;
   errorMsg: string;
   unFinedCases: string;
};

// const validationSchema: yup.ObjectSchema<any> = yup.object({
//    selectedReason: yup.string().required("Please select a reason"),
//    writOrderDate: yup.string().when('selectedReason', {
//       is: (reason: string) => ['1', '2'].includes(reason),
//       then(schema) { return schema.required("This is a required field") },
//       otherwise(schema) { return schema.optional() },
//    }),
//    paymentAmountOwned: yup.string().when('selectedReason', {
//       is: '1',
//       then(schema) { //required("This is a required field")
//          return schema.test('is-number', 'Amount is required (up to two decimal places)', (value) => {
//             // Check if the value is a valid number with up to two decimal places
//             return /^\d+(\.\d{1,2})?$/.test(value as string);
//          }).test('max-amount', 'Amount must be less than or equal to $99999', (value: string | undefined) => {
//             if (!value) return true; // Skip if undefined or empty
//             const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
//             return numericValue <= 99999;
//          });
//       },
//       otherwise(schema) { return schema.optional() },
//    }),
//    paymentDueOn: yup.string().when('selectedReason', {
//       is: '1',
//       then(schema) { return schema.required("This is a required field") },
//       otherwise(schema) { return schema.optional() },
//    }),
//    writComment: yup.string().when('selectedReason', {
//       is: (reason: string) => ['1', '2'].includes(reason),
//       then(schema) { return schema.required("This is a required field") },
//       otherwise(schema) { return schema.optional() },
//    }),
//    writApplicantIS: yup.string().required("Please select an option"),
//    otherApplicantIS: yup.string().when('writApplicantIS', {
//       is: 'Other',
//       then(schema) { return schema.required("Please specify Writ Applicant IS") },
//       otherwise(schema) { return schema.optional() },
//    }),
//    writApplicantPhone: yup.string()
//       .matches(/^(\(\d{3}\) ?|\d{3}-)\d{3}-\d{4}$/, "Please enter a valid phone number"),
//    writLaborId: yup.string().required("Please select an option"),
//    hasSSN: yup.string().when('selectedReason', {
//       is: (reason: string) => ['', '1', '2'].includes(reason), // Check if selectedReason is '2' or '3'
//       then(schema) { return schema.optional() }, // Optional if '2' or '3' is selected
//       otherwise(schema) { return schema.required("Please select an option") }, // Required for other options
//    }),
//    isCorporation: yup.string().when('selectedReason', {
//       is: '0',
//       then(schema) { return schema.required("Please select an option") },
//       otherwise(schema) { return schema.optional() },
//    }),
//    county: yup.string().optional(),
//    militaryStatusReport: yup.string().when(['selectedReason', 'isCorporation', 'county'], {
//       is: (selectedReason: string, isCorporation: string, county: string) => selectedReason === '0' && isCorporation === 'No' && county === "FULTON",
//       then(schema) { return schema.required("This is a required field") },
//       otherwise(schema) { return schema.optional() },
//    }),
// });
const isScraRequiredForCounty = (county: string) => {
   return county === "FULTON";
};

const isWritDetailsRequiredForCounty = (county: string) => {
   return county.toLowerCase() === "gwinnett";
};

const validationSchema: yup.ObjectSchema<any> = yup.object({
   selectedReason: yup.string().when(['county'], {
      is: (county: string) => isWritDetailsRequiredForCounty(county),
      then(schema) {
         return schema.optional(); // Optional if county is "Gwinnett"
      },
      otherwise(schema) {
         return schema.required(vm.selectedReason.required); // Required for other counties
      }
   }),
   // selectedReason: yup.string().required(vm.selectedReason.required),
   writOrderDate: yup.string().when('selectedReason', {
      is: (reason: string) => ['1', '2'].includes(reason),
      then(schema) { return schema.required(vm.basicRequired.required) },
      otherwise(schema) { return schema.optional() },
   }),
   paymentAmountOwned: yup.string().when('selectedReason', {
      is: '1',
      then(schema) { //required("This is a required field")
         return schema.test('is-number', vm.paymentAmountOwned.testDecimal, (value) => {
            // Check if the value is a valid number with up to two decimal places
            return /^\d+(\.\d{1,2})?$/.test(value as string);
         }).test('max-amount', vm.paymentAmountOwned.testAmount, (value: string | undefined) => {
            if (!value) return true; // Skip if undefined or empty
            const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
            return numericValue <= 99999;
         });
      },
      otherwise(schema) { return schema.optional() },
   }),
   paymentDueOn: yup.string().when('selectedReason', {
      is: '1',
      then(schema) { return schema.required(vm.basicRequired.required) },
      otherwise(schema) { return schema.optional() },
   }),
   writComment: yup.string().when(['selectedReason', 'county'], {
      is: (reason: string, county: string) => ['1', '2'].includes(reason) && isScraRequiredForCounty(county),
      then(schema) { return schema.required(vm.basicRequired.required) },
      otherwise(schema) { return schema.optional() },
   }),
   writApplicantIS: yup.string().when('county', {
      is: (county: string) => isWritDetailsRequiredForCounty(county),
      then(schema) {
         return schema.optional();
      },
      otherwise(schema) {
         return schema.required(vm.basicRequired.optionRequired);
      }
   }),
   // writApplicantIS: yup.string().required(vm.basicRequired.optionRequired),
   otherApplicantIS: yup.string().when('writApplicantIS', {
      is: 'Other',
      then(schema) { return schema.required(vm.otherApplicantIS.required) },
      otherwise(schema) { return schema.optional() },
   }),
   // writApplicantPhone: yup.string()
   //    .matches(/^(\(\d{3}\) ?|\d{3}-)\d{3}-\d{4}$/, vm.phone.matches),

   // writApplicantPhone: yup.string()
   //    .matches(/^(\(\d{3}\) ?|\d{3}-)\d{3}-\d{4}$/, vm.phone.matches),

   writApplicantPhone: yup
      .string()
      .nullable()
      .notRequired()
      .test('is-valid-phone', vm.phone.matches, value => {
         if (!value || value.trim() === '') {
            return true; // Allow null or empty values
         }
         return /^(\(\d{3}\) ?|\d{3}-)\d{3}-\d{4}$/.test(value);
      }),
   writLaborId: yup.string().required(vm.basicRequired.optionRequired),
   hasSSN: yup.string().when(['selectedReason', 'county'], {
      is: (reason: string, county: string) => !isScraRequiredForCounty(county) || reason !== '0',
      then(schema) { return schema.optional() }, // Optional if '2' or '3' is selected
      otherwise(schema) { return schema.required(vm.basicRequired.optionRequired) }, // Required for other options
   }),
   isCorporation: yup.string().when(['selectedReason', 'county'], {
      is: (reason: string, county: string) => isScraRequiredForCounty(county) && reason === '0',
      then(schema) { return schema.required(vm.basicRequired.optionRequired) },
      otherwise(schema) { return schema.optional() },
   }),
   county: yup.string().optional(),
   militaryStatusReport: yup.string().when(['selectedReason', 'isCorporation', 'county'], {
      is: (reason: string, isCorporation: string, county: string) => reason === '0' && isCorporation === 'No' && isScraRequiredForCounty(county),
      then(schema) { return schema.required(vm.basicRequired.required) },
      otherwise(schema) { return schema.optional() },
   }),
});

const initialColumnMapping: IGridHeader[] = [
   { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
   { columnName: "county", label: "County" },
   { columnName: "caseNo", label: "CaseNo", toolTipInfo: "The unique number or code associated with your case, as assigned by the court. " },
   { columnName: "propertyName", label: "PropertyName Vs. Tenants" },
   { columnName: "address", label: "TenantAddressCombined" },
   { columnName: "selectedReason", label: "WritReason", toolTipInfo: "The reason for which you are filing a writ of possession. " },
   { columnName: "writOrderDate", label: "WritOrderDate", toolTipInfo: "The date the writ order was issued by the court. " },
   { columnName: "paymentAmountOwned", label: "WritPaymentOwed" },
   { columnName: "paymentDueOn", label: "WritPaymentDueOn" },
   { columnName: "writComment", label: "WritComments", toolTipInfo: "You must clearly state how the tenant failed to meet the terms of the Consent Judgment/Order/Agreement." },
   { columnName: "writApplicantIS", label: "WritApplicantIs", toolTipInfo: "The relationship that the writ affiant has to the case. This is usually Owner, Attorney, or Agent. " },
   { columnName: "writApplicantPhone", label: "WritApplicantPhone" },
   { columnName: "writLaborId", label: "WritLabor" },
   { columnName: "hasSSN", label: "HaveSSN", toolTipInfo: "Select 'Yes' if you used the tenant's social security number to acquire SCRA documentation." },
   { columnName: "isCorporation", label: "IsCorporation", toolTipInfo: "Select 'Yes' if the tenant is a corporation." },
   { columnName: "militaryStatusReport", label: "MiliaryStatusPDF" }
];

const AllCases_AddtoWrits = (props: AddtoWritsProps) => {
   const { userRole, setUnsignedWritCount } = useAuth();
   const navigate = useNavigate();
   const {
      allCases,
      setAllCases,
      writLabors,
      getWritLabors,
      filteredRecords,
      setFilteredRecords,
      setSelectedFilteredCasesId,
      selectedAllCasesId,
      setSelectedAllCasesId,
      bulkRecords,
      selectedCaseIdsForFiling,
      setSelectedCaseIdsForFiling,
      proceedWithDismissals
   } = useAllCasesContext();
   const isMounted = useRef(true);
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [showConfirm, setShowConfirm] = useState<boolean>(false);
   const [showUploadReports, setShowUploadReports] = useState<boolean>(false);
   const [showSignInPopup, setShowSignInPopup] = useState<boolean>(false);
   const [showErrors, setShowErrors] = useState(false);
   const [columnErrors, setColumnErrors] = useState<Record<string, { rowIndex: number; errorMessage: string }[]>[]>([]);
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [otherApplicantISMap, setOtherApplicantISMap] = useState<Record<string, string>>({});
   const [writLabourList, setWritLabourList] = useState<ISelectOptions[]>([]);
   const [uploadReportsForCase, setUploadReportsForCase] = useState<ISelectedWrit | null>(null);
   const [showNonSupportedCountyMessage, setShowNonSupportedCountyMessage] = useState<string>("");
   const [showCountyMessage, setShowCountyMessage] = useState<string>("");

   const [selectedFilteredRows, setSelectedFilteredRows] = useState<Array<boolean>>(
      Array(filteredRecords?.length).fill(false)
   );
   const [checkUnFinedCases, setCheckUnFindCases] = useState<boolean>(false);
   const confirmationMessage = showConfirm
      ? "Are you sure you like to confirm these cases for Writs of Possession?"
      : "Are you sure you’d like to file Writs of Possession?";

   // const writSupportedCounties: string[] = ['CLAYTON', 'DEKALB', 'FULTON', 'GWINNETT'];
   const writSupportedCounties: string[] = ['CLAYTON', 'DEKALB', 'FULTON', 'GWINNETT', 'CHATHAM'];
   // const writNotSupportedCounties: string[] = ['CHATHAM', 'CHEROKEE', 'COBB', 'FORSYTH', 'ROCKDALE'];
   const writNotSupportedCounties: string[] = ['CHEROKEE', 'COBB', 'FORSYTH', 'ROCKDALE'];


   useEffect(() => {
      //Setting default value for reason column
      const allCasesRecords = bulkRecords.map((item: any) => {
         const matchingRecord = filteredRecords.find((r) => r.id === item.id);
         return {
            ...item, // Spread existing properties
            selectedReason: matchingRecord?.selectedReason ?? "",
            writOrderDate: matchingRecord?.writOrderDate ?? "",
            paymentAmountOwned: matchingRecord?.paymentAmountOwned ?? "",
            paymentDueOn: matchingRecord?.paymentDueOn ?? "",
            writComment: matchingRecord?.writComment ?? "",
            writLaborId: matchingRecord?.writLaborId ?? "",
            hasSSN: matchingRecord?.hasSSN ?? "",
            writApplicantIS: matchingRecord?.writApplicantIS ?? "",
            otherApplicantIS: matchingRecord?.otherApplicantIS ?? "",
            writApplicantPhone: matchingRecord?.writApplicantPhone ?? "",
            isCorporation: matchingRecord?.isCorporation ?? "No",
            militaryStatusReport: matchingRecord?.militaryStatusReport ?? "",
         };
      });

      const selectedIds = selectedCaseIdsForFiling.length
         ? selectedCaseIdsForFiling
         : selectedAllCasesId;

      let uniqueRecords: { [key: string]: any } = {};
      let records = allCasesRecords.filter((item) => {
         const id = item.id || "";
         if (!selectedIds.includes(id) || !item.caseNo?.length || uniqueRecords[id] || (!proceedWithDismissals && item.isDismissal)) {
            return false;
         }
         uniqueRecords[id] = true;
         return true;
      });

      if (records.some((item) => writNotSupportedCounties.includes(item.county.toUpperCase()))) {
         setShowNonSupportedCountyMessage(
            `Connect2Court does not currently offer Writ filing in ${formatCountyList(writNotSupportedCounties)} Counties.`
         );
      }

      if (records.some((item) => item.county.toUpperCase() == "GWINNETT")) {
         setShowCountyMessage(
            `Only Writ Labor is needed for Gwinnett County.  The court will determine details for writ and issue if accepted.`
         );
      }

      records = records.filter((item) => writSupportedCounties.includes(item.county.toUpperCase()));

      setFilteredRecords(records);

      setSelectAll(false);
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

   }, [allCases.items, selectedAllCasesId, selectedCaseIdsForFiling]);

   useEffect(() => {
      if (isMounted.current) {
         getWritLabors();
         isMounted.current = false;
      };

   }, []);

   useEffect(() => {
      //   const filterWritLabors =  writLabors.filter(x=>x.email != null && x.email != "" && x.phone != null && x.phone != "")
      const writLaborsList: ISelectOptions[] = writLabors.map((item: IWritsLabor) => {
         return {
            id: item.id,
            value: item.firstName
         } as ISelectOptions;
      });

      setWritLabourList(writLaborsList);

   }, [writLabors]);

   // const handleInputChange = async (
   //   columnName: string,
   //   updatedValue: string,
   //   selectedRowIndex: number
   // ) => {
   //   // setDisableReviewSign(false);
   //   setFilteredRecords((prevRows) =>
   //     prevRows.map((row, rowIndex) => {
   //       const updatedRow =
   //         rowIndex === selectedRowIndex
   //           ? { ...row, [columnName]: updatedValue }
   //           : row;
   //       // Perform validation for the updated row
   //       validateRow(updatedRow, rowIndex);  // Pass the correct rowIndex here

   //       return updatedRow;
   //     })
   //   );
   // };

   const handleInputChange = async (
      columnName: string,
      updatedValue: string | boolean,
      selectedRowIndex: number
   ) => {
      // If any row is selected, perform bulk update
      if (selectedFilteredRows[selectedRowIndex]) {
         setFilteredRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               if (selectedFilteredRows[rowIndex] === selectedFilteredRows[selectedRowIndex]) {
                  if (columnName === "selectedReason") {
                     if (updatedValue === "1") {
                        const updatedRow = {
                           ...row,
                           isCorporation: "No",
                           [columnName]: updatedValue,
                        };
                        validateRow(updatedRow, rowIndex);
                        return updatedRow;
                     }
                     if (updatedValue === "2") {
                        const updatedRow = {
                           ...row,
                           paymentAmountOwned: "",
                           paymentDueOn: "",
                           isCorporation: "No",
                           [columnName]: updatedValue,
                        };
                        validateRow(updatedRow, rowIndex);
                        return updatedRow;
                     }
                     else {
                        const updatedRow = {
                           ...row,
                           writOrderDate: "",
                           paymentAmountOwned: "",
                           paymentDueOn: "",
                           writComment: "",
                           isCorporation: "No",
                           [columnName]: updatedValue as string,
                        };
                        validateRow(updatedRow, rowIndex);
                        return updatedRow;
                     }
                  };
                  // If the row is selected, update the specified column
                  const updatedRow = { ...row, [columnName]: updatedValue };
                  // Perform validation for the updated row 
                  validateRow(updatedRow, rowIndex);

                  return updatedRow;
               }

               else {
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
            writApplicantIS: "writApplicantIS",
            writLaborId: "writLaborId",
            selectedReason: "selectedReason",
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

         // Reset values for specific fields if the reason is changed
         if (columnName === "selectedReason") {
            resetValuesOnReasonChange(rowIndex, selectedOption, columnName);
         };

         // Handle "Other" option for writApplicantIS
         if (dropdownType === "writApplicantIS" && selectedOption === "Other") {
            // Set the "Other" value in writApplicantIS for this specific row
            setFilteredRecords((prevRecords) =>
               prevRecords.map((record, index) => {
                  if (index === rowIndex) {
                     return {
                        ...record,
                        otherApplicantIS: otherApplicantISMap[rowId || ""] || "", // Set the "Other" value
                     };
                  }
                  return record;
               })
            );
         }

         // Perform validation for the updated row
         validateRow(updatedGridData[rowIndex], rowIndex);

      } catch (error) {
         toast.error("Something went wrong");
      } finally {
         setShowSpinner(false);
      }
   };

   const handleMilitaryStatusReport = (rowIndex: number) => {
      // Get the selected record based on the rowIndex
      const selectedRecord = filteredRecords[rowIndex];

      // Set the state variable to show the modal and pass only the selected record
      setShowUploadReports(true);
      setUploadReportsForCase(selectedRecord);
   };

   const handleRemoveMSReport = async (tenant: ITenant) => {
      try {
         if (
            tenant.attachmentId !== Guid.EMPTY &&
            tenant.attachmentId !== null &&
            tenant.attachmentId !== '' &&
            tenant.attachmentId !== undefined
         ) {
            const response = await AllCasesService.removeMilitaryStatusReport(tenant.attachmentId);
            if (response.status === HttpStatusCode.Ok) {
               tenant.isMilitaryStatusUploaded = false;
               tenant.militaryStatusDocURL = "";
               tenant.attachmentId = Guid.EMPTY

               setFilteredRecords((prev) =>
                  prev.map((item) => {
                     // Check if the tenant is part of tenantNames
                     if (item.tenantNames.some((t) => t.id === tenant.id)) {
                        return {
                           ...item,
                           militaryStatusReport: "", // Update militaryStatusReport at item level
                           tenantNames: item.tenantNames.map((t) =>
                              t.id === tenant.id ? { ...t, ...tenant } : t
                           )
                        };
                     }
                     return item;
                  })
               );

               toast.success("Military status report removed successfully");
            }
         } else {
            toast.error("Military status report not found");
         }

      } catch (error) {
         console.log(error);
      }
   };

   const isScraRequiredForIndex = (rowIndex: number) => {
      const county = filteredRecords[rowIndex]?.county;
      return isScraRequiredForCounty(county);
   };

   const isSelectedFirstReason = (fieldName: string, rowIndex: number) => {
      const rowSelectedReason = filteredRecords[rowIndex]?.selectedReason;
      return rowSelectedReason === "0" && ["writOrderDate", "paymentAmountOwned", "paymentDueOn", "writComment"].includes(fieldName);
   };

   const isSelectedThirdReason = (fieldName: string, rowIndex: number) => {
      const rowSelectedReason = filteredRecords[rowIndex]?.selectedReason;
      return rowSelectedReason === "2" && ["paymentAmountOwned", "paymentDueOn"].includes(fieldName);
   };

   const resetValuesOnReasonChange = (rowIndex: number, selectedOption: string, columnName: string) => {
      const updatedGridData = filteredRecords.map((record, index) => {
         if (index === rowIndex) {
            if (selectedOption === "1") {
               return {
                  ...record,
                  isCorporation: "No",
                  [columnName]: selectedOption,
               };
            }
            if (selectedOption === "2") {
               return {
                  ...record,
                  paymentAmountOwned: "",
                  paymentDueOn: "",
                  isCorporation: "No",
                  [columnName]: selectedOption,
               };
            }
            return {
               ...record,
               writOrderDate: "",
               paymentAmountOwned: "",
               paymentDueOn: "",
               writComment: "",
               isCorporation: "No",
               [columnName]: selectedOption,
            };
         }
         return record;
      });

      setFilteredRecords(updatedGridData);
   };

   const handleReviewAndSign = async () => {
      setShowErrors(true);
      // Validate all records against the schema
      const recordsWithErrors = filteredRecords.filter((record, rowIndex) => {
         try {
            validationSchema.validateSync(record, { abortEarly: false });
            return false; // No errors for this record
         } catch (error) {
            validateRow(record, rowIndex); // Update columnErrors state with errors
            return true; // Errors for this record
         }
      });

      if (recordsWithErrors.length > 0) {
         return;
      };

      // Proceed with handleReviewSign if all records are valid
      props.handleReviewSign();
   };

   // file writs in case of non-signer
   const handleConfirmation = () => {
      setShowErrors(true);

      // Validate all records against the schema
      const recordsWithErrors = filteredRecords.filter((record, rowIndex) => {
         try {
            validationSchema.validateSync(record, { abortEarly: false });
            return false; // No errors for this record
         } catch (error) {
            validateRow(record, rowIndex); // Update columnErrors state with errors
            return true; // Errors for this record
         }
      });

      if (recordsWithErrors.length > 0) {
         return;
      };

      setShowConfirm(true);
   };

   const fileWritsAsNonSigner = async () => {
      try {
         setShowConfirm(true);
         const fileWritsRequest = filteredRecords.map((item: IAllCasesItems) => ({
            caseId: item.id,
            reason: parseInt(item.selectedReason ?? '0', 10),
            // item.EvictionDateFiled = item.EvictionDateFiled ? moment(item.EvictionDateFiled, 'MM/DD/YYYY').toISOString() : null;
            writOrderDate: item.writOrderDate ? convertToEasternISOString(item.writOrderDate as string) : null,
            // writOrderDate: item.writOrderDate ? new Date(item.writOrderDate) : new Date(),
            paymentAmountOwned: parseFloat(item.paymentAmountOwned ?? '0'),
            // paymentDueOn: item.paymentDueOn ? new Date(item.paymentDueOn) : new Date(),
            paymentDueOn: item.paymentDueOn ? convertToEasternISOString(item.paymentDueOn as string) : null,
            writComment: item.writComment ?? "",
            hasSSN: isScraRequiredForCounty(item.county) ? (item.hasSSN === "Yes" ? true : false) : null,
            isCorporation: isScraRequiredForCounty(item.county) ? (item.isCorporation === "Yes" ? true : false) : null,
            writApplicantIs: item.writApplicantIS === "Other" ? item.otherApplicantIS : item.writApplicantIS,
            writApplicantPhone: item.writApplicantPhone,
            writLaborId: item.writLaborId,
         } as IWritsCase));

         const response = await AllCasesService.nonSignFileWrits(fileWritsRequest);
         if (response.status === HttpStatusCode.Ok) {
            // set unsigned dismissal count
            handleUnsignedCaseCount();
            toast.success("These cases have been added to writs tab", {
               position: toast.POSITION.TOP_RIGHT,
            });
            setShowSpinner(false);
            setSelectedAllCasesId([]);
            props.handleClose();
            navigate('/writs-of-possession?signed=false');
         }

      } catch (error) {
         toast.success("Something went wrong");
      } finally {
         setShowSpinner(false);
      }
   };

   const handleUnsignedCaseCount = async () => {
      try {
         const response = await AuthService.getUnsignedCaseCount();
         if (response.status === HttpStatusCode.Ok) {
            setUnsignedWritCount(response.data.unsignedWrit);
         }
      } catch (error) {
         console.log(error);
      }
   };

   const validateRow = (row: IAllCasesItems, rowIndex: number) => {
      const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};

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
      setColumnErrors((prevErrors) => [
         ...prevErrors.slice(0, rowIndex),
         recordErrors,
         ...prevErrors.slice(rowIndex + 1),
      ]);
   };

   const [newSelectedRows] = useState<boolean[]>([]);
   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [selectAll, setSelectAll] = useState<boolean>(false);

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
            setSelectAll(true);
         } else {
            setSelectAll(false);
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
      const newSelectAll = !selectAll;
      const allIds: string[] = filteredRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         setSelectedFilteredCasesId(allIds);
      } else {
         setSelectedFilteredCasesId([]);
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
   const handleCellRendered = (cellIndex: number, data: IAllCasesItems, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      //const propertyName = (initialColumnMapping as any)[columnName];
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];

      const renderers: Record<string, () => JSX.Element> = {
         county: () => <>
            <input
               type={"text"}
               value={cellValue}
               readOnly={true}
               className={"font-normal text-xs text-gray-900  focus:outline-none allcasesWrit_county"}
            />
         </>,
         caseNo: () => <>{cellValue}</>,
         propertyName: () => renderPropertyVsTenants(data),
         address: () => formattedAddressCell(data),
         selectedReason: () => (
            <div className="fields_validation">
               <DropdownPresentation
                  heading={""}
                  selectedOption={
                     {
                        id: cellValue,
                        value: cellValue,
                     } as ISelectOptions
                  }
                  handleSelect={(event) => { handleDropdownChange(event, data.id, rowIndex, "selectedReason"); handleInputChange?.(propertyName, event.target.value, rowIndex) }}
                  options={WritsReasonList}
                  placeholder="Select an option"
                  sort={false}
                  disabled={data.county.trim().toLowerCase() === "gwinnett" ? true : false}
               />
               {showErrors && columnErrors[rowIndex]?.selectedReason?.map((error, index) => (
                  <div key={index} className="text-red-500 ml-2 mb-1">
                     {error.errorMessage}
                  </div>
               ))}
            </div>
         ),
         writApplicantIS: () => {
            const isOtherSelected = filteredRecords[rowIndex]?.writApplicantIS === "Other";
            return (
               <div className="fields_validation">
                  <div className="flex">
                     <DropdownPresentation
                        heading={""}
                        selectedOption={
                           {
                              id: cellValue,
                              value: cellValue,
                           } as ISelectOptions
                        }
                        handleSelect={(event) => { handleDropdownChange(event, data.id, rowIndex, "writApplicantIS"); handleInputChange?.(propertyName, event.target.value, rowIndex) }}
                        options={WritApplicantISList}
                        disabled={data.county.trim().toLowerCase() === "gwinnett" ? true : false}
                        placeholder="Select an option"
                     />
                     {isOtherSelected && (
                        <div className="ml-1 min-w-[100px] writApplicantOther">
                           <input
                              type="text"
                              value={filteredRecords[rowIndex]?.otherApplicantIS || ""}
                              onChange={(e) => handleInputChange("otherApplicantIS", e.target.value, rowIndex)}
                              placeholder="Enter Other Applicant IS"
                              className="peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
                           />
                        </div>
                     )}
                  </div>
                  {showErrors && (
                     <>
                        {columnErrors[rowIndex]?.writApplicantIS?.map((error, index) => (
                           <div key={index} className="text-red-500 mt-1">
                              {error.errorMessage}
                           </div>
                        ))}
                        {filteredRecords[rowIndex]?.writApplicantIS === "Other" &&
                           columnErrors[rowIndex]?.otherApplicantIS?.map((error, index) => (
                              <div key={index} className="text-red-500 mt-1">
                                 {error.errorMessage}
                              </div>
                           ))}
                     </>
                  )}
               </div>
            );
         },
         writLaborId: () => (
            <div className="fields_validation">
               <DropdownPresentation
                  heading={""}
                  selectedOption={
                     {
                        id: cellValue,
                        value: cellValue,
                     } as ISelectOptions
                  }
                  handleSelect={(event) => { handleDropdownChange(event, data.id, rowIndex, "writLaborId"); handleInputChange?.(propertyName, event.target.value, rowIndex) }}
                  options={writLabourList}
                  placeholder="Select an option"
               />
               {showErrors && columnErrors[rowIndex]?.writLaborId?.map((error, index) => (
                  <div key={index} className="text-red-500 ml-2 mb-1">
                     {error.errorMessage}
                  </div>
               ))}
            </div>
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

      const renderer = renderers[propertyName] || (() => formattedCell(cellValue, columnName, propertyName, rowIndex, data.id ?? "", data));

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

   const formattedCell = (value: any, columnName: any, fieldName: any, rowIndex: number, id: string, data: IAllCasesItems) => {
      if (fieldName === "writOrderDate") {
         if (isSelectedFirstReason(fieldName, rowIndex)) {
            return (
               renderNotApplicableField(true)
            )
         };
         return (
            <div className="fields_validation">
               <DatePicker
                  selected={value ? new Date(value) : null}
                  onChange={(date) => {
                     // Convert date to a formatted string or use an empty string if date is null
                     const dateString = date ? date.toLocaleDateString() : '';

                     handleInputChange?.(fieldName, dateString, rowIndex);
                  }}
                  //minDate={new Date()}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="mm/dd/yyyy"
                  disabled={data.county.trim().toLowerCase() === "gwinnett" ? true : false}
                  className={'bg-calendar peer placeholder-gray-500 outline-none p-2.5 py-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_right_8px] min-w-28 pr-6'
                  }
               />
               {/* <input
            type={"date"}
            value={isSelectedFirstReason(fieldName, rowIndex) ? "N/A" : value as string}
            readOnly={isSelectedFirstReason(fieldName, rowIndex)}
            className={
              "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
            }
            onChange={(e) =>
              handleInputChange?.(fieldName, e.target.value, rowIndex)
            }
          /> */}
               {showErrors && columnErrors[rowIndex] && columnErrors[rowIndex][fieldName] && (
                  <div className="text-red-500 mb-1">
                     {columnErrors[rowIndex][fieldName].map((error, index) => (
                        <div key={index}>
                           {error.errorMessage}
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )
      };
      if (fieldName === "paymentAmountOwned") {
         return (
            <div className="fields_validation">
               <input
                  type={isSelectedFirstReason(fieldName, rowIndex) || isSelectedThirdReason(fieldName, rowIndex) ? "text" : "number"}
                  value={isSelectedFirstReason(fieldName, rowIndex) || isSelectedThirdReason(fieldName, rowIndex) ? "N/A" : value as string}
                  readOnly={isSelectedFirstReason(fieldName, rowIndex) || isSelectedThirdReason(fieldName, rowIndex)}
                  disabled={isSelectedFirstReason(fieldName, rowIndex) || isSelectedThirdReason(fieldName, rowIndex) || data.county.trim().toLowerCase() === "gwinnett"}
                  style={{
                     backgroundImage: `url(${dollarImage})`,
                  }}
                  min={0}
                  className={`peer outline-none p-2.5 py-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_left_10px] !pl-7  `}
                  onChange={(e) =>
                     handleInputChange?.(fieldName, e.target.value as string, rowIndex)
                  }
               />
               {showErrors && columnErrors[rowIndex] && columnErrors[rowIndex][fieldName] && (
                  <div className="text-red-500 mb-1">
                     {columnErrors[rowIndex][fieldName].map((error, index) => (
                        <div key={index}>
                           {error.errorMessage}
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )
      }
      if (fieldName === "paymentDueOn") {
         if (isSelectedFirstReason(fieldName, rowIndex) || isSelectedThirdReason(fieldName, rowIndex)) {
            return (
               renderNotApplicableField(true)
            )
         }
         return (
            <div className="fields_validation">
               <DatePicker
                  selected={value ? new Date(value) : null}
                  onChange={(date) => {
                     // Convert date to a formatted string or use an empty string if date is null
                     const dateString = date ? date.toLocaleDateString() : '';
                     handleInputChange?.(fieldName, dateString, rowIndex);
                  }}
                  disabled={data.county.trim().toLowerCase() === "gwinnett" ? true : false}
                  // minDate={new Date()}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="mm/dd/yyyy"
                  className={'bg-calendar peer placeholder-gray-500 outline-none p-2.5 py-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_right_8px] min-w-28 pr-6'}
               />
               {/* <input
            type={"date"}
            placeholder={"mm/dd/yyyy"}
            value={isSelectedFirstReason(fieldName, rowIndex) ? "N/A" : value as string}
            readOnly={isSelectedFirstReason(fieldName, rowIndex)}
            className={
              "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
            }
            onChange={(e) =>
              handleInputChange?.(fieldName, e.target.value, rowIndex)
            }
          /> */}
               {showErrors && columnErrors[rowIndex] && columnErrors[rowIndex][fieldName] && (
                  <div className="text-red-500 mb-1">
                     {columnErrors[rowIndex][fieldName].map((error, index) => (
                        <div key={index}>
                           {error.errorMessage}
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )
      };
      if (fieldName === "writApplicantPhone") {
         return (
            <div className="fields_validation">
               <InputMask
                  mask="(999) 999-9999"
                  maskChar=" "
                  value={(value as any)
                  }
                  onChange={(e: any) =>
                     handleInputChange?.(fieldName, e.target.value, rowIndex)
                  }
                  onBlur={(e: any) =>
                     handleInputChange?.(fieldName, e.target.value, rowIndex)
                  }
                  name={fieldName}
                  id={fieldName + rowIndex}
                  disabled={data.county.trim().toLowerCase() === "gwinnett" ? true : false}
                  className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]" // Custom class for styling
               />
               {showErrors && columnErrors[rowIndex] && columnErrors[rowIndex][fieldName] && (
                  <div className="text-red-500 mb-1">
                     {columnErrors[rowIndex][fieldName].map((error, index) => (
                        <div key={index}>
                           {error.errorMessage}
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )
      };
      if (fieldName === "hasSSN") {
         if (!isScraRequiredForIndex(rowIndex)) {
            return (
               renderNotApplicableField(true)
            )
         }
         return (
            <div className="fields_validation">
               <div className="flex gap-3">
                  <div className="flex items-center">
                     <input
                        id={`${fieldName}1`}
                        type="radio"
                        value={"Yes"}  // Set appropriate values for 'Yes' option
                        name={`${fieldName}-${rowIndex}`}
                        disabled={data.county.trim().toLowerCase() === "gwinnett" ? true : false}
                        className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 outline-0"
                        onChange={(e) => handleInputChange?.(fieldName, e.target.value, rowIndex)}
                        checked={value === "Yes"}
                     />
                     <label htmlFor={`${fieldName}${rowIndex}`} className="ms-1 text-xs font-medium text-gray-900 ">Yes</label>
                  </div>
                  <div className="flex items-center">
                     <input
                        id={`${fieldName}2`}
                        type="radio"
                        value="No"  // Set appropriate values for 'No' option
                        name={`${fieldName}-${rowIndex}`}
                        disabled={data.county.trim().toLowerCase() === "gwinnett" ? true : false}
                        className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 outline-0"
                        onChange={(e) => handleInputChange?.(fieldName, e.target.value, rowIndex)}
                        checked={value === "No"}
                     />
                     <label htmlFor={`${fieldName}2`} className="ms-1 text-xs font-medium text-gray-900 ">No</label>
                  </div>
               </div>
               {showErrors && columnErrors[rowIndex] && columnErrors[rowIndex][fieldName] && (
                  <div className="text-red-500 mb-1">
                     {columnErrors[rowIndex][fieldName].map((error, index) => (
                        <div key={index}>
                           {error.errorMessage}
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )
      };
      if (fieldName === "isCorporation") {
         if (!isScraRequiredForIndex(rowIndex)) {
            return (
               renderNotApplicableField(true)
            )
         }
         const selectedReason = filteredRecords[rowIndex]?.selectedReason ?? "";
         // Check if the field should be visible based on the selected reason
         if (!(selectedReason === "0" || selectedReason === "" || selectedReason === undefined)) {
            return <div className="fields_validation">N/A</div>;
         };

         return (
            <div className="fields_validation">
               <div className="radio_btns">
                  <div className="flex gap-3 items-center">
                     <div className="flex items-center">
                        <input
                           id="radio1"
                           type="radio"
                           value={"Yes"}  // Set appropriate values for 'Yes' option
                           name={`radio-${rowIndex}`}
                           className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 outline-0"
                           onChange={(e) => handleInputChange?.(fieldName, e.target.value, rowIndex)}
                           checked={value === "Yes"}
                           disabled={selectedReason !== "0" && selectedReason !== ""}
                        />
                        <label htmlFor="radio1" className="ms-1 text-xs font-medium text-gray-900 ">Yes</label>
                     </div>
                     <div className="flex items-center">
                        <input
                           id="radio2"
                           type="radio"
                           value="No"  // Set appropriate values for 'No' option
                           name={`radio-${rowIndex}`}
                           className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 outline-0"
                           onChange={(e) => handleInputChange?.(fieldName, e.target.value, rowIndex)}
                           checked={value === "No"}
                           disabled={selectedReason !== "0" && selectedReason !== ""}
                        />
                        <label htmlFor="radio2" className="ms-1 text-xs font-medium text-gray-900 ">No</label>
                     </div>
                  </div>
                  {showErrors && columnErrors[rowIndex] && columnErrors[rowIndex][fieldName] && (
                     <div className="text-red-500 mb-1">
                        {columnErrors[rowIndex][fieldName].map((error, index) => (
                           <div key={index}>
                              {error.errorMessage}
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         )
      };
      if (fieldName === "militaryStatusReport") {
         if (!isScraRequiredForIndex(rowIndex)) {
            return (
               renderNotApplicableField(true)
            )
         }
         const isCorporationYes = filteredRecords[rowIndex]?.isCorporation === "Yes";
         const plaintiffNotAcceptedMoney = filteredRecords[rowIndex]?.selectedReason === "0";
         const tenantNames: ITenant[] = filteredRecords[rowIndex]?.tenantNames;
         //const areAllDocumentsUploaded = tenantNames.every((tenant) => tenant.isMilitaryStatusUploaded);
         //filteredRecords[rowIndex].militaryStatusReport = areAllDocumentsUploaded ? "UPLOADED" : "";
         const uploadedReports = tenantNames.filter((tenant) => tenant.isMilitaryStatusUploaded);
         filteredRecords[rowIndex].militaryStatusReport = uploadedReports.length === tenantNames.length ? "UPLOADED" : "";

         if (isCorporationYes && plaintiffNotAcceptedMoney) {
            return <span className="flex items-center text-xs font-medium text-gray-600">Upload Report(s)</span>;
         };

         return (
            <div className="fields_validation">
               <div className="flex gap-1">
                  {uploadedReports.map((tenant: ITenant) => (
                     <div
                        key={tenant.id}
                        className="relative flex select-none items-center whitespace-nowrap rounded-md bg-[#3b82f633] px-2 py-1 font-sans text-[10px] font-bold uppercase text-[#3b82f6]"
                     >
                        <a
                           target="_blank"
                           onClick={() => openPdf(tenant.militaryStatusDocURL)}
                           className="cursor-pointer"
                        >
                           {tenant.firstName}
                        </a>
                        <a
                           onClick={() => handleRemoveMSReport(tenant)}
                           className="cursor-pointer"
                        >
                           <FaTimes />
                        </a>
                     </div>
                  ))}
               </div>
               {uploadedReports.length !== tenantNames.length && (
                  <a
                     className="text-xs font-medium text-blue-600 cursor-pointer"
                     onClick={() => handleMilitaryStatusReport(rowIndex)}
                  >
                     Upload Report(s)
                  </a>
               )}
               {showErrors && columnErrors[rowIndex]?.militaryStatusReport?.map((error, index) => (
                  <div key={index} className="text-red-500 ml-2 mb-1">
                     {error.errorMessage}
                  </div>
               ))}
            </div>
         );
      };
      return (
         <div className="fields_validation">
            <input
               type={"text"}
               value={isSelectedFirstReason(fieldName, rowIndex) ? "N/A" : value as string}
               readOnly={isSelectedFirstReason(fieldName, rowIndex)}
               disabled={isSelectedFirstReason(fieldName, rowIndex) || data.county.trim().toLowerCase() === "gwinnett"}
               className={
                  "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
               }
               onChange={(e) =>
                  handleInputChange?.(fieldName, e.target.value, rowIndex)
               }
            />
            {showErrors && columnErrors[rowIndex] && columnErrors[rowIndex][fieldName] && (
               <div className="text-red-500 mb-1">
                  {columnErrors[rowIndex][fieldName].map((error, index) => (
                     <div key={index}>
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            )}
         </div>
      );
   };

   const renderNotApplicableField = (disabled: boolean) => {
      return (
         <div className="fields_validation">
            <input
               type={"text"}
               value={"N/A"}
               readOnly={true}
               disabled={true}
               className={"peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "}
            />
         </div>

      )
   };

   const renderPropertyVsTenants = (data: IAllCasesItems) => (
      <>
         {data.propertyName ?? ''}
         <strong className="font-semibold text-gray-900">
            {data.propertyName && data.tenantNames?.length ? " Vs. " : ""}
         </strong>
         <br />
         {data.tenantNames.map((tenant, index) => (
            <span key={index}>
               {`${tenant.firstName} ${tenant.middleName ? tenant.middleName + ' ' : ''}${tenant.lastName}${index !== data.tenantNames.length - 1 ? ',' : data.andAllOtherOccupants?.length ? ',' : ''}`}
               <br />
            </span>
         ))}
         {`${data.andAllOtherOccupants?.length ? "and " : ""}${data.andAllOtherOccupants ?? ""}`}
      </>
   );

   const formattedAddressCell = (value: IAllCasesItems) => (
      <span>
         {value != null
            ? `${value.address ?? ""} ${value.unit ?? ""} ${value.city ?? ""} ${value.state ?? ""} ${value.zip ?? ""}`
            : ""}
      </span>
   );

   const resetSelectedRows = () => {
      // setFilteredRecords([]);
      // setSelectedCaseIdsForFiling([]);

      setAllCases(prev => ({
         ...prev,
         items: prev.items.map(item => ({
            ...item,
            isChecked: false,
            selectedReason: "",
            writOrderDate: "",
            paymentAmountOwned: "",
            paymentDueOn: "",
            writComment: "",
            writLaborId: "",
            hasSSN: "",
            writApplicantIS: "",
            otherApplicantIS: "",
            writApplicantPhone: "",
            isCorporation: "",
            militaryStatusReport: ""
         }))
      }));
   };

   const openPdf = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   };

   return (
      <>
         <Drawer
            openDrawer={props.showAddtoWritsPopup}
            onClose={() => {
               props.handleClose();
               resetSelectedRows();
               setFilteredRecords([]);
            }}
         >
            {showSpinner && <Spinner />}
            {/* Container for the content */}
            <div id="fullPageContent">
               <div className="bg-white pb-1.5 pt-4 p-3.5 md:p-5 !pb-1">
                  {/* <div className="md:flex md:items-center justify-between text-center md:text-left mb-1.5 -mt-1.5">
                     <h3
                        className="leading-5 text-gray-900 text-[16px] md:text-xl mb-0"
                        id="modal-title"
                     >
                        File Writs
                     </h3>
                     <p className="text-[#E61818]">
                        {showNonSupportedCountyMessage}
                     </p>
                     <p className="text-[#E61818]">
                        {showCountyMessage}
                     </p>
                  </div> */}
                  <div className="md:flex md:items-center justify-between text-center md:text-left mb-1.5 -mt-1.5">
                     <h3 className="leading-5 text-gray-900 text-[16px] md:text-xl mb-0" id="modal-title">
                        File Writs
                     </h3>
                     <div className="flex flex-col md:ml-4">
                        <p className="text-[#E61818]">
                           {showNonSupportedCountyMessage}
                        </p>
                        <p className="text-[#E61818]">
                           {showCountyMessage}
                        </p>
                     </div>
                  </div>

                  {/* Display the grid*/}
                  <div className="relative pt-1 writlabor-writofpossession-grid">
                     <Grid
                        columnHeading={visibleColumns}
                        rows={filteredRecords}
                        showInPopUp={true}
                        handleSelectAllChange={handleSelectAllChange}
                        selectAll={selectAll}
                        cellRenderer={(
                           data: IAllCasesItems,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                     ></Grid>
                     <p className="text-[10px] md:text-xs text-[#E61818] font-medium mt-2">
                        {props.errorMsg && (
                           <>
                              {props.errorMsg}{' '}
                              <a

                                 onClick={(e) => {
                                    setCheckUnFindCases(true);
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
                        <p className="font-semibold text-[10px] md:text-xs">Total record(s): {filteredRecords?.length}</p>
                        {userRole.includes(UserRole.Admin) ||
                           userRole.includes(UserRole.C2CAdmin) ||
                           userRole.includes(UserRole.ChiefAdmin) ||
                           userRole.includes(UserRole.Signer) ? (
                           <Button
                              handleClick={handleReviewAndSign}
                              title="Review & Sign"
                              isRounded={false}
                              type={"button"}
                              disabled={!filteredRecords.length}
                              classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                           ></Button>
                        ) : (
                           <Button
                              handleClick={handleConfirmation}
                              title="Confirm"
                              isRounded={false}
                              type={"button"}
                              disabled={!filteredRecords.length}
                              classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                           ></Button>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Modal for Military status report upload */}
            <AllCasesWritsDocumentsUploader
               open={showUploadReports}
               setOpen={() => setShowUploadReports(false)}
               selectedCaseForWrits={uploadReportsForCase}
               setSelectedCaseForWrits={(data: ISelectedWrit) => setUploadReportsForCase(data)}
            />

            {/* Confirmation modal for NonSigner  */}
            <Modal
               showModal={showConfirm || showSignInPopup}
               onClose={() => {
                  props.handleClose();
                  resetSelectedRows();
               }}
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
                           {showConfirm && confirmationMessage}
                        </h3>
                     </div>
                  </div>
                  <div className="flex justify-end m-2">
                     <Button
                        type="button"
                        isRounded={false}
                        title="No"
                        handleClick={() => {
                           props.handleClose();
                           // resetSelectedRows();
                        }}
                        classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                     ></Button>
                     <Button
                        handleClick={fileWritsAsNonSigner}
                        title="Yes"
                        isRounded={false}
                        type={"button"}
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        disabled={showSpinner}
                     ></Button>
                  </div>
               </div>
            </Modal>
            {checkUnFinedCases && (
               <Modal
                  showModal={checkUnFinedCases}
                  onClose={() => setCheckUnFindCases(false)}
                  width="max-w-3xl"
               >
                  <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md z-20">
                     <div className="sm:flex sm:items-start">
                        <div className="text-center sm:text-left">
                           <h3 className="leading-5 text-gray-900 text-[16px] md:text-sm mb-1.5 font-medium" id="modal-title">Case(s) Not Found</h3>
                        </div>
                     </div>
                     <div className="border border-gray-200 rounded-md py-3 px-3.5 text-sm mt-2 leading-6 min-h-24">
                        <p>{props.unFinedCases}</p>
                     </div>
                  </div>
               </Modal>
            )}
         </Drawer>
      </>
   );
};

export default AllCases_AddtoWrits;
