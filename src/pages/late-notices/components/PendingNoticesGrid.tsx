import React, { useEffect, useRef, useState } from 'react';
import Grid from 'components/common/grid/GridWithToolTip';
import Spinner from 'components/common/spinner/Spinner';
import Pagination from "components/common/pagination/Pagination";
import GridCheckbox from 'components/formik/GridCheckBox';
import HighlightedText from 'components/common/highlightedText/HighlightedText';
import { IGridHeader } from 'interfaces/grid-interface';
import { IEvictionAutomationNoticesQueue } from 'interfaces/eviction-automation.interface';
import { IFileEvictionsItems } from 'interfaces/file-evictions.interface';
import { ITenant } from 'interfaces/file-evictions.interface';
import { useLateNoticesContext } from '../LateNoticesContext';
import { useAuth } from 'context/AuthContext';
import { UserRole } from 'utils/enum';
import { formatCurrency, formattedDate } from 'utils/helper';
import { toCssClassName } from "utils/helper";

const PendingNoticesGrid: React.FC = () => {
   const { showSpinner,
      selectedEvictionNoticeId,
      setSelectedEvictionNoticeId,
      getEvictionAutomationNoticeQueue,
      evictionAutomationNoticesConfirmQueue,
      setSelectedTab,
   } = useLateNoticesContext();
   const { userRole } = useAuth();

   const initialColumnMapping: IGridHeader[] = [

      { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "county", label: "County" },
      { columnName: "tenantOne", label: "TenantOne" },
      {columnName:"tenantAddressCombined",label:"TenantAddressCombined"},
      { columnName: "monthlyRent", label: "MonthlyRent" , className:'text-right'},
      { columnName: "noticeTotalDue", label: "NoticeTotalDue", className:'text-right' },
      { columnName: "noticeDefaultStartDate", label: "NoticeDefaultStartDate" },
      { columnName: "noticeDefaultEndDate", label: "NoticeDefaultEndDate" },
      { columnName: "noticeLastPaidDate", label: "NoticeLastPaidDate" },
      { columnName: "noticeLastPaidAmount", label: "NoticeLastPaidAmount", className:'text-right' },
      { columnName: "noticeCurrentRentDue", label: "NoticeCurrentRentDue" , className:'text-right'},
      { columnName: "noticePastRentDue", label: "NoticePastRentDue", className:'text-right' },
      {columnName:"noticeServerID",label:"NoticeServerId", className:'text-right'},
      {columnName:"noticeCount",label:"NoticeCount", className:'text-right'},
      {columnName:"previousNotices",label:"PreviousNotices"},
      ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)
      ?[ { columnName: "companyName", label: "CompanyName" }]
      : []
    ),
    //   { columnName: "crmName", label: "CrmName" },
    //   { columnName: "ownerId", label: "OwnerId" },
    //   { columnName: "propertyId", label: "PropertyId" },
    //   { columnName: "unitId", label: "UnitId" },
    //   { columnName: "pullTime", label: "PullTime" },
    //   { columnName: "batchId", label: "BatchId" },    
     // { columnName: "companyName", label: "Company" },  
    //   { columnName: "tenant1Last", label: "Tenant1Last" },
    //   { columnName: "tenant1First", label: "Tenant1First" },
    //   { columnName: "tenant1MI", label: "Tenant1MI" },
    //   { columnName: "andAllOtherTenants", label: "AndAllOtherOccupants" },      
    //   { columnName: "tenantAddress", label: "TenantAddress", className: "TenantAddress", },
    //   { columnName: "tenantUnit", label: "TenantUnit" },
    //   { columnName: "tenantCity", label: "TenantCity" },
    //   { columnName: "tenantState", label: "TenantState" },
    //   { columnName: "tenantZip", label: "TenantZip" },
    //   { columnName: "tenant2Last", label: "Tenant2Last" },
    //   { columnName: "tenant2First", label: "Tenant2First" },
    //   { columnName: "tenant2MI", label: "Tenant2MI" },
    //   { columnName: "tenant3Last", label: "Tenant3Last" },
    //   { columnName: "tenant3First", label: "Tenant3First" },
    //   { columnName: "tenant3MI", label: "Tenant3MI" },
    //   { columnName: "tenant4Last", label: "Tenant4Last" },
    //   { columnName: "tenant4First", label: "Tenant4First" },
    //   { columnName: "tenant4MI", label: "Tenant4MI" },
    //   { columnName: "tenant5Last", label: "Tenant5Last" },
    //   { columnName: "tenant5First", label: "Tenant5First" },
    //   { columnName: "tenant5MI", label: "Tenant5MI" },
    //   { columnName: "reason", label: "EvictionReason", className: "EvictionReason", },
    //   { columnName: "evictionTotalRentDue", label: "EvictionTotalRentDue" },   
    //   { columnName: "allMonths", label: "AllMonths" },
    //   { columnName: "evictionOtherFees", label: "EvictionOtherFees" },
    //   { columnName: "ownerName", label: "OwnerName" },      
    //   { columnName: "propertyPhone", label: "PropertyPhone" },
    //   { columnName: "propertyEmail", label: "PropertyEmail", className: "PropertyEmail", },
    //   { columnName: "propertyAddress", label: "PropertyAddress", className: "PropertyAddress", },
    //   { columnName: "propertyCity", label: "PropertyCity" },
    //   { columnName: "propertyState", label: "PropertyState" },
    //   { columnName: "propertyZip", label: "PropertyZip" },
    //   { columnName: "attorneyName", label: "AttorneyName" },
    //   { columnName: "attorneyBarNo", label: "AttorneyBarNo" },
    //   { columnName: "attorneyEmail", label: "AttorneyEmail", className: "AttorneyEmail", },
    //   { columnName: "filerBusinessName", label: "FilerBusinessName" },
    //   { columnName: "evictionAffiantIs", label: "EvictionAffiantIs" },
    //   { columnName: "filerPhone", label: "EvictionFilerPhone" },
    //   { columnName: "filerEmail", label: "EvictionFilerEmail" },
    //   { columnName: "expedited", label: "Expedited" },
    //   { columnName: "stateCourt", label: "StateCourt" },
    //   { columnName: "clientReferenceId", label: "ClientReferenceId" },
    //   { columnName: "processServerCompany", label: "ProcessServerCompany" },
    //   { columnName: "noticeDeliveryDate", label: "NoticeDeliveryDate" },
    //   { columnName: "noticeLateFees", label: "NoticeLateFees" },
    //  { columnName: "noticeServerID", label: "NoticeServerID" },
   ];

   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   const [newSelectedRows, setNewSelectedRows] = useState<boolean[]>([]);
   const isMounted = useRef(true);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionAutomationNoticesConfirmQueue.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionAutomationNoticesConfirmQueue.totalPages > 1);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(evictionAutomationNoticesConfirmQueue.items.length).fill(false)
   );

   useEffect(() => {

      if (isMounted.current) {
         setSelectedTab("EA - Ready to Confirm");
      setSelectedEvictionNoticeId([]);
      if (localStorage.getItem("casesList"))
         getEvictionAutomationNoticeQueue(1, 100, false, false);
      else
         getEvictionAutomationNoticeQueue(1, 100, false, true);
         isMounted.current = false;
      }
      // evictionAutomationNoticesConfirmQueue.searchParam="";
      // setSelectedTab("Pending Notice Confirmations");
      // setSelectedEvictionNoticeId([]);
      // if (localStorage.getItem("casesList"))
      //    getEvictionAutomationNoticeQueue(1, 100, false, false);
      // else
      //    getEvictionAutomationNoticeQueue(1, 100, false, true);

      const evictionAutomationRecords: IEvictionAutomationNoticesQueue[] = evictionAutomationNoticesConfirmQueue.items.map((item: any) => {
         return {
            //   isChecked: false, // Add the new property
            ...item, // Spread existing properties
         };
      });

      const updatedSelectedRows = (evictionAutomationNoticesConfirmQueue.items || []).map((item: any) =>
         selectedEvictionNoticeId.includes(item.id)
      );

      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(evictionAutomationNoticesConfirmQueue.currentPage > 1);
      setCanPaginateFront(evictionAutomationNoticesConfirmQueue.totalPages > 1);

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
   }, [getEvictionAutomationNoticeQueue, userRole]);
   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {

      if (shiftKeyPressed && lastClickedRowIndex !== -1 && evictionAutomationNoticesConfirmQueue.items) {
         const start = Math.min(index, lastClickedRowIndex);
         const end = Math.max(index, lastClickedRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (evictionAutomationNoticesConfirmQueue.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         evictionAutomationNoticesConfirmQueue.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            // setBulkRecords(prevItems => {
            //   const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
            //   uniqueItems.add(JSON.stringify(item)); // Add the new item
            //   return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            // });      
            //  setBulkRecords((prev)=>[...prev,item]);
         })
         setSelectedEvictionNoticeId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (evictionAutomationNoticesConfirmQueue.items.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = evictionAutomationNoticesConfirmQueue.items.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         // const selectedIds = (fileEvictions.items || [])
         //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
         //   .map((item) => item.id)
         //   .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked        
            //  setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedEvictionNoticeId(prevIds => prevIds.filter(item => item !== id));
         } else {

            //  setBulkRecords(prevItems => {
            //    const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
            //    uniqueItems.add(JSON.stringify(lateNoticesRecords.filter(x=>x.id===id)[0])); // Add the new item
            //    return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            //  });   
            //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedEvictionNoticeId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }
      }
      setLastClickedRowIndex(index);
   };
   const handleCellRendered = (cellIndex: number, data: IFileEvictionsItems, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               // checked={selectedRows.some(row => row.id === data.id && row.selected)}
               checked={
                  selectedEvictionNoticeId.includes(data.id as string)
               }
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id as string, checked)
               }
               label=""
            />
         ),
         tenantOne:()=>formattedTenantFullName(data?.tenantNames[0]),
         tenantAddressCombined:()=>formattedAddressCell(data),
         tenant1Last: () => formattedCell(data?.tenantNames[0]?.lastName),
         tenant1First: () => formattedCell(data?.tenantNames[0]?.firstName),
         tenant1MI: () => formattedCell(data?.tenantNames[0]?.middleName),
         tenant2Last: () => formattedCell(data?.tenantNames[1]?.lastName),
         tenant2First: () => formattedCell(data?.tenantNames[1]?.firstName),
         tenant2MI: () => formattedCell(data?.tenantNames[1]?.middleName),
         tenant3Last: () => formattedCell(data?.tenantNames[2]?.lastName),
         tenant3First: () => formattedCell(data?.tenantNames[2]?.firstName),
         tenant3MI: () => formattedCell(data?.tenantNames[2]?.middleName),
         tenant4Last: () => formattedCell(data?.tenantNames[3]?.lastName),
         tenant4First: () => formattedCell(data?.tenantNames[3]?.firstName),
         tenant4MI: () => formattedCell(data?.tenantNames[3]?.middleName),
         tenant5Last: () => formattedCell(data?.tenantNames[4]?.lastName),
         tenant5First: () => formattedCell(data?.tenantNames[4]?.firstName),
         tenant5MI: () => formattedCell(data?.tenantNames[4]?.middleName),
         county: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />,
         andAllOtherTenants: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />,
         ownerName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />,
         propertyAddress: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />,
         propertyCity: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />,
        // propertyEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />,
         propertyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />,
         propertyPhone: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />,
         propertyState: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />,
         propertyZip: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />,
         companyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />,
        noticeDeliveryDate:() => formattedDateCell(cellValue),
         noticeDefaultStartDate:() => formattedDateCell(cellValue),
        noticeDefaultEndDate:() => formattedDateCell(cellValue),
         noticeLastPaidDate:() => formattedDateCell(cellValue),
         noticePastRentDue:() => formatCurrencyCell(cellValue),
         noticeCurrentRentDue:() => formatCurrencyCell(cellValue),
         noticeLastPaidAmount:() => formatCurrencyCell(cellValue),
         noticeTotalDue:() => formatCurrencyCell(cellValue),
         monthlyRent:() => formatCurrencyCell(cellValue),
         noticeLateFees:() => formatCurrencyCell(cellValue),
         previousNotices:()=>formattedPreviousNoticeCell(cellValue),
      };
      const formattedDateCell = (value: any) => (
         <span>{value !== null ? formattedDate(value) : ""}</span>
      );
      const formatCurrencyCell = (value: number) => (
         <span>{value !== null ? formatCurrency(value) : ""}</span>
      );
      const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
        <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />
     );
     const formattedAddressCell = (value: IFileEvictionsItems) => (
        <>
           {
              value !== null
                 ? <HighlightedText text={`${value.tenantAddress ?? ''} ${value.tenantUnit ?? ''} ${value.tenantCity ?? ''} ${value.tenantState ?? ''} ${value.tenantZip ?? ''}`} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />
                 : ''
           }
        </>
     );
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
   const formattedPreviousNoticeCell = (value: string) => {
      // Split the value by commas to get individual dates
      const dates = value ? value.split(",") : [];
    
      return (
        <span>
          {dates.map((date, index) => (
            <span key={index}>
              {date ? formattedDate(date) : ""}
              {index < dates.length - 1 && <br />} {/* Add breakline between dates */}
            </span>
          ))}
        </span>
      );
    };
   const checkIfAllIdsExist = (
            evictionAutomationRecords: IFileEvictionsItems[],
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
   //    evictionAutomationRecords: IFileEvictionsItems[],
   //    selectedEvictionAutomationQueueIds: string[]
   // ): boolean | undefined => {

   //    return evictionAutomationRecords.every(record =>
   //       selectedEvictionAutomationQueueIds.includes(record.id as string)
   //    );
   // };
   const handleFrontButton = () => {
      if (evictionAutomationNoticesConfirmQueue.currentPage < evictionAutomationNoticesConfirmQueue.totalPages) {
         const updatedCurrentPage = evictionAutomationNoticesConfirmQueue.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getEvictionAutomationNoticeQueue(updatedCurrentPage,
            evictionAutomationNoticesConfirmQueue.pageSize, false, evictionAutomationNoticesConfirmQueue.isViewAll);
      }
   };

   const handleBackButton = () => {
      if (
         evictionAutomationNoticesConfirmQueue.currentPage > 1 &&
         evictionAutomationNoticesConfirmQueue.currentPage <= evictionAutomationNoticesConfirmQueue.totalPages
      ) {
         const updatedCurrentPage = evictionAutomationNoticesConfirmQueue.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(evictionAutomationNoticesConfirmQueue.currentPage > 1);
         // back button get late notices
         getEvictionAutomationNoticeQueue(updatedCurrentPage,
            evictionAutomationNoticesConfirmQueue.pageSize, false, evictionAutomationNoticesConfirmQueue.isViewAll);
      }
   };
   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = evictionAutomationNoticesConfirmQueue.items
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         // emailQueues.items
         // .map((item) => setBulkRecords((prev) => [...prev, item]));
         setSelectedEvictionNoticeId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         evictionAutomationNoticesConfirmQueue.items.forEach((item) => {
            // setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedEvictionNoticeId(prevIds => prevIds.filter(id => id !== item.id));
         });
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

   return (
      <div>
         <div className="relative -mr-0.5">
         <div className="mb-2 text-sm text-gray-600">
            {selectedEvictionNoticeId.length} of {evictionAutomationNoticesConfirmQueue.totalCount} records selected
         </div>
            {showSpinner && <Spinner />}
            <div className="relative flex flex-wrap items-center mb-1.5 mt-2.5 justify-end">
               {/* Add any buttons or controls here if needed */}
            </div>
         </div>
         {showSpinner ? (
            <Spinner />
         ) : (
            <>
               <Grid
                  columnHeading={visibleColumns}
                  rows={evictionAutomationNoticesConfirmQueue.items}
                  handleSelectAllChange={handleSelectAllChange}
                  selectAll={checkIfAllIdsExist(evictionAutomationNoticesConfirmQueue.items, selectedEvictionNoticeId)}
                  cellRenderer={(data: IFileEvictionsItems, rowIndex: number, cellIndex: number) => {
                     return handleCellRendered(cellIndex, data, rowIndex);
                  }}
               />
               <Pagination
                   numberOfItemsPerPage={evictionAutomationNoticesConfirmQueue.pageSize}
                   currentPage={evictionAutomationNoticesConfirmQueue.currentPage}
                   totalPages={evictionAutomationNoticesConfirmQueue.totalPages}
                   totalRecords={evictionAutomationNoticesConfirmQueue.totalCount}
                   handleFrontButton={handleFrontButton}
                   handleBackButton={handleBackButton}
                   canPaginateBack={canPaginateBack}
                   canPaginateFront={canPaginateFront}
                />
            </>
         )}
      </div>
   );
};

export default PendingNoticesGrid;
