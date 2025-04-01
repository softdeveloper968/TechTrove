import React, { useState, useEffect, useRef } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaCopy, FaEdit, FaEye, FaTimes } from "react-icons/fa";
import { useAuth } from "context/AuthContext";
import { useEmailQueueContext } from "../EmailQueueContext";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import GridCheckbox from "components/formik/GridCheckBox";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import IconButton from "components/common/button/IconButton";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import { IGridHeader } from "interfaces/grid-interface";
import { IEditEmailQueueItem, IEmailQueueItem } from "interfaces/email-queue.interface";
import { getStatusClassName, fileToBase64, formatCurrency, formatZip, convertUtcToEst, convertAndFormatDate, adjustDateSystemTimezoneDate, toCssClassName } from "utils/helper";
import EmailQueueService from "services/email-queue.service";
import HelperViewPdfService from "services/helperViewPdfService";
import Search_Filter from "./EmailQueueSearchFilter";
import { getEmailQueueGridenderers } from "utils/gridFormatHelpers";
import { date } from "yup";

const EmailQueueEditModal = React.lazy(() => import("./EmailQueueEditModal"))
const EmailQueueDetails = React.lazy(() => import("./EmailQueueDetails"))

const EmailQueueGrid = () => {
   const {
      showSpinner,
      emailQueues,
      selectedEmailTaskIds,
      filteredRecords,
      getEmailQueues,
      setSelectedEmailTaskIds,
      setSelectedEmailQueueIds,
      setShowSpinner,
      getAllCompanies,
      getServers,
      getAllCounties,
      setBulkRecords
   } = useEmailQueueContext();

   const { selectedStateValue } = useAuth();

   const initialColumnMapping: IGridHeader[] = [
      //    ...(userRole.includes(UserRole.C2CAdmin)
      //    ? [{
      //       columnName: "isChecked",
      //       // label: "isChecked",
      //       controlType: "checkbox",
      //       label: "Bulk Edit",
      //       toolTipInfo: "This checkbox represents bulk update only"
      //    }]
      //    : []
      // ),
      { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
      { columnName: "action", label: "Action", className: "action" },
      ...selectedStateValue.toLowerCase().trim() == "tx" ? [] : [{ columnName: "status", label: "Status" },],
      { columnName: "caseCreatedDate", label: "CaseCreatedDate" },
      { columnName: "taskStatus", label: "TaskStatus" },
      { columnName: "rejectedReason", label: "RejectedReason" },
      { columnName: "referenceId", label: "CaseReferenceId", className: 'text-right' },
      { columnName: "caseNo", label: "CaseNo" },
      { columnName: "documents", label: "PDF link" },
      { columnName: "county", label: "County" },
      { columnName: "processServerEmail", label: "ProcessServerEmail" },
      ...selectedStateValue == "TX" ? [{ columnName: "stateCourt", label: "CourtName" }] : [{ columnName: "stateCourt", label: "StateCourt" }],
      ...selectedStateValue.toLowerCase().trim() == "tx" ? [] : [{ columnName: "expedited", label: "Expedited" }],
      { columnName: "tenantZip", label: "TenantZip", className: 'text-right' },
      { columnName: "companyName", label: "CompanyName" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "description", label: "Description" },
      { columnName: "tenantOne", label: "TenantOne" },
      { columnName: "tenantAddressCombined", label: "TenantAddressCombined" },
      { columnName: "eFileFeeClient", label: "EfileFee", className: 'text-right' },
      { columnName: "evictionCourtFee", label: "CourtFee", className: 'text-right' },
      { columnName: "transactionfee", label: "CourtTransAmt", className: 'text-right' },
      { columnName: "evictionEnvelopeID", label: "EnvelopeID", className: 'text-right' },
      { columnName: "methodName", label: "eFileMethod" },
      { columnName: "evictionDateFiled", label: "DateFiled" },
      { columnName: "evictionPaymentMethod", label: "EvictionPaymentMethod" },
      { columnName: "paymentAccount", label: "PaymentAccount" },
      { columnName: "attorneyName", label: "AttorneyName" },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo", className: 'text-right' },
      { columnName: "evictionReason", label: "EvictionReason" },
      { columnName: "filerEmail", label: "EvictionFilerEmail" },
      { columnName: "envelopeIdHistory", label: "EvictionEnvelopeIdHistory" },

      // { columnName: "status", label: "Status" },

      // { columnName: "state", label: "State" },
      //  { columnName: "zip", label: "Zip" },

      // { columnName: "methodName", label: "FilingMethod" },
      // { columnName: "transactionfee", label: "EvictionTransactionAmt" },

      // { columnName: "referenceId", label: "ReferenceId" }, 

   ];

   const [openEditModal, setOpenEditModal] = useState<boolean>(false);
   const { userRole } = useAuth();
   const isMounted = useRef(true);
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(emailQueues.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(emailQueues.totalPages > 1);
   const [selectAll, setSelectAll] = useState<boolean>(false)
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(emailQueues.items.length).fill(false)
   );
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [newRowsSelected] = useState<boolean[]>([]);
   const [selectedData, setSelectedData] = useState<IEditEmailQueueItem | null>(null);
   const [isUpload, setIsUpload] = useState<boolean>(false);
   const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
   const [selectedLinkId, setSelectedLinkId] = useState<string>("");

   const initialValues: IEditEmailQueueItem = {
      id: selectedData?.id ?? "",
      caseNo: selectedData?.caseNo ?? "",
      taskId: selectedData?.taskId ?? "",
      caseType: selectedData?.caseType ?? "",
      processServerEmail: selectedData?.processServerEmail ?? "",
      description: selectedData?.description ?? "",
      document: selectedData?.description ?? "",
      expedited: selectedData?.expedited ?? "",
      county: selectedData?.county ?? "",
      taskStatus: selectedData?.taskStatus ?? "",
      evictionTransactionAmt: selectedData?.evictionTransactionAmt ?? "",
      //tenantOne: selectedData?.tenantOne ?? "",
      tenantZip: selectedData?.tenantZip ?? "",
      propertyName: selectedData?.propertyName ?? "",
      referenceId: selectedData?.referenceId ?? "",
      stateCourt: selectedData?.stateCourt ?? "",
      tenant1FirstName: selectedData?.tenant1FirstName ?? "",
      tenant1LastName: selectedData?.tenant1LastName ?? "",
      tenant1MiddleName: selectedData?.tenant1MiddleName ?? "",
      caseCreatedDate: selectedData
         ? new Date(convertAndFormatDate(selectedData.caseCreatedDate)).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
         })
         : "",
      // caseCreatedDate: selectedData ? formattedDate(selectedData.caseCreatedDate as string) : "",
      tenantAddress: selectedData?.tenantAddress ?? "",
      tenantUnit: selectedData?.tenantUnit ?? "",
      eFileFeeClient: selectedData?.eFileFeeClient ?? "",
      evictionCourtFee: selectedData?.evictionCourtFee ?? "",
      evictionEnvelopeID: selectedData?.evictionEnvelopeID ?? "",
      evictionDateFiled: selectedData?.evictionDateFiled
         ? new Date(convertAndFormatDate(selectedData.evictionDateFiled)).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
         })
         : "",
      // evictionDateFiled: selectedData ? formattedDate(selectedData.evictionDateFiled as string) : "",
      evictionPaymentMethod: selectedData?.evictionPaymentMethod ?? "",
      attorneyName: selectedData?.attorneyName ?? "",
      attorneyBarNo: selectedData?.attorneyBarNo ?? "",
      evictionReason: selectedData?.evictionReason ?? "",
      filerEmail: selectedData?.filerEmail ?? "",
      tenantCity: selectedData?.tenantCity ?? "",
      tenantState: selectedData?.tenantState ?? "",
      eFileMethod: selectedData?.eFileMethod ?? "",
      paymentAccount: selectedData?.paymentAccount ?? "",
   };

   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [currentCaseId, setCurrentCaseId] = useState<string>("");
   const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);
   const defaultPageSize = 300;

   useEffect(() => {
      if (!filteredRecords.length)
         setSelectAll(false);

   }, [filteredRecords]);

   useEffect(() => {
      if (isMounted.current) {
         getEmailQueues(1, defaultPageSize, '');
         getAllCounties();
         getAllCompanies();
         getServers();
         setSelectedEmailQueueIds([]);
         setSelectedEmailTaskIds([]);
         isMounted.current = false;
      }

      setSelectedRows(Array(emailQueues.items?.length).fill(false));
      setSelectAll(false);
      setCanPaginateBack(emailQueues.currentPage > 1);
      setCanPaginateFront(emailQueues.totalPages > 1);

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

   }, [getEmailQueues, userRole]);

   const handleFrontButton = () => {
      if (emailQueues.currentPage < emailQueues.totalPages) {
         const updatedCurrentPage = emailQueues.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         getEmailQueues(updatedCurrentPage, defaultPageSize, emailQueues.searchParam, emailQueues.companyId, emailQueues.county, emailQueues.serverId, emailQueues.isExpedited, emailQueues.isStateCourt, emailQueues.status, emailQueues.taskStatus, emailQueues.court ?? "");
      }
   };

   const handleSelectAllChange = (checked: boolean) => {
      const allIds: string[] = emailQueues.items
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");

      const allTaskIds: string[] = emailQueues.items
         .map((item) => item.taskId)
         .filter((taskId): taskId is string => typeof taskId === "string");


      if (checked) {
         // Update bulkRecords with unique items
         setBulkRecords(prev => {
            const existingIds = new Set(prev.map(item => item.taskId));
            const newItems = emailQueues.items.filter(item => !existingIds.has(item.taskId));
            return [...prev, ...newItems];
         });

         // Update selectedEmailQueueIds with unique ids
         setSelectedEmailQueueIds(prevIds => {
            const updatedIds = new Set([...prevIds, ...allIds]);
            return Array.from(updatedIds);

         });

         setSelectedEmailTaskIds(prevIds => {
            const updatedIds = new Set([...prevIds, ...allTaskIds]);
            return Array.from(updatedIds);
         });
      } else {
         // Remove items based on id from bulkRecords
         setBulkRecords(prevItems => prevItems.filter(record => !emailQueues.items.some(item => item.taskId === record.taskId)));

         // Remove ids based on id from selectedEmailQueueIds
         setSelectedEmailQueueIds(prevIds => prevIds.filter(id => !allIds.includes(id)));

         setSelectedEmailTaskIds(prevIds => prevIds.filter(id => !allTaskIds.includes(id)));
      }

      // Update selectAll state and selectedRows
      setSelectAll(checked);
      // setSelectedRows(Array(allIds.length).fill(checked));
      setSelectedRows(Array(allTaskIds.length).fill(checked));
   };

   const handleCheckBoxChange = (index: number, id: string, checked: boolean, taskId: string) => {
      if (shiftKeyPressed && lastClickedFilteredRowIndex !== -1 && emailQueues.items) {
         const start = Math.min(index, lastClickedFilteredRowIndex);
         const end = Math.max(index, lastClickedFilteredRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newRowsSelected[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (emailQueues.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         const selectedTaskIds = (emailQueues.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.taskId)
            .filter((taskId): taskId is string => typeof taskId === "string");

         emailQueues.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            setBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(item)); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //  setBulkRecords((prev)=>[...prev,item]);
         })
         setSelectedEmailQueueIds(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         setSelectedEmailTaskIds(prevIds => [...new Set([...prevIds, ...selectedTaskIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (emailQueues.items.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = emailQueues.items.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         var selectedTaskIds = emailQueues.items.filter(item => item.taskId == taskId).map((item) => item.taskId)
            .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked        
            setBulkRecords(prevItems => prevItems.filter(item => item.taskId !== taskId));
            setSelectedEmailQueueIds(prevIds => prevIds.filter(item => item !== id));
            setSelectedEmailTaskIds(prevIds => prevIds.filter(item => item !== taskId));
         } else {

            setBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(emailQueues.items.filter(x => x.taskId === taskId)[0])); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedEmailQueueIds(prevIds => [...new Set([...prevIds, ...selectedIds])]);
            setSelectedEmailTaskIds(prevIds => [...new Set([...prevIds, ...selectedTaskIds])]);
         }

      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleBackButton = () => {
      if (
         emailQueues.currentPage > 1 &&
         emailQueues.currentPage <= emailQueues.totalPages
      ) {
         const updatedCurrentPage = emailQueues.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(emailQueues.currentPage > 1);
         getEmailQueues(updatedCurrentPage, defaultPageSize, emailQueues.searchParam, emailQueues.companyId, emailQueues.county, emailQueues.serverId, emailQueues.isExpedited, emailQueues.isStateCourt, emailQueues.status, emailQueues.taskStatus, emailQueues.court ?? "");
      }
   };

   const handleShowDetails = (id: string) => {
      setCurrentCaseId(id);
      setShowDetails(true);
   };

   const handleDeletelink = (id: string) => {
      setDeleteConfirmation(true);
      setSelectedLinkId(id);
   };
   const handleDeleted = async () => {
      setDeleteConfirmation(false);
      setShowSpinner(true);
      const response = await EmailQueueService.deletePdfLink(selectedLinkId);
      if (response.status === HttpStatusCode.Ok) {
         if (response.data.isSuccess)
            toast.success(response.data.message);
         else {
            // setErrorMsg(response.data.message);
         }
         setShowSpinner(false);
         getEmailQueues(emailQueues.currentPage, emailQueues.pageSize, emailQueues.searchParam, emailQueues.companyId, emailQueues.county, emailQueues.serverId, emailQueues.isExpedited, emailQueues.isStateCourt, emailQueues.status, emailQueues.taskStatus, emailQueues.court ?? "");
      }
      else {
         setShowSpinner(false);
      }
      setSelectedLinkId("");
   };

   const openPdf = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   };
   const renderStatusCell = (status: string, county: string) => {
      let colorClass = "";

      switch (status) {
         case "To be processed":
            colorClass = "bg-gray-700 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Submitting":
            colorClass = "bg-yellow-500 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Submitted":
            colorClass = "bg-green-400 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Tyler Error":
            colorClass = "bg-[#fd4545] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "System Error":
            colorClass = "bg-[#fd4545] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Rejected":
            colorClass = "bg-[#E61818] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Accepted":
            colorClass = "bg-blue-400 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Cancelled":
            colorClass = "bg-orange-400 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Cancellation Error":
            colorClass = "bg-[#fd4545] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "API Off":
            colorClass = "bg-[#A9A9A9] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Receipted":
            colorClass = "bg-blue-400 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         default:
            colorClass = "bg-[#F8F8F8] w-32 min-h-6 leading-[13px] text-center py-1 px-2 text-black inline-flex items-center justify-center rounded-sm";
      }

      return <div className={colorClass}>{county.toUpperCase() === "COBB" && status === "Tyler Error" ? "Error" : status}</div>;
   };

   const handleCellRendered = (cellIndex: number, data: IEmailQueueItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderHighlightedAmount = (cellValue: any, data: IEmailQueueItem) => {
         if (data && data.isTransactionFeeChanged) {
            return <span style={{ backgroundColor: 'lightgreen' }}>{formatCurrencyCell(cellValue) ?? ""}</span>;
         } else {
            return <span>{formatCurrencyCell(cellValue) ?? ""}</span>;
         }
      };
      
      const renderers: Record<string, () => JSX.Element> = getEmailQueueGridenderers(
         data, selectedEmailTaskIds, handleCheckBoxChange, rowIndex, cellValue,
         setHoveredDocumentId, hoveredDocumentId, handleDeletelink, renderActionCell,
         renderStatusCell, emailQueues, formattedDateCell, renderHighlightedAmount
      )

      const renderer = renderers[propertyName] || (() => formattedCell(cellValue));

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

   const formatCurrencyCell = (value: number) => (
      <span>{value !== null ? formatCurrency(value) : ""}</span>
   );

   const formattedDateCell = (value: any) => (
      <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
   );

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   const checkIfAllIdsExist = (
      emailQueueUsers: IEmailQueueItem[],
      selectedEmailTaskIds: string[]
   ): boolean | undefined => {
      if (emailQueueUsers.length === 0) {
         return false;
      }
      return emailQueueUsers.every(record =>
         selectedEmailTaskIds.includes(record.taskId as string)
      );
   };

   const handleEditData = async (formValues: IEditEmailQueueItem) => {
      try {
         debugger;
         setOpenEditModal(false);
         setShowSpinner(true);

         // Get the file input element by ID or other selector
         const fileInput = document.getElementById("fileUpload") as HTMLInputElement | null;

         if (fileInput && fileInput.files && fileInput.files.length > 0) {
            // Access the first file from the file input element
            const file = fileInput.files[0];

            // Convert the file to Base64
            const fileBase64 = await fileToBase64(file);

            // Set the Base64 value in the form values
            formValues.document = fileBase64;

            // Call the API with the updated form values

         }
         // const caseCreateDate = new Date(formValues.caseCreatedDate);
         // const dateFiled =formValues.evictionDateFiled!=null? new Date(formValues.evictionDateFiled):null;


         // Adjust to local timezone offset
         // formValues.caseCreatedDate = new Date(caseCreateDate.getTime() - (caseCreateDate.getTimezoneOffset() * 60000));
         // formValues.evictionDateFiled =dateFiled!=null? new Date(dateFiled.getTime() - (dateFiled.getTimezoneOffset() * 60000)):null;
         formValues.caseCreatedDate = adjustDateSystemTimezoneDate(
            typeof formValues.caseCreatedDate === 'string' ?
               formValues.caseCreatedDate :
               formValues.caseCreatedDate.toISOString()
         ) ?? formValues.caseCreatedDate;
         formValues.evictionDateFiled = formValues.evictionDateFiled != null ? adjustDateSystemTimezoneDate(
            typeof formValues.evictionDateFiled === 'string' ?
               formValues.evictionDateFiled :
               formValues.evictionDateFiled.toISOString()
         )
            : null;
         formValues.evictionEnvelopeID = formValues.evictionEnvelopeID.toString();
         formValues.caseNo = formValues.caseNo == null ? "" : formValues.caseNo;
         formValues.eFileMethod = formValues.eFileMethod ?? "";
         formValues.evictionPaymentMethod = formValues.evictionPaymentMethod ?? "";
         formValues.evictionTransactionAmt = formValues.evictionTransactionAmt ? formValues.evictionTransactionAmt.toString() : "";
         formValues.evictionCourtFee = formValues.evictionCourtFee ? formValues.evictionCourtFee.toString() : "";
         formValues.eFileFeeClient = formValues.eFileFeeClient ? formValues.eFileFeeClient.toString() : "";
         formValues.tenantZip = formValues.tenantZip != null ? formatZip(formValues.tenantZip) : "";
         formValues.taskId = selectedData?.taskId ?? ""; 
         // Call the API with the updated form values
         const response = await EmailQueueService.UpdateCaseInfo(formValues);

         if (response.status === HttpStatusCode.Ok) {
            toast.success("Updated Successfully.");
            setShowSpinner(false);

            getEmailQueues(emailQueues.currentPage, emailQueues.pageSize, emailQueues.searchParam, emailQueues.companyId, emailQueues.county, emailQueues.serverId, emailQueues.isExpedited, emailQueues.isStateCourt, emailQueues.status, emailQueues.taskStatus, emailQueues.court ?? "");
         }
      } catch (error) {
         console.error("Error:", error);
      } finally {
         // setShowSpinner(false);
      }
   };

   const renderActionCell = (data: IEmailQueueItem) => (
      <div className="flex justify-center gap-2">
         <IconButton
            type={"button"}
            className="cursor-pointer text-[#2472db]"
            disabled={!data?.id?.length}
            icon={<FaEye className="h-4 w-4" />}
            handleClick={() => handleShowDetails(data.id ?? "")}
         />
         <IconButton
            type={"button"}
            className="cursor-pointer text-[#2472db]"
            disabled={!data?.id?.length}
            icon={<FaEdit className="h-[14px] w-[14px]" />}
            handleClick={() => {

               setSelectedData({
                  id: data.id, caseNo: data?.caseNo ?? "",
                  processServerEmail: data?.processServerEmail ?? "",
                  description: data?.description ?? "",
                  document: "",
                  expedited: data?.expedited ?? "",
                  county: data?.county ?? "",
                  taskStatus: data.taskStatus ?? "",
                  evictionTransactionAmt: data?.transactionfee ?? "",
                  //tenantOne:data?.tenantOne ?? "",
                  tenantZip: data?.tenantZip ?? "",
                  propertyName: data?.propertyName ?? "",
                  referenceId: data?.referenceId ?? "",
                  stateCourt: data?.stateCourt ?? "",
                  tenant1FirstName: data?.tenant1FirstName ?? "",
                  tenant1LastName: data?.tenant1LastName ?? "",
                  tenant1MiddleName: data?.tenant1MiddleName ?? "",
                  caseCreatedDate: data?.caseCreatedDate ?? "",
                  tenantAddress: data?.tenantAddress ?? "",
                  tenantUnit: data?.tenantUnit ?? "",
                  eFileFeeClient: data?.eFileFeeClient ?? "",
                  evictionCourtFee: data?.evictionCourtFee ?? "",
                  evictionEnvelopeID: data.evictionEnvelopeID ?? "",
                  evictionDateFiled: data.evictionDateFiled ?? "",
                  evictionPaymentMethod: data?.evictionPaymentMethod ?? "",
                  attorneyName: data?.attorneyName ?? "",
                  attorneyBarNo: data?.attorneyBarNo ?? "",
                  evictionReason: data?.evictionReason ?? "",
                  filerEmail: data.filerEmail ?? "",
                  tenantCity: data.tenantCity ?? "",
                  tenantState: data.tenantState ?? "",
                  eFileMethod: data?.methodName ?? "",
                  paymentAccount: data?.paymentAccount ?? "",
                  caseType: data?.status,
                  taskId: data?.taskId ?? ""
               });
               setOpenEditModal(true);
            }}
         />
      </div>
   );

   const renderEditModal = () => (
      openEditModal && <>
         <React.Suspense fallback={<Spinner />}>
            <EmailQueueEditModal showPopup={openEditModal} handleClose={() => setOpenEditModal(false)}
               selectedData={selectedData} handleSubmit={(formValues: IEditEmailQueueItem) => handleEditData(formValues)} />
         </React.Suspense>
      </>
   )

   const renderGrid = () => (
      <>
         <Grid
            columnHeading={visibleColumns}
            rows={emailQueues.items}
            handleSelectAllChange={handleSelectAllChange}
            // selectAll={checkIfAllIdsExist(emailQueues.items, selectedEmailQueueIds)}
            selectAll={checkIfAllIdsExist(emailQueues.items, selectedEmailTaskIds)}
            cellRenderer={(data: IEmailQueueItem, rowIndex: number, cellIndex: number) => {
               return handleCellRendered(cellIndex, data, rowIndex);
            }}
            // handleSorting={handleSorting}
            selectedIds={selectedEmailTaskIds}
         />
         {/* Render the Pagination component with relevant props */}
         <Pagination
            numberOfItemsPerPage={emailQueues.pageSize}
            currentPage={emailQueues.currentPage}
            totalPages={emailQueues.totalPages}
            totalRecords={emailQueues.totalCount}
            handleFrontButton={handleFrontButton}
            handleBackButton={handleBackButton}
            canPaginateBack={canPaginateBack}
            canPaginateFront={canPaginateFront}
         />
      </>
   )

   const renderDeleteConfirmModal = () => (
      deleteConfirmation && (
         <div>
            <Modal
               showModal={deleteConfirmation}
               onClose={() => setDeleteConfirmation(false)}
               width="max-w-md"
            >
               <div id="fullPageContent">
                  <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                     <div className="text-center pr-4 sm:text-left">
                        <h3
                           className="text-sm font-semibold leading-5 text-gray-900"
                           id="modal-title"
                        >
                           Are you sure you want to delete pdf link?
                        </h3>
                     </div>
                  </div>
                  <div className="flex justify-end m-2">
                     <Button
                        type="button"
                        isRounded={false}
                        title="No"
                        handleClick={() => setDeleteConfirmation(false)}
                        classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                     ></Button>
                     <Button
                        handleClick={handleDeleted}
                        title="Delete"
                        isRounded={false}
                        type={"button"}
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                     ></Button>
                  </div>
               </div>
            </Modal>
         </div>
      )
   )

   const renderDetailsGrid = () => (
      showDetails && (
         <React.Suspense fallback={<Spinner />}>
            <EmailQueueDetails
               caseId={currentCaseId}
               showDetails={showDetails}
               setShowDetails={(show: boolean) => setShowDetails(show)}
            />
         </React.Suspense>
      )
   )

   return (
      <div className="pt-2.5">
         <div className="relative -mr-0.5">
            <div className="mb-2 text-sm text-gray-600">
               {selectedEmailTaskIds.length} of {emailQueues.totalCount} records selected
            </div>
            <div className="mb-2.5"> <Search_Filter /></div>
            {showSpinner ? <Spinner /> : (
               renderGrid()
            )}
         </div>

         {renderEditModal()}

         {renderDetailsGrid()}

         {renderDeleteConfirmModal()}
      </div>
   );
};

export default EmailQueueGrid;