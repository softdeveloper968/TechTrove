import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Grid from 'components/common/grid/GridWithToolTip';
import Spinner from 'components/common/spinner/Spinner';
import Pagination from "components/common/pagination/Pagination";
import GridCheckbox from 'components/formik/GridCheckBox';
import HighlightedText from 'components/common/highlightedText/HighlightedText';
import ToggleSwitch from 'components/common/toggle/ToggleSwitch';
import { IGridHeader } from 'interfaces/grid-interface';
import { IFileEvictionsItems } from 'interfaces/file-evictions.interface';
import { useEvictionAutomationContext } from '../EvictionAutomationContext';
import { useAuth } from 'context/AuthContext';
import { UserRole } from 'utils/enum';
import { formatCurrency, formattedDate } from 'utils/helper';
import { toCssClassName } from "utils/helper";

const EvictionAutomationConfirmedGrid: React.FC = () => {
   const { showSpinner,
      evictionAutomationNoticesConfirmedQueue,
      getEvictionAutomationNoticeQueue,
      selectedEvictionNoticeConfirmedId,
      setSelectedEvictionNoticeConfirmedId
    } = useEvictionAutomationContext();
   const { userRole } = useAuth();

   const initialColumnMapping: IGridHeader[] = [
      ...(!userRole.includes(UserRole.PropertyManager)
         ? [{ columnName: "isChecked", label: "isChecked", controlType: "checkbox" }]
         : []
      ),
      { columnName: "crmName", label: "CrmName" },
      { columnName: "ownerId", label: "OwnerId" },
      { columnName: "propertyId", label: "PropertyId" },
      { columnName: "unitId", label: "UnitId" },
      { columnName: "pullTime", label: "PullTime" },
      { columnName: "batchId", label: "BatchId" },
      ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)
      ?[ { columnName: "companyName", label: "Company" }]
      : []
    ),
     // { columnName: "companyName", label: "Company" },
      // { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
      { columnName: "county", label: "County" },
      { columnName: "tenant1Last", label: "Tenant1Last" },
      { columnName: "tenant1First", label: "Tenant1First" },
      { columnName: "tenant1MI", label: "Tenant1MI" },
      { columnName: "andAllOtherTenants", label: "AndAllOtherOccupants" },
      { columnName: "tenantAddress", label: "TenantAddress", className: "TenantAddress", },
      { columnName: "tenantUnit", label: "TenantUnit" },
      { columnName: "tenantCity", label: "TenantCity" },
      { columnName: "tenantState", label: "TenantState" },
      { columnName: "tenantZip", label: "TenantZip" },
      { columnName: "tenant2Last", label: "Tenant2Last" },
      { columnName: "tenant2First", label: "Tenant2First" },
      { columnName: "tenant2MI", label: "Tenant2MI" },
      { columnName: "tenant3Last", label: "Tenant3Last" },
      { columnName: "tenant3First", label: "Tenant3First" },
      { columnName: "tenant3MI", label: "Tenant3MI" },
      { columnName: "tenant4Last", label: "Tenant4Last" },
      { columnName: "tenant4First", label: "Tenant4First" },
      { columnName: "tenant4MI", label: "Tenant4MI" },
      { columnName: "tenant5Last", label: "Tenant5Last" },
      { columnName: "tenant5First", label: "Tenant5First" },
      { columnName: "tenant5MI", label: "Tenant5MI" },
      { columnName: "reason", label: "EvictionReason", className: "EvictionReason", },
      { columnName: "evictionTotalRentDue", label: "EvictionTotalRentDue" },
      { columnName: "monthlyRent", label: "MonthlyRent" },
      { columnName: "allMonths", label: "AllMonths" },
      { columnName: "evictionOtherFees", label: "EvictionOtherFees" },
      { columnName: "ownerName", label: "OwnerName" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "propertyPhone", label: "PropertyPhone" },
      { columnName: "propertyEmail", label: "PropertyEmail", className: "PropertyEmail", },
      { columnName: "propertyAddress", label: "PropertyAddress", className: "PropertyAddress", },
      { columnName: "propertyCity", label: "PropertyCity" },
      { columnName: "propertyState", label: "PropertyState" },
      { columnName: "propertyZip", label: "PropertyZip" },
      { columnName: "attorneyName", label: "AttorneyName" },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo" },
      { columnName: "attorneyEmail", label: "AttorneyEmail", className: "AttorneyEmail", },
      { columnName: "filerBusinessName", label: "FilerBusinessName" },
      { columnName: "evictionAffiantIs", label: "EvictionAffiantIs" },
      { columnName: "filerPhone", label: "EvictionFilerPhone" },
      { columnName: "filerEmail", label: "EvictionFilerEmail" },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "stateCourt", label: "StateCourt" },
      { columnName: "clientReferenceId", label: "ClientReferenceId" },
      { columnName: "processServerCompany", label: "ProcessServerCompany" },
      { columnName: "noticeDeliveryDate", label: "NoticeDeliveryDate" },
      { columnName: "noticeDefaultStartDate", label: "NoticeDefaultStartDate" },
      { columnName: "noticeDefaultEndDate", label: "NoticeDefaultEndDate" },
      { columnName: "noticeLastPaidDate", label: "NoticeLastPaidDate" },
      { columnName: "noticeTotalDue", label: "NoticeTotalDue" },
      { columnName: "noticeLastPaidAmount", label: "NoticeLastPaidAmount" },
      { columnName: "noticeCurrentRentDue", label: "NoticeCurrentRentDue" },
      { columnName: "noticePastRentDue", label: "NoticePastRentDue" },
      { columnName: "noticeLateFees", label: "NoticeLateFees" },
      // { columnName: "noticeServerID", label: "NoticeServerID" },
      // { columnName: "crmName", label: "CrmName" },
      // { columnName: "OwnerId", label: "OwnerId" },
      // { columnName: "PropertyId", label: "PropertyId" }

   ];

   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionAutomationNoticesConfirmedQueue.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionAutomationNoticesConfirmedQueue.totalPages > 1);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(evictionAutomationNoticesConfirmedQueue.items.length).fill(false)
   );
   const [showAllAutomation, setShowAllAutomation] = useState<boolean>(
      false
   );
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   const [newSelectedRows] = useState<boolean[]>([]);
   const location = useLocation();
   const queryParams = new URLSearchParams(location.search);
   const casesList = queryParams.get("cases");
   const isConfirmed=queryParams.get("isNotice")=="true";
   useEffect(()=>{
      if (casesList && !localStorage.getItem("casesList")) {
         localStorage.setItem("casesList", casesList ?? "");
      }
   },[])

   useEffect(() => {
      
      if (localStorage.getItem("casesList") && isConfirmed) {        
         getEvictionAutomationNoticeQueue(1, 100, true, false);
      }
      else
      getEvictionAutomationNoticeQueue(1, 100, true, true);
      setSelectedEvictionNoticeConfirmedId([]);
      const updatedSelectedRows = (evictionAutomationNoticesConfirmedQueue.items || []).map((item: any) =>
         selectedEvictionNoticeConfirmedId.includes(item.id)
      );
      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(evictionAutomationNoticesConfirmedQueue.currentPage > 1);
      setCanPaginateFront(evictionAutomationNoticesConfirmedQueue.totalPages > 1);

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
   }, []);
   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {

      if (shiftKeyPressed && lastClickedRowIndex !== -1 && evictionAutomationNoticesConfirmedQueue.items) {
         const start = Math.min(index, lastClickedRowIndex);
         const end = Math.max(index, lastClickedRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (evictionAutomationNoticesConfirmedQueue.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         evictionAutomationNoticesConfirmedQueue.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            // setBulkRecords(prevItems => {
            //   const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
            //   uniqueItems.add(JSON.stringify(item)); // Add the new item
            //   return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            // });      
            //  setBulkRecords((prev)=>[...prev,item]);
         })
         setSelectedEvictionNoticeConfirmedId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (evictionAutomationNoticesConfirmedQueue.items.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = evictionAutomationNoticesConfirmedQueue.items.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         // const selectedIds = (fileEvictions.items || [])
         //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
         //   .map((item) => item.id)
         //   .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked        
            //  setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedEvictionNoticeConfirmedId(prevIds => prevIds.filter(item => item !== id));
         } else {

            //  setBulkRecords(prevItems => {
            //    const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
            //    uniqueItems.add(JSON.stringify(lateNoticesRecords.filter(x=>x.id===id)[0])); // Add the new item
            //    return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            //  });   
            //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedEvictionNoticeConfirmedId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
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
                  selectedEvictionNoticeConfirmedId.includes(data.id as string)
               }
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id as string, checked)
               }
               label=""
            />
         ),
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
         andAllOtherTenants: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmedQueue.searchParam ?? ''} />,
         ownerName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmedQueue.searchParam ?? ''} />,
         propertyAddress: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmedQueue.searchParam ?? ''} />,
         propertyCity: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmedQueue.searchParam ?? ''} />,
        // propertyEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmedQueue.searchParam ?? ''} />,
         propertyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmedQueue.searchParam ?? ''} />,
         propertyPhone: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmedQueue.searchParam ?? ''} />,
         propertyState: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmedQueue.searchParam ?? ''} />,
         propertyZip: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmedQueue.searchParam ?? ''} />,
         noticeDeliveryDate:() => formattedDateCell(cellValue),
         noticeDefaultStartDate:() => formattedDateCell(cellValue),
        noticeDefaultEndDate:() => formattedDateCell(cellValue),
         noticeLastPaidDate:() => formattedDateCell(cellValue),
         noticePastRentDue:() => formatCurrencyCell(cellValue),
         noticeCurrentRentDue:() => formatCurrencyCell(cellValue),
         noticeLastPaidAmount:() => formatCurrencyCell(cellValue),
         noticeTotalDue:() => formatCurrencyCell(cellValue),
         monthlyRent:() => formatCurrencyCell(cellValue),
         noticeLateFees:() => formatCurrencyCell(cellValue)
      };
      const formattedDateCell = (value: any) => (
         <span>{value !== null ? formattedDate(value) : ""}</span>
      );
      const formatCurrencyCell = (value: number) => (
         <span>{value !== null ? formatCurrency(value) : ""}</span>
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
      if (evictionAutomationNoticesConfirmedQueue.currentPage < evictionAutomationNoticesConfirmedQueue.totalPages) {
         const updatedCurrentPage = evictionAutomationNoticesConfirmedQueue.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getEvictionAutomationNoticeQueue(updatedCurrentPage,
            evictionAutomationNoticesConfirmedQueue.pageSize, false, evictionAutomationNoticesConfirmedQueue.isViewAll);
      }
   };

   const handleBackButton = () => {
      if (
         evictionAutomationNoticesConfirmedQueue.currentPage > 1 &&
         evictionAutomationNoticesConfirmedQueue.currentPage <= evictionAutomationNoticesConfirmedQueue.totalPages
      ) {
         const updatedCurrentPage = evictionAutomationNoticesConfirmedQueue.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(evictionAutomationNoticesConfirmedQueue.currentPage > 1);
         // back button get late notices
         getEvictionAutomationNoticeQueue(updatedCurrentPage,
            evictionAutomationNoticesConfirmedQueue.pageSize, false, evictionAutomationNoticesConfirmedQueue.isViewAll);
      }
   };
   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = evictionAutomationNoticesConfirmedQueue.items
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         // emailQueues.items
         // .map((item) => setBulkRecords((prev) => [...prev, item]));
         setSelectedEvictionNoticeConfirmedId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         evictionAutomationNoticesConfirmedQueue.items.forEach((item) => {
            // setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedEvictionNoticeConfirmedId(prevIds => prevIds.filter(id => id !== item.id));
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
            {showSpinner && <Spinner />}
            <div className="relative flex flex-wrap items-center mb-1.5 mt-2.5 justify-end">
               {/* Add any buttons or controls here if needed */}
               {localStorage.getItem("casesList") && userRole.includes(UserRole.Signer) && isConfirmed && <ToggleSwitch
                     value={showAllAutomation}
                     label={"View All"}
                     handleChange={(event: ChangeEvent<HTMLInputElement>) => {

                        setShowAllAutomation(event.target.checked);
                        getEvictionAutomationNoticeQueue(1, 100, true, event.target.checked, evictionAutomationNoticesConfirmedQueue.searchParam);
                        setSelectedEvictionNoticeConfirmedId([]);
                     }}
                  ></ToggleSwitch>}
            </div>
         </div>
         {showSpinner ? (
            <Spinner />
         ) : (
            <>
               <Grid
                  columnHeading={visibleColumns}
                  rows={evictionAutomationNoticesConfirmedQueue.items}
                  handleSelectAllChange={handleSelectAllChange}
                  selectAll={checkIfAllIdsExist(evictionAutomationNoticesConfirmedQueue.items, selectedEvictionNoticeConfirmedId)}
                  cellRenderer={(data: IFileEvictionsItems, rowIndex: number, cellIndex: number) => {
                     return handleCellRendered(cellIndex, data, rowIndex);
                  }}
                  selectedIds={selectedEvictionNoticeConfirmedId}
               />
               <Pagination
                   numberOfItemsPerPage={evictionAutomationNoticesConfirmedQueue.pageSize}
                   currentPage={evictionAutomationNoticesConfirmedQueue.currentPage}
                   totalPages={evictionAutomationNoticesConfirmedQueue.totalPages}
                   totalRecords={evictionAutomationNoticesConfirmedQueue.totalCount}
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

export default EvictionAutomationConfirmedGrid;
