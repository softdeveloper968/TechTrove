import React, { useState, useEffect, ChangeEvent } from "react";
import { toast } from "react-toastify";
import { FaEye, FaRedo } from "react-icons/fa";
import { useAuth } from "context/AuthContext";
import { useEvictionQueueContext } from "./EvictionQueueContext";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import ToggleSwitch from "components/common/toggle/ToggleSwitch";
import IconButton from "components/common/button/IconButton";
import AllCasesDetails from "pages/all-cases/components/AllCasesDetails";
import GridCheckbox from "components/formik/GridCheckBox";
import Spinner from "components/common/spinner/Spinner";
import { convertUtcToEst, formattedDate, toCssClassName } from "utils/helper";
import { HttpStatusCode, UserRole } from "utils/enum";
import { IGridHeader } from "interfaces/grid-interface";
import { IEvictionQueueTasks, ITenant } from "interfaces/eviction-queue.intreface";
import { IEvictionQueueTaskItem } from "interfaces/eviction-queue.intreface";
import EvictionQueuesService from "services/eviction-queue.service";

type EvictionQueueTasksGridProps = {
   activeTab: string;
};

const EvictionQueueTasksGrid = (props: EvictionQueueTasksGridProps) => {
   const { userRole } = useAuth();
   const {
      evictionQueue1Tasks,
      setEvictionQueue1Tasks,
      evictionQueue2Tasks,
      setEvictionQueue2Tasks,
      evictionQueue3Tasks,
      setEvictionQueue3Tasks,
      evictionQueue4Tasks,
      setEvictionQueue4Tasks,
      evictionQueue5Tasks,
      setEvictionQueue5Tasks,
      evictionQueuesData,
      setEvictionQueuesData,      
      getEvictionQueueTasks,
      updateDisable,
      selectEvictionQueueId,
      setBulkRecords,
      selectedEvictionId,
      setSelectedEvictionId,
      showSpinner
   } = useEvictionQueueContext();
   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [currentCaseId, setCurrentCaseId] = useState<string>("");
   const [evictionQueueTasks,setEvictionQueueTasks]=useState<IEvictionQueueTasks>( {
      items: [],
      currentPage: 0,
      pageSize: 0,
      totalCount: 0,
      totalPages: 0,
      actiontype: 0,
      status: 0,
      searchParam: "",
      county: "",
      company: "",
      sortings: []
  });

   const initialColumnMapping: IGridHeader[] = [
      ...(userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)
         ? [{
            columnName: "isChecked",
            // label: "isChecked",
            controlType: "checkbox",
            label: "Bulk Edit",
            toolTipInfo: "This checkbox represents bulk update only"
         }]
         : []
      ),
      { columnName: "gridAction", label: "Action", className: "action" },
      // { columnName: "disabled", label: "Disabled" },
      { columnName: "status", label: "Status" },
      { columnName: "filingError", label: "FilingError" },
      { columnName: "cancelError", label: "CancelError" },
      { columnName: "rejectedReason", label: "RejectedReason" },
      { columnName: "caseNumber", label: "CaseNo" },
      { columnName: "caseReferenceId", label: "CaseReferenceId", className: 'text-right' },
      { columnName: "envelopeID", label: "EnvelopeID", className: 'text-right' },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "county", label: "County", isSort: true },
      { columnName: "action", label: "ActionType", isSort: true },
      { columnName: "aosType", label: "AOSType"},
      { columnName: "tenantOne", label: "TenantOne", isSort: true },
      { columnName: "tenantTwo", label: "TenantTwo", isSort: true },
      { columnName: "tenantThree", label: "TenantThree", isSort: true },
      { columnName: "tenantFour", label: "TenantFour", isSort: true },
      { columnName: "tenantFive", label: "TenantFive", isSort: true },
      // {columnName:"endpointUrl",label:"Endpoint",isSort:true},   
      { columnName: "address", label: "TenantAddressCombined", isSort: true },
      { columnName: "attorneyName", label: "AttorneyName", isSort: true },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo", toolTipInfo: "AttorneyBarNo" },
      { columnName: "evictionDateFiled", label: "EvictionDateFiled", isSort: true },
      { columnName: "evictionCourtAmount", label: "EvictionCourtTransAmt", className: 'text-right' },
      { columnName: "eFileMethod", label: "eFileMethod" },
      { columnName: "evictionPaymentMethod", label: "PaymentMethod" },
      { columnName: "paymentAccount", label: "PaymentAccount" },
      { columnName: "evictionServiceDate", label: "EvictionServiceDate", isSort: true, toolTipInfo: "The date the case documents were delivered to the tenant by sheriff or private process server." },
      { columnName: "answerBy", label: "EvictionLastDayToAnswer", isSort: true, toolTipInfo: "The last day that the tenant is allowed to answer with the court before it is considered 'Late'." },
      { columnName: "evictionServiceMethod", label: "EvictionServiceMethod", toolTipInfo: "EvictionServiceMethod" },
      { columnName: "evictionServedToName", label: "EvictionServedToName" },
      { columnName: "evictionServiceNotes", label: "EvictionServiceNotes" },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "answerDate", label: "AnswerDate", toolTipInfo: "The date a tenant filed their answer with the court." },
      { columnName: "courtDate", label: "CourtDate", isSort: true },
      { columnName: "writFiledDate", label: "WritFiledDate", toolTipInfo: "The date the writ application was accepted by the court." },
      { columnName: "dismissalFileDate", label: "DismissalFiledDate", toolTipInfo: "The date the dismissal filing was accepted by the court." },
      { columnName: "evictionAffiantSignature", label: "EvictionAffiantSignature", toolTipInfo: "The name that was used to sign the Eviction case document(s)." },
      //  {columnName:"writApplicantDate",label:"WritApplicantDate" },
      { columnName: "writSignDate", label: "WritSignDate", },
      { columnName: "noticeCount", label: "NoticeCount", toolTipInfo: "The number of notices that have been created for a tenant in the past 12 months.", className: 'text-right' },
      { columnName: "evictionCount", label: "EvictionCount", toolTipInfo: "The number of evictions that have been filed for a tenant in the past 12 months.", className: 'text-right' },
      { columnName: "createdDate", label: "CreatedDate" },
      { columnName: "timeStamp", label: "ImportDate" },
      ...(!userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)
         ? []
         : [{
            columnName: "companyName",
            label: "CompanyName"
         }]
      ),
      { columnName: "envelopeIdHistory", label: "EvictionEnvelopeIdHistory" },
   ];

   const eFlexColumnMapping: IGridHeader[] = [
      ...(userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)
         ? [{
            columnName: "isChecked",
            // label: "isChecked",
            controlType: "checkbox",
            label: "Bulk Edit",
            toolTipInfo: "This checkbox represents bulk update only"
         }]
         : []
      ),
      { columnName: "gridAction", label: "Action", className: "action" },
      { columnName: "disabled", label: "Disabled" },
      { columnName: "status", label: "Status" },
      { columnName: "caseNumber", label: "CaseNo" },
      { columnName: "caseReferenceId", label: "CaseReferenceId", className: 'text-right' },
      { columnName: "envelopeID", label: "EnvelopeID", className: 'text-right' },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "county", label: "County", isSort: true },
      { columnName: "action", label: "ActionType", isSort: true },
      { columnName: "aosType", label: "AOSType"},
      { columnName: "tenantOne", label: "TenantOne", isSort: true },
      { columnName: "tenantTwo", label: "TenantTwo", isSort: true },
      { columnName: "tenantThree", label: "TenantThree", isSort: true },
      { columnName: "tenantFour", label: "TenantFour", isSort: true },
      { columnName: "tenantFive", label: "TenantFive", isSort: true },
      // {columnName:"endpointUrl",label:"Endpoint",isSort:true},   
      { columnName: "address", label: "TenantAddressCombined", isSort: true },
      { columnName: "attorneyName", label: "AttorneyName", isSort: true },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo", toolTipInfo: "AttorneyBarNo" },
      { columnName: "evictionDateFiled", label: "EvictionDateFiled", isSort: true, toolTipInfo: "The day the eviction case was accepted by the court." },
      { columnName: "evictionCourtAmount", label: "EvictionCourtTransAmt", className: 'text-right' },
      { columnName: "eFileMethod", label: "eFileMethod" },
      { columnName: "evictionPaymentMethod", label: "EvictionPaymentMethod" },
      { columnName: "paymentAccount", label: "PaymentAccount" },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "createdDate", label: "CreatedDate" },
      { columnName: "timeStamp", label: "ImportDate " },
      ...(!userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)
         ? []
         : [{
            columnName: "companyName",
            label: "CompanyName"
         }]
      ),
   ];

   const manualColumnMapping: IGridHeader[] = [
      ...(userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)
         ? [{
            columnName: "isChecked",
            controlType: "checkbox",
            label: "Bulk Edit",
            toolTipInfo: "This checkbox represents bulk update only"
         }]
         : []
      ),
      { columnName: "gridAction", label: "Action", className: "action" },
      { columnName: "caseNumber", label: "CaseNo" },
      { columnName: "caseReferenceId", label: "CaseReferenceId", className: 'text-right' },
      { columnName: "processServerEmail", label: "ProcessServerEmail" },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "county", label: "County", isSort: true },
      { columnName: "stateCourt", label: "StateCourt" },
      { columnName: "action", label: "ActionType", isSort: true },
      { columnName: "aosType", label: "AOSType"},
      { columnName: "tenant1Last", label: "Tenant1Last" },
      { columnName: "tenant1First", label: "Tenant1First" },
      { columnName: "tenant1MI", label: "Tenant1MI" },
      { columnName: "andAllOtherOccupants", label: "AndAllOtherOccupants" },
      { columnName: "tenantAddress", label: "TenantAddress", className: "TenantAddress" },
      { columnName: "unit", label: "TenantUnit" },
      { columnName: "city", label: "TenantCity" },
      { columnName: "state", label: "TenantState" },
      { columnName: "zip", label: "TenantZip", className: 'text-right' },
      { columnName: "tenant2Last", label: "Tenant2Last" },
      { columnName: "tenant2First", label: "Tenant2First" },
      { columnName: "tenant2MI", label: "Tenant2MI" },
      { columnName: "tenant3Last", label: "Tenant3Last" },
      { columnName: "tenant3First", label: "Tenant3First" },
      { columnName: "tenant3MI", label: "Tenant3MI" },
      { columnName: "tenant4First", label: "Tenant4First" },
      { columnName: "tenant4MI", label: "Tenant4MI" },
      { columnName: "tenant5Last", label: "Tenant5Last" },
      { columnName: "tenant5First", label: "Tenant5First" },
      { columnName: "tenant5MI", label: "Tenant5MI" },
      { columnName: "evictionReason", label: "EvictionReason", className: "EvictionReason" },
      { columnName: "evictionTotalRentDue", label: "EvictionTotalRentDue", className: 'text-right' },
      { columnName: "monthlyRent", label: "MonthlyRent", className: 'text-right' },
      { columnName: "allMonths", label: "AllMonths" },
      { columnName: "evictionOtherFees", label: "EvictionOtherFees" },
      { columnName: "ownerName", label: "OwnerName" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "propertyPhone", label: "PropertyPhone" },
      { columnName: "propertyEmail", label: "PropertyEmail", className: "PropertyEmail" },
      { columnName: "propertyAddress", label: "PropertyAddress", className: "PropertyAddress" },
      { columnName: "propertyCity", label: "PropertyCity" },
      { columnName: "propertyState", label: "PropertyState" },
      { columnName: "propertyZip", label: "PropertyZip", className: 'text-right' },
      { columnName: "attorneyName", label: "AttorneyName" },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo", className: 'text-right' },
      { columnName: "attorneyEmail", label: "AttorneyEmail", className: "AttorneyEmail" },
      { columnName: "evictionServiceDate", label: "EvictionServiceDate", isSort: true, toolTipInfo: "The date the case documents were delivered to the tenant by sheriff or private process server." },
      { columnName: "answerBy", label: "EvictionLastDayToAnswer", isSort: true, toolTipInfo: "The last day that the tenant is allowed to answer with the court before it is considered 'Late'." },
      { columnName: "evictionServiceMethod", label: "EvictionServiceMethod", toolTipInfo: "EvictionServiceMethod" },
      { columnName: "evictionServedToName", label: "EvictionServedToName" },
      { columnName: "evictionServiceNotes", label: "EvictionServiceNotes" },
      { columnName: "writFiledDate", label: "WritFiledDate", toolTipInfo: "The date the writ application was accepted by the court." },
      { columnName: "dismissalFileDate", label: "DismissalFiledDate", toolTipInfo: "The date the dismissal filing was accepted by the court." },
      { columnName: "evictionAffiantSignature", label: "EvictionAffiantSignature" },
      // { columnName: "evictionDateFiled", label: "EvictionAffiantSignDate" },
      { columnName: "evictionAffiantSignDate", label: "EvictionAffiantSignDate" },
      { columnName: "evictionAffiantIs", label: "EvictionAffiantIs" },
      { columnName: "evictionFilerEmail", label: "EvictionFilerEmail" },
      { columnName: "evictionPaymentMethod", label: "PaymentMethod" },
      // { columnName: "evictionDateFiled", label: "DateFiled", isSort: true },
      { columnName: "dateFiled", label: "DateFiled", isSort: true },
      { columnName: "eFileMethod", label: "eFileMethod" },
      { columnName: "evictionCourtAmount", label: "CourtTransAmt", className: 'text-right' },
      { columnName: "adminNotes", label: "AdminNotes" },
      { columnName: "createdDate", label: "CreatedDate" },
   ];


   useEffect(() => {
      switch(selectEvictionQueueId){
         case 1:
            setEvictionQueueTasks(evictionQueue1Tasks);
            break;
         case 2:
            setEvictionQueueTasks(evictionQueue2Tasks);
            break;
         case 3:
            setEvictionQueueTasks(evictionQueue3Tasks);
            break;
         case 4:
            setEvictionQueueTasks(evictionQueue4Tasks);
            break;
            case 5:
               setEvictionQueueTasks(evictionQueue5Tasks);
               break;
      }
      
   }, [evictionQueue1Tasks,evictionQueue2Tasks,evictionQueue3Tasks,evictionQueue4Tasks,evictionQueue5Tasks])

   useEffect(() => {
      if (selectEvictionQueueId !== 0) {
         // getEvictionQueueTasks(
         //    1,
         //    100,
         //    selectEvictionQueueId,
         //    evictionQueueTasks.actiontype ?? 0,
         //    evictionQueueTasks.status ?? 0,
         //    evictionQueueTasks.searchParam,
         //    evictionQueueTasks.county,
         //    evictionQueueTasks.company
         // );
      }

   }, [userRole]);

   // useEffect(() => {
   //    if (userRole.includes(UserRole.C2CAdmin)) {
   //       const hasCompanyNameColumn = visibleColumns.some(x => x.columnName === "companyName");

   //       if (!hasCompanyNameColumn) {
   //          setVisibleColumns(prev => [
   //             ...prev,
   //             { columnName: "companyName", label: "CompanyName" }
   //          ]);
   //       }
   //    }

   // }, [userRole]);

   useEffect(() => {
      setBulkRecords([]);
   }, []);

   useEffect(() => {
      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(evictionQueueTasks.currentPage > 1);
      setCanPaginateFront(evictionQueueTasks.totalPages > 1);
   }, [evictionQueueTasks]);

   useEffect(() => {
      setSelectAll(false);
      setSelectedEvictionId([]);
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
   }, [evictionQueueTasks.searchParam]);

   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
      props.activeTab.trim().toLowerCase() === "eflex"
         ? eFlexColumnMapping
         : props.activeTab.trim().toLowerCase() === "manual"
            ? manualColumnMapping
            : initialColumnMapping
   );

   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionQueueTasks.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionQueueTasks.totalPages > 1);

   const handleFrontButton = () => {
      if (evictionQueueTasks.currentPage < evictionQueueTasks.totalPages) {
         const updatedCurrentPage = evictionQueueTasks.currentPage + 1;
         setCanPaginateBack(updatedCurrentPage > 1);
         getEvictionQueueTasks(
            updatedCurrentPage,
            evictionQueueTasks.pageSize,
            selectEvictionQueueId,
            evictionQueueTasks.actiontype ?? 0,
            evictionQueueTasks.status ?? 0,
            evictionQueueTasks.searchParam,
            evictionQueueTasks.county,
            evictionQueueTasks.company,
            evictionQueueTasks.sortings
         );
      }
   };

   const handleBackButton = () => {
      if (
         evictionQueueTasks.currentPage > 1 &&
         evictionQueueTasks.currentPage <= evictionQueueTasks.totalPages
      ) {
         const updatedCurrentPage = evictionQueueTasks.currentPage - 1;
         setCanPaginateBack(evictionQueueTasks.currentPage > 1);
         getEvictionQueueTasks(
            updatedCurrentPage,
            evictionQueueTasks.pageSize,
            selectEvictionQueueId,
            evictionQueueTasks.actiontype ?? 0,
            evictionQueueTasks.status ?? 0,
            evictionQueueTasks.searchParam,
            evictionQueueTasks.county,
            evictionQueueTasks.company,
            evictionQueueTasks.sortings
         );
      }
   };

   // const handleSorting = (columnName: string, order: string) => {
   //    const sortedQueues = [...evictionQueueTasks.items];

   //    const compare = (a: any, b: any) => {
   //       let valueA;
   //       let valueB;
   //       if (['tenantOne', 'tenantTwo', 'tenantThree', 'tenantFour', 'tenantFive'].includes(columnName)) {
   //          valueA = getTenantPropertyValue(a, columnName)?.firstName;
   //          valueB = getTenantPropertyValue(b, columnName)?.firstName;
   //       } else {
   //          valueA = a[columnName];
   //          valueB = b[columnName];
   //       }

   //       if (order === 'asc') {
   //          if (valueA < valueB) return -1;
   //          if (valueA > valueB) return 1;
   //          return 0;
   //       } else {
   //          if (valueA > valueB) return -1;
   //          if (valueA < valueB) return 1;
   //          return 0;
   //       }
   //    };

   //    const extractNumberFromString = (tenantName: string): number | undefined => {
   //       const numberWords: { [key: string]: number } = {
   //          "One": 1,
   //          "Two": 2,
   //          "Three": 3,
   //          "Four": 4,
   //          "Five": 5,
   //          // Add more words and their corresponding numbers as needed
   //       };

   //       const numberWord = tenantName.match(/[A-Z][a-z]*/g)?.pop();

   //       if (numberWord && numberWords.hasOwnProperty(numberWord)) {
   //          return numberWords[numberWord];
   //       }

   //       return undefined;
   //    };

   //    const getTenantPropertyValue = (item: IEvictionQueueTaskItem, columnName: string) => {
   //       const tenantName = columnName.replace("tenant", "");
   //       const number = extractNumberFromString(tenantName);
   //       if (number !== undefined) {
   //          //console.log(number); // This will log the number extracted from the string
   //          return item.tenantNames[number - 1];
   //       } else {
   //          console.log("No number found in the string");
   //       }
   //    };

   //    sortedQueues.sort(compare);

   //    setEvictionQueueTasks((prev) => ({
   //       ...prev,
   //       items: sortedQueues
   //    }));
   // };

   const handleSorting = (columnName: string, order: string) => {
      switch(selectEvictionQueueId){
         case 1:
            setEvictionQueue1Tasks(prev => {
               const existingSort = prev.sortings.find(sort => sort.sortColumn === columnName);
      
               const updatedSortings = existingSort
                  ? prev.sortings.map(sort =>
                     sort.sortColumn === columnName
                        ? { ...sort, isAscending: order === "asc" } // Update existing sort
                        : sort
                  )
                  : [...prev.sortings, { sortColumn: columnName, isAscending: order === "asc" }]; // Add new sort
      
               // Fetch the data with the updated sortings
               getEvictionQueueTasks(
                  evictionQueueTasks.currentPage,
                  evictionQueueTasks.pageSize,
                  selectEvictionQueueId,
                  evictionQueueTasks.actiontype ?? 0,
                  evictionQueueTasks.status ?? 0,
                  evictionQueueTasks.searchParam,
                  evictionQueueTasks.county,
                  evictionQueueTasks.company,
                  updatedSortings
               );
      
               // Return the updated state
               return {
                  ...prev,
                  sortings: updatedSortings
               };
            });
            break;
         case 2:
            setEvictionQueue2Tasks(prev => {
               const existingSort = prev.sortings.find(sort => sort.sortColumn === columnName);
      
               const updatedSortings = existingSort
                  ? prev.sortings.map(sort =>
                     sort.sortColumn === columnName
                        ? { ...sort, isAscending: order === "asc" } // Update existing sort
                        : sort
                  )
                  : [...prev.sortings, { sortColumn: columnName, isAscending: order === "asc" }]; // Add new sort
      
               // Fetch the data with the updated sortings
               getEvictionQueueTasks(
                  evictionQueueTasks.currentPage,
                  evictionQueueTasks.pageSize,
                  selectEvictionQueueId,
                  evictionQueueTasks.actiontype ?? 0,
                  evictionQueueTasks.status ?? 0,
                  evictionQueueTasks.searchParam,
                  evictionQueueTasks.county,
                  evictionQueueTasks.company,
                  updatedSortings
               );
      
               // Return the updated state
               return {
                  ...prev,
                  sortings: updatedSortings
               };
            });
            break;
         case 3:
            setEvictionQueue3Tasks(prev => {
               const existingSort = prev.sortings.find(sort => sort.sortColumn === columnName);
      
               const updatedSortings = existingSort
                  ? prev.sortings.map(sort =>
                     sort.sortColumn === columnName
                        ? { ...sort, isAscending: order === "asc" } // Update existing sort
                        : sort
                  )
                  : [...prev.sortings, { sortColumn: columnName, isAscending: order === "asc" }]; // Add new sort
      
               // Fetch the data with the updated sortings
               getEvictionQueueTasks(
                  evictionQueueTasks.currentPage,
                  evictionQueueTasks.pageSize,
                  selectEvictionQueueId,
                  evictionQueueTasks.actiontype ?? 0,
                  evictionQueueTasks.status ?? 0,
                  evictionQueueTasks.searchParam,
                  evictionQueueTasks.county,
                  evictionQueueTasks.company,
                  updatedSortings
               );
      
               // Return the updated state
               return {
                  ...prev,
                  sortings: updatedSortings
               };
            });
            break;
         case 4:
            setEvictionQueue4Tasks(prev => {
               const existingSort = prev.sortings.find(sort => sort.sortColumn === columnName);
      
               const updatedSortings = existingSort
                  ? prev.sortings.map(sort =>
                     sort.sortColumn === columnName
                        ? { ...sort, isAscending: order === "asc" } // Update existing sort
                        : sort
                  )
                  : [...prev.sortings, { sortColumn: columnName, isAscending: order === "asc" }]; // Add new sort
      
               // Fetch the data with the updated sortings
               getEvictionQueueTasks(
                  evictionQueueTasks.currentPage,
                  evictionQueueTasks.pageSize,
                  selectEvictionQueueId,
                  evictionQueueTasks.actiontype ?? 0,
                  evictionQueueTasks.status ?? 0,
                  evictionQueueTasks.searchParam,
                  evictionQueueTasks.county,
                  evictionQueueTasks.company,
                  updatedSortings
               );
      
               // Return the updated state
               return {
                  ...prev,
                  sortings: updatedSortings
               };
            });
            break;
            case 5:
               setEvictionQueue5Tasks(prev => {
                  const existingSort = prev.sortings.find(sort => sort.sortColumn === columnName);
         
                  const updatedSortings = existingSort
                     ? prev.sortings.map(sort =>
                        sort.sortColumn === columnName
                           ? { ...sort, isAscending: order === "asc" } // Update existing sort
                           : sort
                     )
                     : [...prev.sortings, { sortColumn: columnName, isAscending: order === "asc" }]; // Add new sort
         
                  // Fetch the data with the updated sortings
                  getEvictionQueueTasks(
                     evictionQueueTasks.currentPage,
                     evictionQueueTasks.pageSize,
                     selectEvictionQueueId,
                     evictionQueueTasks.actiontype ?? 0,
                     evictionQueueTasks.status ?? 0,
                     evictionQueueTasks.searchParam,
                     evictionQueueTasks.county,
                     evictionQueueTasks.company,
                     updatedSortings
                  );
         
                  // Return the updated state
                  return {
                     ...prev,
                     sortings: updatedSortings
                  };
               });
               break;
      }
      // Update the sortings state with the new sorting option, ensuring no duplicates
      
   };

   const handleDisableChange = async (
      evictionQueueTaskId: string | undefined,
      disabled: boolean,
      selectedRowIndex: number,
   ) => {
      updateDisable(evictionQueueTaskId || "", disabled);

      setEvictionQueueTasks((prevState) => ({
         ...prevState,
         items: prevState.items.map((item, index) => {
            if (selectedRowIndex === index) {
               return {
                  ...item,
                  disabled
               };
            }
            return item;
         })
      }));
   };

   const handleShowDetails = (id: string) => {
      setCurrentCaseId(id);
      setShowDetails(true);
   };

   const handleResubmitCase = async (id: string) => {
      const response = await EvictionQueuesService.resubmitCases([id]);
      if (response.status === HttpStatusCode.OK) {
         toast.success("Case resubmitted successfully.");
         getEvictionQueueTasks(
            1,
            100,
            selectEvictionQueueId,
            evictionQueueTasks.actiontype ?? 0,
            evictionQueueTasks.status ?? 0,
            evictionQueueTasks.searchParam,
            evictionQueueTasks.county,
            evictionQueueTasks.company,
            evictionQueueTasks.sortings
         );
      } else {
         toast.error("Failed to resubmitted case.");
      }
      setSelectedEvictionId([]);
      // setFilteredRecords([]);
      setBulkRecords([]);
   };

   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(Array(evictionQueueTasks.items?.length).fill(false));
   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [newSelectedRows, setNewSelectedRows] = useState<boolean[]>([]);
   const [selectAll, setSelectAll] = useState<boolean>();

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
      if (shiftKeyPressed && lastClickedFilteredRowIndex !== -1 && evictionQueueTasks) {
         const start = Math.min(index, lastClickedFilteredRowIndex);
         const end = Math.max(index, lastClickedFilteredRowIndex);
         setSelectedRows(Array.from({ length: end + 1 }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (evictionQueueTasks.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         evictionQueueTasks.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            setBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(item)); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //  setBulkRecords((prev)=>[...prev,item]);
         })
         setSelectedEvictionId(prevIds => [...new Set([...prevIds, ...selectedIds])]);

         // setSelectedProcessServerId(selectedIds);
      }
      // else {
      //   const updatedSelectedRows = [...selectedRows];
      //   updatedSelectedRows[index] = checked;
      //   setSelectedRows(updatedSelectedRows);
      //   if (processServerCases.items.length === updatedSelectedRows.filter(item => item).length) {
      //     setSelectAll(true);
      //   } else {
      //     setSelectAll(false);
      //   }
      //   const selectedIds = (processServerCases.items || [])
      //     .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
      //     .map((item) => item.id)
      //     .filter((id): id is string => typeof id === "string");


      //   setSelectedProcessServerId(selectedIds);
      // }
      else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (evictionQueueTasks.items.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = evictionQueueTasks.items.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         // const selectedIds = (fileEvictions.items || [])
         //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
         //   .map((item) => item.id)
         //   .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked        
            setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedEvictionId(prevIds => prevIds.filter(item => item !== id));
         } else {

            setBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(evictionQueueTasks.items.filter(x => x.id === id)[0])); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedEvictionId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }

      }
      setLastClickedFilteredRowIndex(index);
   };

   // const handleSelectAllChange = (checked: boolean) => {
   //   const newSelectAll = !selectAll;
   //   const allIds: string[] = processServerCases.items
   //     .map((item) => item.id)
   //     .filter((id): id is string => typeof id === "string");
   //   if (checked) {
   //     setSelectedProcessServerId(allIds);
   //   } else {
   //     setSelectedProcessServerId([]);
   //   }

   //   setSelectAll((prevSelectAll) => {
   //     // Update selectedRows state
   //     setSelectedRows(Array(allIds.length).fill(newSelectAll));
   //     return newSelectAll;
   //   });
   // };

   // const handleSelectAllChange = (checked: boolean) => {
   //    const newSelectAll = !selectAll;
   //    const allIds: string[] = evictionQueueTasks.items
   //       .filter(item =>
   //          typeof item.id === "string" &&
   //          (item.caseNumber === null || item.caseNumber === "") ||
   //          // ((selectEvictionQueueId == 2) && (item.status === "Completed" || item.status === "Error" || item.status === "To be processed"))
   //          ((selectEvictionQueueId == 2) && (item.status !== "Accepted"))
   //       )
   //       .map(item => item.id);
   //    if (checked) {
   //       evictionQueueTasks.items
   //          .map((item) => setBulkRecords((prev) => [...prev, item]));
   //       setSelectedEvictionId(prevIds => [...new Set([...prevIds, ...allIds])]);
   //    } else {
   //       evictionQueueTasks.items.forEach((item) => {
   //          setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
   //          setSelectedEvictionId(prevIds => prevIds.filter(id => id !== item.id));
   //       });
   //    }

   //    setSelectAll((prevSelectAll) => {
   //       // Update selectedRows state
   //       setSelectedRows(Array(allIds.length).fill(newSelectAll));
   //       return newSelectAll;
   //    });
   // };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      let allIds: string[];
      if (selectEvictionQueueId == 4) {
         allIds = evictionQueueTasks.items
            .filter(item =>
               typeof item.id === "string"
            )
            .map(item => item.id);
      }
      else {
         allIds = evictionQueueTasks.items
            .filter(item =>
               typeof item.id === "string" 
               // && (
               //   // (item.caseNumber === null || item.caseNumber === "") ||
               //    (
               //       //(selectEvictionQueueId == 2) && 
               //    (item.status !== "Accepted")))
            )
            .map(item => item.id);
      }

      if (checked) {
         setBulkRecords(prev => {
            const uniqueRecords = new Map(prev.map(item => [item.id, item])); // Using Map to ensure uniqueness
            evictionQueueTasks.items.forEach(item => {
               if (item.id && !uniqueRecords.has(item.id)) {
                  uniqueRecords.set(item.id, item);
               }
            });
            return Array.from(uniqueRecords.values());
         });

         //console.log(selectedEvictionId);
         setSelectedEvictionId(prevIds => {
            const uniqueIds = new Set([...prevIds, ...allIds]);
            return Array.from(uniqueIds);
         });

      } else {
         setBulkRecords(prevItems => prevItems.filter(record => !allIds.includes(record.id)));
         setSelectedEvictionId(prevIds => prevIds.filter(id => !allIds.includes(id)));
      }

      setSelectAll(() => {
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

   const checkIfAllIdsExist = (
      evictionItems: IEvictionQueueTaskItem[],
      selectedEvictionId: string[]
   ): boolean | undefined => {
      ;
      if (evictionItems?.length === 0) {
         return false;
      }
      // const filteredRecords = evictionItems.filter(item => typeof item.id === "string" && ((item.caseNumber === null && item.caseNumber === "") ||
      //    // ((selectEvictionQueueId == 2) && (item.status === "Completed" || item.status === "Error" || item.status === "To be processed"))
      //    ((selectEvictionQueueId == 2) && (item.status !== "Accepted"))));
      if (selectEvictionQueueId == 4) {
         return evictionItems.every(record =>
            selectedEvictionId.includes(record.id as string)
         );
      }
      const filteredRecords = evictionItems.filter(item => typeof item.id === "string");
      const filteredIds = filteredRecords.map(item => item.id);
      var result = filteredIds.every(id => selectedEvictionId.includes(id));
      return filteredIds.every(id => selectedEvictionId.includes(id));
   };

   const handleCellRendered = (cellIndex: number, data: IEvictionQueueTaskItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      ;
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => <GridCheckbox
         checked={selectedEvictionId.includes(data.id as string)}
         onChange={(checked: boolean) =>
            handleCheckBoxChange(rowIndex, data.id, checked)}
         label=""
      />,
         //    (//(selectEvictionQueueId == 1 && (data.caseNumber != null && data.caseNumber != "")) || 
         // (data.status === "Accepted")) ? (
         //    <GridCheckbox
         //       disabled={true}
         //       checked={false}
         //       onChange={(checked: boolean) => { }}
         //       label=""
         //    />
         // ) : (
         //    <GridCheckbox
         //       checked={selectedEvictionId.includes(data.id as string)}
         //       onChange={(checked: boolean) =>
         //          handleCheckBoxChange(rowIndex, data.id, checked)}
         //       label=""
         //    />
         // ),
         caseNumber: () => renderHighlightedCell(cellValue),
         gridAction: () => renderGridActionCell(data),
         name: () => renderHighlightedCell(cellValue),
         county: () => renderHighlightedCell(cellValue),
         status: () => renderStatusCell(cellValue, data.county),
         disabled: () => renderDisabledCell(cellValue, data, rowIndex),
         endpointUrl: () => renderHighlightedCell(cellValue),
         address: () => formattedAddressCell(data),
         evictionDateFiled: () => formattedDateCell(cellValue),
         dateFiled: () => formattedDateCell(cellValue),
         evictionServiceDate: () => formattedDateCell(cellValue),
         answerBy: () => formattedDateCell(cellValue),
         courtDate: () => formattedDateCell(cellValue),
         dismissalFileDate: () => formattedDateCell(cellValue),
         writFiledDate: () => formattedDateCell(cellValue),
         answerDate: () => formattedDateCell(cellValue),
         caseReferenceId: () => renderHighlightedCell(cellValue),
         envelopeID: () => renderHighlightedCell(cellValue),
         attorneyBarNo: () => formattedCell(cellValue),
         writSignDate: () => formattedDateCell(cellValue),
         evictionAffiantSignDate: () => formattedDateCell(cellValue),
         tenantOne: () => formattedFullNameCell((data && data.tenantNames && data.tenantNames[0]) ? data.tenantNames[0] : null),
         tenantTwo: () => formattedFullNameCell((data && data.tenantNames && data.tenantNames[1]) ? data.tenantNames[1] : null),
         tenantThree: () => formattedFullNameCell((data && data.tenantNames && data.tenantNames[2]) ? data?.tenantNames[2] : null),
         tenantFour: () => formattedFullNameCell((data && data.tenantNames && data.tenantNames[3]) ? data?.tenantNames[3] : null),
         tenantFive: () => formattedFullNameCell((data && data.tenantNames && data.tenantNames[4]) ? data?.tenantNames[4] : null),
         evictionCourtAmount: () => renderHighlightedAmount(cellValue, data),
         // for manual tab
         tenantAddress: () => formattedCell(data?.address),
         tenant1Last: () => renderHighlightedCell(data?.tenantNames[0]?.lastName),
         tenant1First: () => renderHighlightedCell(data?.tenantNames[0]?.firstName),
         tenant1MI: () => renderHighlightedCell(data?.tenantNames[0]?.middleName),
         tenant2Last: () => renderHighlightedCell(data?.tenantNames[1]?.lastName),
         tenant2First: () => renderHighlightedCell(data?.tenantNames[1]?.firstName),
         tenant2MI: () => renderHighlightedCell(data?.tenantNames[1]?.middleName),
         tenant3Last: () => renderHighlightedCell(data?.tenantNames[2]?.lastName),
         tenant3First: () => renderHighlightedCell(data?.tenantNames[2]?.firstName),
         tenant3MI: () => renderHighlightedCell(data?.tenantNames[2]?.middleName),
         tenant4Last: () => renderHighlightedCell(data?.tenantNames[3]?.lastName),
         tenant4First: () => renderHighlightedCell(data?.tenantNames[3]?.firstName),
         tenant4MI: () => renderHighlightedCell(data?.tenantNames[3]?.middleName),
         tenant5Last: () => renderHighlightedCell(data?.tenantNames[4]?.lastName),
         tenant5First: () => renderHighlightedCell(data?.tenantNames[4]?.firstName),
         tenant5MI: () => renderHighlightedCell(data?.tenantNames[4]?.middleName),
         expedited: () => <span>{cellValue != "" && cellValue != null ? "Expedited" : ""}</span>,
         monthlyRent: () => formatCurrencyCell(cellValue),
         evictionTotalRentDue: () => formatCurrencyCell(cellValue),
         createdDate: () => formattedDateCell(cellValue),
         timeStamp: () => formattedDateCell(cellValue),
      };

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

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   // const formattedDateCell = (value: any) => (
   //    <span>{value !== null ? formattedDate(value) : ""}</span>
   // );
   const formattedDateCell = (value: any) => (
      <span>{value !== null && value != "" ? convertUtcToEst(value).date : ""}</span>
      //   <span>{value !== null ? formattedDate(value) : ""}</span>
   );

   const formattedFullNameCell = (tenant: ITenant | null): JSX.Element => {
      if (!tenant) return <></>;
      if (tenant === null) return <></>;
      const { firstName, lastName, middleName } = tenant;
      const fullName = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
      return <HighlightedText text={fullName} query={evictionQueueTasks.searchParam ?? ''} />;
   };

   const formattedAddressCell = (value: IEvictionQueueTaskItem) => (
      <>
         {
            value !== null
               ? <HighlightedText text={`${value.address ?? ''} ${value.unit ?? ''} ${value.city ?? ''} ${value.state ?? ''} ${value.zip ?? ''}`} query={evictionQueueTasks.searchParam ?? ''} />
               : ''
         }
      </>
   );

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

   const renderGridActionCell = (item: IEvictionQueueTaskItem) => (
      <>
         <IconButton
            type={"button"}
            className="cursor-pointer text-[#2472db]"
            disabled={!item.id?.length}
            icon={<FaEye className="h-4 w-4" />}
            handleClick={() => handleShowDetails(item.dispoId ?? "")}
            title="View"
         />
         <IconButton
            type={"button"}
            className={`cursor-pointer text-[#2472db] ml-1.5 ${(item.status == "Tyler Error" || item.status == "System Error" || item.status === "Rejected" || item.status == "API Off") && selectEvictionQueueId != 1 ? "" : "hidden"}`}
            icon={<FaRedo className="h-4 w-4" />}
            title="Resubmit"
            handleClick={() => handleResubmitCase(item.id ?? "")}
         />
      </>
   );

   const renderHighlightedCell = (cellValue: any) => (
      <HighlightedText text={cellValue ?? ''} query={evictionQueueTasks.searchParam ?? ''} />
   );

   // const renderHighlightedAmount = (cellValue: any, data: IEvictionQueueTaskItem) => {
   //    if (data && data.isTransactionFeeChanged) {
   //       return <span style={{ backgroundColor: 'lightgreen' }}>{formatCurrencyCell(cellValue) ?? ""}</span>;
   //    } else {
   //       return <span>{formatCurrencyCell(cellValue) ?? ""}</span>;
   //    }
   // };

   const renderHighlightedAmount = (cellValue: any, data: IEvictionQueueTaskItem) => {
      // Convert cellValue to a number for currency formatting
      const numericValue = parseFloat(cellValue);
      let formattedValue = cellValue;

      // Check if the parsed value is a valid number
      if (!isNaN(numericValue)) {
         // Format as currency if it's a valid number
         formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericValue);
      }

      // Apply conditional styling based on data.isTransactionFeeChanged
      const style = data && data.isTransactionFeeChanged ? { backgroundColor: 'lightgreen' } : {};

      return <span style={style}>{formattedValue}</span>;
   };

   const formatCurrencyCell = (value: any): JSX.Element => {
      // Try to parse the value as a number
      const numericValue = parseFloat(value);

      // Check if the parsed value is a valid number
      const formattedValue = !isNaN(numericValue)
         ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericValue)
         : value;

      return <span>{formattedValue}</span>;
   };

   const renderDisabledCell = (cellValue: any, data: IEvictionQueueTaskItem, rowIndex: number) => (
      <ToggleSwitch
         value={cellValue}
         label={""}
         handleChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleDisableChange(data.id, event.target.checked, rowIndex);
         }}
      ></ToggleSwitch>
   );

   const handleStatusChange = async (
      evictionQueueId: number | undefined,
      status: boolean,
   ) => {
      const updatedEvictionQueuesData = setQueueStatus(evictionQueueId || 0, status);
      if (evictionQueueId) {
         const response = await EvictionQueuesService.updateStatus(evictionQueueId, status);
         if (response.status === HttpStatusCode.OK) {
            setEvictionQueuesData(updatedEvictionQueuesData);
            toast.success("Status successfully updated.");
         } else {
            toast.error("Failed to update status.");
         }
      }
   };

   const setQueueStatus = (evictionQueueId: number, status: boolean) => {
      return {
         ...evictionQueuesData,
         items: evictionQueuesData.items.map((item) => {
            if (item.id === evictionQueueId) {
               return {
                  ...item,
                  status: status
               };
            }
            return item;
         })
      };
   };

   return (
      <>
         <div className="relative pt-1.5 md:pt-2.5 -mr-1 management_view">
         <div className="mb-2 text-sm text-gray-600">
            {selectedEvictionId  .length} of {evictionQueueTasks.totalCount} records selected
         </div>
            <>
               <>
                  {selectEvictionQueueId === 1 && evictionQueuesData.items.map((item, index) => {
                     return (
                        item.id === selectEvictionQueueId ?
                           <ToggleSwitch
                              key={index}
                              value={item.status}
                              label={item.status ? "Running" : "Stopped"} // Assuming cellValue is defined1
                              handleChange={(event: ChangeEvent<HTMLInputElement>) => {
                                 handleStatusChange(selectEvictionQueueId, event.target.checked);
                              }}
                           />
                           :
                           null
                     );
                  })}
               </>
               {showSpinner ? (
                  <Spinner />
               ) : (
                  <>
                     <Grid
                        columnHeading={visibleColumns}
                        rows={evictionQueueTasks.items}
                        handleSelectAllChange={handleSelectAllChange}
                        selectAll={checkIfAllIdsExist(evictionQueueTasks.items, selectedEvictionId)}
                        cellRenderer={(data: IEvictionQueueTaskItem, rowIndex: number, cellIndex: number) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                        handleSorting={handleSorting}
                        activeSortingMap={evictionQueueTasks.sortings}
                        selectedIds={selectedEvictionId}
                     />
                     {/* Render the Pagination component with relevant props */}
                     <Pagination
                        numberOfItemsPerPage={evictionQueueTasks.pageSize}
                        currentPage={evictionQueueTasks.currentPage}
                        totalPages={evictionQueueTasks.totalPages}
                        totalRecords={evictionQueueTasks.totalCount}
                        handleFrontButton={handleFrontButton}
                        handleBackButton={handleBackButton}
                        canPaginateBack={canPaginateBack}
                        canPaginateFront={canPaginateFront}
                     />
                  </>
               )}
            </>
         </div>
         {showDetails && (
            <AllCasesDetails
               title="Case Details"
               caseId={currentCaseId}
               showDetails={showDetails}
               setShowDetails={(show: boolean) => setShowDetails(show)}
            />
         )}
      </>
   );
};

export default EvictionQueueTasksGrid;