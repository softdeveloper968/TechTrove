import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useDissmissalsContext } from '../DismissalsContext';
import { useAuth } from 'context/AuthContext';
import { IGridHeader } from 'interfaces/grid-interface';
import { IEvictionAutomationButton, IEvictionAutomationQueueItem } from 'interfaces/eviction-automation.interface';
import { IFileEvictionsItems, ITenant } from 'interfaces/file-evictions.interface';
import { EvictionAutomationButtonList } from 'utils/constants';
import { UserRole } from 'utils/enum';
import GridCheckbox from 'components/formik/GridCheckBox';
import HighlightedText from 'components/common/highlightedText/HighlightedText';
import Spinner from 'components/common/spinner/Spinner';
import Grid from 'components/common/grid/GridWithToolTip';
import Pagination from "components/common/pagination/Pagination";
import ToggleSwitch from 'components/common/toggle/ToggleSwitch';
import { convertUtcToEst, toCssClassName } from 'utils/helper';

const EvictionAutomationDismissalsApprovalGrid: React.FC = () => {
    const {
       showSpinner,
       evictionAutomationDismissalApprovalsQueue,
       getEvictionAutomationDismissalApprovalsQueue,
       selectedEvictionDismissalApprovalId,
       setSelectedEvictionDismissalApprovalId,  
    } = useDissmissalsContext();
    const {userRole}=useAuth();
    const [showAllAutomation, setShowAllAutomation] = useState<boolean>(
      false
   );
    const initialColumnMapping: IGridHeader[] = [
       { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
       { columnName: "caseNo", label: "CaseNo" },
       {columnName :"tenantOne",label:"TenantOne"},
      //  {columnName :"tenantTwo",label:"TenantTwo"},
      //  {columnName :"tenantThree",label:"TenantThree"},
      //  {columnName :"tenantFour",label:"TenantFour"},
      //  {columnName :"tenantFive",label:"TenantFive"},
       { columnName: "tenantAddress", label: "TenantAddressCombined", className: "TenantAddress"},
       { columnName: "propertyName", label: "PropertyName" },
      //  { columnName: "crmName", label: "CrmName" },
      //  { columnName: "ownerId", label: "OwnerId" },
      //  { columnName: "propertyId", label: "PropertyId" },
      //  { columnName: "unitId", label: "UnitId" },
       {columnName:"balanceDate",label:"BalanceDate"},
       { columnName: "evictionTotalRentDue", label: "EvictionTotalRentDue", className:'text-right' },
       {columnName:"currentBalance",label:"CurrentBalance", className:'text-right'},
       ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)
      ?[ { columnName: "companyName", label: "CompanyName" }]
      : []
    ),
      // { columnName: "companyName", label: "Company" },
    ];
    const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
       initialColumnMapping
    );
    const [evictionAutomationRecords, setEvictionAutomationRecords] = useState<IEvictionAutomationQueueItem[]>([]);
    const [selectedButtons, setselectedButtons] = useState<IEvictionAutomationButton[]>([]);
    const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionAutomationDismissalApprovalsQueue.currentPage > 1);
    const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionAutomationDismissalApprovalsQueue.totalPages > 1);
    const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
       Array(evictionAutomationDismissalApprovalsQueue.items.length).fill(false)
    );
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
    const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
    const [newSelectedRows] = useState<boolean[]>([]);
    const isMounted = useRef(true);
    
    useEffect(() => {

      if (isMounted.current) {
         setSelectedEvictionDismissalApprovalId([]);   
       if (localStorage.getItem("casesList"))
         getEvictionAutomationDismissalApprovalsQueue(1, 100, false, false);
      else
      getEvictionAutomationDismissalApprovalsQueue(1, 100, false, true);
         isMounted.current = false;
      }

       const evictionAutomationRecords: IEvictionAutomationQueueItem[] = evictionAutomationDismissalApprovalsQueue.items.map((item: any) => {
          return {
             //   isChecked: false, // Add the new property
             ...item, // Spread existing properties
          };
       });
 
       setEvictionAutomationRecords(evictionAutomationRecords);
       const selectedButtons = EvictionAutomationButtonList.filter(button => button.title === "Approve/Sign");
       setselectedButtons(selectedButtons);
       // getEvictionAutomationQueue(1,100);
 
       const updatedSelectedRows = (evictionAutomationDismissalApprovalsQueue.items || []).map((item: any) =>
          selectedEvictionDismissalApprovalId.includes(item.id)
       );
 
       // Enable/disable pagination buttons based on the number of total pages
       setCanPaginateBack(evictionAutomationDismissalApprovalsQueue.currentPage > 1);
       setCanPaginateFront(evictionAutomationDismissalApprovalsQueue.totalPages > 1);
 
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
 
 
 
    const handleCellRendered = (cellIndex: number, data: IFileEvictionsItems, rowIndex: number) => {
       const columnName = visibleColumns[cellIndex]?.label;
       const propertyName = visibleColumns[cellIndex]?.columnName;
       const cellValue = (data as any)[propertyName];
       const renderers: Record<string, () => JSX.Element> = {
          isChecked: () => (
             <GridCheckbox
                // checked={selectedRows.some(row => row.id === data.id && row.selected)}
                checked={
                   selectedEvictionDismissalApprovalId.includes(data.id as string)
                }
                onChange={(checked: boolean) => 
                   handleCheckBoxChange(rowIndex, data.id as string, checked)
                }
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
          companyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  andAllOtherTenants: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  attorneyBarNo: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  attorneyEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  attorneyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  county: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  filerEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  evictionAffiantIs: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  filerBusinessName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  ownerName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  propertyAddress: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  propertyCity: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  propertyEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
          propertyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
          caseNo: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  propertyPhone: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  propertyState: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
         //  propertyZip: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />,
          tenantAddress: () => (
            <span>
               <HighlightedText
                  text={`${data.tenantAddress ?? ""} ${data.tenantUnit ?? ""} ${data.tenantCity ?? ""
                     } ${data.tenantState ?? ""} ${data.tenantZip ?? ""}`}
                  query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ""}
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
             balanceDate: () => formattedDateCell(cellValue),
       };
       const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
         <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={evictionAutomationDismissalApprovalsQueue.searchParam ?? ''} />
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
    const formattedDateCell = (value: any) => (
      <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
   //   <span>{value !== null ? formattedDate(value) : ""}</span>
   );
 
    const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
       
       if (shiftKeyPressed && lastClickedRowIndex !== -1 && evictionAutomationDismissalApprovalsQueue.items) {
          const start = Math.min(index, lastClickedRowIndex);
          const end = Math.max(index, lastClickedRowIndex);
          setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
             i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
          ));
          setSelectedRows(selectedRows);
          const selectedIds = (evictionAutomationDismissalApprovalsQueue.items || [])
             .filter((_, rowIndex) => selectedRows[rowIndex])
             .map((item) => item.id)
             .filter((id): id is string => typeof id === "string");
 
             evictionAutomationDismissalApprovalsQueue.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
             // setBulkRecords(prevItems => {
             //   const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
             //   uniqueItems.add(JSON.stringify(item)); // Add the new item
             //   return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
             // });      
             //  setBulkRecords((prev)=>[...prev,item]);
          })
          setSelectedEvictionDismissalApprovalId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
       } else {
          const updatedSelectedRows = [...selectedRows];
          updatedSelectedRows[index] = checked;
          setSelectedRows(updatedSelectedRows);
 
          if (evictionAutomationDismissalApprovalsQueue.items.length === updatedSelectedRows.filter(item => item).length) {
             setSelectAll(true);
          } else {
             setSelectAll(false);
          }
 
          var selectedIds = evictionAutomationDismissalApprovalsQueue.items.filter(item => item.id == id).map((item) => item.id)
             .filter((id): id is string => typeof id === "string");
          // const selectedIds = (fileEvictions.items || [])
          //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
          //   .map((item) => item.id)
          //   .filter((id): id is string => typeof id === "string");
 
          if (!checked) {
             // Remove the item from filteredRecords if unchecked        
             //  setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
             setSelectedEvictionDismissalApprovalId(prevIds => prevIds.filter(item => item !== id));
          } else {
 
             //  setBulkRecords(prevItems => {
             //    const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
             //    uniqueItems.add(JSON.stringify(lateNoticesRecords.filter(x=>x.id===id)[0])); // Add the new item
             //    return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
             //  });   
             //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
             // if (selectedItem)
             //   settingData(selectedItem);
             setSelectedEvictionDismissalApprovalId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
          }
       }
       setLastClickedRowIndex(index);
    };
 
    
    const handleFrontButton = () => {
       if (evictionAutomationDismissalApprovalsQueue.currentPage < evictionAutomationDismissalApprovalsQueue.totalPages) {
          const updatedCurrentPage = evictionAutomationDismissalApprovalsQueue.currentPage + 1;
          // Update current page and enable/disable 'Back' button
          setCanPaginateBack(updatedCurrentPage > 1);
          // back button get late notices
          getEvictionAutomationDismissalApprovalsQueue(updatedCurrentPage,
            evictionAutomationDismissalApprovalsQueue.pageSize,false,evictionAutomationDismissalApprovalsQueue.isViewAll);         
       }
    };
 
    const handleBackButton = () => {
       if (
         evictionAutomationDismissalApprovalsQueue.currentPage > 1 &&
         evictionAutomationDismissalApprovalsQueue.currentPage <= evictionAutomationDismissalApprovalsQueue.totalPages
       ) {
          const updatedCurrentPage = evictionAutomationDismissalApprovalsQueue.currentPage - 1;
          // Update current page and enable/disable 'Back' button
          setCanPaginateBack(evictionAutomationDismissalApprovalsQueue.currentPage > 1);
          // back button get late notices
          getEvictionAutomationDismissalApprovalsQueue(updatedCurrentPage,
            evictionAutomationDismissalApprovalsQueue.pageSize,false,evictionAutomationDismissalApprovalsQueue.isViewAll);   
       }
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
 
    const handleSelectAllChange = (checked: boolean) => {
       const newSelectAll = !selectAll;
       const allIds: string[] = evictionAutomationDismissalApprovalsQueue.items
          .map((item) => item.id)
          .filter((id): id is string => typeof id === "string");
       if (checked) {
          // emailQueues.items
          // .map((item) => setBulkRecords((prev) => [...prev, item]));
          setSelectedEvictionDismissalApprovalId(prevIds => [...new Set([...prevIds, ...allIds])]);
       } else {
         evictionAutomationDismissalApprovalsQueue.items.forEach((item) => {
             // setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
             setSelectedEvictionDismissalApprovalId(prevIds => prevIds.filter(id => id !== item.id));
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
             <div className="relative -mr-0.5">
             <div className="mb-2 text-sm text-gray-600">
            {selectedEvictionDismissalApprovalId.length} of {evictionAutomationDismissalApprovalsQueue.totalCount} records selected
         </div>
                {showSpinner && <Spinner />}
                {/* <div className="relative flex flex-wrap items-center mb-1.5 mt-2.5 justify-end">
                   {localStorage.getItem("casesList") && userRole.includes(UserRole.PropertyManager) && <ToggleSwitch
                     value={showAllAutomation}
                     label={"View All"}
                     handleChange={(event: ChangeEvent<HTMLInputElement>) => {
                        
                        setShowAllAutomation(event.target.checked);
                        getEvictionAutomationDismissalApprovalsQueue(1, 100, false, event.target.checked, evictionAutomationDismissalApprovalsQueue.searchParam);
                        setSelectedEvictionDismissalApprovalId([]);
                     }}
                  ></ToggleSwitch>}
                </div> */}
             </div>
          </div>
          <Grid
             columnHeading={visibleColumns}
             rows={evictionAutomationDismissalApprovalsQueue.items}
             handleSelectAllChange={handleSelectAllChange}
             selectAll={checkIfAllIdsExist(evictionAutomationDismissalApprovalsQueue.items, selectedEvictionDismissalApprovalId)}
             cellRenderer={(data: IFileEvictionsItems, rowIndex: number, cellIndex: number) => {
                return handleCellRendered(cellIndex, data, rowIndex);
             }}
          // handleSorting={handleSorting}
             selectedIds={selectedEvictionDismissalApprovalId}
          />
          <Pagination
                   numberOfItemsPerPage={evictionAutomationDismissalApprovalsQueue.pageSize}
                   currentPage={evictionAutomationDismissalApprovalsQueue.currentPage}
                   totalPages={evictionAutomationDismissalApprovalsQueue.totalPages}
                   totalRecords={evictionAutomationDismissalApprovalsQueue.totalCount}
                   handleFrontButton={handleFrontButton}
                   handleBackButton={handleBackButton}
                   canPaginateBack={canPaginateBack}
                   canPaginateFront={canPaginateFront}
                />
       </div>
    );
 };
 
 export default EvictionAutomationDismissalsApprovalGrid;