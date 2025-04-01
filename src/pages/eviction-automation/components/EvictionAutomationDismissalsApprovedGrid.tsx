import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEvictionAutomationContext } from '../EvictionAutomationContext';
import { useAuth } from 'context/AuthContext';
import { IGridHeader } from 'interfaces/grid-interface';
import { IFileEvictionsItems, ITenant } from 'interfaces/file-evictions.interface';
import GridCheckbox from 'components/formik/GridCheckBox';
import HighlightedText from 'components/common/highlightedText/HighlightedText';
import Spinner from 'components/common/spinner/Spinner';
import Grid from 'components/common/grid/GridWithToolTip';
import Pagination from 'components/common/pagination/Pagination';
import ToggleSwitch from 'components/common/toggle/ToggleSwitch';
import { UserRole } from 'utils/enum';
import { toCssClassName } from "utils/helper";

const EvictionAutomationDismissalsApprovedGrid: React.FC = () => {
    const {
       showSpinner,
       evictionAutomationDismissalApprovedQueue,
       getEvictionAutomationDismissalApprovalsQueue,
       setSelectedEvictionDismissalApprovedId,
       selectedEvictionDismissalApprovedId
    } = useEvictionAutomationContext();
    const {userRole}=useAuth();
    const initialColumnMapping: IGridHeader[] = [
      ...(!userRole.includes(UserRole.PropertyManager)
      ?[{ columnName: "isChecked", label: "isChecked", controlType: "checkbox" }]
      : []
    ),
      { columnName: "caseNo", label: "CaseNo" },
      {columnName :"tenantOne",label:"TenantOne"},
      //  {columnName :"tenantTwo",label:"TenantTwo"},
      //  {columnName :"tenantThree",label:"TenantThree"},
      //  {columnName :"tenantFour",label:"TenantFour"},
      //  {columnName :"tenantFive",label:"TenantFive"},
       { columnName: "tenantAddress", label: "TenantAddressCombined", className: "TenantAddress"},
       { columnName: "propertyName", label: "PropertyName" },
      // { columnName: "crmName", label: "CrmName" },
      // { columnName: "ownerId", label: "OwnerId" },
      // { columnName: "propertyId", label: "PropertyId" },
      // { columnName: "unitId", label: "UnitId" },
      {columnName:"balanceDate",label:"BalanceDate"},
      { columnName: "evictionTotalRentDue", label: "EvictionTotalRentDue", className:'text-right' },
      {columnName:"currentBalance",label:"CurrentBalance", className:'text-right'},
      ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)
      ?[ { columnName: "companyName", label: "CompanyName" }]
      : []
    ),
      //{ columnName: "companyName", label: "Company" },
 
       
    ];
    const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
       initialColumnMapping
    );
    const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionAutomationDismissalApprovedQueue.currentPage > 1);
    const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionAutomationDismissalApprovedQueue.totalPages > 1);
    const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
       Array(evictionAutomationDismissalApprovedQueue.items.length).fill(false)
    );
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
    const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
    const [newSelectedRows] = useState<boolean[]>([]);
    const isMounted = useRef(true);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const casesList = queryParams.get("cases");
    const isDismissal=queryParams.get("isDismissal")=="true";
    const [showAllAutomation, setShowAllAutomation] = useState<boolean>(
      false
   );
    useEffect(()=>{
      
       if (casesList && !localStorage.getItem("casesList")) {
          localStorage.setItem("casesList", casesList ?? "");
       }
    },[])



    useEffect(() => {

      if (isMounted.current) {
         if (localStorage.getItem("casesList") && isDismissal) {        
            getEvictionAutomationDismissalApprovalsQueue(1, 100, true, false);
         }
         else
         getEvictionAutomationDismissalApprovalsQueue(1, 100, true, true);
          setSelectedEvictionDismissalApprovedId([]);
         isMounted.current = false;
      }

      // if (localStorage.getItem("casesList") && isDismissal) {        
      //    getEvictionAutomationDismissalApprovalsQueue(1, 100, true, false);
      // }
      // else
      // getEvictionAutomationDismissalApprovalsQueue(1, 100, true, true);
      //  setSelectedEvictionDismissalApprovedId([]);
      // getEvictionAutomationDismissalApprovalsQueue(1, 100, true,evictionAutomationDismissalApprovedQueue.isViewAll);
       const updatedSelectedRows = (evictionAutomationDismissalApprovedQueue.items || []).map((item: any) =>
          selectedEvictionDismissalApprovedId.includes(item.id)
       );
 
       // Enable/disable pagination buttons based on the number of total pages
       setCanPaginateBack(evictionAutomationDismissalApprovedQueue.currentPage > 1);
       setCanPaginateFront(evictionAutomationDismissalApprovedQueue.totalPages > 1);
 
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
    }, [getEvictionAutomationDismissalApprovalsQueue, userRole]);
 
    const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
 
       if (shiftKeyPressed && lastClickedRowIndex !== -1 && evictionAutomationDismissalApprovedQueue.items) {
          const start = Math.min(index, lastClickedRowIndex);
          const end = Math.max(index, lastClickedRowIndex);
          setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
             i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
          ));
          setSelectedRows(selectedRows);
          const selectedIds = (evictionAutomationDismissalApprovedQueue.items || [])
             .filter((_, rowIndex) => selectedRows[rowIndex])
             .map((item) => item.id)
             .filter((id): id is string => typeof id === "string");
 
             evictionAutomationDismissalApprovedQueue.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
             // setBulkRecords(prevItems => {
             //   const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
             //   uniqueItems.add(JSON.stringify(item)); // Add the new item
             //   return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
             // });      
             //  setBulkRecords((prev)=>[...prev,item]);
          })
          setSelectedEvictionDismissalApprovedId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
       } else {
          const updatedSelectedRows = [...selectedRows];
          updatedSelectedRows[index] = checked;
          setSelectedRows(updatedSelectedRows);
 
          if (evictionAutomationDismissalApprovedQueue.items.length === updatedSelectedRows.filter(item => item).length) {
             setSelectAll(true);
          } else {
             setSelectAll(false);
          }
 
          var selectedIds = evictionAutomationDismissalApprovedQueue.items.filter(item => item.id == id).map((item) => item.id)
             .filter((id): id is string => typeof id === "string");
          // const selectedIds = (fileEvictions.items || [])
          //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
          //   .map((item) => item.id)
          //   .filter((id): id is string => typeof id === "string");
 
          if (!checked) {
             // Remove the item from filteredRecords if unchecked        
             //  setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
             setSelectedEvictionDismissalApprovedId(prevIds => prevIds.filter(item => item !== id));
          } else {
 
             //  setBulkRecords(prevItems => {
             //    const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
             //    uniqueItems.add(JSON.stringify(lateNoticesRecords.filter(x=>x.id===id)[0])); // Add the new item
             //    return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
             //  });   
             //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
             // if (selectedItem)
             //   settingData(selectedItem);
             setSelectedEvictionDismissalApprovedId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
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
                checked={selectedEvictionDismissalApprovedId.includes(data.id as string)}
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
          tenantOne: () => formattedTenantFullName(data?.tenantNames[0]),
         //  tenantTwo:()=>formattedTenantFullName(data?.tenantNames[1]),
         //  tenantThree:()=>formattedTenantFullName(data?.tenantNames[2]),
         //  tenantFour:()=>formattedTenantFullName(data?.tenantNames[3]),
         //  tenantFive:()=>formattedTenantFullName(data?.tenantNames[4]),
         //  tenant1Last: () => formattedCell(data?.tenantNames[0]?.lastName),
         //  tenant1First: () => formattedCell(data?.tenantNames[0]?.firstName),
         //  tenant1MI: () => formattedCell(data?.tenantNames[0]?.middleName),
         //  tenant2Last: () => formattedCell(data?.tenantNames[1]?.lastName),
         //  tenant2First: () => formattedCell(data?.tenantNames[1]?.firstName),
         //  tenant2MI: () => formattedCell(data?.tenantNames[1]?.middleName),
         //  tenant3Last: () => formattedCell(data?.tenantNames[2]?.lastName),
         //  tenant3First: () => formattedCell(data?.tenantNames[2]?.firstName),
         //  tenant3MI: () => formattedCell(data?.tenantNames[2]?.middleName),
         //  tenant4Last: () => formattedCell(data?.tenantNames[3]?.lastName),
         //  tenant4First: () => formattedCell(data?.tenantNames[3]?.firstName),
         //  tenant4MI: () => formattedCell(data?.tenantNames[3]?.middleName),
         //  tenant5Last: () => formattedCell(data?.tenantNames[4]?.lastName),
         //  tenant5First: () => formattedCell(data?.tenantNames[4]?.firstName),
         //  tenant5MI: () => formattedCell(data?.tenantNames[4]?.middleName),
         //  companyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  andAllOtherTenants: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  attorneyBarNo: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  attorneyEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  attorneyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  county: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  filerEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  evictionAffiantIs: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  filerBusinessName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  ownerName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  propertyAddress: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  propertyCity: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  propertyEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
             propertyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
             caseNo: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
             companyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  propertyPhone: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  propertyState: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
         //  propertyZip: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />,
          tenantAddress: () => (
            <span>
               <HighlightedText
                  text={`${data.tenantAddress ?? ""} ${data.tenantUnit ?? ""} ${data.tenantCity ?? ""
                     } ${data.tenantState ?? ""} ${data.tenantZip ?? ""}`}
                  query={evictionAutomationDismissalApprovedQueue.searchParam ?? ""}
               />
            </span>),
             evictionTotalRentDue: () => (
               <span>
                 {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(cellValue))}
               </span>
             ),
             currentBalance: () => (
               <span>
                 {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(cellValue))}
               </span>
             ),
         };
         const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
            <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={evictionAutomationDismissalApprovedQueue.searchParam ?? ''} />
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
    const handleFrontButton = () => {
       if (evictionAutomationDismissalApprovedQueue.currentPage < evictionAutomationDismissalApprovedQueue.totalPages) {
          const updatedCurrentPage = evictionAutomationDismissalApprovedQueue.currentPage + 1;
          // Update current page and enable/disable 'Back' button
          setCanPaginateBack(updatedCurrentPage > 1);
          // back button get late notices
          getEvictionAutomationDismissalApprovalsQueue(updatedCurrentPage,
            evictionAutomationDismissalApprovedQueue.pageSize, true,evictionAutomationDismissalApprovedQueue.isViewAll);
       }
    };
 
    const handleBackButton = () => {
       if (
         evictionAutomationDismissalApprovedQueue.currentPage > 1 &&
         evictionAutomationDismissalApprovedQueue.currentPage <= evictionAutomationDismissalApprovedQueue.totalPages
       ) {
          const updatedCurrentPage = evictionAutomationDismissalApprovedQueue.currentPage - 1;
          // Update current page and enable/disable 'Back' button
          setCanPaginateBack(evictionAutomationDismissalApprovedQueue.currentPage > 1);
          // back button get late notices
          getEvictionAutomationDismissalApprovalsQueue(updatedCurrentPage,
            evictionAutomationDismissalApprovedQueue.pageSize, true,evictionAutomationDismissalApprovedQueue.isViewAll);
       }
    };

    const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = evictionAutomationDismissalApprovedQueue.items
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         // emailQueues.items
         // .map((item) => setBulkRecords((prev) => [...prev, item]));
         setSelectedEvictionDismissalApprovedId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         evictionAutomationDismissalApprovedQueue.items.forEach((item) => {
            // setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedEvictionDismissalApprovedId(prevIds => prevIds.filter(id => id !== item.id));
         });
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
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
   //  const checkIfAllIdsExist = (
   //     evictionAutomationRecords: IFileEvictionsItems[],
   //     selectedEvictionAutomationQueueIds: string[]
   //  ): boolean | undefined => {
 
   //     return evictionAutomationRecords.every(record =>
   //        selectedEvictionAutomationQueueIds.includes(record.id as string)
   //     );
   //  };
    return (
       <div>
          <div className="relative -mr-0.5">
             <div className="relative -mr-0.5">
                {showSpinner && <Spinner />}
                <div className="relative flex flex-wrap items-center mb-1.5 mt-2.5 justify-end">
                {localStorage.getItem("casesList") && userRole.includes(UserRole.Signer) && isDismissal && <ToggleSwitch
                     value={showAllAutomation}
                     label={"View All"}
                     handleChange={(event: ChangeEvent<HTMLInputElement>) => {

                        setShowAllAutomation(event.target.checked);
                        getEvictionAutomationDismissalApprovalsQueue(1, 100, true, event.target.checked, evictionAutomationDismissalApprovedQueue.searchParam);
                        setSelectedEvictionDismissalApprovedId([]);
                     }}
                  ></ToggleSwitch>}
                </div>
             </div>
          </div>
          <Grid
             columnHeading={visibleColumns}
             rows={evictionAutomationDismissalApprovedQueue.items}
             handleSelectAllChange={handleSelectAllChange}
             selectAll={checkIfAllIdsExist(evictionAutomationDismissalApprovedQueue.items, selectedEvictionDismissalApprovedId)}
             cellRenderer={(data: IFileEvictionsItems, rowIndex: number, cellIndex: number) =>
                handleCellRendered(cellIndex, data, rowIndex)
             }
             selectedIds={selectedEvictionDismissalApprovedId}
          />
          <Pagination
             numberOfItemsPerPage={evictionAutomationDismissalApprovedQueue.pageSize}
             currentPage={evictionAutomationDismissalApprovedQueue.currentPage}
             totalPages={evictionAutomationDismissalApprovedQueue.totalPages}
             totalRecords={evictionAutomationDismissalApprovedQueue.totalCount}
             handleFrontButton={handleFrontButton}
             handleBackButton={handleBackButton}
             canPaginateBack={canPaginateBack}
             canPaginateFront={canPaginateFront}
          />
       </div>
    );
 };
 
 export default EvictionAutomationDismissalsApprovedGrid;
