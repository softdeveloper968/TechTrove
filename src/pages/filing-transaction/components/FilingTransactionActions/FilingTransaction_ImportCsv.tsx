import React, { useState } from "react";
import { Form, Formik } from "formik";
import { toast } from "react-toastify";
import FormikControl from "components/formik/FormikControl";
import Modal from "components/common/popup/PopUp";
import { useAuth } from "context/AuthContext";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import { ISelectOptions } from "interfaces/late-notices.interface";
import fileUpload from "assets/svg/file-upload.svg";
import { HttpStatusCode, UserRole } from "utils/enum";
import { useFilingTransactionContext } from "pages/filing-transaction/FilingTransactionContext";
import moment from "moment";
import { IImportExistingBillingTransactionCSV } from "interfaces/filing-transaction.interface";
import FilingTransactionService from "services/filing-transaction.service";

type SetImportCsvPopUp = (
   value: React.SetStateAction<boolean>,
   resetGrid: boolean
) => void;



type FilingTransactionImportCsvProps = {
   importCsvPopUp: boolean;
   activeTab?: string;
   setImportCsvPopUp: SetImportCsvPopUp;
   showConfirmation: (msg: { __html: string }) => void;
};

const initialSelectOption: ISelectOptions = { id: '', value: '' };

const FilingTransaction_ImportCsv = (props: FilingTransactionImportCsvProps) => {
   const {
      getAccountingQueue,
      getFilingTransactions,
      setSelectedFilingTransactionId,
      setSelectedFilteredFilingTransactionId,
      filingType,
      setShowSpinner,
      setBulkRecords,
      setFilteredRecords,
      setAOSBulkRecords,
      setWritBulkRecords,
      setAmendmentBulkRecords,
      setDismissalBulkRecords,
      accountingQueue,
      filingTransactions,
      aosFilingTransactions,
      dismissalsFilingTransactions,
      writsFilingTransactions,
      amendmentsFilingTransactions
   } = useFilingTransactionContext();
   const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
   const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);
   const [isSelectedCompany, setIsSelectedCompany] = useState(true);

   // const [gridData, setGridData] = useState<ICreateFileEviction[]>([]);
   const [gridData, setGridData] = useState<IImportExistingBillingTransactionCSV[]>([]);
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
   const { userRole } = useAuth();

   // this is used to show error when csv is invalid
   const [showInvalidCSVMessage, setShowInvalidCSVMessage] =
      useState<boolean>(false);

   // this is used to show error when csv is invalid
   const [showMaxRecords, setshowMaxRecords] = useState<boolean>(false);
   // set spinner
   const [toggleSpinner, setToggleSpinner] = useState<boolean>(false);
   const [totalRecord, setTotalRecord] = useState<number>(0);

   const initialValues = {
      UploadFile: "",
   };

   /**
    * Handles the creation of file evictions based on the provided form values.
    * Displays a success toast message upon successful creation.
    * Closes the popup on success.
    *
    * @param {IImportExistingBillingTransactionCSV} formValues - The form values for creating a late notice.
    */
   const handleImportExistingCases = async (data: IImportExistingBillingTransactionCSV[]) => {
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      console.log(headers);
      const errors: Record<
         string,
         { rowIndex: number; errorMessage: string }[]
      >[] = [];
      const rowErrors: IImportExistingBillingTransactionCSV[] = [];
      // Iterate through gridData with index
      data.forEach((record, index: number) => {
         const recordErrors: Record<
            string,
            { rowIndex: number; errorMessage: string }[]
         > = {};
         const fields: IImportCsvFieldError[] = [];

         if (Object.keys(recordErrors).length > 0) {
            errors.push(recordErrors);
         }

      });

      if (errors.length === 0) {
         try {
            setToggleSpinner(true);
            // Add ClientId for specific user roles
            if (userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)) {
               // Clone the gridData to preserve the original data
               const clonedGridData: IImportExistingBillingTransactionCSV[] = JSON.parse(JSON.stringify(data));
               const formattedData: IImportExistingBillingTransactionCSV[] = clonedGridData.map(item => {
                  item.courtTransAmt = item.courtTransAmt?.toString() === "" ? 0 : item.courtTransAmt
                  item.evictionCourtTransAmt = item.evictionCourtTransAmt?.toString() === "" ? 0 : item.evictionCourtTransAmt;
                  item.aosCourtTransAmt = item.aosCourtTransAmt?.toString() === "" ? 0 : item.aosCourtTransAmt;
                  item.dismissalCourtTransAmt = item.dismissalCourtTransAmt?.toString() === "" ? 0 : item.dismissalCourtTransAmt;
                  item.writCourtTransAmt = item.writCourtTransAmt?.toString() === "" ? 0 : item.writCourtTransAmt;
                  item.amendmentCourtTransAmt = item.amendmentCourtTransAmt?.toString() === "" ? 0 : item.amendmentCourtTransAmt;

                  item.paymentAmount = item.paymentAmount?.toString() === "" ? 0 : item.paymentAmount;
                  item.evictionPaymentAmount = item.evictionPaymentAmount?.toString() === "" ? 0 : item.evictionPaymentAmount;
                  item.aosPaymentAmount = item.aosPaymentAmount?.toString() === "" ? 0 : item.aosPaymentAmount;
                  item.dismissalPaymentAmount = item.dismissalPaymentAmount?.toString() === "" ? 0 : item.dismissalPaymentAmount;
                  item.writPaymentAmount = item.writPaymentAmount?.toString() === "" ? 0 : item.writPaymentAmount;
                  item.amendmentPaymentAmount = item.amendmentPaymentAmount?.toString() === "" ? 0 : item.amendmentPaymentAmount;

                  item.payPalFee = item.payPalFee?.toString() === "" ? 0 : item.payPalFee;
                  item.evictionPayPalFee = item.evictionPayPalFee?.toString() === "" ? 0 : item.evictionPayPalFee;
                  item.aosPayPalFee = item.aosPayPalFee?.toString() === "" ? 0 : item.aosPayPalFee;
                  item.dismissalPayPalFee = item.dismissalPayPalFee?.toString() === "" ? 0 : item.dismissalPayPalFee;
                  item.writPayPalFee = item.writPayPalFee?.toString() === "" ? 0 : item.writPayPalFee;
                  item.amendmentPayPalFee = item.amendmentPayPalFee?.toString() === "" ? 0 : item.amendmentPayPalFee;

                  item.payPalManual = item.payPalManual?.toString() === "" ? 0 : item.payPalManual;
                  item.evictionPayPalManual = item.evictionPayPalManual?.toString() === "" ? 0 : item.evictionPayPalManual;
                  item.aosPayPalManual = item.aosPayPalManual?.toString() === "" ? 0 : item.aosPayPalManual;
                  item.dismissalPayPalManual = item.dismissalPayPalManual?.toString() === "" ? 0 : item.dismissalPayPalManual;
                  item.writPayPalManual = item.writPayPalManual?.toString() === "" ? 0 : item.writPayPalManual;
                  item.amendmentPayPalManual = item.amendmentPayPalManual?.toString() === "" ? 0 : item.amendmentPayPalManual;

                  item.invoiceNo = item.invoiceNo && item.invoiceNo.length > 0 ? item.invoiceNo : "";
                  item.evictionInvoiceNo = item.evictionInvoiceNo && item.evictionInvoiceNo.length > 0 ? item.evictionInvoiceNo : "";
                  item.aosInvoiceNo = item.aosInvoiceNo && item.aosInvoiceNo.length > 0 ? item.aosInvoiceNo : "";
                  item.dismissalInvoiceNo = item.dismissalInvoiceNo && item.dismissalInvoiceNo.length > 0 ? item.dismissalInvoiceNo : "";
                  item.writInvoiceNo = item.writInvoiceNo && item.writInvoiceNo.length > 0 ? item.writInvoiceNo : "";
                  item.amendmentInvoiceNo = item.amendmentInvoiceNo && item.amendmentInvoiceNo.length > 0 ? item.amendmentInvoiceNo : "";


                  item.checkNo = item.checkNo?.length > 0 ? item.checkNo : "";
                  item.evictionCheckNo = item.evictionCheckNo?.length > 0 ? item.evictionCheckNo : "";
                  item.aosCheckNo = item.aosCheckNo?.length > 0 ? item.aosCheckNo : "";
                  item.dismissalCheckNo = item.dismissalCheckNo?.length > 0 ? item.dismissalCheckNo : "";
                  item.writCheckNo = item.writCheckNo?.length > 0 ? item.writCheckNo : "";
                  item.amendmentCheckNo = item.amendmentCheckNo?.length > 0 ? item.amendmentCheckNo : "";

                  item.evictionEfileFee = item.evictionEfileFee?.toString() === "" ? 0 : item.evictionEfileFee;
                  item.c2CServiceExpFee = item.c2CServiceExpFee?.toString() === "" ? 0 : item.c2CServiceExpFee;
                  item.c2CEvictionFee = item.c2CEvictionFee?.toString() === "" ? 0 : item.c2CEvictionFee;
                  item.sheriffFee = item.sheriffFee?.toString() === "" ? 0 : item.sheriffFee;
                  item.c2CServiceFee = item.c2CServiceFee?.toString() === "" ? 0 : item.c2CServiceFee;
                  item.eaFee = item.eaFee?.toString() === "" ? 0 : item.eaFee;

                  // Mapping the date fields from CSV (formatted as mm/dd/yyyy) to DateTime format
   //                item.created = item.created ? new Date(item.created) : null;
   //                item.filedDate = item.filedDate ? new Date(moment(item.filedDate, 'MM/DD/YYYY').toISOString()) : null;

   //                item.invoiceDate = item.invoiceDate ? new Date(moment(item.invoiceDate, 'MM/DD/YYYY').toISOString()) : null;
   //                item.evictionInvoiceDate = item.evictionInvoiceDate ? new Date(moment(item.evictionInvoiceDate, 'MM/DD/YYYY').toISOString()) : null;
   //                item.aosInvoiceDate = item.aosInvoiceDate ? new Date(moment(item.aosInvoiceDate, 'MM/DD/YYYY').toISOString()) : null;
   //                item.dismissalInvoiceDate = item.dismissalInvoiceDate ? new Date(moment(item.dismissalInvoiceDate, 'MM/DD/YYYY').toISOString()) : null;
   //                item.writInvoiceDate = item.writInvoiceDate ? new Date(moment(item.writInvoiceDate, 'MM/DD/YYYY').toISOString()) : null;
   //                item.amendmentInvoiceDate = item.amendmentInvoiceDate ? new Date(moment(item.amendmentInvoiceDate, 'MM/DD/YYYY').toISOString()) : null;

   //                item.datePaid = item.datePaid ? new Date(moment(item.datePaid, 'MM/DD/YYYY').toISOString()) : null;
   //                item.eFileDatePaid = item.eFileDatePaid ? new Date(moment(item.eFileDatePaid, 'MM/DD/YYYY').toISOString()) : null;
   //                item.evictionDatePaid = item.evictionDatePaid ? new Date(moment(item.evictionDatePaid, 'MM/DD/YYYY').toISOString()) : null;
   //                item.aosDatePaid = item.aosDatePaid ? new Date(moment(item.aosDatePaid, 'MM/DD/YYYY').toISOString()) : null;
   //                item.dismissalDatePaid = item.dismissalDatePaid ? new Date(moment(item.dismissalDatePaid, 'MM/DD/YYYY').toISOString()) : null;
   //                item.writDatePaid = item.writDatePaid ? new Date(moment(item.writDatePaid, 'MM/DD/YYYY').toISOString()) : null;
   //                item.amendmentDatePaid = item.amendmentDatePaid ? new Date(moment(item.amendmentDatePaid, 'MM/DD/YYYY').toISOString()) : null;

   //                item.serverReceived = item.serverReceived ? new Date(moment(item.serverReceived, 'MM/DD/YYYY').toISOString()) : null;
   //                item.serviceDate = item.serviceDate ? new Date(moment(item.serviceDate, 'MM/DD/YYYY').toISOString()) : null;
   //                // item.payrollDate = item.payrollDate ? new Date(moment(item.payrollDate, 'MM/DD/YYYY').toISOString()) : null;
   //                item.payrollDate = item.payrollDate ? 
   //  (moment(item.payrollDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.payrollDate, 'MM/DD/YYYY').toISOString()) : null) 
   //  : null;
   //                item.commissionDate = item.commissionDate ? new Date(moment(item.commissionDate, 'MM/DD/YYYY').toISOString()) : null;
   //                item.officeCheckedDate = item.officeCheckedDate
   //                   ? new Date(item.officeCheckedDate)  // Convert string to Date object
   //                   : null;
   //                item.serviceDayCal = (item.serviceDayCal === "null" || item.serviceDayCal === null || item.serviceDayCal === undefined)
   //                   ? null
   //                   : parseInt(item.serviceDayCal.toString(), 10);

   //                item.paidServer = item.paidServer?.toString() === "" ? null : item.paidServer;
   //                item.evictionFiledDate = item.evictionFiledDate ? new Date(moment(item.evictionFiledDate, 'MM/DD/YYYY').toISOString()) : null;;
   //                item.aosFiledDate = item.aosFiledDate ? new Date(moment(item.aosFiledDate, 'MM/DD/YYYY').toISOString()) : null;;
   //                item.dismissalFiledDate = item.dismissalFiledDate ? new Date(moment(item.dismissalFiledDate, 'MM/DD/YYYY').toISOString()) : null;;
   //                item.dismissalApplicantDate = null;
   //                item.writFiledDate = item.writFiledDate ? new Date(moment(item.writFiledDate, 'MM/DD/YYYY').toISOString()) : null;;
   //                item.writApplicantDate = null;
   //                item.amendmentFiledDate = item.amendmentFiledDate ? new Date(moment(item.amendmentFiledDate, 'MM/DD/YYYY').toISOString()) : null;;
   //                item.amendmentApplicantDate = null;

   item.created = item.created ? new Date(item.created) : null;
                  item.filedDate = item.filedDate ? 
    (moment(item.filedDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.filedDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;

                  item.invoiceDate = item.invoiceDate ? 
    (moment(item.invoiceDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.invoiceDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.evictionInvoiceDate = item.evictionInvoiceDate ? 
    (moment(item.evictionInvoiceDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.evictionInvoiceDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.aosInvoiceDate = item.aosInvoiceDate ? 
    (moment(item.aosInvoiceDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.aosInvoiceDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.dismissalInvoiceDate = item.dismissalInvoiceDate ? 
    (moment(item.dismissalInvoiceDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.dismissalInvoiceDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.writInvoiceDate = item.writInvoiceDate ? 
    (moment(item.writInvoiceDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.writInvoiceDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.amendmentInvoiceDate = item.amendmentInvoiceDate ? 
    (moment(item.amendmentInvoiceDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.amendmentInvoiceDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;

                  item.datePaid = item.datePaid ? 
    (moment(item.datePaid, 'MM/DD/YYYY').isValid() ? new Date(moment(item.datePaid, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.eFileDatePaid = item.eFileDatePaid ? 
    (moment(item.eFileDatePaid, 'MM/DD/YYYY').isValid() ? new Date(moment(item.eFileDatePaid, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.evictionDatePaid = item.evictionDatePaid ? 
    (moment(item.evictionDatePaid, 'MM/DD/YYYY').isValid() ? new Date(moment(item.evictionDatePaid, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.aosDatePaid = item.aosDatePaid ? 
    (moment(item.aosDatePaid, 'MM/DD/YYYY').isValid() ? new Date(moment(item.aosDatePaid, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.dismissalDatePaid = item.dismissalDatePaid ? 
    (moment(item.dismissalDatePaid, 'MM/DD/YYYY').isValid() ? new Date(moment(item.dismissalDatePaid, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.writDatePaid = item.writDatePaid ? 
    (moment(item.writDatePaid, 'MM/DD/YYYY').isValid() ? new Date(moment(item.writDatePaid, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.amendmentDatePaid = item.amendmentDatePaid ? 
    (moment(item.amendmentDatePaid, 'MM/DD/YYYY').isValid() ? new Date(moment(item.amendmentDatePaid, 'MM/DD/YYYY').toISOString()) : null) 
    : null;

                  item.serverReceived = item.serverReceived ? 
    (moment(item.serverReceived, 'MM/DD/YYYY').isValid() ? new Date(moment(item.serverReceived, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.serviceDate = item.serviceDate ? 
    (moment(item.serviceDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.serviceDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
   //  item.payrollDate = item.payrollDate ? new Date(moment(item.payrollDate, 'MM/DD/YYYY').toISOString()) : null;
   //                item.payrollDate = item.payrollDate ? 
   //  (moment(item.payrollDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.payrollDate, 'MM/DD/YYYY').toISOString()) : null) 
   //  : null;

   item.payrollDate = item.payrollDate 
    ? // Check if payrollDate contains any of the invalid variations (NA, n/a, N.A., N.a., etc.)
      (/^(N\s?\/?\s?A|N\s?\.?\s?A|N\s?\.?a\.$)$/i.test(item.payrollDate.toString().trim()) 
        ? new Date(new Date('01/01/1111').setHours(12))  // Add 12 hours to the invalid date
        : moment(item.payrollDate, 'MM/DD/YYYY').isValid()  // Check if the date is valid
          ? new Date(moment(item.payrollDate, 'MM/DD/YYYY').toISOString())  // Convert and keep the valid date
          : null)  // If it's not a valid date, set it to null
    : null;
                  item.commissionDate = item.commissionDate ? 
    (moment(item.commissionDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.commissionDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  // item.officeCheckedDate = item.officeCheckedDate
                  //    ? new Date(item.officeCheckedDate)  // Convert string to Date object
                  //    : null;
                     item.officeCheckedDate = item.officeCheckedDate 
    ? !isNaN(new Date(item.officeCheckedDate).getTime()) 
        ? new Date(item.officeCheckedDate)  // Valid Date
        : null  // Invalid Date
    : null;  // If item.officeCheckedDate is null or undefined
                  item.serviceDayCal = (item.serviceDayCal === "null" || item.serviceDayCal === null || item.serviceDayCal === undefined)
                     ? null
                     : parseInt(item.serviceDayCal.toString(), 10);

                  item.paidServer = item.paidServer?.toString() === "" ? null : item.paidServer;
                  item.evictionFiledDate = item.evictionFiledDate ? 
    (moment(item.evictionFiledDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.evictionFiledDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.aosFiledDate = item.aosFiledDate ? 
    (moment(item.aosFiledDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.aosFiledDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.dismissalFiledDate = item.dismissalFiledDate ? 
    (moment(item.dismissalFiledDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.dismissalFiledDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.dismissalApplicantDate = null;
                  item.writFiledDate = item.writFiledDate ? 
    (moment(item.writFiledDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.writFiledDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
                  item.writApplicantDate = null;
                  item.amendmentFiledDate = item.amendmentFiledDate ? 
    (moment(item.amendmentFiledDate, 'MM/DD/YYYY').isValid() ? new Date(moment(item.amendmentFiledDate, 'MM/DD/YYYY').toISOString()) : null) 
    : null;
    item.amendmentApplicantDate = null; 
                  return item; // Return the modified item
               });
               props.setImportCsvPopUp(false, true);
               const type = props.activeTab == "Accounting Queue" ? "Accounting" : filingType;

               toast.success("Import is in Progress");
               //   setShowSpinner(true);
               // Import the cases
               const response = await FilingTransactionService.reImportFilingTransaction(formattedData,headers, type);

               if (response.status === HttpStatusCode.OK) {

                  const message = {
                     __html: response.data.message
                  };
                  if (response.data.isSuccess == true) {
                     toast.success(response.data.message);
                  }
                  else {
                     toast.error(response.data.message);
                  }
                  props.showConfirmation(message);
                  //toast.success("Successfully Imported CSV");
                  getGridData();
                  props.setImportCsvPopUp(false, true);
               } else {
                  //toast.error("Failed to import CSV.");
               }

            }
         } catch (error) {
            console.error("An error occurred:", error);
         } finally {
            // setShowSpinner(true);
            setToggleSpinner(false);
         }
      }
   };

   const getGridData = () => {
      switch (filingType) {
         case "Eviction":
            getFilingTransactions(1, 100, filingTransactions.searchParam, "Eviction",filingTransactions.companyId, filingTransactions.fromDate, filingTransactions.toDate,filingTransactions.datePaidFromDate, filingTransactions.datePaidToDate, filingTransactions.blankOption,filingTransactions.nonBlankOption,filingTransactions.county);
            // getFilingTransactions(1, 100, '', "Eviction");
            break;
         case "AOS":
            getFilingTransactions(1, 100, aosFilingTransactions.searchParam, "AOS",aosFilingTransactions.companyId, aosFilingTransactions.fromDate, aosFilingTransactions.toDate,aosFilingTransactions.datePaidFromDate, aosFilingTransactions.datePaidToDate, aosFilingTransactions.blankOption,aosFilingTransactions.nonBlankOption,aosFilingTransactions.county);

            // getFilingTransactions(1, 100, '', "AOS");
            break;
         case "Dismissal":
            getFilingTransactions(1, 100, dismissalsFilingTransactions.searchParam, "Dismissal",dismissalsFilingTransactions.companyId, dismissalsFilingTransactions.fromDate, dismissalsFilingTransactions.toDate,dismissalsFilingTransactions.datePaidFromDate, dismissalsFilingTransactions.datePaidToDate, dismissalsFilingTransactions.blankOption,dismissalsFilingTransactions.nonBlankOption,dismissalsFilingTransactions.county);

            // getFilingTransactions(1, 100, '', "Dismissal");
            break;
         case "Writ":
            getFilingTransactions(1, 100, writsFilingTransactions.searchParam, "Writ",writsFilingTransactions.companyId, writsFilingTransactions.fromDate, writsFilingTransactions.toDate,writsFilingTransactions.datePaidFromDate, writsFilingTransactions.datePaidToDate, writsFilingTransactions.blankOption,writsFilingTransactions.nonBlankOption,writsFilingTransactions.county);

            // getFilingTransactions(1, 100, '', "Writ");
            break;
         case "Amendment":
            getFilingTransactions(1, 100, amendmentsFilingTransactions.searchParam, "Amendment",amendmentsFilingTransactions.companyId, amendmentsFilingTransactions.fromDate, amendmentsFilingTransactions.toDate,amendmentsFilingTransactions.datePaidFromDate, amendmentsFilingTransactions.datePaidToDate, amendmentsFilingTransactions.blankOption,amendmentsFilingTransactions.nonBlankOption,amendmentsFilingTransactions.county);

            // getFilingTransactions(1, 100, '', "Amendment");
            break;
         default:
            break;
      }
      if (props.activeTab == "Accounting Queue") {
         getAccountingQueue(1, 100, accountingQueue.searchParam, accountingQueue.fromDatePaid, accountingQueue.toDatePaid,
            accountingQueue.type, accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll,
            accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption,accountingQueue.nonBlankOption,accountingQueue.county);
         // getAccountingQueue(1, 100, '');
      }
      setSelectedFilingTransactionId([]);
      setSelectedFilteredFilingTransactionId([]);
      setBulkRecords([]);
      setFilteredRecords([]);
      setAOSBulkRecords([]);
      setWritBulkRecords([]);
      setAmendmentBulkRecords([]);
      setDismissalBulkRecords([]);

   };

   /**
    *
    * @param data imported data from csv
    */
   const loadUserData = (data: IImportExistingBillingTransactionCSV[]) => {
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

         const formattedData = data.map((item: IImportExistingBillingTransactionCSV) => {
            return {
               Remove: "",
               ...item,
               //    TenantUnit: item.TenantUnit
               //       ? item.TenantUnit.toString()
               //       : item.TenantUnit,
               //    EvictionTotalRentDue: item.EvictionTotalRentDue.toString().replace(/[^0-9.]/g, ""),
               //    PropertyPhone: item.PropertyPhone.toString().trim(),
            };
         });
         setGridData(formattedData);
         setToggleSpinner(false);
         handleImportExistingCases(formattedData);
      } catch (error) {
         setShowUploadCsv(true);
         setToggleSpinner(false);
         setShowInvalidCSVMessage(true);
      }
   };

   //    const handleFileUpload = (data: IImportExistingBillingTransactionCSV[]) => {
   //     ;
   //       if (data.length === 0) {
   //          setToggleSpinner(false);
   //          toast.error(
   //             "The uploaded file is empty. Please make sure the file is not empty and try again."
   //          );
   //          return;
   //       }
   //       // Trim spaces from each cell in the data and remove entries with empty string keys
   //       const trimmedData = data.map(record => {
   //          const trimmedRecord: Partial<IImportExistingBillingTransactionCSV> = {};
   //          for (const key in record) {
   //             if (record.hasOwnProperty(key)) {
   //                const trimmedKey = key.trim();
   //                if (trimmedKey !== "") {
   //                   const value = record[key as keyof IImportExistingBillingTransactionCSV];
   //                   if (typeof value === 'string') {
   //                      trimmedRecord[trimmedKey as keyof IImportExistingBillingTransactionCSV] = value.trim() as any;
   //                   } else {
   //                      trimmedRecord[trimmedKey as keyof IImportExistingBillingTransactionCSV] = value as any;
   //                   }
   //                }
   //             }
   //          }

   //          return trimmedRecord as IImportExistingBillingTransactionCSV;
   //       });

   //       const keys = Object.keys(trimmedData[0]); 

   //          loadUserData(trimmedData);
   //    };

   const handleFileUpload = (data: IImportExistingBillingTransactionCSV[]) => {
      console.log("Raw Data", data);  // Log raw data to check if there are missing fields.

      // Filter out rows where all required fields are empty
      const validData = data.filter(record => {
         // Check if any required field has data (you can adjust the fields depending on which are required)
         return Object.values(record).some(value => value !== null && value !== undefined && value !== '');
      });

      if (validData.length === 0) {
         setToggleSpinner(false);
         toast.error("The uploaded file has no valid records. Please ensure at least some required fields are populated.");
         return;
      }

      // Now process the valid data (trim and handle missing fields)
      //  const trimmedData: IImportExistingBillingTransactionCSV[] = validData.map(record => {
      //     const trimmedRecord: IImportExistingBillingTransactionCSV = {
      //        Id: record.Id || "", // Provide default values if necessary
      //        ActionType: record.ActionType || "",
      //        created: record.created || null,
      //        ClientReferenceId: record.ClientReferenceId || null,
      //        County: record.County || "",
      //        CaseNumber: record.CaseNumber || "",
      //        FilerEmail: record.FilerEmail || "",
      //        TenantOne: record.TenantOne || "",
      //        EFileMethod: record.EFileMethod || "",
      //        EnvelopeId: record.EnvelopeId || "",
      //        filedDate: record.filedDate || null,
      //        EFilePaymentMethod: record.EFilePaymentMethod || "",
      //        InvoiceNo: record.InvoiceNo || "",
      //        invoiceDate: record.invoiceDate || null,
      //        datePaid: record.datePaid || null,
      //        CheckNo: record.CheckNo || "",
      //        PaymentNotes: record.PaymentNotes || "",
      //        CourtTransAmt: record.CourtTransAmt || 0,
      //        AddtlTenants: record.AddtlTenants || null,
      //        AndAllOtherOccupants: record.AndAllOtherOccupants || null,
      //        Expedited: record.Expedited || "",
      //        CompanyName: record.CompanyName || null,
      //        PropertyName: record.PropertyName || null,
      //        TenantAddressCombined: record.TenantAddressCombined || "",
      //        ProcessServerCompany: record.ProcessServerCompany || "",
      //        serverReceived: record.serverReceived || null,
      //        serviceDate: record.serviceDate || null,
      //        serviceDayCal: record.serviceDayCal || null,
      //        PaidServer: record.PaidServer || null,
      //        ServerPayAdminNotes: record.ServerPayAdminNotes || "",
      //        ServerSignature: record.ServerSignature || "",
      //        PersonalService: record.PersonalService || "",
      //        ServiceMethod: record.ServiceMethod || "",
      //        House: record.House || null,
      //        C2CServiceFee: record.C2CServiceFee || 0,
      //        SheriffFee: record.SheriffFee || 0,
      //        PayPalFee: record.PayPalFee || 0,
      //        PayPalManual: record.PayPalManual || 0,
      //        StateCourt: record.StateCourt || "",
      //        payrollDate: record.payrollDate || null,
      //        commissionDate: record.commissionDate || null,
      //        PaymentAmount: record.PaymentAmount || 0,
      //        Notes: record.Notes || "",
      //        officeCheckedDate: record.officeCheckedDate || null,
      //        OfficeCheckedBy: record.OfficeCheckedBy || "",
      //        OfficeCheckedNotes: record.OfficeCheckedNotes || "",
      //        PaymentAccount: record.PaymentAccount || "",
      //        EvictionCourtTransAmt: record.EvictionCourtTransAmt || null,
      //        EvictionEfileFee: record.EvictionEfileFee || null,
      //        C2CServiceExpFee: record.C2CServiceExpFee || null,
      //        C2CEvictionFee: record.C2CEvictionFee || null,
      //        EAFee: record.EAFee || null,
      //        EvictionPaymentAmount: record.EvictionPaymentAmount || 0,
      //        EvictionPayPalFee: record.EvictionPayPalFee || null,
      //        EvictionPayPalManual: record.EvictionPayPalManual || null,
      //        evictionFiledDate: record.evictionFiledDate || null,
      //        evictionInvoiceDate: record.evictionInvoiceDate || null,
      //        EvictionInvoiceNo: record.EvictionInvoiceNo || "",
      //        evictionDatePaid: record.evictionDatePaid || null,
      //        EvictionCheckNo: record.EvictionCheckNo || "",
      //     };

      //     return trimmedRecord;
      //  });

      console.log("Trimmed Data", validData);  // Log trimmed data to inspect final structure

      // Proceed to load user data with the valid, trimmed data
      loadUserData(validData);  // Now, the data should be of type IImportExistingBillingTransactionCSV[]
   };
   const handleFileUploadError = (error: Error) => {
      if (error.message === "File size exceeds the maximum allowed size.") {
         setshowMaxRecords(true);
      } else {
         setshowMaxRecords(false);
      }
      setToggleSpinner(false);
   };


   return (
      <>
         <Modal
            showModal={props.importCsvPopUp}
            onClose={() => {
               props.setImportCsvPopUp(false, false);
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
                                       //    onDataLoaded={handleFileUpload}
                                       onDataLoaded={(data: IImportExistingBillingTransactionCSV[]) => {
                                          console.log("Filing Transaction Data loaded from CSV:", data);
                                          handleFileUpload(data);  // Pass the parsed data to your handler
                                       }}
                                       onError={(error: Error) =>
                                          handleFileUploadError(error)
                                       }
                                       filingType={"FE"}
                                       className="sr-only"
                                    />
                                 </Form>
                              )}
                           </Formik>
                        </div>
                     </div>
                  </div>
               )}
               {showEmptyRecordMessage && (
                  <p className="text-center text-red-500	">No record found </p>
               )}
               {showMaxRecords && (
                  <p className="text-center text-red-500	">
                     File size exceeds the maximum allowed size.
                  </p>
               )}
            </div>
         </Modal>
      </>
   );
};

export default FilingTransaction_ImportCsv;
