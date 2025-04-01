// FileEvictionsButtons.tsx
import React, { SetStateAction, useState } from "react";
import Papa from "papaparse";
import { FaExclamationTriangle, FaEdit, FaFileExport, FaPlus, FaFileExcel } from "react-icons/fa";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import { IFileEvictionsButton } from "interfaces/file-evictions.interface";
import { IAccountingQueueExportResource, IEvictionFilingTransactionExportResource, IExportCsv, IExportTransactionCsv, IFilingTransactionButton, IFilingTransactionExportResource } from "interfaces/filing-transaction.interface";
import { useAuth } from "context/AuthContext";
import { useFilingTransactionContext } from "../FilingTransactionContext";
import FilingTransaction_BulkEdit from "./FilingTransactionActions/FilingTransaction_BulkEdit";
import FilingTransactionService from "services/filing-transaction.service";
import { convertAndFormatDateForCSV, toCssClassName } from "utils/helper";
import FilingTransaction_ImportCsv from "./FilingTransactionActions/FilingTransaction_ImportCsv";

// Define the props type for FileEvictionsButton component
type FilingTransactionButtonsProps = {
   buttons: IFileEvictionsButton[];
   activeTab?: string;
};

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

export const FilingTransactionButtons = (props: FilingTransactionButtonsProps) => {
   // this is to get selected file evictions on the basis of checkbox
   const {
      selectedFilingTransactionId,
      setSelectedFilingTransactionId,
      setFilingTransactions,
      filingTransactions,
      aosFilingTransactions,
      dismissalsFilingTransactions,
      writsFilingTransactions,
      amendmentsFilingTransactions,
      filingType,
      accountingQueue,
      companyId
   } = useFilingTransactionContext();
   const { userRole,selectedStateValue } = useAuth();
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   // when no row is selected then show error message based on this varible
   const [
      showErrorMessageWhenNoRowIsSelected,
      setShowErrorMessageWhenNoRowIsSelected,
   ] = useState<boolean>(false);

   // to show import csv pop up
   const [importCsvPopUp, setImportCsvPopUp] = useState<boolean>(false);
   // const [evictionFilteredRecords, setevictionFilteredRecords] = useState<IFileEvictionsItems[]>(
   //    []
   // );
   const [pdfLink, setPdfLink] = useState<string>("");
   const [bulkEditPopUp, setBulkEditPopUp] = useState<boolean>(false);
   const [
      showPopUpWhenDownloadFileEviction,
      setShowPopUpWhenDownloadFileEviction,
   ] = useState<boolean>(false);
   const [sendToAdditionalParties, setSendToAdditionalParties] =
      useState<boolean>(false);

   /**
    * this is to remove selected tenant from the application
    * @returns show success message when user remove all tenants.
    */
   const resetSelectedRows = () => {
      // setevictionFilteredRecords([]);
      setSelectedFilingTransactionId([]);
      setFilingTransactions((prev) => {
         return {
            ...prev,
            items: prev.items.map((item) => ({
               ...item,
               isChecked: false,
            })),
         };
      });
   };

   const getFilingTransaction = () => {
      switch (filingType) {
         case "Eviction":
            return filingTransactions;
            break;
         case "AOS":
            return aosFilingTransactions;
            break;
         case "Dismissal":
            return dismissalsFilingTransactions;
            break;
         case "Writ":
            return writsFilingTransactions;
            break;
         case "Amendment":
            return amendmentsFilingTransactions;
            break;
         default:
            return {
               items: [],
               currentPage: 0,
               pageSize: 0,
               totalCount: 0,
               totalPages: 0,
               searchParam: "",
               companyId: "",
               fromDate: null,
               toDate: null,
               datePaidFromDate: null,
               datePaidToDate: null,
               blankOption: [],
               nonBlankOption: [],
               county: "",
            };
      }
   }
   const getDataForCsv = async () => {
      try {
         const filingTransactionValues = getFilingTransaction();
         // setShowExportSpinner(true);
         const request: IExportTransactionCsv = {
            transactionIds: selectedFilingTransactionId,
            filingType: filingType
         };
         const response = await FilingTransactionService.exportFilingTransaction(request, filingTransactionValues.searchParam,
            filingType,
            companyId,
            filingTransactionValues.fromDate,
            filingTransactionValues.toDate,
            filingTransactionValues.datePaidFromDate,
            filingTransactionValues.datePaidToDate,
            filingTransactionValues.blankOption,
            filingTransactionValues.nonBlankOption,
            filingTransactionValues.county,
            selectedStateValue
         );
         return response.data;
      } catch (error) {
         throw new Error("Error fetching cases data:");
      } finally {
         // setShowExportSpinner(false);
      }
   };

   const getEvictionDataForCsv = async () => {
      try {
         // setShowExportSpinner(true);
         const request: IExportTransactionCsv = {
            transactionIds: selectedFilingTransactionId,
            filingType: filingType
         };
         const response = await FilingTransactionService.exportEvictionFilingTransaction(request,
            filingTransactions.searchParam,
            "Eviction",
            companyId,
            filingTransactions.fromDate,
            filingTransactions.toDate,
            filingTransactions.datePaidFromDate,
            filingTransactions.datePaidToDate,
            filingTransactions.blankOption,
            filingTransactions.nonBlankOption,
            filingTransactions.county,
            selectedStateValue
         );
         return response.data;
      } catch (error) {
         throw new Error("Error fetching eviction filing transaction data:");
      } finally {
         // setShowExportSpinner(false);
      }
   };

   const getAccountingQueueDataForCsv = async () => {
      try {
         // setShowExportSpinner(true);
         const request: IExportCsv = {
            transactionIds: selectedFilingTransactionId,
         };
         const response = await FilingTransactionService.exportAccountingQueue(request, accountingQueue.searchParam, accountingQueue.fromDatePaid, accountingQueue.toDatePaid
            , accountingQueue.type, accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll
            , accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption, accountingQueue.nonBlankOption, accountingQueue.county,selectedStateValue);
         return response.data;
      } catch (error) {
         throw new Error("Error fetching eviction filing transaction data:");
      } finally {
         // setShowExportSpinner(false);
      }
   };

   const isISODateString = (value: unknown): boolean => {
      return (
         typeof value === "string" &&
         /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)
      );
   };

   const downloadCSV = async () => {
      try {
         // Fetch data from the API
         if (filingType === 'Eviction' && props.activeTab !== "Accounting Queue") {
            const response: IEvictionFilingTransactionExportResource[] = await getEvictionDataForCsv();
            // Ensure that response is not null or undefined
            if (response) {
               // Convert the single object to an array
               const dataArray: IEvictionFilingTransactionExportResource[] = response as IEvictionFilingTransactionExportResource[];

               const formattedData = dataArray.map((entry) => ({
                  ...entry,
                  created: convertAndFormatDateForCSV(entry.created),
                  issueDate: convertAndFormatDateForCSV(entry.issueDate),
                  serverReceived: convertAndFormatDateForCSV(entry.serverReceived),
                  serviceDate: convertAndFormatDateForCSV(entry.serviceDate),
                  evictionFiledDate: convertAndFormatDateForCSV(entry.evictionFiledDate),
                  evictionInvoiceDate: convertAndFormatDateForCSV(entry.evictionInvoiceDate),
                  evictionDatePaid: convertAndFormatDateForCSV(entry.evictionDatePaid),
                  eFileDatePaid: convertAndFormatDateForCSV(entry.eFileDatePaid),
                  officeCheckedDate: convertAndFormatDateForCSV(entry.officeCheckedDate),
               }));
               // Convert objects to strings using JSON.stringify
               // const stringifiedDataArray = formattedData.map((item) => {
               //    // Ensure that each item is of type Record<string, string>
               //    const typedItem = item as unknown as Record<string, string>;

               //    // Convert each object property to a string
               //    return Object.keys(typedItem).reduce((acc, key) => {
               //       // const value = typedItem[key];
               //       const typedKey = key as keyof IEvictionFilingTransactionExportResource;
               //    const value = item[typedKey];
               //       // const stringValue =
               //       //    typeof value === "object" ? JSON.stringify(value) : String(value);
               //       // acc[key] = stringValue;
               //       // return acc;
               //       if (isISODateString(value) || value instanceof Date) {
               //          acc[key] = formatDate(value as string); // Format date
               //        } else if (typeof value === "object" && value !== null) {
               //          // If the value is an object (but not null), stringify it
               //          acc[key] = JSON.stringify(value);
               //        } else {
               //          // Otherwise, just convert it to a string
               //          acc[key] = String(value);
               //        }
               //        return acc;
               //    }, {} as Record<string, string>);
               // });
               const stringifiedDataArray = formattedData.map((item) => {
                  // Ensure that each item is of type Record<string, string>
                  const typedItem = item as unknown as Record<string, string>;

                  // Convert each object property to a string
                  return Object.keys(typedItem).reduce((acc, key) => {
                     const typedKey = key as keyof IEvictionFilingTransactionExportResource;
                     let value = item[typedKey];
                     // Use a type guard function to handle the Date check
                     const isDate = (val: any): val is Date => val instanceof Date;
                     if(selectedStateValue.toLocaleLowerCase()=="tx")
                        {
                           if (key.toLowerCase() === "expedited") {
                              return acc;
                            }
                        }
                     if (typeof value === "string" && isISODateString(value)) {
                        // Process string or null values
                        acc[key] = convertAndFormatDateForCSV(value);
                     } else if (isDate(value)) {
                        // Handle Date instances
                        acc[key] = convertAndFormatDateForCSV(value);
                     } else if (typeof value === "object" && value !== null) {
                        // If the value is a non-null object, stringify it
                        acc[key] = JSON.stringify(value);
                     } else {
                        // For all other types, convert to string
                        acc[key] = String(value);
                     }
                     if(selectedStateValue.toLocaleLowerCase()=="tx")
                     {
                        if (key.toLowerCase() === "statecourt") {
                           acc["court"] = String(value); // Replace stateCourt with court
                         }
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
               link.setAttribute("download", "EvictionFilingTransaction.csv");
               document.body.appendChild(link);
               link.click();

               // Clean up by removing the link and revoking the URL
               document.body.removeChild(link);
               URL.revokeObjectURL(url);
            }
         }
         else if (props.activeTab !== "Accounting Queue") {
            const response: IFilingTransactionExportResource[] = await getDataForCsv();
            // Ensure that response is not null or undefined
            if (response) {
               // Convert the single object to an array
               const dataArray: IFilingTransactionExportResource[] = response as IFilingTransactionExportResource[];
               const formattedData = dataArray.map((entry) => ({
                  ...entry,
                  created: convertAndFormatDateForCSV(entry.created),
                  filedDate: convertAndFormatDateForCSV(entry.filedDate),
                  invoiceDate: convertAndFormatDateForCSV(entry.invoiceDate),
                  datePaid: convertAndFormatDateForCSV(entry.datePaid),
                  officeCheckedDate: convertAndFormatDateForCSV(entry.officeCheckedDate),
                  serviceDateAmendment: convertAndFormatDateForCSV(entry.serviceDateAmendment),
                  serverReceivedAmendment: convertAndFormatDateForCSV(entry.serverReceivedAmendment),
               }));

               // Define the keys that need to be prefixed with the tab name
               const keysToPrefix = [
                  "filedDate",
                  "courtTransAmt",
                  "paymentAmount",
                  "payPalFee",
                  "payPalManual",
                  "invoiceDate",
                  "invoiceNo",
                  "datePaid",
                  "checkNo",
               ];

               // Function to convert the filing type and key into camel case
               const toCamelCase = (filingType: string, key: string) => {
                  const lowerFilingType = filingType.toLowerCase();
                  return lowerFilingType + key.charAt(0).toUpperCase() + key.slice(1);
               };

               // Convert objects to strings using JSON.stringify and modify keys based on tabName
               // const stringifiedDataArray = dataArray.map((item) => {
               //    const typedItem = item as unknown as Record<string, string>;

               //    // return Object.keys(typedItem).reduce((acc, key) => {
               //    //    const value = typedItem[key];
               //    //    const stringValue =
               //    //       typeof value === "object" ? JSON.stringify(value) : String(value);

               //    //    // Only prefix keys that are in the keysToPrefix array
               //    //    if (keysToPrefix.includes(key)) {
               //    //       acc[toCamelCase(filingType, key)] = stringValue;
               //    //    } else {
               //    //       acc[key] = stringValue;
               //    //    }
               //    //    return acc;
               //    // }, {} as Record<string, string>);
               //    return Object.keys(typedItem).reduce((acc, key) => {
               //       // const value = typedItem[key];
               //       const typedKey = key as keyof IFilingTransactionExportResource;
               //    const value = item[typedKey];
               //       const stringValue = typeof value === "object" && value !== null 
               //         ? JSON.stringify(value) 
               //         : String(value);

               //       // Check if the value is an ISO date string or Date object
               //       if (isISODateString(value) || value instanceof Date) {
               //         acc[key] = formatDate(value as string); // Format date
               //       } else if (typeof value === "object" && value !== null) {
               //         acc[key] = JSON.stringify(value); // Stringify object
               //       } else {
               //         // Check if the key should be prefixed
               //         if (keysToPrefix.includes(key)) {
               //           acc[toCamelCase(filingType, key)] = stringValue;
               //         } else {
               //           acc[key] = stringValue;
               //         }
               //       }

               //       return acc;
               //     }, {} as Record<string, string>);
               // });

               // const stringifiedDataArray = formattedData.map((item) => {
               //    const typedItem = item as unknown as Record<string, string>;

               //    return Object.keys(typedItem).reduce((acc, key) => {
               //      const typedKey = key as keyof IFilingTransactionExportResource;
               //      const value = item[typedKey];
               //      let stringValue: string;

               //      // Check if the value is an ISO date string or Date object
               //      if (isISODateString(value) || value instanceof Date) {
               //        stringValue = formatDate(value as string); // Format date
               //      } else if (typeof value === "object" && value !== null) {
               //        stringValue = JSON.stringify(value); // Stringify object
               //      } else {
               //        stringValue = String(value);
               //      }

               //      // Rename 'created' based on filingType
               //      if (key.toLowerCase() === "created") {
               //        if (filingType === "Dismissal") {
               //          acc["dismissalApplicantDate"] = stringValue;
               //        } else if (filingType === "Writ") {
               //          acc["writApplicantDate"] = stringValue;
               //        } else if (filingType === "Amendment") {
               //          acc["amendmentApplicantDate"] = stringValue;
               //        } else {
               //          acc[key] = stringValue; // Keep original key if no match
               //        }
               //      } else {
               //        // Check if the key should be prefixed
               //        if (keysToPrefix.includes(key)) {
               //          acc[toCamelCase(filingType, key)] = stringValue;
               //        } else {
               //          acc[key] = stringValue;
               //        }
               //      }

               //      return acc;
               //    }, {} as Record<string, string>);
               //  });

               // Helper function to determine if a value is a Date
               function isDate(value: any): value is Date {
                  return value instanceof Date && !isNaN(value.getTime());
               }

               // Your main mapping function
               const stringifiedDataArray = formattedData.map((item) => {
                  const typedItem = item as unknown as Record<string, string | number | Date | null>;
                
                  return Object.keys(typedItem).reduce((acc, key) => {
                    const typedKey = key as keyof IFilingTransactionExportResource;
                    let value = item[typedKey];
                    let stringValue: string = ""; // Initialize stringValue
                
                    // Check if the value is an ISO date string
                    if (typeof value === "string" && isISODateString(value)) {
                      stringValue = convertAndFormatDateForCSV(value); // Format date if it's an ISO string
                
                      // Check if the value is a Date object using the type guard
                    } else if (isDate(value)) {
                      stringValue = convertAndFormatDateForCSV(value.toISOString()); // Format Date object
                
                      // Check if the value is an object (but not null), then stringify it
                    } else if (typeof value === "object" && value !== null) {
                      stringValue = JSON.stringify(value);
                
                      // Handle other types (string, number, or null)
                    } else if (typeof value === "string" || typeof value === "number") {
                      stringValue = String(value); // Convert to string
                    }
                
                    // Rename 'created' based on filingType
                    if (key.toLowerCase() === "created") {
                      if (filingType === "Dismissal") {
                        acc["dismissalApplicantDate"] = stringValue;
                      } else if (filingType === "Writ") {
                        acc["writApplicantDate"] = stringValue;
                      } else if (filingType === "Amendment") {
                        acc["amendmentApplicantDate"] = stringValue;
                      } else {
                        acc[key] = stringValue; // Keep original key if no match
                      }
                    } else {
                      // If activeTab is not "Billing Amendments", exclude 'serviceDateAmendment' and 'serverReceivedAmendment'
                      if (props.activeTab !== "Billing Amendments" && 
                          (key === "serviceDateAmendment" || 
                           key === "serverReceivedAmendment" ||
                           key === "serviceMethodAmendment" ||
                           key === "serverSignatureAmendment" ||
                           key === "c2CServiceFee" || 
                           key === "c2CAmendmentFee" ||
                           key === "sheriffFee")) {
                        // Skip adding these fields to the accumulator
                        return acc;
                      }
                      if (props.activeTab !== "Billing AOS" && 
                        (key === "c2CAOSFee")) {
                      // Skip adding these fields to the accumulator
                      return acc;
                    }
                    if (props.activeTab !== "Billing Dismissals" && 
                     (key === "c2CDismissalFee")) {
                   // Skip adding these fields to the accumulator
                   return acc;
                 }
                 if (props.activeTab !== "Billing Writs" && 
                  (key === "c2CWritFee")) {
                // Skip adding these fields to the accumulator
                return acc;
              }
                
                      // Check if the key should be prefixed
                      if (keysToPrefix.includes(key)) {
                        acc[toCamelCase(filingType, key)] = stringValue;
                      } else {
                        acc[key] = stringValue;
                      }
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
               link.setAttribute("download", `${filingType}FilingTransaction.csv`);
               document.body.appendChild(link);
               link.click();

               // Clean up by removing the link and revoking the URL
               document.body.removeChild(link);
               URL.revokeObjectURL(url);
            }
         }
         else {
            const response: IAccountingQueueExportResource[] = await getAccountingQueueDataForCsv();
            // Ensure that response is not null or undefined
            if (response) {
               // Convert the single object to an array
               const dataArray: IAccountingQueueExportResource[] = response as IAccountingQueueExportResource[];
               const formattedData = dataArray.map((entry) => ({
                  ...entry,
                  created: convertAndFormatDateForCSV(entry.created),
                  payrollDate: convertAndFormatDateForCSV(entry.payrollDate),
                  commissionDate: convertAndFormatDateForCSV(entry.commissionDate),
                  serverReceived: convertAndFormatDateForCSV(entry.serverReceived),
                  serviceDate: convertAndFormatDateForCSV(entry.serviceDate),
                  filedDate: convertAndFormatDateForCSV(entry.filedDate),
                  invoiceDate: convertAndFormatDateForCSV(entry.invoiceDate),
                  datePaid: convertAndFormatDateForCSV(entry.datePaid),
                  officeCheckedDate: convertAndFormatDateForCSV(entry.officeCheckedDate),
                  serviceDateAmendment: convertAndFormatDateForCSV(entry.serviceDateAmendment),
                  serverReceivedAmendment: convertAndFormatDateForCSV(entry.serverReceivedAmendment),
               }));
               // Convert objects to strings using JSON.stringify
               const stringifiedDataArray = formattedData.map((item) => {
                  // Ensure that each item is of type Record<string, string>
                  const typedItem = item as unknown as Record<string, string>;
                  // Convert each object property to a string
                  return Object.keys(typedItem).reduce((acc, key) => {
                     const typedKey = key as keyof IAccountingQueueExportResource;
                     let value = item[typedKey];
                     if (key.toLowerCase() === "payrolldate") {
                        const isInvalidDate = value !== null && new Date(value).toLocaleDateString() === "1/1/1111"; 
                       if(isInvalidDate)
                         {
                           value = "NA";
                           acc[key] = "NA";
                         }
                     }
                     // Use a type guard function to handle the Date check
                     const isDate = (val: any): val is Date => val instanceof Date;
                     if(selectedStateValue.toLocaleLowerCase()=="tx")
                        {
                           if (key.toLowerCase() === "expedited") 
                           {
                             return acc; 
                            }
                        }
                     if (typeof value === "string" && isISODateString(value)) {
                        // Process string or null values
                        acc[key] = convertAndFormatDateForCSV(value);
                     } else if (isDate(value)) {
                        // Handle Date instances
                        acc[key] = convertAndFormatDateForCSV(value);
                     } else if (typeof value === "object" && value !== null) {
                        // If the value is a non-null object, stringify it
                        acc[key] = JSON.stringify(value);
                     } else {
                        // For all other types, convert to string
                        acc[key] = String(value);
                     }
                     if(selectedStateValue.toLocaleLowerCase()=="tx")
                        {
                           if (key.toLowerCase() === "statecourt") {
                              acc["court"] = String(value); // Replace stateCourt with court
                            }
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
               link.setAttribute("download", "AccountingQueue.csv");
               document.body.appendChild(link);
               link.click();

               // Clean up by removing the link and revoking the URL
               document.body.removeChild(link);
               URL.revokeObjectURL(url);
            }
         }
      } catch (error) {
         console.error("Error fetching or exporting data:", error);
         // Handle error (e.g., display an error message)
      }
   };

   /** handle click of all buttons  */
   const handleClick = (button: IFilingTransactionButton) => {
      // Switch based on the button type or any other property that uniquely identifies the button
      switch (button.title) {
         case "Edit":
            if (selectedFilingTransactionId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(true);
               return;
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
               setBulkEditPopUp(true);
            }
            break;
         case "Export CSV":
            // if (selectedFilingTransactionId.length === 0) {
            //    setShowErrorMessageWhenNoRowIsSelected(true);
            //    return;
            // } else {
            //    setShowErrorMessageWhenNoRowIsSelected(false);
            downloadCSV();
            // }
            break;

         case "ReImport Data":
            setImportCsvPopUp(true);
            break;
         // Add more cases for other button types
         default:
            // Handle default case or unknown button types
            console.log(`Unknown button type: ${button.icon}`);
      }
   };


   /**
    *
    * @param formValues get those values from the email
    */
   //    const handleSignIn = async (formValues: any) => {

   //       try {
   //          setShowSpinner(true);
   //          // Download all file evictions
   //          if (sendToAdditionalParties) {
   //             let request: ISendFileEvictionEmail = {
   //                combinedPdfUrl: pdfLink,
   //                dispoIds: selectedFileEvictionId,
   //                userEmails: formValues.email.split(","),
   //             };
   //             const apiResponse = await FileEvictionService.sendFileEvictionEmail(
   //                request
   //             );
   //          }
   //          setShowPopUpWhenDownloadFileEviction(false);
   //          await downloadPDF(pdfLink);
   //          setShowSpinner(false);
   //          getFileEvictions(1, 100);
   //          setSelectedFileEvictionId([]);
   //       } catch (error) { }
   //    };


   return (
      <>
         {/* Map through the buttons array to generate individual buttons */}
         {props.buttons.map((item: IFilingTransactionButton, index: number) => {
            let iconComponent;
            // Switch statement to determine the icon based on the provided icon type
            switch (item.icon) {
               case "FaEdit":
                  iconComponent = (
                     <FaEdit className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaFileExport":
                  iconComponent = (
                     <FaFileExport className="fa-solid fa-plus mr-1 text-xs" />
                  );
                  break;
               case "FaFileExcel":
                     iconComponent = <FaFileExcel className="fa-solid fa-plus mr-1 text-xs" />;
                     break;
               default:
                  // Provide a default case or handle unknown icon types
                  iconComponent = <></>;
            }
            // if (
            //    item.title === "ReImport Data" &&
            //    props.activeTab !== "Accounting Queue" && props.activeTab != "Billing Evictions"
            //    && props.activeTab != "Billing AOS" && props.activeTab != "Billing Dismissals"
            //    && props.activeTab != "Billing Writs"
            // ) {
            //    return null; // Hide the button for non-signers
            // }

            return (
               <Button
                  title={item.title}
                  classes={item.classes}
                  type={"button"}
                  isRounded={false}
                  icon={iconComponent}
                  key={index}
                  handleClick={() => handleClick(item)}
                  disabled={item.title === "Verify Address" ? true : false}
               ></Button>
            );
         })}

         {showSpinner && <Spinner></Spinner>}
         {/* This is to show error message when no row is selected from grid */}
         {showErrorMessageWhenNoRowIsSelected && (
            <>
               <Modal
                  showModal={showErrorMessageWhenNoRowIsSelected}
                  onClose={() => {
                     setShowErrorMessageWhenNoRowIsSelected(false);
                  }}
                  width="max-w-md"
               >
                  <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                     <div className="text-center py-8">
                        <div className="mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-red-100 mx-auto">
                           <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="mt-2.5 text-center ">
                           <p className="text-xs text-gray-500 text-center font-medium text-gray-600 text-md">
                              Please select at least 1 record
                           </p>
                        </div>
                     </div>
                  </div>
               </Modal>
            </>
         )}
         {bulkEditPopUp && (
            <>
               <FilingTransaction_BulkEdit
                  showFileEvictionPopup={bulkEditPopUp}
                  handleClose={() => {
                     setBulkEditPopUp(false);
                     //    resetSelectedRows();
                  }}
                  tabName={props.activeTab}
               />
            </>
         )}
         {importCsvPopUp && (
            <>
               <FilingTransaction_ImportCsv
                  importCsvPopUp={importCsvPopUp}
                  activeTab = {props.activeTab}
                  setImportCsvPopUp={(value: SetStateAction<boolean>, resetGrid: boolean) => {
                     
                     if (resetGrid) {
                        //resetSelectedRows();
                     }
                     setImportCsvPopUp(value);
                  }}
                  showConfirmation={(msg: { __html:string}) => {
                     
                     // setShowConfirmation(true);
                     // setConfirmationMsg(msg);
                   }}
               />
            </>
         )}
      </>
   );
};
