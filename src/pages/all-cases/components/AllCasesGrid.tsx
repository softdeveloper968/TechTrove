import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import { FaEdit, FaEye, FaCopy } from "react-icons/fa";
// import Grid from "components/common/grid/Grid";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import Spinner from "components/common/spinner/Spinner";
import GridCheckbox from "components/formik/GridCheckBox";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import IconButton from "components/common/button/IconButton";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import ToggleSwitch from "components/common/toggle/ToggleSwitch";
import { useAllCasesContext } from "../AllCasesContext";
import { IAllCasesItems, ICaseDocument, ITenant } from "interfaces/all-cases.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { convertUtcToEst, extractFilePrefix, toCssClassName, parseFileName, getEnumFromValue } from "utils/helper";
import { AttatchmentTypeEnum, UserRole } from "utils/enum";
import HelperViewPdfService from "services/helperViewPdfService";
import AllCasesService from "services/all-cases.service";
import { useAuth } from "context/AuthContext";
import AllCasesDetails from "./AllCasesDetails";
import { file } from "jszip";

// Define the props interface with a  type 'IAllCases'
type AllCasesGridProps = {};

// React functional component 'AllCasesGrid' with a generic type 'IAllCases'
const AllCasesGrid = (props: AllCasesGridProps) => {
   //  integrated late notices here
   const {
      allCases,
      getAllCases,
      setAllCases,
      setSelectedAllCasesId,
      showSpinner,
      bulkRecords,
      setBulkRecords,
      selectedAllCasesId,
      setShowSpinner,
      getAllCounties,
      showCaseSnapShot,
      setShowCaseSnapShot,
      getAllCompanies,
      clickedFilingButton,
      getCourts,
   } = useAllCasesContext();
   const { userRole, selectedStateValue } = useAuth();
   const isMounted = useRef(true);
   // State variables for pagination for next and previous button
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      allCases.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      allCases.totalPages > 1
   );
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(allCases.items?.length).fill(false)
   );
   const [allCasesRecords, setAllCasesRecords] = useState<IAllCasesItems[]>([]);
   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [currentCaseId, setCurrentCaseId] = useState<string>("");
   const [openInfoModal, setInfoModal] = useState<boolean>(false);
   const [selectedCaseNo, setSelectedCaseNo] = useState<string>("");
   const [selectedId, setSelectedId] = useState<string | undefined>("");
   const initialColumnMapping: IGridHeader[] = [
      {
         columnName: "isChecked",
         label: "isChecked",
         controlType: "checkbox"
      },
      { columnName: "action", label: "Actions", className: "action" },
      ...(selectedStateValue === "GA" ? [{ columnName: "status", label: "Status" }] : []),
      { columnName: "statusDescription", label: "Accepted/Rejected" },
      { columnName: "caseNo", label: "CaseNo", toolTipInfo: "The unique number or code associated with your case, as assigned by the court." },
      { columnName: "documents", label: "AllPDFs" },
      { columnName: "propertyName", label: "PropertyName", isSort: true },
      { columnName: "county", label: "County", isSort: true },
      ...(selectedStateValue === "TX" ? [{ columnName: "stateCourt", label: "Court" }] : []),
      { columnName: "tenantOne", label: "TenantOne", isSort: true },
      { columnName: "address", label: "TenantAddressCombined", isSort: true },
      { columnName: "attorneyName", label: "AttorneyName", isSort: true },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo", className: 'text-right' },
      { columnName: "evictionDateFiled", label: "EvictionDateFiled", isSort: true, toolTipInfo: "The day the eviction case was accepted by the court." },
      { columnName: "courtDate", label: "CourtDate", isSort: true },
      ...selectedStateValue == "GA" ? [
         { columnName: "evictionServiceDate", label: "EvictionServiceDate", isSort: true, toolTipInfo: "The date the case documents were delivered to the tenant by sheriff or private process server." },
         { columnName: "lastDayToAnswer", label: "EvictionLastDayToAnswer", isSort: true, toolTipInfo: "The last day that the tenant is allowed to answer with the court before it is considered 'Late'." },
         { columnName: "evictionServiceMethod", label: "EvictionServiceMethod", toolTipInfo: "EvictionServiceMethod" },
         //  {columnName:"evictionServedToName",label:"EvictionServedToName"},
         { columnName: "expedited", label: "Expedited", toolTipInfo: "This will show 'Expedited' if you have selected expedited process service." },
         { columnName: "answerDate", label: "AnswerDate", toolTipInfo: "The date a tenant filed their answer with the court. (not the date it is accepted)" },
         { columnName: "writFiledDate", label: "WritFiledDate", toolTipInfo: "The date the writ application was accepted by the court." },
         { columnName: "dismissalFileDate", label: "DismissalFileDate", toolTipInfo: "The date the dismissal filing was accepted by the court." },
         { columnName: "evictionAffiantSignature", label: "EvictionAffiantSignature", toolTipInfo: "The name that was used to sign the Eviction case document(s)." },
         //  {columnName:"writApplicantDate",label:"WritApplicantDate" },
         { columnName: "writFiledDate", label: "WritApplicantDate", toolTipInfo: "The date the Writ of Possession application was submitted to the court." },
         // { columnName: "issueDate", label: "IssueDate"},
         { columnName: "createdAt", label: "CaseCreatedDate" },
         { columnName: "noticeCount", label: "NoticeCount", toolTipInfo: "The number of notices that have been created for a tenant in the past 12 months.", className: 'text-right' },
         { columnName: "evictionCount", label: "EvictionCount", toolTipInfo: "The number of evictions that have been filed for a tenant in the past 12 months.", className: 'text-right' },
         { columnName: "evictionAutomation", label: "EvictionAutomation" },

         //         ...(!userRole.includes(UserRole.C2CAdmin)
         //     ? []
         //     : [{
         //       columnName: "companyName",
         //       label: "CompanyName"
         //     }]
         //   ),
      ] : [],
      { columnName: "clientReferenceId", label: "ClientReferenceId" },
      ...(selectedStateValue === "TX" ? [{ columnName: "propertyPhone", label: "PropertyPhone" }] : []),

   ];

   const initialSnapShotColumnMapping: IGridHeader[] = [
      {
         columnName: "isChecked",
         label: "isChecked",
         controlType: "checkbox"
      },
      { columnName: "caseNo", label: "CaseNo", toolTipInfo: "The unique number or code associated with your case, as assigned by the court." },
      { columnName: "county", label: "County", isSort: true },
      ...(selectedStateValue === "TX" ? [{ columnName: "stateCourt", label: "Court" }] : []),
      { columnName: "propertyName", label: "PropertyName", isSort: true },
      { columnName: "tenantOne", label: "TenantOne", isSort: true },
      { columnName: "address", label: "TenantAddressCombined", isSort: true },
      ...(selectedStateValue === "GA" ? [{ columnName: "issueDate", label: "IssueDate" },
      { columnName: "evictionServiceDate", label: "EvictionServiceDate", isSort: true, toolTipInfo: "The date the case documents were delivered to the tenant by sheriff or private process server." },
      { columnName: "lastDayToAnswer", label: "EvictionLastDayToAnswer", isSort: true, toolTipInfo: "The last day that the tenant is allowed to answer with the court before it is considered 'Late'." },
      { columnName: "evictionServiceMethod", label: "EvictionServiceMethod", toolTipInfo: "EvictionServiceMethod" },
      { columnName: "answerDate", label: "AnswerDate", toolTipInfo: "The date a tenant filed their answer with the court. (not the date it is accepted)" },
      { columnName: "writFiledDate", label: "WritFiledDate", toolTipInfo: "The date the writ application was accepted by the court." },
      { columnName: "dismissalFileDate", label: "DismissalFileDate", toolTipInfo: "The date the dismissal filing was accepted by the court." },] : []),

      { columnName: "clientReferenceId", label: "ClientReferenceId" },
   ];

   // Filter columns based on user role
   const filteredColumns = userRole.includes(UserRole.Viewer)
      ? initialColumnMapping.filter(col => col.columnName !== "isChecked")
      : initialColumnMapping;

   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(filteredColumns);

   useEffect(() => {
      getAllCounties();
      if (!allCases.totalCount) {
         if (isMounted.current) {
            getAllCases(1, 100);
            if (userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)) {
               getAllCompanies();
            }
            isMounted.current = false;
         };
      };

   }, []);



   useEffect(() => {
      setSelectAll(false);
      //setSelectedAllCasesId([]);

      // const filteredColumns = !showCaseSnapShot
      //    ? initialColumnMapping
      //    : initialColumnMapping.filter(column =>
      //       AllCasesSnapshot.includes(column.label)
      //    );

      setVisibleColumns(!showCaseSnapShot
         ? initialColumnMapping
         : initialSnapShotColumnMapping);

   }, [showCaseSnapShot]);
   //   useEffect(()=>{
   //     if(userRole.includes(UserRole.C2CAdmin) && !visibleColumns.some(x=>x.columnName==="companyName")){
   //       setVisibleColumns((prev) => (
   //         [
   //           ...prev,
   //           {
   //             columnName: "companyName",
   //             label: "CompanyName"
   //           }
   //         ]
   //       )
   //       )
   //     }
   //   }, [userRole]);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
   useEffect(() => {
      setSelectAll(false);
      const allCasesRecords = allCases.items.map((item: any) => {
         return {
            isChecked: false, // Add the new property
            ...item, // Spread existing properties
         };
      });
      setAllCasesRecords(allCasesRecords);
      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(allCases.currentPage > 1);
      setCanPaginateFront(allCases.totalPages > 1);
      setSelectedRows(Array(allCases.items?.length).fill(false));
   }, [allCases]);

   useEffect(() => {
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
   }, [allCases.searchParam]);
   // Event handler for the 'Back' button
   const handleBackButton = () => {
      if (
         allCases.currentPage > 1 &&
         allCases.currentPage <= allCases.totalPages
      ) {
         const updatedCurrentPage = allCases.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(allCases.currentPage > 1);
         // back button get late notices
         getAllCases(updatedCurrentPage, allCases.pageSize, allCases.searchParam, allCases.status, allCases.county, allCases.filingType, allCases.courtType ?? "", allCases.sortings);
      }
   };

   // // Event handler for the 'Next' button
   const handleFrontButton = () => {
      if (allCases.currentPage < allCases.totalPages) {
         const updatedCurrentPage = allCases.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getAllCases(updatedCurrentPage, allCases.pageSize, allCases.searchParam, allCases.status, allCases.county, allCases.filingType, allCases.courtType ?? "", allCases.sortings);
      }
   };

   const [newSelectedRows] = useState<boolean[]>([]);

   // const handleCheckBoxChange = (index: number, checked: boolean) => {
   //   if (shiftKeyPressed && lastClickedRowIndex !== -1 && allCases.items) {
   //     const start = Math.min(index, lastClickedRowIndex);
   //     const end = Math.max(index, lastClickedRowIndex);
   //     setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
   //       i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
   //     ));
   //     setSelectedRows(selectedRows);
   //     const selectedIds = (allCases.items || [])
   //       .filter((_, rowIndex) => selectedRows[rowIndex])
   //       .map((item) => item.id)
   //       .filter((id): id is string => typeof id === "string");
   //     setSelectedAllCasesId(selectedIds);
   //   }
   //   else {
   //     const updatedSelectedRows = [...selectedRows];
   //     updatedSelectedRows[index] = checked;
   //     setSelectedRows(updatedSelectedRows);

   //     if (allCases.items.length === updatedSelectedRows.filter(item => item).length) {
   //       setSelectAll(true);
   //     } else {
   //       setSelectAll(false);
   //     }

   //     const selectedIds = (allCases.items || [])
   //       .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
   //       .map((item) => item.id)
   //       .filter((id): id is string => typeof id === "string");

   //     setSelectedAllCasesId(selectedIds);
   //   }

   //   setLastClickedRowIndex(index);
   // };

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
      if (shiftKeyPressed && lastClickedRowIndex !== -1 && allCasesRecords) {
         const start = Math.min(index, lastClickedRowIndex);
         const end = Math.max(index, lastClickedRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (allCasesRecords || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         allCasesRecords.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            setBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(item)); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //  setBulkRecords((prev)=>[...prev,item]);
         })
         setSelectedAllCasesId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (allCasesRecords.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = allCasesRecords.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         // const selectedIds = (fileEvictions.items || [])
         //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
         //   .map((item) => item.id)
         //   .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked        
            setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedAllCasesId(prevIds => prevIds.filter(item => item !== id));
         } else {
            setBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(allCasesRecords.filter(x => x.id === id)[0])); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedAllCasesId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }

      }

      setLastClickedRowIndex(index);
   };

   // const handleSelectAllChange = (checked: boolean) => {
   //   const newSelectAll = !selectAll;
   //   const allIds: string[] = allCases.items
   //     .map((item) => item.id)
   //     .filter((id): id is string => typeof id === "string");

   //   if (checked) {
   //     setSelectedAllCasesId(allIds);
   //   } else {
   //     setSelectedAllCasesId([]);
   //   }

   //   setSelectAll((prevSelectAll) => {
   //     // Update selectedRows state
   //     setSelectedRows(Array(allIds.length).fill(newSelectAll));
   //     return newSelectAll;
   //   });
   // };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = allCasesRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      console.log(bulkRecords);
      console.log(selectedAllCasesId);
      if (checked) {
         allCasesRecords
            .filter(record => typeof record.id === "string" && !selectedAllCasesId.includes(record.id))
            .map((item) => setBulkRecords((prev) => [...prev, item]));
         setSelectedAllCasesId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         allCasesRecords.forEach((item) => {
            setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedAllCasesId(prevIds => prevIds.filter(id => id !== item.id));
         });
      }
      console.log("after");
      console.log(bulkRecords);
      console.log(selectedAllCasesId);

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

   const renderStatusCell = (status: string) => {
      let colorClass = "";

      switch (status) {
         case "Filed":
            colorClass = "bg-sky-200 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Amended":
            colorClass = "bg-[#FF914D] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Amendment Ready":
            colorClass = "bg-blue-400 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Writ Ready":
            colorClass = "bg-[#fd4545] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Dismissal Applied for":
            colorClass = "bg-[#4DB452] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Set-Out":
            colorClass = "bg-yellow-300 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Submitted":
            colorClass = "bg-[#54C1FF] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Writ Applied for":
            colorClass = "bg-[#E61818] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Answered":
            colorClass = "bg-[#6D37BB] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Check for Writ":
            colorClass = "bg-[#F86565] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Served":
            colorClass = "bg-[#427AC7] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Submission In Progress":
            colorClass = "bg-yellow-300 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Dismissal Submission In Progress":
            colorClass = "bg-yellow-300 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Court Rejected":
            colorClass = "bg-[#E61818] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Cancelled":
            colorClass = "bg-[#E61818] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Previous System":
            colorClass = "bg-[#A9A9A9] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         default:
            colorClass = "bg-black-500 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
      }

      return <div className={colorClass}>{status}</div>;
   };

   const handleDocumentClick = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   };

   const handleShowDetails = (id: string) => {
      setCurrentCaseId(id);
      setShowDetails(true);
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
      data: IAllCasesItems,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      //TODO : update tha handleCheckBoxChange
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               checked={selectedAllCasesId.includes(data.id as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id as string, checked)
               }
               label=""
            />
         ),
         action: () => renderActionsCell(data.id ?? "", data),
         status: () => renderStatusCell(cellValue),
         statusDescription: () => renderStatusDescriptionCell(cellValue, data.county),
         evictionDateFiled: () => formattedDateCell(cellValue),
         lastDayToAnswer: () => formattedDateCell(cellValue),
         evictionServiceDate: () => formattedDateCell(cellValue),
         answerBy: () => formattedDateCell(cellValue),
         courtDate: () => formattedDateCell(cellValue),
         dismissalFileDate: () => formattedDateCell(cellValue),
         writFiledDate: () => formattedDateCell(cellValue),
         answerDate: () => formattedDateCell(cellValue),
         // attorneyBarNo: () => formattedCell(cellValue),
         clientReferenceId: () => formattedCell(cellValue),
         attorneyBarNo: () => renderHighlightedCell(cellValue),
         attorneyName: () => renderHighlightedCell(cellValue),
         writSignDate: () => formattedDateCell(cellValue),
         createdAt: () => formattedDateCell(cellValue),
         documents: () => renderDocumentsCell(cellValue, data),
         expedited: () => <span>{cellValue != "" && cellValue != null ? "Expedited" : ""}</span>,
         tenantOne: () => formattedTenantFullName(data?.tenantNames[0]),
         tenantTwo: () => formattedTenantFullName(data?.tenantNames[1]),
         tenantThree: () => formattedTenantFullName(data?.tenantNames[2]),
         tenantFour: () => formattedTenantFullName(data?.tenantNames[3]),
         tenantFive: () => formattedTenantFullName(data?.tenantNames[4]),
         tenantOnePhone: () => <span>{data?.tenantNames[0]?.phone}</span>,
         tenantOneEmail: () => <span>{data?.tenantNames[0]?.email}</span>,
         tenantTwoPhone: () => <span>{data?.tenantNames[1]?.phone}</span>,
         tenantTwoEmail: () => <span>{data?.tenantNames[1]?.email}</span>,
         tenantThreePhone: () => <span>{data?.tenantNames[2]?.phone}</span>,
         tenantThreeEmail: () => <span>{data?.tenantNames[2]?.email}</span>,
         tenantFourPhone: () => <span>{data?.tenantNames[3]?.phone}</span>,
         tenantFourEmail: () => <span>{data?.tenantNames[3]?.email}</span>,
         tenantFivePhone: () => <span>{data?.tenantNames[4]?.phone}</span>,
         tenantFiveEmail: () => <span>{data?.tenantNames[4]?.email}</span>,
         address: () => formattedAddressCell(data),
         propertyName: () => renderHighlightedCell(data.propertyName),
         propertyPhone: () => renderHighlightedCell(data.propertyPhone),
         county: () => renderHighlightedCell(cellValue),
         caseNo: () => renderHighlightedCell(cellValue),
         evictionAutomation: () => {
            if (data && data.crmInfo && data.crmInfo.crmName && data.crmInfo.crmName.length) {
               return <span>Yes</span>;
            } else {
               return <span>No</span>;
            }
         }
      };

      const renderer =
         renderers[propertyName] || (() => formattedCell(cellValue));

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
      <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
      //   <span>{value !== null ? formattedDate(value) : ""}</span>
   );

   const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
      <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={allCases.searchParam ?? ''} />
   );

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );


   const renderHighlightedCell = (value: any) => (
      <HighlightedText text={value as string ?? ''} query={allCases.searchParam ?? ''} />
   );

   const formattedAddressCell = (value: IAllCasesItems) => (
      <>
         {
            value !== null
               ? <HighlightedText text={`${value.address ?? ''} ${value.unit ?? ''} ${value.city ?? ''} ${value.state ?? ''} ${value.zip ?? ''}`} query={allCases.searchParam ?? ''} />
               : ''
         }
      </>
   );

   const renderActionsCell = (id: string, data: IAllCasesItems) => {
      return (
         <>
            <div
               className="cursor-pointer flex flex-row items-center"
            >
               {(userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)) && <FaEdit
                  className={`h-[14px] w-[14px] cursor-pointer fill-[#2472db] ${(data.status !== "Submitted" || userRole.includes(UserRole.Viewer)) ? 'hidden' : ''}`}
                  onClick={() => {
                     if (data.status === "Submitted") {
                        setInfoModal(true);
                        setSelectedCaseNo(data.caseNo);
                        setSelectedId(data?.id);
                     }
                  }}
               />}
               <IconButton
                  type={"button"}
                  className="cursor-pointer text-[#2472db] ml-1.5"
                  disabled={!id.length}
                  icon={<FaEye className="h-4 w-4" />}
                  handleClick={() => handleShowDetails(id)}
               />
            </div>
         </>
      );
   };

   const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);

   const renderDocumentsCell = (cellValue: ICaseDocument[], data: IAllCasesItems) => {
      const handleCopyClick = (url: string) => {
         navigator.clipboard.writeText(url);
         toast.success("Document URL copied to clipboard!");
      };

      // Map the documents and apply special naming logic for "AOS" types
      const processedDocuments = cellValue.map(item => {
         let displayName = (selectedStateValue.toLocaleLowerCase() == "tx" ? item.fileName : item.type) || '';

         // Remove ".pdf" from the display name if present
         if (displayName.endsWith('.pdf') && selectedStateValue.toLocaleLowerCase() != "tx") {
            displayName = displayName.replace('.pdf', '');
         }

         var attatchmentType = getEnumFromValue(item.type);
         if (attatchmentType)
            switch (attatchmentType) {
               case AttatchmentTypeEnum.AOS:
                  displayName = extractFilePrefix(item.url);
                  break;
               default:
                  displayName = parseFileName(item.fileName, attatchmentType);
                  break;
            }

         return {
            id: item.id,
            url: item.url,
            displayName,
         };
      });

      return (
         <div className="flex flex-wrap">
            {processedDocuments.map((item) => (
               <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setHoveredDocumentId(item.id)}
                  onMouseLeave={() => setHoveredDocumentId(null)}
               >
                  <h1
                     onClick={() => handleDocumentClick(item.url)}
                     className="underline text-[#2472db] mr-5"
                     style={{ cursor: 'pointer' }}
                  >
                     {item.displayName}
                  </h1>
                  {hoveredDocumentId === item.id && (
                     <FaCopy
                        className="w-4 h-4 text-gray-500 absolute right-0 top-0 cursor-pointer ml-9"
                        onClick={() => handleCopyClick(item.url)}
                     />
                  )}
               </div>
            ))}
         </div>
      );
   };

   const renderStatusDescriptionCell = (cellValue: any, county: string) => {
      if (!cellValue) return ''; // Handle empty or null values
      if (cellValue == "error" && county.toUpperCase() != "COBB") {
         cellValue = "tyler error"
      }
      else if (cellValue == "systemerror") {
         cellValue = "system error"
      }
      // return cellValue.charAt(0).toUpperCase() + cellValue.slice(1);
      return cellValue.toString().toUpperCase();
   };

   // const handleSorting = (columnName: string, order: string) => {
   //    if (columnName === "tenantOne") {
   //       columnName = "tenantFirstName" // set column name for tenant name sorting
   //    };

   //    // Copy the current fileEvictionRecords array to avoid mutating the state directly
   //    const sortedRecords = [...allCasesRecords];

   //    // Define a compare function based on the column name and order
   //    const compare = (a: any, b: any) => {
   //       // Extract values for comparison
   //       const aValue1 = columnName !== "name" ? a[columnName] : a["tenantFirstName"];
   //       const bValue1 = columnName !== "name" ? b[columnName] : b["tenantLastName"];

   //       // Implement sorting logic based on the order (ascending or descending)
   //       if (order === 'asc') {
   //          if (aValue1 < bValue1) return -1;
   //          if (aValue1 > bValue1) return 1;
   //          return 0;
   //       } else {
   //          if (aValue1 > bValue1) return -1;
   //          if (aValue1 < bValue1) return 1;
   //          return 0;
   //       }
   //    };

   //    // Sort the records array using the compare function
   //    sortedRecords.sort(compare);

   //    // Update the state with sorted recordss
   //    setAllCasesRecords(sortedRecords);
   // };

   const handleSorting = (columnName: string, order: string) => {
      // Update the sortings state with the new sorting option, ensuring no duplicates
      setAllCases(prev => {
         const existingSort = prev.sortings.find(sort => sort.sortColumn === columnName);

         const updatedSortings = existingSort
            ? prev.sortings.map(sort =>
               sort.sortColumn === columnName
                  ? { ...sort, isAscending: order === "asc" } // Update existing sort
                  : sort
            )
            : [...prev.sortings, { sortColumn: columnName, isAscending: order === "asc" }]; // Add new sort

         // Fetch the data with the updated sortings
         getAllCases(
            prev.currentPage,
            prev.pageSize,
            prev.searchParam,
            prev.status,
            prev.county,
            prev.filingType,
            prev.courtType ?? "",
            updatedSortings
         );

         // Return the updated state
         return {
            ...prev,
            sortings: updatedSortings
         };
      });
   };

   const checkIfAllIdsExist = (
      allCasesRecords: IAllCasesItems[],
      selectedAllCasesId: string[]
   ): boolean | undefined => {
      if (allCasesRecords.length === 0) {
         return false;
      }
      return allCasesRecords.every(record =>
         selectedAllCasesId.includes(record.id as string)
      );
   };
   // const checkIfAllIdsExist = (
   //    allCasesRecords: IAllCasesItems[],
   //    selectedAllCasesId: string[]
   // ): boolean | undefined => {
   //    return allCasesRecords.every(record =>
   //       selectedAllCasesId.includes(record.id as string)
   //    );
   // };

   const handleEditData = async (caseNo: string) => {
      setInfoModal(false);
      setShowSpinner(true);
      var data = { UniqueId: selectedId as string, CaseNumber: caseNo }
      const response = await AllCasesService.updateAllCasesCaseNo(data);
      if (response.status === HttpStatusCode.Ok) {
         toast.success("Updated Successfully.");
         getAllCases(
            allCases.currentPage,
            allCases.pageSize,
            allCases.searchParam,
            allCases.status,
            allCases.county,
            allCases.filingType,
            allCases.courtType ?? '',
            allCases.sortings
         );
         // setBulkRecords([]);
         // setSelectedAllCasesId([]);
      }
      setShowSpinner(false);
      // setSelectedAllCasesId([]);
   }
   const handleToggleClick = () => {
      setShowCaseSnapShot(!showCaseSnapShot);
      console.log(showCaseSnapShot);
   };

   return (
      <div className="my-1.5 bg-white p-3 md:p-3.5 pb-3.5 md:pb-4 rounded-md shadow-md shadow-slate-300">
         <div className="relative -mr-0.5">
            <div className="mb-2 text-sm text-gray-600">
               {selectedAllCasesId.length} of {allCases.totalCount} records selected
            </div>
            {/* Render the Grid component with column headings and grid data */}
            {showSpinner ? (
               <Spinner />
            ) : (
               <>
                  <ToggleSwitch
                     value={showCaseSnapShot}
                     label={"Case Snapshot"}
                     handleChange={() => {
                        handleToggleClick()
                     }}
                  ></ToggleSwitch>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={allCasesRecords}
                     handleSelectAllChange={handleSelectAllChange}
                     // selectAll={selectAll}
                     selectAll={checkIfAllIdsExist(allCasesRecords, selectedAllCasesId)}
                     cellRenderer={(
                        data: IAllCasesItems,
                        rowIndex: number,
                        cellIndex: number
                     ) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                     // sorting={["PropertyName", "County", "TenantAddressCombined", "OwnerName", "AttorneyName", "EvictionDateFiled", "EvictionServiceDate", "CourtDate", "EvictionLastDayToAnswer"]}
                     handleSorting={handleSorting}
                     activeSortingMap={allCases.sortings}
                     selectedIds={selectedAllCasesId}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={allCases.pageSize}
                     currentPage={allCases.currentPage}
                     totalPages={allCases.totalPages}
                     totalRecords={allCases.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               </>
            )}
         </div>
         {showDetails && (
            <AllCasesDetails
               title="Case Details"
               caseId={currentCaseId}
               showDetails={showDetails}
               setShowDetails={(show: boolean) => setShowDetails(show)}
            />
         )}
         <Modal showModal={openInfoModal} onClose={() => setInfoModal(false)} width="max-w-xs">
            <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
               <div className="sm:flex sm:items-start">
                  <div className="text-center sm:text-left">
                     <h3
                        className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                        id="modal-title"
                     >
                        Update
                     </h3>
                  </div>
               </div>
               <Formik
                  initialValues={{ caseNo: selectedCaseNo }}
                  onSubmit={(values) => handleEditData(values.caseNo)}
               >
                  {(formik) => (
                     <Form className="pt-1">
                        <div className="md:grid-cols-2 gap-2.5 sm:gap-3.5 mb-2.5">
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Case Number"}
                                 name={"caseNo"}
                                 placeholder={"Enter Case Number"}
                              />
                           </div>
                        </div>

                        <div className="mt-1.5 md:mt-0 py-2.5 flex justify-end items-center">
                           <Button
                              type="button"
                              isRounded={false}
                              title="Cancel"
                              handleClick={() => setInfoModal(false)}
                              classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                           ></Button>
                           <Button
                              title={"Update"}
                              type={"submit"}
                              isRounded={false}
                              disabled={showSpinner}
                              classes="py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                           ></Button>
                        </div>
                     </Form>
                  )}
               </Formik>
            </div>
         </Modal>
      </div>
   );
};

export default AllCasesGrid;
