import React, { useEffect, useState, useRef } from "react";
import { FaEye } from "react-icons/fa";
import { useEvictionAutomationContext } from "../EvictionAutomationContext";
import { useAuth } from "context/AuthContext";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import GridCheckbox from "components/formik/GridCheckBox";
import IconButton from "components/common/button/IconButton";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import { IGridHeader } from "interfaces/grid-interface";
import {
   IEvictionAutomationButton, IEvictionAutomationQueueItem
} from "interfaces/eviction-automation.interface";
import EvictionAutomationDetails from "./EvictionAutomationDetails";
import { EvictionAutomationButtonList } from "utils/constants";
import { convertUtcToEst, formattedDate, toCssClassName } from "utils/helper";
import { UserRole } from "utils/enum";
import EvictionSearch_filter from './EvictionAutomationActions/EvictionSearch_Filter';

type EvictionAutomationGridProps = {};

const EvictionAutomationCRMSettingsGrid = (props: EvictionAutomationGridProps) => {
   const { userRole } = useAuth();
   const initialColumnMapping: IGridHeader[] = [
      { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
      // { columnName: "action", label: "Action", className: "action" },
      // { columnName: "clientId", label: "ClientId" },
      { columnName: "company", label: "CompanyName" },
      ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "notes", label: "EANotes" }] : [],
      // { columnName: "notes", label: "EANotes" },
      ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "disabled", label: "Disabled" }] : [],
      // { columnName: "disabled", label: "Disabled" },
      {columnName:"crmName",label:"CrmName"},
      { columnName: "ownerId", label: "OwnerId" },
      { columnName: "propertyId", label: "PropertyId" },
      { columnName: "confirmationPin", label: "ConfirmationPin" },
      { columnName: "county", label: "County" },
      { columnName: "filerBusinessName", label: "FilerBusinessName" },
      { columnName: "propertyName", label: "PropertyName" },
      // { columnName: "evictionFilingDate", label: "EvictionDelinquencyDate"},
      { columnName: "evictionFilingDays", label: "EvictionDelinquencyDate"},

      { columnName: "dismissalNotificationDay", label: "DismissalNotificationDay" },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "stateCourt", label: "StateCourt" },
      { columnName: "confirmReportEmail", label: "EvictionConfirmEmail" },
      { columnName: "signerEmail", label: "EvictionSignerEmail" },
      { columnName: "ccEmails", label: "CcEmails" },
      {columnName:"noticeDelinquencyDate",label:"NoticeDelinquencyDate"},
      {columnName:"noticeDismissalDate",label:"NoticeDismissalDate"},
      {columnName:"noticeConfirmEmail",label:"NoticeConfirmEmail"},
      {columnName:"noticeSignerEmail",label:"NoticeSignerEmail"},
      { columnName: "propertyEmail", label: "PropertyEmail" },
      { columnName: "evictionFilerEmail", label: "EvictionFilerEmail" },
      { columnName: "attorneyEmail", label: "AttorneyEmail" },
      { columnName: "attorneyName", label: "AttorneyName" },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo", className:'text-right' },
      { columnName: "evictionAffiantIs", label: "EvictionAffiantIs" },
      { columnName: "processServer", label: "ProcessServer" },
      { columnName: "andAllOtherOccupants", label: "AndAllOtherOccupants" },
      ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "tenantAddressConfig", label: "TenantAddressConfig" }] : [],
      // { columnName: "tenantAddressConfig", label: "TenantAddressConfig" },
      ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "unitsUsePropertyAddress", label: "UnitsUsePropertyAddress" }] : [],
      // { columnName: "unitsUsePropertyAddress", label: "UnitsUsePropertyAddress" },
      { columnName: "propertyAddress", label: "PropertyAddress" },
      { columnName: "propertyCity", label: "PropertyCity" },
      { columnName: "propertyState", label: "PropertyState" },
      { columnName: "propertyZip", label: "PropertyZip", className:'text-right' },
      { columnName: "propertyPhone", label: "PropertyPhone" },
      { columnName: "ownerName", label: "OwnerName" },
      { columnName: "ownerAddress", label: "OwnerAddress" },
      { columnName: "ownerCity", label: "OwnerCity" },
      { columnName: "ownerState", label: "OwnerState" },
      { columnName: "ownerZip", label: "OwnerZip", className:'text-right' },
      { columnName: "ownerEmail", label: "OwnerEmail" },
      { columnName: "ownerPhone", label: "OwnerPhone" },
      ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "noticesRequired", label: "NoticesRequired" }] : [],
      // { columnName: "noticesRequired", label: "NoticesRequired" },
      ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "daysToFileAfterNoticeDelivery", label: "DaysToFileAfterNoticeDelivery", className:'text-right' }] : [],
      // { columnName: "daysToFileAfterNoticeDelivery", label: "DaysToFileAfterNoticeDelivery", className:'text-right' },
      // { columnName: "allowMultipleImports", label: "AllowMultipleImports" },
      { columnName: "filingThresholdAdjustment", label: "FilingThresholdAdjustment", className:'text-right' },
      { columnName: "minimumFilingAmount", label: "MinimumFilingAmount", className:'text-right' },
      ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "prescreenSignEmail", label: "PrescreenSignEmail" }] : [],
      // { columnName: "prescreenSignEmail", label: "PrescreenSignEmail" },
      ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "prescreenConfirmEmail", label: "PrescreenConfirmEmail" }] : [],
      // { columnName: "prescreenConfirmEmail", label: "PrescreenConfirmEmail" },
      { columnName: "bccEmails", label: "BccEmails" }
   ];
   const {
      showSpinner,
      evictionAutomationQueue,
      getEvictionAutomationQueue,
      selectedEvictionAutomationQueueIds,
      setSelectedEvictionAutomationQueueIds,
      setBulkEditRecords,
      getAllCompanies,
      getAllCounties,
      getAllPMS,
      //getAllIntegrations
   } = useEvictionAutomationContext();

   const isMounted = useRef(true);
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   //const [evictionAutomationList, setEvictionAutomationList] = useState<IEvictionAutomationQueue>(evictionAutomationQueue);
   // const [evictionAutomationRecords, setEvictionAutomationRecords] = useState<IEvictionAutomationQueueItem[]>([]);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionAutomationQueue.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionAutomationQueue.totalPages > 1);

   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(evictionAutomationQueue.items.length).fill(false)
   );

   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   const [newSelectedRows] = useState<boolean[]>([]);
   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [selectedButtons, setselectedButtons] = useState<IEvictionAutomationButton[]>([]);

   const [selectedEviction, setSelectedEviction] = useState<IEvictionAutomationQueueItem | null>(null);

   useEffect(() => {
      getAllCompanies();
     // getAllIntegrations();
     getAllPMS();
      getAllCounties();
      if (evictionAutomationQueue.totalCount <= 1) {
         if (isMounted.current) {
            getEvictionAutomationQueue(1, 100, evictionAutomationQueue.searchParam);
            isMounted.current = false;
         }
      }
      const selectedButtons = EvictionAutomationButtonList.filter(button => button.title === "Edit" || button.title === "Delete" || button.title === "Add ");
      setselectedButtons(selectedButtons);
      setSelectedEvictionAutomationQueueIds([]);
   }, []);

   useEffect(() => {
      // const evictionAutomationRecords: IEvictionAutomationQueueItem[] = evictionAutomationQueue.items.map((item: any) => {
      //    return {
      //       isChecked: selectedEvictionAutomationQueueIds.includes(item.id) ? true : false, // Add the new property
      //       ...item, // Spread existing properties
      //    };
      // });

      // setEvictionAutomationRecords(evictionAutomationRecords);

      const updatedSelectedRows = (evictionAutomationQueue.items || []).map((item: any) =>
         selectedEvictionAutomationQueueIds.includes(item.id)
      );

      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(evictionAutomationQueue.currentPage > 1);
      setCanPaginateFront(evictionAutomationQueue.totalPages > 1);

      // Update the state with the new selectedRows array
      setSelectedRows(updatedSelectedRows);

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

   }, [evictionAutomationQueue, selectedEvictionAutomationQueueIds]);

   const prepareEvictionDataForApi = async (item: IEvictionAutomationQueueItem) => {
      
      const checkItem = {
         id: item.id,
         company: item.company ?? "",
         clientId: item.clientId ?? "",
         evictionAffiantIs: item.evictionAffiantIs ?? "",
         andAllOtherOccupants: item.andAllOtherOccupants ?? "",
         allowMultipleImports: item.allowMultipleImports ?? false,
         attorneyBarNo: item.attorneyBarNo ?? "",
         attorneyEmail: item.attorneyEmail ?? "",
         attorneyName: item.attorneyName ?? "",
         bccEmails: item.bccEmails ?? "",
         ccEmails: item.ccEmails ?? "",
         tenantAddressConfig: item.tenantAddressConfig ?? "",
         confirmReportEmail: item.confirmReportEmail ?? "",
         county: item.county ?? "",
         daysToFileAfterNoticeDelivery: item.daysToFileAfterNoticeDelivery ?? 0,
         disabled: item.disabled ?? false,
         dismissalNotificationDay: item.dismissalNotificationDay ?? "",
         expedited: item.expedited ?? false,
         filerBusinessName: item.filerBusinessName ?? "",
         evictionFilerEmail: item.evictionFilerEmail ?? "",
         // evictionFilingDate: item.evictionFilingDate ?? null,
         evictionFilingDays: item.evictionFilingDays,
         filingThresholdAdjustment: item.filingThresholdAdjustment ?? null,
         minimumFilingAmount: item.minimumFilingAmount ?? null,
         notes: item.notes ?? "",
         noticesRequired: item.noticesRequired ?? false,
         ownerId: item.ownerId ?? "",
         ownerName: item.ownerName ?? "",
         prescreenConfirmEmail: item.prescreenConfirmEmail ?? "",
         processServer: item.processServer ?? "",
         propertyAddress: item.propertyAddress ?? "",
         propertyCity: item.propertyCity ?? "",
         propertyEmail: item.propertyEmail ?? "",
         propertyId: item.propertyId ?? "",
         propertyName: item.propertyName ?? "",
         propertyPhone: item.propertyPhone ?? "",
         propertyState: item.propertyState ?? "",
         propertyStreetNo: item.propertyStreetNo ?? "",
         propertyZip: item.propertyZip ?? "",
         prescreenSignEmail: item.prescreenSignEmail ?? false,
         signerEmail: item.signerEmail ?? "",
         stateCourt: item.stateCourt ?? false,
         unitsUsePropertyAddress: item.unitsUsePropertyAddress ?? false,
         ownerAddress:item.ownerAddress??"",
         ownerCity:item.ownerCity??"",
         ownerState:item.ownerState??"",
         ownerZip:item.ownerZip??"",
         ownerEmail:item.ownerEmail??"",
         ownerPhone:item.ownerPhone??"",
         crmName:item.crmName??"",
         noticeDelinquencyDate:item.noticeDelinquencyDate??null,
         noticeDismissalDate:item.noticeDismissalDate??null,
         noticeConfirmEmail:item.noticeConfirmEmail,
         noticeSignerEmail:item.noticeSignerEmail,
         confirmationPin:item.confirmationPin,
         integrationId:item.integrationId,
         xpropertyId:item.xPropertyId
      };

      setBulkEditRecords(prevItems => {
         const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
         uniqueItems.add(JSON.stringify(checkItem)); // Add the new item
         return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
      });
   };

   const checkIfAllIdsExist = (
        evictionAutomationRecords: IEvictionAutomationQueueItem[],
      selectedEvictionAutomationQueueIds: string[]
   ): boolean | undefined => {
      if (evictionAutomationRecords.length === 0) {
          return false;
      }
      return evictionAutomationRecords.every(record =>
         selectedEvictionAutomationQueueIds.includes(record.id as string)
      );
   };
   // const checkIfAllIdsExist = (
   //    evictionAutomationRecords: IEvictionAutomationQueueItem[],
   //    selectedEvictionAutomationQueueIds: string[]
   // ): boolean | undefined => {

   //    return evictionAutomationRecords.every(record =>
   //       selectedEvictionAutomationQueueIds.includes(record.id as string)
   //    );
   // };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = evictionAutomationQueue.items
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         evictionAutomationQueue.items.map((item) => prepareEvictionDataForApi(item));
         setSelectedEvictionAutomationQueueIds(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         evictionAutomationQueue.items.forEach((item) => {
            setBulkEditRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedEvictionAutomationQueueIds(prevIds => prevIds.filter(id => id !== item.id));
         });
      };

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
      
      if (shiftKeyPressed && lastClickedRowIndex !== -1 && evictionAutomationQueue.items) {
         const start = Math.min(index, lastClickedRowIndex);
         const end = Math.max(index, lastClickedRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (evictionAutomationQueue.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         evictionAutomationQueue.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            prepareEvictionDataForApi(item);
         });
         setSelectedEvictionAutomationQueueIds(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (evictionAutomationQueue.items.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = evictionAutomationQueue.items.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked
            setBulkEditRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedEvictionAutomationQueueIds(prevIds => prevIds.filter(item => item !== id));
         } else {
            prepareEvictionDataForApi(evictionAutomationQueue.items.filter(x => x.id === id)[0]);
            setSelectedEvictionAutomationQueueIds(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }
      }

      setLastClickedRowIndex(index);
   };

   const handleFrontButton = () => {
      if (evictionAutomationQueue.currentPage < evictionAutomationQueue.totalPages) {
         const updatedCurrentPage = evictionAutomationQueue.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         // getEvictionAutomationQueue(
         //    updatedCurrentPage,
         //    evictionAutomationQueue.pageSize
         // );
      }
   };

   const handleBackButton = () => {
      if (
         evictionAutomationQueue.currentPage > 1 &&
         evictionAutomationQueue.currentPage <= evictionAutomationQueue.totalPages
      ) {
         const updatedCurrentPage = evictionAutomationQueue.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(evictionAutomationQueue.currentPage > 1);
         // back button get late notices
         // getEvictionAutomationQueue(
         //    updatedCurrentPage,
         //    evictionAutomationQueue.pageSize
         // );
      }
   };

   const handleSorting = (columnName: string, order: string) => {
      // Copy the current fileEvictionRecords array to avoid mutating the state directly
      const sortedRecords = [...evictionAutomationQueue.items];
      // Define a compare function based on the column name and order
      const compare = (a: any, b: any) => {
         // Extract values for comparison
         // const propertyName =Object.keys(initialColumnMapping).find(key => (initialColumnMapping as any)[key].heading === columnName)

         const aValue1 =
            columnName != "tenantOne"
               ? a[columnName]
               : a.tenantNames[0]["firstName"];
         const bValue1 =
            columnName != "tenantOne"
               ? b[columnName]
               : b.tenantNames[0]["firstName"];

         // Implement sorting logic based on the order (ascending or descending)
         if (order === "asc") {
            if (aValue1 < bValue1) return -1;
            if (aValue1 > bValue1) return 1;
            return 0;
         } else {
            if (aValue1 > bValue1) return -1;
            if (aValue1 < bValue1) return 1;
            return 0;
         }
      };

      // Sort the records array using the compare function
      sortedRecords.sort(compare);

      // Update the state with sorted records
      //setEvictionAutomationRecords(sortedRecords);
   };

   const handleShowDetails = (data: IEvictionAutomationQueueItem) => {
      
      setSelectedEviction(data);
      setShowDetails(true);
   };

   const handleCellRendered = (cellIndex: number, data: IEvictionAutomationQueueItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               // checked={selectedRows.some(row => row.id === data.id && row.selected)}
               checked={selectedEvictionAutomationQueueIds.includes(data.id as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id as string, checked)
               }
               label=""
            />
         ),
         action: () => renderActionsCell(data),
         allowMultipleImports: () => renderBooleanAsYesNo(cellValue),
         disabled: () => renderBooleanAsYesNo(cellValue),
         noticesRequired: () => renderBooleanAsYesNo(cellValue),
         prescreenSignEmail: () => renderBooleanAsYesNo(cellValue),
         unitsUsePropertyAddress: () => renderBooleanAsYesNo(cellValue),
         expedited: () => formattedExpeditedCell(cellValue),
         stateCourt: () => formattedStateCourtCell(cellValue),
         clientId: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationQueue.searchParam ?? ''} />,
         company: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationQueue.searchParam ?? ''} />,
         filerBusinessName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationQueue.searchParam ?? ''} />,
         notes: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationQueue.searchParam ?? ''} />,
         ownerId: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationQueue.searchParam ?? ''} />,
         propertyId: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationQueue.searchParam ?? ''} />,
         confirmReportEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationQueue.searchParam ?? ''} />,
         noticeDelinquencyDate:()=>formattedDateCell(cellValue),
         noticeDismissalDate:()=>formattedDateCell(cellValue),
         // evictionFilingDate:()=>formattedDateCell(cellValue),
      };

      const renderer = renderers[propertyName] || (() => formattedCell(cellValue));
      // const formattedDateCell = (value: any) => (
      //    <span>{value !== null ? formattedDate(value) : ""}</span>
      // );
      const formattedDateCell = (value: any) => (
         <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
      //   <span>{value !== null ? formattedDate(value) : ""}</span>
      );
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

   const formattedExpeditedCell = (expedited: boolean) => (
      <span>{expedited ? "Expedited" : ""}</span>
   );

   const formattedStateCourtCell = (stateCourt: boolean) => (
      <span>{stateCourt ? "State Court" : ""}</span>
   );

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   const renderBooleanAsYesNo = (value: boolean) => (
      <span>{value as boolean ? "Yes" : "No"}</span>
   );

   const renderActionsCell = (data: IEvictionAutomationQueueItem) => (
      <div className="flex justify-center gap-1.5">
         <IconButton
            type={"button"}
            className="cursor-pointer text-[#2472db]"
            disabled={!data?.id?.length}
            icon={<FaEye className="h-4 w-4" />}
            handleClick={() => handleShowDetails(data)}
         />
      </div>
   );

   return (
      <div>
         <div className="relative -mr-0.5">
            <div className="relative -mr-0.5">
               {showSpinner && <Spinner />}
               <div className="relative flex flex-wrap items-center mb-2 mt-2.5">                  
               <EvictionSearch_filter/>
               </div>
               <Grid
                  columnHeading={visibleColumns}
                  rows={evictionAutomationQueue.items}
                  handleSelectAllChange={handleSelectAllChange}
                  selectAll={checkIfAllIdsExist(evictionAutomationQueue.items, selectedEvictionAutomationQueueIds)}
                  cellRenderer={(data: IEvictionAutomationQueueItem, rowIndex: number, cellIndex: number) =>
                     handleCellRendered(cellIndex, data, rowIndex)
                  }
                  handleSorting={handleSorting}
                  selectedIds={selectedEvictionAutomationQueueIds}
               />
               <Pagination
                  numberOfItemsPerPage={evictionAutomationQueue.pageSize}
                  currentPage={evictionAutomationQueue.currentPage}
                  totalPages={evictionAutomationQueue.totalPages}
                  totalRecords={evictionAutomationQueue.totalCount}
                  handleFrontButton={handleFrontButton}
                  handleBackButton={handleBackButton}
                  canPaginateBack={canPaginateBack}
                  canPaginateFront={canPaginateFront}
               />
            </div>
         </div>
         {showDetails && (
            <EvictionAutomationDetails
               data={selectedEviction}
               showDetails={showDetails}
               setShowDetails={(show: boolean) => setShowDetails(show)}
            />
         )}
      </div>
   );
};

export default EvictionAutomationCRMSettingsGrid;