import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Grid from 'components/common/grid/GridWithToolTip';
import Spinner from 'components/common/spinner/Spinner';
import GridCheckbox from 'components/formik/GridCheckBox';
import Pagination from 'components/common/pagination/Pagination';
import HighlightedText from 'components/common/highlightedText/HighlightedText';
import ToggleSwitch from 'components/common/toggle/ToggleSwitch';
import { IGridHeader } from 'interfaces/grid-interface';
import { IFileEvictionsItems } from 'interfaces/file-evictions.interface';
import { useEvictionAutomationContext } from '../EvictionAutomationContext';
import { useAuth } from 'context/AuthContext';
import { UserRole } from 'utils/enum';
import { toCssClassName } from "utils/helper";

const EAEvictionsGrid: React.FC = () => {
   const {
      showSpinner,
      evictionAutomationApprovedQueue,
      getEvictionAutomationApprovalsQueue,
      evictionAutomationApprovalsQueue,
      setSelectedEvictionApprovedId,
      selectedEvictionApprovedId
   } = useEvictionAutomationContext();
   const { userRole } = useAuth();
   const [showAllAutomation, setShowAllAutomation] = useState<boolean>(
      false
   );
//   Unit	Months	Total Due	Monthly Rent	Additional Fees	Tenant Names	Tenant Address (used in filing)
   const clientVisibleColumnMapping: IGridHeader[] = [
      ...(!userRole.includes(UserRole.PropertyManager)
         ? [{ columnName: "isChecked", label: "isChecked", controlType: "checkbox" }]
         : []
      ),
      { columnName: "tenantUnit", label: "TenantUnit" },
      { columnName: "allMonths", label: "AllMonths" },
      { columnName: "evictionTotalRentDue", label: "EvictionTotalRentDue", className:'text-right' },
      { columnName: "monthlyRent", label: "MonthlyRent", className:'text-right' },
      { columnName: "evictionOtherFees", label: "EvictionOtherFees" },
      { columnName: "tenant1Last", label: "Tenant1Last" },
      { columnName: "tenant1First", label: "Tenant1First" },
      { columnName: "tenantAddress", label: "TenantAddress", className: "TenantAddress", }
   ];
   const c2cAdminColumnMapping: IGridHeader[] = [
      { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
      { columnName: "crmName", label: "CrmName" },
      { columnName: "ownerId", label: "OwnerId" },
      { columnName: "propertyId", label: "PropertyId" },
      { columnName: "unitId", label: "UnitId" },
      { columnName: "pullTime", label: "PullTime" },
      { columnName: "batchId", label: "BatchId" },
      { columnName: "companyName", label: "CompanyName" },
//      ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "companyName", label: "CompanyName" }] : [] ),
      { columnName: "county", label: "County" },
      { columnName: "tenant1Last", label: "Tenant1Last" },
      { columnName: "tenant1First", label: "Tenant1First" },
      { columnName: "tenant1MI", label: "Tenant1MI" },
      { columnName: "andAllOtherTenants", label: "AndAllOtherOccupants" },
      { columnName: "tenantAddress", label: "TenantAddress", className: "TenantAddress", },
      { columnName: "tenantUnit", label: "TenantUnit" },
      { columnName: "tenantCity", label: "TenantCity" },
      { columnName: "tenantState", label: "TenantState" },
      { columnName: "tenantZip", label: "TenantZip", className:'text-right' },
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
      { columnName: "evictionTotalRentDue", label: "EvictionTotalRentDue", className:'text-right' },
      { columnName: "monthlyRent", label: "MonthlyRent", className:'text-right' },
      { columnName: "allMonths", label: "AllMonths" },
      { columnName: "evictionOtherFees", label: "EvictionOtherFees" },
      { columnName: "ownerName", label: "OwnerName" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "propertyPhone", label: "PropertyPhone" },
      { columnName: "propertyEmail", label: "PropertyEmail", className: "PropertyEmail", },
      { columnName: "propertyAddress", label: "PropertyAddress", className: "PropertyAddress", },
      { columnName: "propertyCity", label: "PropertyCity" },
      { columnName: "propertyState", label: "PropertyState" },
      { columnName: "propertyZip", label: "PropertyZip", className:'text-right' },
      { columnName: "attorneyName", label: "AttorneyName" },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo", className:'text-right' },
      { columnName: "attorneyEmail", label: "AttorneyEmail", className: "AttorneyEmail", },
      { columnName: "filerBusinessName", label: "FilerBusinessName" },
      { columnName: "evictionAffiantIs", label: "EvictionAffiantIs" },
      { columnName: "filerPhone", label: "EvictionFilerPhone" },
      { columnName: "filerEmail", label: "EvictionFilerEmail" },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "stateCourt", label: "StateCourt" },
      { columnName: "clientReferenceId", label: "ClientReferenceId" },
      { columnName: "processServerCompany", label: "ProcessServerCompany" },   
   ];
   const initialColumnMapping: IGridHeader[] = [
     ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin) ? clientVisibleColumnMapping : clientVisibleColumnMapping ),
   ];
   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
      initialColumnMapping
   );
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionAutomationApprovedQueue.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionAutomationApprovedQueue.totalPages > 1);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(evictionAutomationApprovedQueue.items.length).fill(false)
   );
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   const [newSelectedRows] = useState<boolean[]>([]);
   const location = useLocation();
   const queryParams = new URLSearchParams(location.search);
   const isMounted = useRef(true);
   const casesList = queryParams.get("cases");
   const isApproved=queryParams.get("isApproved")=="true";
   useEffect(()=>{
      if (casesList && !localStorage.getItem("casesList")) {
         localStorage.setItem("casesList", casesList ?? "");
      }
   },[])

   useEffect(() => {
      
      if (isMounted.current) {
         if (localStorage.getItem("casesList") && isApproved) {        
           // getEvictionAutomationApprovalsQueue(1, 100, true, false,'');
         }
         else
           // getEvictionAutomationApprovalsQueue(1, 100, true, true,'');
         setSelectedEvictionApprovedId([]);
         isMounted.current = false;
      }

      // if (localStorage.getItem("casesList") && isApproved) {        
      //    getEvictionAutomationApprovalsQueue(1, 100, true, false,'');
      // }
      // else
      //    getEvictionAutomationApprovalsQueue(1, 100, true, true,'');
      // setSelectedEvictionApprovedId([]);
      const updatedSelectedRows = (evictionAutomationApprovedQueue.items || []).map((item: any) =>
         selectedEvictionApprovedId.includes(item.id)
      );
      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(evictionAutomationApprovedQueue.currentPage > 1);
      setCanPaginateFront(evictionAutomationApprovedQueue.totalPages > 1);

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
   }, [getEvictionAutomationApprovalsQueue, userRole]);

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {

      if (shiftKeyPressed && lastClickedRowIndex !== -1 && evictionAutomationApprovedQueue.items) {
         const start = Math.min(index, lastClickedRowIndex);
         const end = Math.max(index, lastClickedRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (evictionAutomationApprovedQueue.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         evictionAutomationApprovedQueue.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            // setBulkRecords(prevItems => {
            //   const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
            //   uniqueItems.add(JSON.stringify(item)); // Add the new item
            //   return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            // });      
            //  setBulkRecords((prev)=>[...prev,item]);
         })
         setSelectedEvictionApprovedId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (evictionAutomationApprovedQueue.items.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = evictionAutomationApprovedQueue.items.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         // const selectedIds = (fileEvictions.items || [])
         //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
         //   .map((item) => item.id)
         //   .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked        
            //  setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedEvictionApprovedId(prevIds => prevIds.filter(item => item !== id));
         } else {

            //  setBulkRecords(prevItems => {
            //    const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
            //    uniqueItems.add(JSON.stringify(lateNoticesRecords.filter(x=>x.id===id)[0])); // Add the new item
            //    return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            //  });   
            //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedEvictionApprovedId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }
      }
      setLastClickedRowIndex(index);
   };

   const handleCellRendered = (cellIndex: number, data: IFileEvictionsItems, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (!data.isSigned) ? (
            <GridCheckbox
               checked={selectedEvictionApprovedId.includes(data.id as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id as string, checked)}
               label=""
            />
         ) : (
            <GridCheckbox
               disabled={true}
               checked={false}
               onChange={(checked: boolean) => { }}
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
         companyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         andAllOtherTenants: () => <HighlightedText text={cellValue ?"AndAllOthers ": ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         attorneyBarNo: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         attorneyEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         attorneyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         county: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         filerEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         evictionAffiantIs: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         filerBusinessName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         ownerName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         propertyAddress: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         propertyCity: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         propertyEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         propertyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         propertyPhone: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         propertyState: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         propertyZip: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         expedited: () => <span>{cellValue != "" && cellValue != null ? "Expedited" : ""}</span>,
         propertyId: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         ownerId: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         crmName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovedQueue.searchParam ?? ''} />,
         evictionTotalRentDue: () => (
            <span>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(cellValue))}
            </span>
          ),
          monthlyRent: () => (
            <span>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(cellValue))}
            </span>
          ),
          evictionOtherFees: () => {
            let formattedValue = cellValue;
      
            // Try to parse the cellValue as a number
            const numericValue = parseFloat(cellValue);
            
            // Check if the parsed value is a valid number
            if (!isNaN(numericValue)) {
              // Format as currency if it's a valid number
              formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericValue);
            }
            
            return <span>{formattedValue}</span>;
          },
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
   const handleFrontButton = () => {
      if (evictionAutomationApprovedQueue.currentPage < evictionAutomationApprovedQueue.totalPages) {
         const updatedCurrentPage = evictionAutomationApprovedQueue.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getEvictionAutomationApprovalsQueue(updatedCurrentPage,
            evictionAutomationApprovedQueue.pageSize, true, evictionAutomationApprovalsQueue.isViewAll);
      }
   };

   const handleBackButton = () => {
      if (
         evictionAutomationApprovedQueue.currentPage > 1 &&
         evictionAutomationApprovedQueue.currentPage <= evictionAutomationApprovedQueue.totalPages
      ) {
         const updatedCurrentPage = evictionAutomationApprovedQueue.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(evictionAutomationApprovedQueue.currentPage > 1);
         // back button get late notices
         getEvictionAutomationApprovalsQueue(updatedCurrentPage,
            evictionAutomationApprovedQueue.pageSize, false, evictionAutomationApprovalsQueue.isViewAll);
      }
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = evictionAutomationApprovedQueue.items
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         // emailQueues.items
         // .map((item) => setBulkRecords((prev) => [...prev, item]));
         setSelectedEvictionApprovedId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         evictionAutomationApprovedQueue.items.forEach((item) => {
            // setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedEvictionApprovedId(prevIds => prevIds.filter(id => id !== item.id));
         });
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

   // const checkIfAllIdsExist = (
   //    evictionAutomationRecords: IFileEvictionsItems[],
   //    selectedEvictionAutomationQueueIds: string[]
   // ): boolean | undefined => {

   //    return evictionAutomationRecords.every(record =>
   //       selectedEvictionAutomationQueueIds.includes(record.id as string)
   //    );
   // };

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
   return (
      <div>
         <div className="relative -mr-0.5">
            <div className="relative -mr-0.5">
               {showSpinner && <Spinner />}
               <div className="relative flex flex-wrap items-center mb-1.5 mt-2.5 justify-end">
                  {localStorage.getItem("casesList") && userRole.includes(UserRole.Signer) && isApproved && <ToggleSwitch
                     value={showAllAutomation}
                     label={"View All"}
                     handleChange={(event: ChangeEvent<HTMLInputElement>) => {

                        setShowAllAutomation(event.target.checked);
                        getEvictionAutomationApprovalsQueue(1, 100, true, event.target.checked, evictionAutomationApprovalsQueue.searchParam);
                        setSelectedEvictionApprovedId([]);
                     }}
                  ></ToggleSwitch>}
               </div>
            </div>
         </div>
         {showSpinner ? (
               <Spinner />
            ) : (
               <>
                  {/* <Grid
            columnHeading={visibleColumns}
            rows={evictionAutomationApprovedQueue.items}
            handleSelectAllChange={handleSelectAllChange}
            selectAll={checkIfAllIdsExist(evictionAutomationApprovedQueue.items, selectedEvictionApprovedId)}
            cellRenderer={(data: IFileEvictionsItems, rowIndex: number, cellIndex: number) =>
               handleCellRendered(cellIndex, data, rowIndex)
            }
         /> */}
         <Pagination
            numberOfItemsPerPage={evictionAutomationApprovedQueue.pageSize}
            currentPage={evictionAutomationApprovedQueue.currentPage}
            totalPages={evictionAutomationApprovedQueue.totalPages}
            totalRecords={evictionAutomationApprovedQueue.totalCount}
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

export default EAEvictionsGrid;
