import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import GridCheckbox from "components/formik/GridCheckBox";
import { IGridHeader } from "interfaces/grid-interface";
import { ISelectOptions } from "interfaces/late-notices.interface";
import { IFileEvictionsItems } from "interfaces/file-evictions.interface";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import { IUpdateBillingTnxPayload, UpdatePaymentResource } from "interfaces/filing-transaction.interface";
import { adjustDateSystemTimezone, convertAndFormatDate, convertToUTCISOString, formattedDate, formatToDateOnlyString, parseDateOnly, toCssClassName } from "utils/helper";
import { useFilingTransactionContext } from "pages/filing-transaction/FilingTransactionContext";
import FilingTransactionService from "services/filing-transaction.service";
import dollarImage from "assets/images/dollar-sign.svg";
import DropdownPresentation from "components/common/dropdown/DropDown";
import { PaymentMethodOption } from "utils/constants";

type FilingTransactionBulkEditProps = {
   showFileEvictionPopup: boolean;
   handleClose: () => void;
   tabName?: string;
};

const FilingTransaction_BulkEdit = (props: FilingTransactionBulkEditProps) => {
   const {
      filingTransactions,
      aosFilingTransactions,
      dismissalsFilingTransactions,
      writsFilingTransactions,
      amendmentsFilingTransactions,
      setShowSpinner,
      showSpinner,
      setFilteredRecords,
      filteredRecords,
      selectedFilingTransactionId,
      setSelectedFilingTransactionId,
      //   selectedFileEvictionId,
      setSelectedFilteredFilingTransactionId,
      //   setSelectedFilteredFileEvictionId,
      getFilingTransactions,
      //   getFileEvictions,
      bulkRecords,
      aosBulkRecords,
      dismissalBulkRecords,
      writBulkRecords,
      amendmentBulkRecords,
      setBulkRecords,
      setAOSBulkRecords,
      setDismissalBulkRecords,
      setWritBulkRecords,
      setAmendmentBulkRecords,
      setFilingType,
      companyId,
      filingType,
      dateFiled,
      datePaid,
      getAccountingQueue,
      accountingQueue
   } = useFilingTransactionContext();

   const courtTransAmountColumn = {
      Eviction: "EvictionCourtTransAmount",
      AOS: "AOSCourtTransAmount",
      Dismissal: "DismissalCourtTransAmount",
      Writ: "WritCourtTransAmount",
      Amendment: "AmendmentCourtTransAmount"
   }[filingType] || null;   

   const paymentAmountColumn = {
      Eviction: "EvictionPaymentAmount",
      AOS: "AOSPaymentAmount",
      Dismissal: "DismissalPaymentAmount",
      Writ: "WritPaymentAmount",
      Amendment: "AmendmentPaymentAmount"
   }[filingType] || null;

   const datePaidColumn = {
      Eviction: "EvictionDatePaid",
      AOS: "AOSDatePaid",
      Dismissal: "DismissalDatePaid",
      Writ: "WritDatePaid",
      Amendment: "AmendmentDatePaid"
   }[filingType] || null;

   const filedDateColumn = {
      Eviction: "EvictionFiledDate",
      AOS: "AOSFiledDate",
      Dismissal: "DismissalFiledDate",
      Writ: "WritFiledDate",
      Amendment: "AmendmentFiledDate"
   }[filingType] || null;

   const invoiceDateColumn = {
      Eviction: "EvictionInvoiceDate",
      AOS: "AOSInvoiceDate",
      Dismissal: "DismissalInvoiceDate",
      Writ: "WritInvoiceDate",
      Amendment: "AmendmentInvoiceDate"
   }[filingType] || null;

   const invoiceNumberColumn = {
      Eviction: "EvictionInvoice#",
      AOS: "AOSInvoice#",
      Dismissal: "DismissalInvoice#",
      Writ: "WritInvoice#",
      Amendment: "AmendmentInvoice#"
   }[filingType] || null;

   const checkNumberColumn = {
      Eviction: "EvictionCheck#",
      AOS: "AOSCheck#",
      Dismissal: "DismissalCheck#",
      Writ: "WritCheck#",
      Amendment: "AmendmentCheck#"
   }[filingType] || null;

   const payPalFeeColumn = {
      Eviction: "EvictionPayPalFee",
      AOS: "AOSPayPalFee",
      Dismissal: "DismissalPayPalFee",
      Writ: "WritPayPalFee",
      Amendment: "AmendmentPayPalFee"
   }[filingType] || null;

   const payPalManualColumn = {
      Eviction: "EvictionPayPalManual",
      AOS: "AOSPayPalManual",
      Dismissal: "DismissalPayPalManual",
      Writ: "WritPayPalManual",
      Amendment: "AmendmentPayPalManual"
   }[filingType] || null;

   const evictionColumns = filingType === "Eviction" ? [
      { columnName: "eFileClientFee", label: "EvictionEfileFee" },
      { columnName: "expFee", label: "C2CServiceExpFee" },
      { columnName: "c2CFilingFee", label: "C2CEvictionFee" },
      { columnName: "sheriffFee", label: "SheriffFee" },
      { columnName: "c2CServiceFee", label: "C2CServiceFee" },
      { columnName: "automationFee", label: "EAFee" },
      // { columnName: "payPalFee", label: "EvictionPayPalFee " },
      // { columnName: "payPalManual", label: "EvictionPayPalManual" },
      { columnName: "house", label: "House" },
      { columnName: "paymentNotes", label: "PaymentNotes" }
   ] : [];

   const initialColumnMapping: IGridHeader[] = [
      { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
      { columnName: "caseNumber", label: "CaseNumber" },
      ...(courtTransAmountColumn && props.tabName !== "Accounting Queue" ? [{ columnName: "courtTransAmount", label: courtTransAmountColumn }] : []),
      ...(props.tabName === "Billing Writs" ? [{ columnName: "c2CFilingFee", label: "C2CWritFee" },] : []),
      ...(paymentAmountColumn && props.tabName !== "Accounting Queue" ? [{ columnName: "paymentAmount", label: paymentAmountColumn }] : []),
      ...(payPalFeeColumn && props.tabName !== "Accounting Queue" ? [{ columnName: "payPalFee", label: payPalFeeColumn }] : []),
      ...(payPalManualColumn && props.tabName !== "Accounting Queue" ? [{ columnName: "payPalManual", label: payPalManualColumn }] : []),
      ...(datePaidColumn && props.tabName !== "Accounting Queue" ? [{ columnName: "datePaid", label: datePaidColumn }] : []),
      ...(props.tabName === "Billing Evictions" ? [{ columnName: "eFileDatePaid", label: "EFileDatePaid" }] : []),
      ...(filedDateColumn && props.tabName !== "Accounting Queue" ? [{ columnName: "filedDate", label: filedDateColumn }] : []),
      ...(invoiceDateColumn && props.tabName !== "Accounting Queue" ? [{ columnName: "invoiceDate", label: invoiceDateColumn }] : []),
      ...(invoiceNumberColumn && props.tabName !== "Accounting Queue" ? [{ columnName: "invoiceNumber", label: invoiceNumberColumn }] : []),
      ...(checkNumberColumn && props.tabName !== "Accounting Queue" ? [{ columnName: "checkNumber", label: checkNumberColumn }] : []),
      
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "courtTransAmount", label: "CourtTransAmount" }] : []),
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "payPalFee", label: "PayPalFee" }] : []),
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "payPalManual", label: "PayPalManual" }] : []),
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "datePaid", label: "DatePaid" }] : []),
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "filedDate", label: "FiledDate" }] : []),
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "invoiceDate", label: "InvoiceDate" }] : []),
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "invoiceNumber", label: "InvoiceNumber" }] : []),
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "checkNumber", label:  "CheckNumber"}] : []),
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "commissionDate", label: "CommissionDate" }] : []),
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "paymentAmount", label: "PaymentAmount" }] : []),
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "payrollDate", label: "PayrollDate" }] : []),
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "paidServer", label:  "PaidServer$"}] : []),
      ...(props.tabName === "Accounting Queue" ? [{ columnName: "serverPayAdminNotes", label: "ServerPayAdminNotes" }] : []),
      ...evictionColumns,

      { columnName: "notes", label: "Notes" },
      { columnName: "officeCheckedDate", label: "OfficeCheckedDate" },
      { columnName: "officeCheckedBy", label: "OfficeCheckedBy" },
      { columnName: "officeCheckedNotes", label: "OfficeCheckedNotes" },
      { columnName: "paymentMethod", label: "eFilePaymentMethod" },
      { columnName: "paymentAccount", label: "PaymentAccount" },

      ...(props.tabName === "Billing Amendments" ? [{ columnName: "serviceDateAmendment", label: "ServiceDateAmendment" }] : []),
      ...(props.tabName === "Billing Amendments" ? [{ columnName: "serverReceivedAmendment", label: "ServerReceivedAmendment" }] : []),
      ...(props.tabName === "Billing Amendments" ? [{ columnName: "serviceMethodAmendment", label: "ServiceMethodAmendment" }] : []),
      ...(props.tabName === "Billing Amendments" ? [{ columnName: "serverSignatureAmendment", label: "ServerSignatureAmendment" }] : [])
   ];

   const validationSchema = yup.object({
      //   PropertyZip: yup
      //      .string()
      //      .min(5, "Zip code must be 5 digits.")
      //      .max(5, "Zip code must be 5 digits.")
      //      .required("Please enter Zip code."),
      //  checkNumber: yup.string(),
      //  datePaid: yup.string(),
      //       paymentAmount: yup.string(),
      invoiceNumber: yup
         .string()
         .max(50, "InvoiceNumber must not exceed 50 characters."),
         checkNumber: yup
         .string()
         .max(500, "CheckNumber must not exceed 500 characters."),
         house: yup
         .string()
         .max(50, "House must not exceed 50 characters."),
         paymentNotes: yup
         .string()
         .max(2000, "PaymentNotes must not exceed 2000 characters."),
         serverPayAdminNotes: yup
         .string()
         .max(2000, "ServerPayAdminNotes must not exceed 2000 characters."),

         courtTransAmount: yup
         .string()
         .test(
            "isCurrency",
            "CourtTransAmount must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "CourtTransAmount must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),

         payPalFee: yup
         .string()
         .test(
            "isCurrency",
            "PayPalFee must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "PayPalFee must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),

         payPalManual: yup
         .string()
         .test(
            "isCurrency",
            "PayPalManual must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "PayPalManual must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),

         paidServer: yup
         .string()
         .test(
            "isCurrency",
            "PaidServer must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "PaidServer must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),

         eFileClientFee: yup
         .string()
         .test(
            "isCurrency",
            "EvictionEfileFee must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "EvictionEfileFee must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),

         expFee: yup
         .string()
         .test(
            "isCurrency",
            "C2CServiceExpFee must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "C2CServiceExpFee must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),
         c2CFilingFee: yup
         .string()
         .test(
            "isCurrency",
            "C2CEvictionFee must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "C2CEvictionFee must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),
         sheriffFee: yup
         .string()
         .test(
            "isCurrency",
            "SheriffFee must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "SheriffFee must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),
         c2CServiceFee: yup
         .string()
         .test(
            "isCurrency",
            "C2CServiceFee must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "C2CServiceFee must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),
         automationFee: yup
         .string()
         .test(
            "isCurrency",
            "EAFee must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "EAFee must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),
      paymentAmount: yup
         .string()
         .test(
            "isCurrency",
            "PaymentAmount must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         )
         // .test(
         //    "maxAmount",
         //    "PaymentAmount must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),
   });

   const [showConfirm, setShowConfirm] = useState<boolean>(false);
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [bulkCases, setBulkCases] = useState<UpdatePaymentResource[]>([]);

   // const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
   //   Array(signedWrits.items?.length).fill(false)
   // );
   const [columnErrors, setColumnErrors] = useState<
      Record<string, { rowIndex: number; errorMessage: string }[]>[]
   >([]);

   const [rowErrors, setRowErrors] = useState<IImportCsvRowError[]>([]);
   const [updatePayload, setUpdatePayload] = useState<IUpdateBillingTnxPayload[]>([]);
   // const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectFilteredAll, setSelectFilteredAll] = useState<boolean>(false);
   const [setOutCompletedDateSelected, setSetOutCompletedDateSelected] = useState<boolean>(false);

   const [selectedFilteredRows, setSelectedFilteredRows] = useState<
      Array<boolean>
   >(Array(filteredRecords?.length).fill(false));

   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);

   const [newSelectedRows] = useState<boolean[]>([]);

   useEffect(() => {
      // const records = bulkRecords.filter((item) =>
      //    selectedFilingTransactionId.includes(item.id || "")
      // );
      // if(props.tabName == "Accounting Queue")
      // {
      //    bulkRecords.forEach(item => {
      //       item.paidServer = item.paidServer != null ?item.paidServer:  item.expedited != null && item.expedited !=""?10 :7
      //    });
      // }
      // let uniqueRecords: { [key: string]: any } = {};
      // let records = bulkRecords.filter((item) => {
      //    const id = item.id || "";
      //    if (!selectedFilingTransactionId.includes(id) || uniqueRecords[id]) {
      //       return false;
      //    }
      //    uniqueRecords[id] = true;
      //    return true;
      // });
      // setFilteredRecords(records);
      let bulkData: UpdatePaymentResource[] = [];

      switch (filingType) {
         case "Eviction":
            bulkData = bulkRecords;
            setBulkCases(bulkRecords);
            break;
         case "AOS":
            bulkData = aosBulkRecords;
            setBulkCases(aosBulkRecords);
            break;
         case "Dismissal":
            bulkData = dismissalBulkRecords;
            setBulkCases(dismissalBulkRecords);
            break;
         case "Writ":
            bulkData = writBulkRecords;
            setBulkCases(writBulkRecords);
            break;
         case "Amendment":
            bulkData = amendmentBulkRecords;
            setBulkCases(amendmentBulkRecords);
            break;
         default:
            bulkData = [];
            break;
      }
      if (props.tabName == "Accounting Queue") {
         bulkData = bulkRecords;
         setBulkCases(bulkRecords);
      }
      let uniqueRecords: { [key: string]: any } = {};
      let records = bulkData.filter((item) => {
         const id = item.id || "";
         if (!selectedFilingTransactionId.includes(id) || uniqueRecords[id]) {
            return false;
         }
         uniqueRecords[id] = true;
         return true;
      }).map((item) => {
         // Create a deep copy of each item to prevent modification of bulkRecords
         return JSON.parse(JSON.stringify(item));
      });
      if (props.tabName == "Accounting Queue") {
         records.forEach(item => {
            item.commissionDate = convertAndFormatDate(item.commissionDate);
            item.payrollDate = item.payrollDate !== null && new Date(item.payrollDate).toLocaleDateString() === "1/1/1111" ? "NA" : convertAndFormatDate(item.payrollDate);
         });
      }
      if (props.tabName == "Billing Evictions") {
         records.forEach(item => {
            item.eFileDatePaid = convertAndFormatDate(item.eFileDatePaid);
         });
      }
      
      records.forEach(item => {
         item.invoiceDate = convertAndFormatDate(item.invoiceDate);
         item.datePaid = convertAndFormatDate(item.datePaid);
         item.filedDate = convertAndFormatDate(item.filedDate);
      });

      setFilteredRecords(records);
      // setFilteredRecords(records);
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

   const validateRow = (row: UpdatePaymentResource, rowIndex: number) => {
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
         setSelectedFilteredFilingTransactionId(selectedIds);
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

         setSelectedFilteredFilingTransactionId(selectedIds);
      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = filteredRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         setSelectedFilteredFilingTransactionId(allIds);
      } else {
         setSelectedFilteredFilingTransactionId([]);
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

   /**
    * Render each cell of a table
    * @param cellIndex  : cell of table
    * @param data  :data of cell
    * @param rowIndex : row index
    * @returns render cell
    */
   const handleCellRendered = (
      cellIndex: number,
      data: UpdatePaymentResource,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      var cellValue = "";
      if (propertyName == "eFileDatePaid" || propertyName == "datePaid" || propertyName == "filedDate" || propertyName == "officeCheckedDate"
               || propertyName == "serviceDateAmendment"
               || propertyName == "serverReceivedAmendment"
      )
      {
         var value = (data as any)[propertyName];
         cellValue = value ? formattedDate(value as string) : ""
      }
      else if (propertyName == "paymentAmount") {
         var value = (data as any)["paymentAmount"];
         cellValue = value !== null ? (value) : ""
      }
      else {
         cellValue = (data as any)[propertyName];
      }
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
                  disabled={true}
               />
               {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                  <div key={index} className="text-red-500">
                     {error.errorMessage}
                  </div>
               ))}
            </>
         )
      };

      const renderer = renderers[propertyName] || (() => formattedCell(cellValue, columnName, propertyName, rowIndex));

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
         var data: IUpdateBillingTnxPayload[] = filteredRecords.map((item) => ({
            id: item.id,
            dispoId: item.dispoId,
            // courtTransAmount: item.courtTransAmount ?? 0,
            courtTransAmount: item.courtTransAmount?.toString() === "" ? 0 : item.courtTransAmount,
            // eFileClientFee: item.eFileClientFee ?? 0,
            eFileClientFee: item.eFileClientFee?.toString() === "" ? 0 : item.eFileClientFee,
            // expFee: item.expFee ?? 0,
            expFee: item.expFee?.toString() === "" ? 0 : item.expFee,
            // c2CFilingFee: item.c2CFilingFee ?? 0,
            c2CFilingFee: item.c2CFilingFee?.toString() === "" ? 0 : item.c2CFilingFee,
            // sheriffFee: item.sheriffFee ?? 0,
            sheriffFee: item.sheriffFee?.toString() === "" ? 0 : item.sheriffFee,
            // c2CServiceFee: item.c2CServiceFee ?? 0,
            c2CServiceFee: item.c2CServiceFee?.toString() === "" ? 0 : item.c2CServiceFee,
            // automationFee: item.automationFee ?? 0,
            automationFee: item.automationFee?.toString() === "" ? 0 : item.automationFee,
            paymentAmount: item.paymentAmount?.toString() === "" ? 0 : item.paymentAmount,
            // payPalFee: item.payPalFee ?? 0,
            // payPalManual: item.payPalManual ?? 0,
            payPalFee: item.payPalFee?.toString() === "" ? 0 : item.payPalFee,
            payPalManual: item.payPalManual?.toString() === "" ? 0 : item.payPalManual,
            invoiceDate: item.invoiceDate ? adjustDateSystemTimezone(item.invoiceDate as string) : null,
            datePaid: item.datePaid ? adjustDateSystemTimezone(item.datePaid as string) : null,
            eFileDatePaid: item.eFileDatePaid ? adjustDateSystemTimezone(item.eFileDatePaid as string) : null,
            filedDate: item.filedDate ? adjustDateSystemTimezone(item.filedDate as string) : null,
            // officeCheckedDate: item.officeCheckedDate ? formatToDateOnlyString(parseDateOnly(adjustDateSystemTimezone(item.officeCheckedDate as string).toString())) : null,
            officeCheckedDate: item.officeCheckedDate ? formatToDateOnlyString(parseDateOnly(item.officeCheckedDate.toString())) : null,
            invoiceNumber: item.invoiceNumber && item.invoiceNumber.length > 0 ? item.invoiceNumber : null,
            checkNumber: item.checkNumber?.length > 0 ? item.checkNumber : "",
            house: item.house ?? null,
            paymentNotes: item.paymentNotes ?? null,
            serverPayAdminNotes: item.serverPayAdminNotes ?? null,
            // commissionDate: item.commissionDate ? convertToUTCISOString(item.commissionDate as string) : null,
            // payrollDate: item.payrollDate ? convertToUTCISOString(item.payrollDate as string) : null,
            commissionDate: item.commissionDate ? adjustDateSystemTimezone(item.commissionDate as string) : null,
            // payrollDate: item.payrollDate ? adjustDateSystemTimezone(item.payrollDate as string) : null,
        payrollDate: item.payrollDate && item.payrollDate != "NA"
    ? adjustDateSystemTimezone(item.payrollDate as string)
    : (bulkCases != null && bulkCases != undefined
        ? (bulkCases.find(record => record.id === item.id)?.payrollDate !== null
            && new Date(bulkCases.find(record => record.id === item.id)?.payrollDate ?? "").toLocaleDateString() === "1/1/1111"
                ? bulkCases.find(record => record.id === item.id)?.payrollDate
                : null)
        : null) ?? null,

            paidServer: item.paidServer?.toString() === "" ? null : item.paidServer,
            notes: item?.notes ?? null,
            // officeCheckedDate: item.officeCheckedDate ? formatToDateOnlyString(parseDateOnly(item.officeCheckedDate.toString())) : null,
            officeCheckedBy: item.officeCheckedBy ?? null,
            officeCheckedNotes: item.officeCheckedNotes ?? null,
            paymentAccount: item.paymentAccount,
            paymentMethod: item.paymentMethod,
            serviceDateAmendment: item.serviceDateAmendment ? formatToDateOnlyString(parseDateOnly(item.serviceDateAmendment.toString())) : null,
            serverReceivedAmendment: item.serverReceivedAmendment ? formatToDateOnlyString(parseDateOnly(item.serverReceivedAmendment.toString())) : null,
            serviceMethodAmendment: item.serviceMethodAmendment,
            serverSignatureAmendment: item.serverSignatureAmendment
      }));
         setUpdatePayload(data);
         const response = await FilingTransactionService.editFilingTransactionBulk(data, props.tabName === "Accounting Queue" ? true: false);
         if (response.status === HttpStatusCode.Ok) {
            // Display a success toast message
            toast.success("Transaction info successfully updated.");
            // Close the popup
            props.handleClose();
         } else {
            // Handle other status codes if needed
            // For example, display an error message toast
            toast.error("Failed to update transaction info.");
            props.handleClose();
         }
         // setBulkRecords(filteredRecords);
         setFilteredRecords([]);
         setSelectAll(false);
         setSelectedFilingTransactionId([]);
         setBulkRecords([]);
         setAOSBulkRecords([]);
         setDismissalBulkRecords([]);
         setWritBulkRecords([]);
         setAmendmentBulkRecords([]);

      } finally {
         setShowSpinner(false);
         if(props.tabName != "Accounting Queue")
         {
            const filingTransactionValues = getFilingTransaction();
         getFilingTransactions(1, 100, filingTransactionValues.searchParam, filingType, companyId, dateFiled[0] ,dateFiled[1], datePaid[0] ,datePaid[1],filingTransactionValues.blankOption,filingTransactionValues.nonBlankOption,filingTransactionValues.county);
         }
         else
         {
            getAccountingQueue(1, 100, accountingQueue.searchParam, accountingQueue.fromDatePaid,accountingQueue.toDatePaid
               , accountingQueue.type, accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll, accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption, accountingQueue.nonBlankOption,accountingQueue.county);
         }
         // hide spinner
         // setShowSpinner(false);
      }
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

   const formattedCell = (value: any, columnName: any, propertyName: any, rowIndex: number) => {

      if (propertyName === "paymentAmount" ||
         propertyName === "courtTransAmount" ||
         propertyName === "eFileClientFee" ||
         propertyName === "expFee" ||
         propertyName === "c2CFilingFee" ||
         propertyName === "sheriffFee" ||
         propertyName === "c2CServiceFee" ||
         propertyName === "automationFee" ||
         propertyName === "payPalFee" ||
         propertyName === "payPalManual" ||
         propertyName === "paidServer" 
      ) {
         return (
            <div>
               <input
                  type={"number"}
                  value={value}
                  className={`peer outline-none px-2.5 py-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_left_10px] !pl-7 number_filed`}
                  onChange={(e) =>
                     handleInputChange?.(propertyName, e.target.value, rowIndex)
                  }
                  style={{
                     backgroundImage: `url(${dollarImage})`,
                  }}
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
            </div>
         );
      }
      if (propertyName === "payrollDate") {
         if (value != null && value != "" && value === "NA") {
            return <input
            type={"text"}
            value={"NA"}
            className={
               "peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
            }
            onChange={(e) =>
               handleInputChange?.(propertyName, e.target.value, rowIndex)
            }
            disabled={true}
         />; // Display NA if value is "NA"
          }
          else
          {
         return (
            <>
               <div className="datePicker">
                  <DatePicker
                     selected={
                        value && Date.parse(value as string)
                           ? new Date(value as string)
                           : null // new Date()
                     }
                     onChange={(date: any) => {
                        handleInputChange?.(propertyName, date, rowIndex);
                        handleSetOutCompletedDateChange(date, rowIndex);
                     }}
                     //dateFormat="MM/dd/yyyy"
                     dateFormat="MM/dd/yyyy"
                     placeholderText="mm/dd/yyyy"
                     className="bg-calendar bg-no-repeat bg-[center_right_1rem] peer placeholder-gray-500 outline-none px-2.5 py-1.5 pr-7 min-w-32 block border w-full border-gray-200 rounded-lg text-xs  focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none   "
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
         )
      }
      }
      if (propertyName === "eFileDatePaid" 
               || propertyName === "datePaid" 
               || propertyName === "filedDate" 
               || propertyName === "invoiceDate" 
               || propertyName === "commissionDate" 
               || propertyName === "officeCheckedDate"
               || propertyName === "serviceDateAmendment" 
               || propertyName === "serverReceivedAmendment"
            ) {
         return (
            <>
               <div className="datePicker">
                  <DatePicker
                     selected={
                        value && Date.parse(value as string)
                           ? new Date(value as string)
                           : null // new Date()
                     }
                     onChange={(date: any) => {
                        handleInputChange?.(propertyName, date, rowIndex);
                        handleSetOutCompletedDateChange(date, rowIndex);
                     }}
                     //dateFormat="MM/dd/yyyy"
                     dateFormat="MM/dd/yyyy"
                     placeholderText="mm/dd/yyyy"
                     className="bg-calendar bg-no-repeat bg-[center_right_1rem] peer placeholder-gray-500 outline-none px-2.5 py-1.5 pr-7 min-w-32 block border w-full border-gray-200 rounded-lg text-xs  focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none   "
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
         )
      }

      if (propertyName === "paymentAccount") {
         return <DropdownPresentation
            heading=""
            selectedOption={
               { id: value, value: value } as ISelectOptions
            }
            handleSelect={(event) =>
               handleInputChange?.(propertyName, event.target.value, rowIndex)
            }
            options={PaymentMethodOption}
            placeholder="Select"
         />
      }

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
                           Edit Billing Transactions
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
                           data: UpdatePaymentResource,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                     ></Grid>
                     <div className="py-2.5 flex justify-between mt-1.5 items-center">
                        <p className="font-semibold text-[10px] md:text-xs">
                           Total records: {selectedFilingTransactionId.length}
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
               onClose={handleModalClose}
               width="max-w-md"
            >
               {showSpinner && <Spinner />}
               {/* Container for the content */}
               <div id="fullPageContent">
                  <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                     <div className="text-center pr-4 sm:text-left">
                        <h3
                           className="text-sm font-semibold leading-5 text-gray-900"
                           id="modal-title"
                        >
                           Are you sure you want to update the transaction information ?
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

export default FilingTransaction_BulkEdit;
