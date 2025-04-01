import React, { useState, Fragment, SetStateAction } from "react";
import { useNavigate } from "react-router";
import {
   FaPlus,
   FaFileSignature,
   FaExclamationTriangle,
   FaFileExcel,
   FaFileExport,
   FaFilePdf,
   FaTrash,
   FaRegWindowClose,
} from "react-icons/fa";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Papa from "papaparse";
import { Form, Formik } from "formik";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useAuth } from "context/AuthContext";
import { useAllCasesContext } from "../AllCasesContext";
import { IAllCasesButton, IAllCasesItems, ICasesSearchRequest } from "interfaces/all-cases.interface";
import { IAmendmentsSign } from "interfaces/amendments.interface";
import { ExportAllCasesResource } from "interfaces/export-late-notices.interface";
import AllCasesService from "services/all-cases.service";
import AmendmentsService from "services/amendments.service";
import AuthService from "services/auth.service";
import { UserRole } from "utils/enum";
import { convertAndFormatDate, convertUtcToEst, formatCountyList, parseToDecimal } from "utils/helper";
import { AllCasesSnapshot } from "utils/constants";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import FormikControl from "components/formik/FormikControl";
import ToggleSwitch from "components/common/toggle/ToggleSwitch";
// import DownloadCsv from "components/common/downloadCsv/DownloadCsv";
import AllCasesAddtoDismissals from "./AllCasesActions/AllCases_FileDismissals";
import AllCasesAddtoWrits from "./AllCasesActions/AllCases_AddtoWrits";
import AllCasesAddtoAmendments from "./AllCasesActions/AllCases_AddtoAmendments";
import AllCasesExportData from "./AllCasesActions/AllCases_ExportData";
import AllCasesImportCsv from "./AllCasesActions/AllCases_ImportCsv";
import DeleteConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";

const classNames = (...classes: string[]) => {
   return classes.filter(Boolean).join(" ");
};

// Define the props type for AllCasesButtons component
type AllCasesButtonsProps = {
   buttons: IAllCasesButton[];
   handleFileDismissalReviewSign: () => void;
   handleFileWritsReviewSign: () => void;
   handleFileAmendmentReviewSign: () => void;
};
// Utility function to format dates in MM/DD/YYYY format
// const formatDate = (dateString: string | Date | null): string => {
//    if (!dateString) return ""; // Return empty string for null or undefined dates

//    const date = new Date(dateString);

//    if (isNaN(date.getTime())) {
//       // If it's not a valid date, return the original value (to prevent wrongly formatting strings like "AWESOME APARTMENTS 172")
//       return String(dateString);
//    }

//    // Format date as MM/DD/YYYY
//    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
//    const day = date.getDate().toString().padStart(2, "0");
//    const year = date.getFullYear();
//    return `${month}/${day}/${year}`;
// };

const formatDate = (dateString: string | Date | null): string => {
   if (!dateString) return ""; // Return empty string for null or undefined dates

   // Check if dateString is an ISO format
   if (typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(dateString)) {
      // Extract the date parts from the string directly
      const [datePart] = dateString.split('T'); // Get the date part before 'T'
      const [year, month, day] = datePart.split('-'); // Split by '-'

      // Return the formatted date as MM/DD/YYYY
      return `${month}/${day}/${year}`;
   }

   // Fallback for other formats (if needed)
   const date = new Date(dateString);
   if (isNaN(date.getTime())) {
      return String(dateString); // Return original value if invalid date
   }

   // Format date as MM/DD/YYYY using UTC methods
   const formattedMonth = (date.getUTCMonth() + 1).toString().padStart(2, "0");
   const formattedDay = date.getUTCDate().toString().padStart(2, "0");
   const formattedYear = date.getUTCFullYear();

   return `${formattedMonth}/${formattedDay}/${formattedYear}`;
};

export const AllCasesButtons = (props: AllCasesButtonsProps) => {
   const {
      allCases,
      setAllCases,
      showSpinner,
      filteredRecords,
      setFilteredRecords,
      selectedAllCasesId,
      setSelectedAllCasesId,
      bulkRecords,
      setBulkRecords,
      selectedCaseIdsForFiling,
      setSelectedCaseIdsForFiling,
      setShowSpinner,
      showCaseSnapShot,
      setShowCaseSnapShot,
      allCounties,
      clickedFilingButton,
      searchCases,
      setSearchCases,
      filingType,
      setFilingType,
      caseSearchError,
      setCaseSearchError,
      unFinedCases,
      setUnFindCases,
      getAllCases,
      caseSearchFor,
      setCaseSearchFor,
      proceedWithDismissals,
      setProceedWithDismissals
   } = useAllCasesContext();
   const {
      selectedStateValue
   } = useAuth();
   const navigate = useNavigate();
   const { userRole, setUnsignedAmendmentCount } = useAuth();
   const [showErrorMessageWhenNoRowIsSelected, setShowErrorMessageWhenNoRowIsSelectedState] = useState<boolean>(false);
   const [errorMessage, setMessage] = useState<string>("");
   const [showAddtoDismissalsPopup, setShowAddtoDismissalsPopup] = useState<boolean>(clickedFilingButton === 'dismissal' ? true : false);
   const [showAddtoWritsPopup, setShowAddtoWritsPopup] = useState<boolean>(clickedFilingButton === 'writ' ? true : false);
   const [showAddtoAmendmentsPopup, setShowAddtoAmendmentsPopup] = useState<boolean>(clickedFilingButton === 'amendment' ? true : false);
   const [showExportDataPopup, setShowExportDataPopup] = useState<boolean>(false);
   const [showSignInPopup, setShowSignInPopup] = useState<boolean>(false);
   const [amendmentSignFor, setAmendmentSignFor] = useState<string>("");
   const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false);
   const [showExportSpinner, setShowExportSpinner] = useState<boolean>(false);
   const [showCaseSearchPopup, setShowCaseSearchPopup] = useState<boolean>(searchCases ? true : false);
   const [searchCaseSpinner, setSearchCaseSpinner] = useState<boolean>(false);
   // const [filingType, setFilingType] = useState<string>("");
   const [importCsvPopUp, setImportCsvPopUp] = useState<boolean>(false);
   // const [caseSearchFor, setCaseSearchFor] = useState<string>("");
   //const [caseSearchError, setCaseSearchError] = useState<string>("");
   //const [unFinedCases, setUnFindCases] = useState<string[]>([]);
   const [checkUnFinedCases, setCheckUnFindCases] = useState<boolean>(false);
   const [showConfirmation, setShowConfirmation] = useState(false);
   const [confirmationMsg, setConfirmationMsg] = useState<{ __html: string } | null>(null);
   const [showDeleteCasesConfirmation, setShowDeleteCasesConfirmation] = useState<boolean>(false);
   const [showDismissalCasesConfirmation, setShowDismissalCasesConfirmation] = useState<boolean>(false);
   // const writNotSupportedCounties: string[] = ['CHATHAM', 'CHEROKEE', 'COBB', 'FORSYTH', 'ROCKDALE'];
   const writNotSupportedCounties: string[] = ['CHEROKEE', 'COBB', 'FORSYTH', 'ROCKDALE'];


   const initialCaseSearchValue = { searchKeyword: searchCases ? searchCases : "" };

   const setShowErrorMessageWhenNoRowIsSelected = (show: boolean, customMessage?: string) => {
      setMessage(customMessage || "Please select at least 1 record.");
      setShowErrorMessageWhenNoRowIsSelectedState(show);
   };

   const handleClick = (button: IAllCasesButton) => {
      setFilingType(button.title);
      setSearchCases("");
      // Check if no records are selected at the beginning and button is not file dismissal
      // if (!selectedAllCasesId.length && button.title !== "File Dismissals") {
      //    setShowErrorMessageWhenNoRowIsSelected(true);
      //    return; // Early return if no records are selected
      // }

      // No error if records are selected
      setShowErrorMessageWhenNoRowIsSelected(false);
      switch (button.title) {
         case "File Dismissals":
            setCaseSearchFor("dismissal(s)");
            // Check if no records are selected at the beginning
            if (!selectedAllCasesId.length) {
               // setCaseSearchFor("dismissal(s)");
               setShowCaseSearchPopup(true);

            }
            else {
               // Check if all selected cases do not have a case number
               const selectedCasesForDismissal = selectedAllCasesId.every((id) => {
                  const record = allCases.items.find((item) => item.id === id);
                  return record && (!record.caseNo || record.caseNo.trim() === "");
               });

               if (selectedCasesForDismissal) {
                  setShowErrorMessageWhenNoRowIsSelected(true, "None of the selected cases have a case number.");
               } else {
                  const dismissalReadyRecords = allCases.items.filter(
                     (record) =>
                        (record.dismissalFileDate !== null
                           // || record.status === "Dismissal Applied for"
                           || record.isDismissal === true
                        ) &&
                        selectedAllCasesId.includes(record.id ?? "")
                  );

                  const hasDismissalReadyRecords = dismissalReadyRecords.length > 0;

                  if (hasDismissalReadyRecords) {
                     const dismissalReadyCases = dismissalReadyRecords.map((record) => record.caseNo);
                     // setShowErrorMessageWhenNoRowIsSelected(true, "Ensure that the chosen case has not already been dismissed.");
                     // setUnFindCases([]);
                     //setCaseSearchError("");
                     setUnFindCases(dismissalReadyCases);
                     // setCaseSearchError( "Sorry, we couldn't find " + dismissalReadyCases.length + " case(s) that match your criteria or case(s) already dismissed.");
                     setShowDismissalCasesConfirmation(true);
                  }
                  else {
                     setShowAddtoDismissalsPopup(true);
                     setCaseSearchError("");
                  }
               }
            }
            break;

         case "File Writs":
            setSelectedCaseIdsForFiling([]);
            setCaseSearchFor("writ(s)");
            // Check if no records are selected at the beginning
            if (!selectedAllCasesId.length) {
               // setCaseSearchFor("writ(s)");
               setShowCaseSearchPopup(true);

            } else {
               // Check if all selected cases do not have a case number
               const selectedCasesForWrit = selectedAllCasesId.every((id) => {
                  const record = allCases.items.find((item) => item.id === id);
                  return record && (!record.caseNo || record.caseNo.trim() === "");
               });

               if (selectedCasesForWrit) {
                  setShowErrorMessageWhenNoRowIsSelected(true, "None of the selected cases have a case number.");
               } else {
                  const selectedRecords = bulkRecords.filter((record) =>
                     selectedAllCasesId.includes(record.id ?? "")
                  );
                  const writNotSupportedRecords = selectedRecords.every((record) => writNotSupportedCounties.includes(record.county.toUpperCase()));

                  if (writNotSupportedRecords) {
                     setShowErrorMessageWhenNoRowIsSelected(true, `Connect2Court does not currently offer Writ filing in ${formatCountyList(writNotSupportedCounties)} Counties.`);
                  } else {
                     // const hasWritFiledRecords = selectedRecords.some((record) =>
                     //    // record.status === "Writ Applied for" || 
                     //    record.status === "Dismissal Applied for"
                     // );

                     const dismissalReadyRecords = allCases.items.filter(
                        (record) =>
                           (record.dismissalFileDate !== null || record.status === "Dismissal Applied for") &&
                           selectedAllCasesId.includes(record.id ?? "")
                     );

                     const hasDismissalReadyRecords = dismissalReadyRecords.length > 0;
                     if (hasDismissalReadyRecords) {
                        const dismissalReadyRecordIds = dismissalReadyRecords.map((record) => record.caseNo);
                        setUnFindCases(dismissalReadyRecordIds);
                        // setCaseSearchError( "Sorry, we couldn't find " + dismissalReadyRecordIds.length + " case(s) that match your criteria or case(s) already dismissed.");
                        setShowDismissalCasesConfirmation(true);
                     }
                     else {
                        setShowAddtoWritsPopup(true);
                        setCaseSearchError("");
                     }
                     // if (hasWritFiledRecords) {
                     //    setShowErrorMessageWhenNoRowIsSelected(true, "Please select records without 'Dismissal Applied for' status.");
                     // } else {
                     //    setShowAddtoWritsPopup(true);
                     //    setCaseSearchError("");
                     // }
                  }
               }
            }
            break;

         case "File Amendments":
            setCaseSearchFor("amendment(s)");
            // Check if no records are selected at the beginning
            if (!selectedAllCasesId.length) {
               //setCaseSearchFor("amendment(s)");
               setShowCaseSearchPopup(true);

            } else {
               // Check if all selected cases do not have a case number
               const selectedCasesForAmendment = selectedAllCasesId.every((id) => {
                  const record = allCases.items.find((item) => item.id === id);
                  return record && (!record.caseNo || record.caseNo.trim() === "");
               });

               if (selectedCasesForAmendment) {
                  setShowErrorMessageWhenNoRowIsSelected(true, "None of the selected cases have a case number.");
               } else {
                  const dismissalReadyRecords = allCases.items.filter(
                     (record) =>
                        (record.dismissalFileDate !== null || record.status === "Dismissal Applied for") &&
                        selectedAllCasesId.includes(record.id ?? "")
                  );

                  const hasDismissalReadyRecords = dismissalReadyRecords.length > 0;
                  if (hasDismissalReadyRecords) {
                     const dismissalReadyRecordIds = dismissalReadyRecords.map((record) => record.caseNo);
                     setUnFindCases(dismissalReadyRecordIds);
                     //setCaseSearchError( "Sorry, we couldn't find " + dismissalReadyRecordIds.length + " case(s) that match your criteria or case(s) already dismissed.");
                     setShowDismissalCasesConfirmation(true);
                  }
                  else {
                     setShowAddtoAmendmentsPopup(true);
                     setCaseSearchError("");
                  }
                  // const hasAmendedOrDismissalRecords = allCases.items.some(
                  //    (record) =>
                  //       (record.dismissalFileDate !== null ||
                  //          record.status === "Dismissal Applied for" ||
                  //          record.status === "Amended" ||
                  //          record.status === "Amendment Ready") &&
                  //       selectedAllCasesId.includes(record.id ?? "")
                  // );

                  // if (hasAmendedOrDismissalRecords) {
                  //    setShowErrorMessageWhenNoRowIsSelected(
                  //       true,
                  //       "Please select records without 'Dismissal Applied for' or 'Amended' status."
                  //    );
                  // } else {
                  //    setShowAddtoAmendmentsPopup(true);
                  //    if (userRole.includes(UserRole.NonSigner))
                  //       setShowConfirmPopup(true);
                  //    setCaseSearchError("");
                  // }
               }
            }
            break;

         // case "Download Documents":
         //    const selectedIds = selectedAllCasesId;
         //    if (selectedIds.length === 0) {
         //       setShowErrorMessageWhenNoRowIsSelected(true);
         //    } else {
         //       setShowErrorMessageWhenNoRowIsSelected(false);
         //       setShowDownloadSpinner(true);
         //       getLink();
         //    }
         //    break;

         case "Import Data":
            setImportCsvPopUp(true);
            break;

         case "Remove from List":
            // Handle click for the "delete" button
            if (selectedAllCasesId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(true);
            } else {
               const selectedRecords = bulkRecords.filter((record) =>
                  selectedAllCasesId.includes(record.id ?? "")
               );
               setShowErrorMessageWhenNoRowIsSelected(false);
               setShowDeleteCasesConfirmation(true);
            }
            break;

         default:
            console.log(`Unknown button type: ${button.icon}`);
      }
   };

   const handleToggleClick = () => {
      setShowCaseSnapShot(!showCaseSnapShot);
      console.log(showCaseSnapShot);
   };

   const handleCaseSearch = async (formValues: { searchKeyword: string }) => {
      setSearchCases(formValues.searchKeyword);
      // Split the input by comma, space, or newline
      const caseNumbersArray = formValues.searchKeyword
         .split(/,|\s+/)
         .filter((value) => value.trim() !== ""); // Remove empty strings

      // Construct the list of strings
      const caseNumbersList = caseNumbersArray.map(value => `${value.trim().toLowerCase()}`);

      try {
         setSearchCaseSpinner(true);

         const payload: ICasesSearchRequest = {
            filingType: filingType.replace("File ", "").toLowerCase(),
            caseNumbers: caseNumbersList
         };

         const response = await AllCasesService.getCasesBySearchingCaseNumber(payload);

         if (response.status === HttpStatusCode.Ok) {
            const records = response.data;
            if (records && records.length) {
               const filteredCases = caseNumbersList.filter(
                  caseNo => !records.some(record => record.caseNo.toLowerCase() === caseNo.toLowerCase())
               );
               const dispoIds: string[] = records.map((item) => item.id as string);
               setSelectedCaseIdsForFiling(dispoIds);
               setBulkRecords(records);
               // setSelectedAllCasesId(dispoIds);
               // var dismissalCases = records.filter(record => record.status.toLowerCase() === "dismissal applied for")
               var dismissalCases = records.filter(record => record.isDismissal === true)
               if (dismissalCases.length > 0) {
                  const dismissalReadyCases = dismissalCases.map((record) => record.caseNo);
                  setUnFindCases(dismissalReadyCases);
                  //setCaseSearchError( "Sorry, we couldn't find " + dismissalReadyCases.length + " case(s) that match your criteria or case(s) already dismissed.");
                  // setUnFindCases([]);
                  // setCaseSearchError("");
                  setShowDismissalCasesConfirmation(true);
                  return;
               }
               else if (filteredCases.length > 0) {
                  setUnFindCases(filteredCases);
                  setCaseSearchError("Sorry, we couldn't find " + filteredCases.length + " case(s) that match your criteria.");

               }
               else {
                  setCaseSearchError("");
               }

               // setShowCaseSearchPopup(false);
               if (filingType === "File Dismissals") {
                  setShowAddtoDismissalsPopup(true);
               } else if (filingType === "File Writs") {
                  setShowAddtoWritsPopup(true);
               } else if (filingType === "File Amendments") {
                  setShowAddtoAmendmentsPopup(true);
               }
            } else {
               setBulkRecords([]);
               setSelectedAllCasesId([]);
               const baseErrorMessage = "Sorry, we couldn't find any cases matching your criteria";

               let errorMessage;

               switch (filingType) {
                  case "File Dismissals":
                     errorMessage = `${baseErrorMessage} or they have already been dismissed`;
                     break;
                  case "File Writs":
                     errorMessage = `${baseErrorMessage} or they have already been dismissed or are from ${formatCountyList(writNotSupportedCounties)} Counties`;
                     break;
                  case "File Amendments":
                     errorMessage = `${baseErrorMessage} or they have already been amended/dismissed`;
                     break;
                  default:
                     errorMessage = baseErrorMessage;
               }

               toast.error(errorMessage);
            }
         } else {
            setBulkRecords([]);
            setSelectedAllCasesId([]);
         }
      } catch (error) {
         console.log(error)
      } finally {
         setSearchCaseSpinner(false);
      }
   };

   const handleFileAmendment = async () => {
      try {
         setShowSpinner(true);
         const filedAmendmentsList: IAmendmentsSign[] = filteredRecords.map((item: IAllCasesItems) => {
            return {
               dispoId: item.id,
               propertyName: item.propertyName,
               county: item.county,
               tenantFirstName: item.tenantFirstName,
               tenantLastName: item.tenantLastName,
               address: item.address,
               unit: item.unit,
               city: item.city,
               state: item.state,
               zip: item.zip,
               evictionServiceMethod: item.evictionServiceMethod,
               attorneyName: item.attorneyName,
               ownerName: item.ownerName ?? "",
               reason: item.reason ?? "",
               monthlyRent: parseToDecimal(item.monthlyRent),
               totalRent: parseToDecimal(item.totalRent),
               evictionAffiantIs: item.evictionAffiantIs,
               Tenant1Last: item.tenant1Last,
               Tenant1First: item.tenant1First,
               Tenant1MI: item.tenant1MI,
               Tenant2Last: item.tenant2Last,
               Tenant2First: item.tenant2First,
               Tenant2MI: item.tenant2MI,
               Tenant3Last: item.tenant3Last,
               Tenant3First: item.tenant3First,
               Tenant3MI: item.tenant3MI,
               Tenant4Last: item.tenant4Last,
               Tenant4First: item.tenant4First,
               Tenant4MI: item.tenant4MI,
               Tenant5Last: item.tenant5Last,
               Tenant5First: item.tenant5First,
               Tenant5MI: item.tenant5MI,
               AndAllOtherOccupants: item.andAllOtherOccupants,
               EvictionTotalRentDue: item.evictionTotalRentDue,
               AllMonths: item.allMonths,
               EvictionOtherFees: item.evictionOtherFees,
               PropertyPhone: item.propertyPhone,
               PropertyEmail: item.propertyEmail,
               PropertyAddress: item.propertyAddress,
               PropertyCity: item.propertyCity,
               PropertyState: item.propertyState,
               PropertyZip: item.propertyZip,
               AttorneyBarNo: item.attorneyBarNo,
               AttorneyEmail: item.attorneyEmail,
               FilerBusinessName: item.filerBusinessName,
               FilerPhone: item.filerPhone,
               FilerEmail: item.filerEmail,
               Expedited: item.expedited,
               StateCourt: item.stateCourt
            }
         });
         const response = await AmendmentsService.FileAmendment(filedAmendmentsList);
         if (response.status === HttpStatusCode.Ok) {
            navigate(`/amendments`);
            setShowConfirmPopup(false);
            setShowSignInPopup(false);

            handleUnsignedCaseCount();
            toast.success(`These cases have been added to ${amendmentSignFor} tab`);
         };
      } catch (error) {
         console.error('handleFileAmendment', error)
      } finally {
         setShowSpinner(false);
      }
   };

   const handleUnsignedCaseCount = async () => {
      try {
         const response = await AuthService.getUnsignedCaseCount();
         if (response.status === HttpStatusCode.Ok) {
            setUnsignedAmendmentCount(response.data.unsignedAmendment);
         }
      } catch (error) {
         console.log(error);
      }
   };

   // const getLink = async () => {

   //    try {
   //       let request: IFileEvictionEmail = {
   //          dispoIds: selectedAllCasesId,
   //       };
   //       // Download all file evictions
   //       const apiResponse =
   //          await FileEvictionService.getFileEvictionDocumentForSign(
   //             selectedFileEvictionId
   //          );
   //       // api returns pdf link
   //       if (apiResponse.status === HttpStatusCode.Ok) {
   //          setPdfLink(apiResponse.data.combinedPDFUrl);
   //          if(!userRole.includes(UserRole.Viewer))
   //             setShowPopUpWhenDownloadFileEviction(true);
   //          else
   //             await downloadPDF(apiResponse.data.combinedPDFUrl);
   //       }
   //    } catch (error) {
   //    } finally {
   //       setShowSpinner(false);
   //    }
   // };

   const getDataForCsv = async () => {
      try {
         // setShowExportSpinner(true);
         toast.info("CSV export process has started.");
         const response = await AllCasesService.exportAllCases(selectedAllCasesId
            , allCases.searchParam, allCases.status, allCases.county, allCases.filingType);
         return response.data;
      } catch (error) {
         throw new Error("Error fetching cases data:");
      } finally {
         // setShowExportSpinner(false);
      }
   };

   // const downloadCSV = async () => {
   //    try {
   //       // Fetch data from the API
   //       const response: ExportAllCasesResource[] = await getDataForCsv();
   //       // Ensure that response is not null or undefined
   //       if (response) {
   //          // Convert the single object to an array
   //          const dataArray: ExportAllCasesResource[] = response as ExportAllCasesResource[];

   //          // Convert objects to strings using JSON.stringify
   //          const stringifiedDataArray = dataArray.map((item) => {
   //             // Ensure that each item is of type Record<string, string>
   //             const typedItem = item as unknown as Record<string, string>;

   //             // Convert each object property to a string
   //             return Object.keys(typedItem).reduce((acc, key) => {
   //                const value = typedItem[key];
   //                const stringValue =
   //                   typeof value === "object" ? JSON.stringify(value) : String(value);
   //                acc[key] = stringValue;
   //                return acc;
   //             }, {} as Record<string, string>);
   //          });

   //          // Convert the data array to CSV format
   //          const csv = Papa.unparse(stringifiedDataArray as object[]);

   //          // Create a Blob with the CSV data
   //          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

   //          // Create a temporary link element and trigger the download
   //          const link = document.createElement("a");
   //          const url = URL.createObjectURL(blob);
   //          link.href = url;
   //          link.setAttribute("download", "Cases.csv");
   //          document.body.appendChild(link);
   //          link.click();

   //          // Clean up by removing the link and revoking the URL
   //          document.body.removeChild(link);
   //          URL.revokeObjectURL(url);
   //       }
   //    } catch (error) {
   //       console.error("Error fetching or exporting data:", error);
   //       // Handle error (e.g., display an error message)
   //    }
   // };

   // Check if a string is an ISO date string
   const isISODateString = (value: unknown): boolean => {
      return (
         typeof value === "string" &&
         /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)
      );
   };

   const downloadCSV = async () => {
      try {
         // Fetch data from the API
         const response: ExportAllCasesResource[] = await getDataForCsv();
         if (response) {
            const dataArray: ExportAllCasesResource[] = response as ExportAllCasesResource[];
            // Ensure that AllCasesSnapshot has lowercase keys
            const allCasesSnapshotLower = AllCasesSnapshot.map(key => key.charAt(0).toLowerCase() + key.slice(1));

            // Determine which keys to include based on showCaseSnapShot flag
            const keysToInclude = showCaseSnapShot
               ? allCasesSnapshotLower.filter(key => key !== "isChecked")
               : Object.keys(response[0]); // Include all fields if showCaseSnapShot is false

            const formattedData = dataArray.map((entry) => ({
               ...entry,
               evictionDateFiled: convertAndFormatDate(entry.evictionDateFiled),
               evictionServiceDate: convertAndFormatDate(entry.evictionServiceDate),
               evictionLastDayToAnswer: convertAndFormatDate(entry.evictionLastDayToAnswer),
               answerDate: convertAndFormatDate(entry.answerDate),
               courtDate: convertAndFormatDate(entry.courtDate),
               writFiledDate: convertAndFormatDate(entry.writFiledDate),
               dismissalFileDate: convertAndFormatDate(entry.dismissalFileDate),
               writApplicantDate: convertAndFormatDate(entry.writApplicantDate),
               caseCreatedDate: convertAndFormatDate(entry.caseCreatedDate),
               issueDate: convertAndFormatDate(entry.issueDate),
            }));

            // Filter data based on the keys to include
            const filteredDataArray = formattedData.map((item) => {
               const filteredItem: Partial<Record<keyof ExportAllCasesResource, string | number | Date>> = {};

               keysToInclude.forEach((key) => {
                  const typedKey = key as keyof ExportAllCasesResource;
                  filteredItem[typedKey] = item[typedKey];
               });

               return filteredItem;
            });

            // Convert objects to strings using JSON.stringify
            const stringifiedDataArray = filteredDataArray.map((item) => {
               return Object.keys(item).reduce((acc, key) => {
                  const typedKey = key as keyof ExportAllCasesResource;
                  const value = item[typedKey];
                  // const stringValue =
                  //    typeof value === "object" ? JSON.stringify(value) : String(value);
                  // acc[key] = stringValue;
                  // return acc;
                  // Check if value is an ISO date string or a Date object
                  if (isISODateString(value) || value instanceof Date) {
                     acc[key] = formatDate(value as string); // Format date
                  } else if (typeof value === "object" && value !== null) {
                     // If the value is an object (but not null), stringify it
                     acc[key] = JSON.stringify(value);
                  } else {
                     // Otherwise, just convert it to a string
                     acc[key] = String(value);
                  }
                  return acc;
               }, {} as Record<string, string>);
            });

            // Convert the data array to CSV format
            const csv = Papa.unparse(stringifiedDataArray as object[]);

            // Create a Blob with the CSV data
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

            // Create a temporary link element and trigger the download
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.setAttribute("download", "Cases.csv");
            document.body.appendChild(link);
            link.click();
            toast.success("CSV has been downloaded successfully.");

            // Clean up by removing the link and revoking the URL
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
         }
      } catch (error) {
         console.error("Error fetching or exporting data:", error);
         // Handle error (e.g., display an error message)
      }
   };

   const allCasesSnapshotLowercase = AllCasesSnapshot.map(field => field.toLowerCase());

   //Download for case snapshot cases
   // const downloadCSV = async () => {
   //   try {
   //     // Fetch data from the API
   //     const response: ExportAllCasesResource[] = await getDataForCsv();
   //     // Ensure that response is not null or undefined
   //     if (response) {
   //       // Convert the single object to an array
   //       const dataArray: ExportAllCasesResource[] = response as ExportAllCasesResource[];

   //       // Convert objects to strings using JSON.stringify
   //       const stringifiedDataArray = dataArray.map((item) => {
   //         // Ensure that each item is of type Record<string, string>
   //         const typedItem = item as unknown as Record<string, any>;

   //         // Filter the object properties based on showCaseSnapShot
   //         const filteredItem = Object.keys(typedItem).reduce((acc, key) => {
   //           const keyLowerCase = key.toLowerCase();
   //           if (!showCaseSnapShot || allCasesSnapshotLowercase.includes(keyLowerCase)) {
   //             const value = typedItem[key];
   //             const stringValue =
   //               typeof value === "object" ? JSON.stringify(value) : String(value);
   //             acc[key] = stringValue;
   //           }
   //           return acc;
   //         }, {} as Record<string, string>);

   //         return filteredItem;
   //       });

   //       // Convert the data array to CSV format
   //       const csv = Papa.unparse(stringifiedDataArray as object[]);

   //       // Create a Blob with the CSV data
   //       const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

   //       // Create a temporary link element and trigger the download
   //       const link = document.createElement("a");
   //       const url = URL.createObjectURL(blob);
   //       link.href = url;
   //       link.setAttribute("download", "Cases.csv");
   //       document.body.appendChild(link);
   //       link.click();

   //       // Clean up by removing the link and revoking the URL
   //       document.body.removeChild(link);
   //       URL.revokeObjectURL(url);
   //     }
   //   } catch (error) {
   //     console.error("Error fetching or exporting data:", error);
   //     // Handle error (e.g., display an error message)
   //   }
   // };

   const handleCloseConfirmation = () => {
      setShowConfirmPopup(false);
      setShowSignInPopup(false);
      setFilteredRecords([]);
      setSelectedAllCasesId([]);
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

   const handleDownloadDocument = (type: string) => {
      const selectedIds = selectedAllCasesId;
      if (selectedIds.length === 0) {
         setShowErrorMessageWhenNoRowIsSelected(true);
      } else {
         setShowErrorMessageWhenNoRowIsSelected(false);
         // setShowSpinner(true);
         getLink(type);
      }
   };

   /**
    * 
  * get link of selected records id
  */
   // const getLink = async (type: string) => {
   //    try {
   //      // Download all file evictions
   //      const apiResponse = await AllCasesService.getAllCasesDocuments(selectedAllCasesId, type);

   //      // Log the API response to inspect its structure
   //      console.log('API Response:', apiResponse);

   //      // api returns pdf link
   //      if (apiResponse.status === HttpStatusCode.Ok) {
   //        // Ensure the data is an array of objects containing pdfUrls
   //        if (Array.isArray(apiResponse.data) && apiResponse.data.length > 0 && 'pdfUrls' in apiResponse.data[0]) {
   //          const pdfUrls = apiResponse.data.map(x => x.pdfUrls);
   //          for (const pdfUrl of pdfUrls) {
   //            await downloadPDF(pdfUrl);
   //            setShowSpinner(false);
   //          }

   //          setPdfLink(pdfUrls);
   //        } else {
   //          toast.error("Not found any file for the selected records");
   //        }
   //      }
   //    } catch (error) {
   //      console.error('Error fetching and downloading PDFs:', error);
   //      toast.error("Error fetching and downloading PDFs");
   //    } finally {
   //      setShowSpinner(false);
   //    }
   //  };

   const fetchPDFBlob = async (pdfUrl: string) => {
      try {
         const response = await fetch(pdfUrl, {
            headers: {
               "Content-Type": "application/pdf",
            },
         });

         if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.statusText}`);
         }

         return await response.blob();
      } catch (error) {
         console.error("Error fetching PDF:", error);
         throw error;
      }
   };

   const getLink = async (type: string) => {
      try {
         // Download all cases
         const apiResponse = await AllCasesService.getAllCasesDocuments(selectedAllCasesId, type);
         // Log the API response to inspect its structure
         console.log('API Response:', apiResponse);
         if (apiResponse.status === HttpStatusCode.Ok) {
            // Ensure the data is an array of objects containing pdfUrls
            if (Array.isArray(apiResponse.data) && apiResponse.data.length > 0 && 'pdfUrls' in apiResponse.data[0]) {
               toast.info("File downloading has been started");

               // Initialize JSZip
               const zip = new JSZip();
               const existingFileNames = new Set();

               const fetchAndAddPDFsToZip = async () => {
                  for (const data of apiResponse.data) {
                     try {
                        const pdfBlob = await fetchPDFBlob(data.pdfUrls);
                        const pathParts = data.pdfUrls.split('/');
                        const uniquePart = pathParts.slice(-2).join('_');
                        const fileName = data.pdfUrls.substring(data.pdfUrls.lastIndexOf("/") + 1);

                        let zipFileName = fileName;

                        if (existingFileNames.has(fileName)) {
                           zipFileName = uniquePart;
                        } else {
                           existingFileNames.add(fileName);
                        }

                        zip.file(zipFileName, pdfBlob);
                     } catch (error) {
                        console.error(`Failed to fetch and add PDF from ${data.pdfUrls}:`, error);
                     }
                  }
               };

               await fetchAndAddPDFsToZip();

               // Generate the zip file and trigger the download
               zip.generateAsync({ type: "blob" }).then((zipBlob) => {
                  saveAs(zipBlob, "C2C_PDF_Export.zip");
                  toast.success("File has been successfully downloaded");
               });
            } else {
               toast.error("Not found any file for the selected records");
            }
         }
      } catch (error) {
         console.error('Error fetching and downloading PDFs:', error);
         toast.error("Error fetching and downloading PDFs");
      } finally {
         // setShowSpinner(false);
      }
   };

   const handleDeleteCases = async () => {
      setShowSpinner(true);
      const apiResponse = await AllCasesService.deleteCases(
         selectedAllCasesId
      );
      if (apiResponse.status === HttpStatusCode.Ok) {
         getAllCases(1, 100, allCases.searchParam, allCases.status, allCases.county, allCases.filingType);
         toast.success("Record(s) removed successfully");
      }
      // else
      // {
      //    toast.error("Fail to remove records");
      // }
      setShowSpinner(false);
      setShowDeleteCasesConfirmation(false);
      setSelectedAllCasesId([]);
      setFilteredRecords([]);
      setBulkRecords([]);
   };

   const handleProceed = (withDismissals : boolean) => {
      setProceedWithDismissals(withDismissals);
      handleAddToPopup();
   }

   const handleAddToPopup = () => {
      if (caseSearchFor === "amendment(s)") {
         setShowAddtoAmendmentsPopup(true);
      }
      if (caseSearchFor === "writ(s)") {
         setShowAddtoWritsPopup(true);
      }
      if (caseSearchFor === "dismissal(s)") {
         setShowAddtoDismissalsPopup(true);
      }
   }

   const handleDismissalCasesConfirmation = () => {
      setShowDismissalCasesConfirmation(false);
      if (selectedCaseIdsForFiling.length) {
         setSelectedCaseIdsForFiling([]);
         let records: React.SetStateAction<IAllCasesItems[]> = [];

         records = bulkRecords.filter((item) =>
            !selectedCaseIdsForFiling.includes(item.id || "") && item.caseNo?.length
         );
         setBulkRecords(records);
      };
   }

   return (
      <>
         {props.buttons.map((item: IAllCasesButton, index: number) => {
            let iconComponent;
            switch (item.icon) {
               case "FaPlus":
                  iconComponent = <FaPlus className="fa-solid fa-plus mr-1 text-xs" />;
                  break;
               case "FaFileExcel":
                  iconComponent = <FaFileExcel className="fa-solid fa-plus mr-1 text-xs" />;
                  break;
               case "FaFileSignature":
                  <FaFileSignature className="text-[25px] mr-3 " />
                  break;
               // case "FaTrash":
               //    <FaTrash className="text-[25px] mr-3 " />
               //    break;
               case "FaRegWindowClose":
                  iconComponent = (
                     <FaRegWindowClose className="fa-solid fa-plus mr-1 text-xs " />
                  );
                  break;
               default:
                  iconComponent = <></>;
            }
            if (
               (item.title === "File Dismissals" ||
                  item.title === "File Writs" ||
                  item.title === "File Amendments") &&
               userRole.includes(UserRole.Viewer)) {
               return null; // Skip items with specified titles or "Sign Proofs" for non-signers
            } else if (
               !userRole.includes(UserRole.C2CAdmin) &&
               !userRole.includes(UserRole.ChiefAdmin) &&
               item.title === "Import Data") {
               return null;
            }
            else if (
               !userRole.includes(UserRole.C2CAdmin) &&
               !userRole.includes(UserRole.ChiefAdmin) &&
               item.title === "Remove from List") {
               return null;
            }
            return (
               <Button
                  title={item.title}
                  classes={item.classes}
                  type={"button"}
                  isRounded={false}
                  icon={iconComponent}
                  key={index}
                  handleClick={() => handleClick(item)}
               ></Button>
            );
         }
         )}
         {/* <DownloadCsv fetchData={getDataForCsv} fileName="Cases.csv" /> */}
         <>
         </>
         {showExportSpinner && (<Spinner />)}
         {(!userRole.includes(UserRole.Viewer) && !userRole.includes(UserRole.NonSigner)) && (
            <>
               <Menu
                  as="div"
                  className="relative inline-block text-left z-[11] mb-1 ml-1 md:ml-1.5"
               >
                  <div>
                     <Menu.Button className="inline-flex w-full justify-center gap-x-1 rounded-md bg-white px-2.5 py-1.5 text-[11px] md:text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        Download
                        <ChevronDownIcon
                           className="-mr-0.5 h-4 w-4 text-gray-400"
                           aria-hidden="true"
                        />
                     </Menu.Button>
                  </div>

                  <Transition
                     as={Fragment}
                     enter="transition ease-out duration-100"
                     enterFrom="transform opacity-0 scale-95"
                     enterTo="transform opacity-100 scale-100"
                     leave="transition ease-in duration-75"
                     leaveFrom="transform opacity-100 scale-100"
                     leaveTo="transform opacity-0 scale-95"
                  >
                     <Menu.Items className="dropdown-menu absolute left-0 md:left-auto md:right-0 mt-2 w-70 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1 text-nowrap">
                           {selectedStateValue === "GA" && (
                              <>
                                 <Menu.Item>
                                    {({ active }) => (
                                       // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download All
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("Eviction")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download Evictions
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("Writ")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download Writs
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("Amendment")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download Amendments
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("Dismissal")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download Dismissals
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("AOS")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download AOS
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("Answer")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download Answers
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={downloadCSV}
                                       >
                                          <FaFileExport className="fa-solid fa-plus  mr-1 text-[13px] md:text-sm" />{" "}
                                          Export CSV
                                       </a>
                                    )}
                                 </Menu.Item>
                              </>
                           )}
                           {selectedStateValue === "TX" && (
                              <>
                                 <Menu.Item>
                                    {({ active }) => (
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download All
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("BatchUpload")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download Batch Upload
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("Lease")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download Lease
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("Notice")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download Notices
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("Petition")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download Petitions
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("SCRAAffidavit")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download SCRA Affidavits
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("SCRAReport")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download SCRA Reports
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("SupplementalDocuments1")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download SupplementalDocuments1
                                       </a>
                                    )}
                                 </Menu.Item>
                                 <Menu.Item>
                                    {({ active }) => (
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("SupplementalDocuments2")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download SupplementalDocuments2
                                       </a>
                                    )}
                                 </Menu.Item>
                              </>
                           )}
                        </div>
                     </Menu.Items>
                  </Transition>
               </Menu>
            </>
         )}
         {/* <ToggleSwitch
            value={showCaseSnapShot}
            label={"Case Snapshot"}
            handleChange={() => {
               handleToggleClick()
            }}
         ></ToggleSwitch> */}
         {showErrorMessageWhenNoRowIsSelected && (
            <Modal
               showModal={showErrorMessageWhenNoRowIsSelected}
               onClose={() => {
                  setShowErrorMessageWhenNoRowIsSelected(false);
                  // resetSelectedRows();
               }}
               width="max-w-md"
            >
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                  <div className="text-center py-8">
                     <div className="mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-red-100 mx-auto">
                        <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                     </div>
                     <div className="mt-2.5 text-center ">
                        <p className="text-xs text-gray-500 text-center font-medium text-gray-600 text-md">
                           {errorMessage}
                        </p>
                     </div>
                  </div>
               </div>
            </Modal>
         )}

         {/* This is to show Add to Dismissals popup */}
         {showAddtoDismissalsPopup && (
            <AllCasesAddtoDismissals
               showAddtoDismissalPopup={showAddtoDismissalsPopup}
               handleClose={() => {
                  setShowAddtoDismissalsPopup(false);
               }}
               handleReviewSign={() => {
                  props.handleFileDismissalReviewSign()
               }}
               errorMsg={caseSearchError}
               handleShowUnFindCases={() => { setCheckUnFindCases(true) }}
            />
         )}

         {/* This is to show Add to Writs popup */}
         {showAddtoWritsPopup && (
            <AllCasesAddtoWrits
               showAddtoWritsPopup={showAddtoWritsPopup}
               handleClose={() => { setShowAddtoWritsPopup(false); }}
               handleReviewSign={() => props.handleFileWritsReviewSign()}
               errorMsg={caseSearchError}
               unFinedCases={unFinedCases.map(caseNo => caseNo.toUpperCase()).join(", ")}
            />
         )}

         {/* This is to show Add to Amendments popup */}
         {showAddtoAmendmentsPopup && (
            <AllCasesAddtoAmendments
               showAddtoAmendmentsPopup={showAddtoAmendmentsPopup}
               handleClose={() => { setShowAddtoAmendmentsPopup(false); }}
               handleReviewSign={() => props.handleFileAmendmentReviewSign()}
               handleFinish={() => {
                  setShowAddtoAmendmentsPopup(false);
                  setAmendmentSignFor(filteredRecords.length === 1 ? "Amendment" : "Amendments");
                  setShowSignInPopup(true);
               }}
               errorMsg={caseSearchError}
               handleShowUnFindCases={() => { setCheckUnFindCases(true) }}
            />
         )}

         {/* This is to show Add to ExportData popup */}
         {showExportDataPopup && (
            <AllCasesExportData
               showExportDataPopup={showExportDataPopup}
               handleClose={() => { setShowExportDataPopup(false); }}
            />
         )}

         {(showConfirmPopup || showSignInPopup) && (
            <Modal
               showModal={showConfirmPopup || showSignInPopup}
               onClose={handleCloseConfirmation}
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
                           {showConfirmPopup
                              ? `Are you sure you like to confirm these cases for ${amendmentSignFor}?`
                              : `Are you sure you’d like to file ${amendmentSignFor}`}
                        </h3>
                     </div>
                  </div>
                  <div className="flex justify-end m-2">
                     <Button
                        type="button"
                        isRounded={false}
                        title="No"
                        handleClick={handleCloseConfirmation}
                        classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                     ></Button>
                     <Button
                        handleClick={handleFileAmendment}
                        title="Yes"
                        isRounded={false}
                        type={"button"}
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        disabled={showSpinner}
                     ></Button>
                  </div>
               </div>
            </Modal>
         )}

         {searchCaseSpinner && (<Spinner />)}

         {showCaseSearchPopup && (
            <Modal showModal={showCaseSearchPopup} onClose={() => setShowCaseSearchPopup(false)} width="max-w-xl">
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3
                           className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                           id="modal-title"
                        >
                           {filingType}
                        </h3>
                     </div>
                  </div>
                  <Formik
                     initialValues={initialCaseSearchValue}
                     onSubmit={(values) => handleCaseSearch(values)}
                  >
                     {(formik) => (
                        <Form className="pt-1">
                           <div className="md:grid-cols-2 gap-2.5 sm:gap-3.5 mb-2.5">
                              <div className="relative">
                                 <FormikControl
                                    control="textarea"
                                    type="text"
                                    label={""}
                                    classes={'min-h-28'}
                                    name={"searchKeyword"}
                                    placeholder={"Please enter or paste the case numbers for which you wish to file " + caseSearchFor + "."}
                                 />
                              </div>
                           </div>
                           <div className="mt-1.5 md:mt-0 py-2.5 flex justify-end items-center">
                              <Button
                                 type="button"
                                 isRounded={false}
                                 title="Cancel"
                                 handleClick={() => setShowCaseSearchPopup(false)}
                                 classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                              ></Button>
                              <Button
                                 title={"Continue"}
                                 type={"submit"}
                                 isRounded={false}
                                 disabled={(searchCaseSpinner || !formik.values.searchKeyword.length)}
                                 classes="py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                              ></Button>
                           </div>
                        </Form>
                     )}
                  </Formik>
               </div>
            </Modal>
         )}

         {importCsvPopUp && (
            <>
               <AllCasesImportCsv
                  importCsvPopUp={importCsvPopUp}
                  setImportCsvPopUp={(value: SetStateAction<boolean>, resetGrid: boolean) => {

                     if (resetGrid) {
                        //resetSelectedRows();
                     }
                     setImportCsvPopUp(value);
                  }}
                  showConfirmation={(msg: { __html: string }) => {

                     setShowConfirmation(true);
                     setConfirmationMsg(msg);
                  }}
                  counties={allCounties.map(c => c.countyName.toLowerCase())}
               />
            </>
         )}

         {checkUnFinedCases && (
            <Modal
               showModal={checkUnFinedCases}
               onClose={() => setCheckUnFindCases(false)}
               width="max-w-3xl case_modal"
            >
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3 className="leading-5 text-gray-900 text-[16px] md:text-sm mb-1.5 font-medium" id="modal-title">Dismissed Case(s)</h3>
                     </div>
                  </div>
                  <div className="border border-gray-200 rounded-md py-3 px-3.5 text-sm mt-2 leading-6 min-h-24">
                     <p>{unFinedCases.map(caseNo => caseNo.toUpperCase()).join(", ")}</p>
                  </div>
               </div>
            </Modal>
         )}

         {showConfirmation && (
            <>
               <Modal
                  showModal={showConfirmation}
                  onClose={() => {
                     {
                        // setShowPopUpWhenSign(false);
                     }
                  }}
                  showCloseIcon={true}
                  width="max-w-[32rem]"
               >
                  {/* Container for the content */}
                  <div id="fullPageContent">
                     <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                        <div className="text-center max-h-[180px] overflow-y-auto">
                           <h3
                              className="text-sm font-medium leading-5 text-gray-900"
                              id="modal-title"
                           >
                              {showConfirmation && confirmationMsg ? (
                                 <div dangerouslySetInnerHTML={confirmationMsg} />
                              ) : (
                                 "No confirmation message."
                              )}
                           </h3>
                        </div>
                        {/* Display the grid with late notices */}
                        <div className="relative pt-2.5">
                           <div className="pt-2.5 flex justify-center mt-1.5">
                              <Button
                                 type="submit"
                                 isRounded={false}
                                 title={`Ok`}
                                 handleClick={() => {
                                    setShowConfirmation(false);
                                 }}
                                 classes="text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-5 text-white"
                              ></Button>
                           </div>
                        </div>
                     </div>
                  </div>
               </Modal>
            </>
         )}

         {showDeleteCasesConfirmation && (
            <DeleteConfirmationBox
               heading={"Confirmation"}
               message={`Are you sure you want to remove ${selectedAllCasesId.length
                  } ${selectedAllCasesId.length > 1 ? "cases" : "case"}?`}
               showConfirmation={showDeleteCasesConfirmation}
               closePopup={() => {
                  setShowDeleteCasesConfirmation(false);
               }}
               handleSubmit={() => setShowAddtoDismissalsPopup(true)}
            ></DeleteConfirmationBox>

         )}

         {showDismissalCasesConfirmation && (
            <ConfirmationBox
               heading="Confirmation"
               message={
                  <>
                     <a
                        href="#"
                        onClick={(e) => {
                           e.preventDefault();
                           setCheckUnFindCases(true);
                        }}
                        className="cursor-pointer text-blue-600 hover:underline"
                        aria-label="View unmatched cases"
                     >
                        {unFinedCases.length} Selected Case(s)
                     </a>{" "}
                     have already been dismissed. Are you sure you want to proceed?{" "}
                     <br></br><b>How would you like to proceed?</b>
                  </>
               }
               showConfirmation={showDismissalCasesConfirmation}
               closePopup={() => {
                  handleDismissalCasesConfirmation();
               }}
               handleSubmit={() => {
                  handleProceed(true);
               }}
               confirmButtonTitle="Proceed with duplicates"

               isAdditionalBtn={true}
               AdditionalBtnTitle={"Proceed without duplicates"}
               handleProceed={() => {
                  handleProceed(false);
               }}
               disclaimer="**Please note all submitted items will be billed accordingly."
            />
         )}
      </>
   );
};
