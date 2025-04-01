import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { FaFileInvoice, FaPaperPlane, FaSyncAlt } from "react-icons/fa";
import GenerateInvoiceModal from "./GenerateInvoiceModal";
import SendInvoiceModal from "./SendInvoiceModal";
import Spinner from "components/common/spinner/Spinner";
import Button from "components/common/button/Button";
import Pagination from "components/common/pagination/Pagination";
import Grid from "components/common/grid/GridWithToolTip";
import IconButton from "components/common/button/IconButton";
import { HttpStatusCode, InvoiceEmailStatus, InvoiceStatus, UserRole } from "utils/enum";
import { formattedDate, toCssClassName } from "utils/helper";
import InvoicesService from "services/invoices.service";
import HelperViewPdfService from "services/helperViewPdfService";
import { ICustomerRef, IInvoiceItem, ISendInvoiceEmail, IGroupLine } from "interfaces/invoices.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { useAccountingContext } from "../AccountingContext";
import { useAuth } from "context/AuthContext";
import Modal from "components/common/popup/PopUp";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";

type InvoicesGridProps = {};

const initialColumnMapping: IGridHeader[] = [
   { columnName: "action", label: "Action", className: "action" },
   { columnName: "dueDate", label: "DueDate" },
   { columnName: "docNumber", label: "InvoiceNo", className:'text-right' },
   { columnName: "invoiceDetails", label: "InvoiceDetails" },
   { columnName: "customer", label: "Customer" },
   { columnName: "propertyName", label: "PropertyName" },
   { columnName: "status", label: "Status" },
   { columnName: "emailStatus", label: "EmailStatus" },
   { columnName: "totalAmt", label: "TotalAmount", className: "TotalAmount" },
];

const InvoicesGrid = (props: InvoicesGridProps) => {
   const {
      invoices,
      getInvoices,
      showSpinner,
      setShowSpinner,
      allCompanies,
      getAllCompanies
   } = useAccountingContext();
   const { userRole } = useAuth();
   const queryParams = new URLSearchParams(window.location.search);
   const code = queryParams.get('code');
   const state = queryParams.get('state');
   const realmId = queryParams.get('realmId');
   const isMounted = useRef(true);
   const isMountedInvoice = useRef(true);
   const [apiCalled, setApiCalled] = useState(false);
   const [openGenerateInvoiceModal, setOpenGenerateInvoiceModal] = useState<boolean>(false);
   const [invoice, setInvoice] = useState<IInvoiceItem | null>(null);
   const [openSendInvoiceModal, setOpenSendInvoiceModal] = useState<boolean>(false);
   const [openConfirmationModal, setOpenConfirmationModal] = useState<boolean>(false);

   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(invoices.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(invoices.totalPages > 1);

   useEffect(() => {
      const fetchData = async () => {
         try {
            if (code && state && !apiCalled) {
               const response = await InvoicesService.callback(code, state);
               if (response) {
                  setApiCalled(true); // Mark API call as done
               }
            }
         } catch (error) {
            console.error('Error fetching data:', error);
         }
      };

      if (isMounted.current) {
         fetchData();
         isMounted.current = false;
      };
   }, [code, state, realmId, apiCalled]);

   useEffect(() => {
      if (isMountedInvoice.current) {
         getInvoices(1, 100, "");
         isMountedInvoice.current = false;
      };

   }, []);

   useEffect(() => {
      if (isMounted.current) {
         getAllCompanies();
         isMounted.current = false;
      }

   }, [allCompanies, getAllCompanies]);

   useEffect(() => {
      // Filter columns based on user role
      const filteredColumns = userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)
         ? initialColumnMapping
         : initialColumnMapping.filter(column =>
            column.columnName !== "action" &&
            column.columnName !== "emailStatus" &&
            column.columnName !== "invoiceDetails"
         );

      setVisibleColumns(filteredColumns);
   }, [userRole]);

   const handleAuthorize = async () => {
      try {
         setShowSpinner(true);
         const response = await InvoicesService.authorize();
         if (response.status === HttpStatusCode.OK) {
            window.open(response.data, '_blank');
         } else {
            // toast.error("An unexpected error occur");
         }
      } catch (error) {
         console.error("Error in handleAuthorize:", error);
      } finally {
         setShowSpinner(false);
      }
   };

   const handleSendEmail = async () => {
      try {
         setShowSpinner(true);
         setOpenConfirmationModal(false);

         if(invoice !== null) {
            // Define payload for sending invoice email
            const payload: ISendInvoiceEmail = {
               invoiceId: invoice.id,
               email: null // If not provided, the invoice will be sent to the billing email address
            };

            const response = await InvoicesService.sendInvoiceEmail(payload);
            if (response.status === HttpStatusCode.OK) {
               setInvoice(null);
               getInvoices(1, 100);
               toast.success("Invoice sent successfully");
            }
         } else {
            console.log('Invoice is not selected');
         }
      } catch (error) {
         console.log("handleSendEmail", error);
      } finally {
         setInvoice(null);
         setShowSpinner(false);
      }
   };

   const handlePreviewInvoice = async (invoiceId: string) => {
      try {
         // setShowSpinner(true);
         const response = await InvoicesService.previewInvoice(invoiceId);
         if (response.status === HttpStatusCode.OK) {
            if (response.data.isSuccess) {
               const base64String = response.data.base64String;
               const byteCharacters = atob(base64String);
               const byteNumbers = new Array(byteCharacters.length);
               for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
               }
               const byteArray = new Uint8Array(byteNumbers);
               const file = new Blob([byteArray], { type: 'application/pdf' });

               // Build a URL from the file
               const fileURL = URL.createObjectURL(file);

               // Open the URL in a new window
               const pdfWindow = window.open();
               if (pdfWindow) {
                  pdfWindow.location.href = fileURL;
               }
            }
         } else {
            console.error('Error downloading invoice:', response.statusText);
         }
      } catch (error) {
         console.error("Error in downloadInvoice:", error);
      } finally {
         // setShowSpinner(false);
      }
   };

   const handleInvoiceDetailPdf = async (invoiceId: string) => {
      try {
         // setShowSpinner(true);
         const response = await InvoicesService.previewInvoiceDetail(invoiceId);
         if (response.status === HttpStatusCode.OK) {
            const pdfLink = response.data.base64String; // this is a pdf link
            await HelperViewPdfService.GetPdfView(pdfLink);
         } else {
            console.error('Error downloading invoice detail:', response.statusText);
         }
      } catch (error) {
         console.error('Error downloading invoice detail:', error);
      } finally {
         // setShowSpinner(false);
      }
   };

   const handleFrontButton = () => {
      if (invoices.currentPage < invoices.totalPages) {
         const updatedCurrentPage = invoices.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getInvoices(
            updatedCurrentPage,
            invoices.pageSize
         );
      }
   };

   const handleBackButton = () => {
      if (
         invoices.currentPage > 1 &&
         invoices.currentPage <= invoices.totalPages
      ) {
         const updatedCurrentPage = invoices.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(invoices.currentPage > 1);
         // back button get late notices
         getInvoices(
            updatedCurrentPage,
            invoices.pageSize
         );
      }
   };

   const getCellClassName = (property: string, cellValue: any): string => {
      let cellClass = "";

      if (property === "emailStatus") {
         switch (cellValue) {
            case InvoiceEmailStatus.NeedToSend:
               cellClass = "NeedToSend";
               break;
            case InvoiceEmailStatus.EmailSent:
               cellClass = "EmailSent";
               break;
            case InvoiceEmailStatus.NotSet:
               cellClass = "NotSet";
               break;
            default:
               cellClass = "";
               break;
         }
      } else if (property === "status") {
         switch (cellValue) {
            case InvoiceStatus.PAID:
               cellClass = "status-paid";
               break;
            case InvoiceStatus.OVERDUE:
               cellClass = "status-overdue";
               break;
            case InvoiceStatus.PENDING:
               cellClass = "status-due";
               break;
            default:
               cellClass = "";
               break;
         }
      }

      return cellClass;
   };

   const handleCellRendered = (cellIndex: number, data: IInvoiceItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const cellClass = getCellClassName(propertyName, cellValue);

      const renderers: Record<string, () => JSX.Element> = {
         action: () => (
            <div className="flex items-center gap-2">
               {(userRole.includes(UserRole.C2CAdmin)|| userRole.includes(UserRole.ChiefAdmin)) && (
                  <IconButton
                     type={"button"}
                     className="cursor-pointer text-[#2472db]"
                     icon={<FaPaperPlane className="h-3.5 w-3.5" />}
                     disabled={showSpinner || data.status === InvoiceStatus.PAID}
                     handleClick={() => {
                        if (data.emailStatus === InvoiceEmailStatus.NotSet) {
                           setInvoice(data);
                           setOpenSendInvoiceModal(true);
                        } else {
                           setOpenConfirmationModal(true);
                           setInvoice(data)
                           //handleSendEmail(data);
                        }
                     }}
                  />
               )}
            </div>
         ),
         dueDate: () => cellValue ? <span>{formattedDate(cellValue)}</span> : <span></span>,
         // dueDate: () => <>{formattedDate(cellValue)}</>,
         docNumber: () => renderInvoiceNumber(data),
         customer: () => renderCustomer(data.customerRef),
         propertyName: () => <>{renderProperty(data.line)}</>,
         totalAmt: () => <>${cellValue}</>,
         invoiceDetails: () => renderInvoiceDetails(data)
      };

      const renderer = renderers[propertyName] || (() => formattedCell(cellValue));

      if (visibleColumns.find(x => x.label === columnName)) {

         return (
            <td
               key={cellIndex}
               className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929]  ${toCssClassName(columnName)} ${cellClass}`}
            >
               {renderer()}
            </td>
         );
      }

      return <></>;
   };

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   const renderInvoiceNumber = (data: IInvoiceItem) => (
      <span
         onClick={() => handlePreviewInvoice(data.id)}
         className="text-[#2472db] cursor-pointer"
      >
         {data.docNumber}
      </span>
   )

   const renderInvoiceDetails = (data: IInvoiceItem) => (
      <span
         onClick={() => handleInvoiceDetailPdf(data.id)}
         className="text-[#2472db] cursor-pointer"
      >
         Invoice_{data.docNumber}
      </span>
   )

   const renderCustomer = (customer: ICustomerRef) => (
      <span>{customer.name ?? ""}</span>
   );

   const renderProperty = (lines: IGroupLine[]) => {
      return lines
         .filter(line => line.detailType === 'GroupLineDetail')
         .map(line => <div key={0}>{line.description}</div>);
   };

   return (
      <div className="pt-1.5 lg:pt-2 accounting_grid invoices_grid">
         <div className="relative -mr-0.5">
            <div className="text-right flex items-center justify-end gap-1.5 md:gap-2 flex-wrap">
               {(userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin))&& (
                  <Button
                     isRounded={false}
                     title={"Generate Invoices"}
                     type={"button"}
                     icon={<FaFileInvoice className="mr-1.5" />}
                     handleClick={() => setOpenGenerateInvoiceModal(true)}
                     disabled={showSpinner}
                     classes="bg-[#4DB452] px-3 md:px-3.5 py-1.5 font-medium text-[10.4px] md:text-[11px] text-white rounded-md shadow-lg inline-flex items-center relative z-[1] font-semibold"
                  />
               )}
               <Button
                  isRounded={false}
                  title={"Fetch Invoices"}
                  type={"button"}
                  icon={<FaSyncAlt className="mr-1.5" />}
                  handleClick={() => getInvoices(1, 100)}
                  disabled={showSpinner}
                  classes="bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10.4px] md:text-[11px] text-white rounded-md shadow-lg inline-flex items-center relative z-[1] font-semibold"
               />
               {/* <Button
                  isRounded={false}
                  title={"Connect to QuickBooks"}
                  type={"button"}
                  handleClick={() => handleAuthorize()}
                  classes="bg-[#4DB452] px-3.5 md:px-4 py-2 font-medium text-[12px] md:text-[13px] text-white rounded-md shadow-lg inline-flex items-center"
               /> */}
            </div>
            <div className="relative -mr-0.5">
               {showSpinner && <Spinner />}
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={invoices.items}
                     // handleSelectAllChange={handleSelectAllChange}
                     // selectAll={selectAll}
                     cellRenderer={(data: IInvoiceItem, rowIndex: number, cellIndex: number) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={invoices.pageSize}
                     currentPage={invoices.currentPage}
                     totalPages={invoices.totalPages}
                     totalRecords={invoices.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               </>
            </div>
         </div>
         {openGenerateInvoiceModal && (
            <GenerateInvoiceModal
               openModal={openGenerateInvoiceModal}
               setOpenModal={(open: boolean) => setOpenGenerateInvoiceModal(open)}
            />
         )}
         {openSendInvoiceModal && (
            <SendInvoiceModal
               openModal={openSendInvoiceModal}
               setOpenModal={(open: boolean) => setOpenSendInvoiceModal(open)}
               invoice={invoice}
            />
         )}

         {openConfirmationModal && (
            <ConfirmationBox
               heading={"Confirmation"}
               message={`Are you sure you want to send the invoice to ${invoice?.customerRef?.name}?`}
               showConfirmation={openConfirmationModal}
               confirmButtonTitle="Yes"
               closePopup={() => setOpenConfirmationModal(false)}
               handleSubmit={handleSendEmail}
            />
         )}
      </div>
   );
};

export default InvoicesGrid;