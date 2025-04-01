import { useAuth } from 'context/AuthContext';
import React, { useEffect, useRef, useState } from 'react';
import { useFileEvictionsTXContext } from '../FileEvictionsTXContext';
import { IGridHeader } from 'interfaces/grid-interface';
import { UserRole } from 'utils/enum';
import { IEvictionAutomationQueueItem } from 'interfaces/eviction-automation.interface';
import { FileEvictionsTXButtonsList } from 'utils/constants';
import HighlightedText from 'components/common/highlightedText/HighlightedText';
import { IFileEvictionsItems } from 'interfaces/file-evictions.interface';
import GridCheckbox from "components/formik/GridCheckBox";
import { toCssClassName } from "utils/helper";
import Spinner from 'components/common/spinner/Spinner';
import Grid from 'components/common/grid/GridWithToolTip';
import Pagination from "components/common/pagination/Pagination";
import { formattedCell, formatAttorneyCell, formatPropertyNameAddressCell, formatTenantUnitCell, formatTenantNamesCell, formatTenantAddressCell, formatFilerBusinessInfoCell } from "utils/gridFormatHelpers";

const EA_EvictionGrid: React.FC = () => {
    const { userRole } = useAuth();
    const {
        showSpinner,
        evictionAutomationApprovalsQueue,
        getEvictionAutomationApprovalsQueue,
        selectedEvictionApprovalId,
        setSelectedEvictionApprovalId,
        getCounties,
        setBulkEARecords
     } = useFileEvictionsTXContext();
     const clientVisibleColumnMapping: IGridHeader[] = [
      //   ...(!userRole.includes(UserRole.PropertyManager)
      //      ? [{ columnName: "isChecked", label: "isChecked", controlType: "checkbox" }]
      //      : []
      //   ),
        { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
        { columnName: "propertyName", label: "Property Name" },
        { columnName: "tenantUnit", label: "Tenant Unit", className:'text-right' },
        { columnName: "tenantNames", label: "Tenants" },
        { columnName: "fullTenantAddress", label: "Tenant Address", className:"fullTenantAddress" },
        { columnName: "tenant1Phone", label: "Tenant1Phone"},
        { columnName: "allMonths", label: "Months" },
        { columnName: "evictionTotalRentDue", label: "Total Due", className:'text-right' },
        { columnName: "monthlyRent", label: "Monthly Rent", className:'text-right' },
        { columnName: "evictionOtherFees", label: "Other Fees" },
        { columnName: "reason", label: "Eviction Reason", className: "EvictionReason", },
        { columnName: "fullPropertyNameAddress", label: "Owner/Property" },
        { columnName: "fullAttorneyInfo", label: "Attorney" },
        { columnName: "filerBusinessName", label: "Filer Business Name" },
        { columnName: "evictionAffiantIs", label: "AffiantIs" },
        { columnName: "filerPhone", label: "FilerPhone" },
        { columnName: "filerEmail", label: "FilerEmail" },
        //{ columnName: "expedited", label: "Expedited" },
        { columnName: "stateCourt", label: "Court" },
        { columnName: "clientReferenceId", label: "Client Reference Id" },
        //{ columnName: "processServerCompany", label: "Process Server Company" },
     ];
     const c2cAdminColumnMapping: IGridHeader[] = [
        { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
        ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)
        ?[ { columnName: "companyName", label: "CompanyName" }]
        : []
      ),
      // { columnName: "companyName", label: "Company" },
        { columnName: "county", label: "County" },
        { columnName: "propertyName", label: "Property Name" },
        { columnName: "tenantUnit", label: "Tenant Unit" },
        { columnName: "tenantNames", label: "Tenants" },
        { columnName: "fullTenantAddress", label: "Tenant Address", className:"fullTenantAddress" },
        { columnName: "tenant1Phone", label: "Tenant1Phone"},
        { columnName: "reason", label: "Eviction Reason", className: "EvictionReason", },
        { columnName: "fullPropertyNameAddress", label: "Owner/Property" },
        { columnName: "fullAttorneyInfo", label: "Attorney" },
        { columnName: "evictionTotalRentDue", label: "Total Due", className:'text-right' },
        { columnName: "monthlyRent", label: "Monthly Rent", className:'text-right' },
        { columnName: "allMonths", label: "Months" },
        { columnName: "evictionOtherFees", label: "Other Fees" },
        { columnName: "filerBusinessName", label: "Filer Business Name" },
        { columnName: "evictionAffiantIs", label: "AffiantIs" },
        { columnName: "filerPhone", label: "Filer Phone" },
        { columnName: "filerEmail", label: "Filer Email" },
       // { columnName: "expedited", label: "Expedited" },
        { columnName: "stateCourt", label: "Court" },
        { columnName: "clientReferenceId", label: "Client Reference Id" },
        //{ columnName: "processServerCompany", label: "Process Server Company" },
        { columnName: "crmName", label: "CRM Name" },
        { columnName: "ownerId", label: "OwnerId" },
        { columnName: "propertyId", label: "PropertyId" },
        { columnName: "unitId", label: "UnitId" },
        { columnName: "pullTime", label: "PullTime" },
        { columnName: "batchId", label: "BatchId" },
     ];
     const initialColumnMapping: IGridHeader[] = [
        ...((userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) ? c2cAdminColumnMapping : clientVisibleColumnMapping ),
     ];
     const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
        initialColumnMapping
     );
     const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionAutomationApprovalsQueue.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionAutomationApprovalsQueue.totalPages > 1);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(evictionAutomationApprovalsQueue.items.length).fill(false)
   );
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   const [newSelectedRows] = useState<boolean[]>([]);
   const isMounted = useRef(true);   
   useEffect(() => {
      
    if (isMounted.current) {
       getCounties();
       setSelectedEvictionApprovalId([]);
       setBulkEARecords([]);
       getEvictionAutomationApprovalsQueue(1, 100, false, false);
       isMounted.current = false;
    }

    const evictionAutomationRecords: IEvictionAutomationQueueItem[] = evictionAutomationApprovalsQueue.items.map((item: any) => {
       return {
          //   isChecked: false, // Add the new property
          ...item, // Spread existing properties
       };
    });

    const selectedButtons = FileEvictionsTXButtonsList.filter(button => button.title === "Approve/Sign");

    const updatedSelectedRows = (evictionAutomationApprovalsQueue.items || []).map((item: any) =>
       selectedEvictionApprovalId.includes(item.id)
    );

    // Enable/disable pagination buttons based on the number of total pages
    setCanPaginateBack(evictionAutomationApprovalsQueue.currentPage > 1);
    setCanPaginateFront(evictionAutomationApprovalsQueue.totalPages > 1);

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
 }, [evictionAutomationApprovalsQueue, userRole]);

 const handleCellRendered = (cellIndex: number, data: IFileEvictionsItems, rowIndex: number) => {
    const columnName = visibleColumns[cellIndex]?.label;
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
    const renderers: Record<string, () => JSX.Element> = {
       isChecked: () => (
          <GridCheckbox
             // checked={selectedRows.some(row => row.id === data.id && row.selected)}
             checked={
                selectedEvictionApprovalId.includes(data.id as string)
             }
             onChange={(checked: boolean) =>
                handleCheckBoxChange(rowIndex, data.id as string, checked)
             }
             label=""
          />
       ),
       tenantNames: () => formatTenantNamesCell(data?.tenantNames, data?.andAllOtherTenants),
       tenant1Phone:()=><span>{data?.tenantNames[0]?.phone??""}</span>,
       fullTenantAddress: () => formatTenantAddressCell(data),
       fullPropertyNameAddress: () => formatPropertyNameAddressCell(data),
       fullAttorneyInfo: () => formatAttorneyCell(data),
       tenantUnit: () => formatTenantUnitCell(cellValue),
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
       companyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       andAllOtherTenants: () => <HighlightedText text={cellValue ?"AndAllOthers ": ""}  query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       attorneyBarNo: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       attorneyEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       attorneyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       county: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       filerEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       evictionAffiantIs: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       filerBusinessName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       ownerName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       propertyAddress: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       propertyCity: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       propertyEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       propertyName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       propertyPhone: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       propertyState: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       propertyZip: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       propertyId: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       ownerId: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       crmName: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationApprovalsQueue.searchParam ?? ''} />,
       expedited: () => <span>{cellValue != "" && cellValue != null ? "Expedited" : ""}</span>,
       // expedited:()=><span>{cellValue?"Expedited":""}</span>,
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
        filerBusinessInfo: () => formatFilerBusinessInfoCell(data),
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

 const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
    
    if (shiftKeyPressed && lastClickedRowIndex !== -1 && evictionAutomationApprovalsQueue.items) {
       const start = Math.min(index, lastClickedRowIndex);
       const end = Math.max(index, lastClickedRowIndex);
       setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
          i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
       ));
       setSelectedRows(selectedRows);
       const selectedIds = (evictionAutomationApprovalsQueue.items || [])
          .filter((_, rowIndex) => selectedRows[rowIndex])
          .map((item) => item.id)
          .filter((id): id is string => typeof id === "string");

       evictionAutomationApprovalsQueue.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
          // setBulkRecords(prevItems => {
          //   const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
          //   uniqueItems.add(JSON.stringify(item)); // Add the new item
          //   return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
          // });      
          //  setBulkRecords((prev)=>[...prev,item]);
          settingData(item);
       })
       setSelectedEvictionApprovalId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
    } else {
       const updatedSelectedRows = [...selectedRows];
       updatedSelectedRows[index] = checked;
       setSelectedRows(updatedSelectedRows);

       if (evictionAutomationApprovalsQueue.items.length === updatedSelectedRows.filter(item => item).length) {
          setSelectAll(true);
       } else {
          setSelectAll(false);
       }

       var selectedIds = evictionAutomationApprovalsQueue.items.filter(item => item.id == id).map((item) => item.id)
          .filter((id): id is string => typeof id === "string");
       // const selectedIds = (fileEvictions.items || [])
       //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
       //   .map((item) => item.id)
       //   .filter((id): id is string => typeof id === "string");

       if (!checked) {
          // Remove the item from filteredRecords if unchecked        
          //  setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
          setBulkEARecords(prevItems => prevItems.filter(item => item.id !== id));
          setSelectedEvictionApprovalId(prevIds => prevIds.filter(item => item !== id));
       } else {

          //  setBulkRecords(prevItems => {
          //    const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
          //    uniqueItems.add(JSON.stringify(lateNoticesRecords.filter(x=>x.id===id)[0])); // Add the new item
          //    return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
          //  });   
          //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
          // if (selectedItem)
          //   settingData(selectedItem);
          settingData(evictionAutomationApprovalsQueue.items.filter(x => x.id === id)[0])
          setSelectedEvictionApprovalId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
       }
    }
    setLastClickedRowIndex(index);
 };

 const settingData = async (record: IFileEvictionsItems) => {
    
    const checkItem = {
       id: record.id,
       County: record.county,
       Tenant1Last:
          formattedTenantValue(record, 0) != null
             ? formattedTenantValue(record, 0)?.lastName || ""
             : "",
       Tenant1First:
          formattedTenantValue(record, 0) != null
             ? formattedTenantValue(record, 0)?.firstName || ""
             : "",
       Tenant1MI:
          formattedTenantValue(record, 0) != null
             ? formattedTenantValue(record, 0)?.middleName || ""
             : "",
       Tenant2Last:
          formattedTenantValue(record, 1) != null
             ? formattedTenantValue(record, 1)?.lastName || ""
             : "",
       Tenant2First:
          formattedTenantValue(record, 1) != null
             ? formattedTenantValue(record, 1)?.firstName || ""
             : "",
       Tenant2MI:
          formattedTenantValue(record, 1) != null
             ? formattedTenantValue(record, 1)?.middleName || ""
             : "",
       Tenant3Last:
          formattedTenantValue(record, 2) != null
             ? formattedTenantValue(record, 2)?.lastName || ""
             : "",
       Tenant3First:
          formattedTenantValue(record, 2) != null
             ? formattedTenantValue(record, 2)?.firstName || ""
             : "",
       Tenant3MI:
          formattedTenantValue(record, 2) != null
             ? formattedTenantValue(record, 2)?.middleName || ""
             : "",
       Tenant4Last:
          formattedTenantValue(record, 3) != null
             ? formattedTenantValue(record, 3)?.lastName || ""
             : "",
       Tenant4First:
          formattedTenantValue(record, 3) != null
             ? formattedTenantValue(record, 3)?.firstName || ""
             : "",
       Tenant4MI:
          formattedTenantValue(record, 3) != null
             ? formattedTenantValue(record, 3)?.middleName || ""
             : "",
       Tenant5Last:
          formattedTenantValue(record, 4) != null
             ? formattedTenantValue(record, 4)?.lastName || ""
             : "",
       Tenant5First:
          formattedTenantValue(record, 4) != null
             ? formattedTenantValue(record, 4)?.firstName || ""
             : "",
       Tenant5MI:
          formattedTenantValue(record, 4) != null
             ? formattedTenantValue(record, 4)?.middleName || ""
             : "",
       AndAllOtherOccupants: record.andAllOtherTenants ?? "",
       TenantAddress: record.tenantAddress ?? "",
       TenantUnit: record.tenantUnit ?? "",
       TenantCity: record.tenantCity ?? "",
       TenantZip: record.tenantZip ?? "",
       TenantState: record.tenantState ?? "",
       EvictionReason: record.reason ?? "",
       EvictionTotalRentDue: record.evictionTotalRentDue ?? "",
       MonthlyRent: record.monthlyRent ?? "",
       AllMonths: record.allMonths ?? "",
       EvictionOtherFees: record.evictionOtherFees ?? "",
       OwnerName: record.ownerName ?? "",
       PropertyName: record.propertyName ?? "",
       PropertyPhone: record.propertyPhone ?? "",
       PropertyEmail: record.propertyEmail ?? "",
       PropertyAddress: record.propertyAddress ?? "",
       PropertyCity: record.propertyCity ?? "",
       PropertyState: record.propertyState ?? "",
       PropertyZip: record.propertyZip ?? "",
       AttorneyName: record.attorneyName ?? "",
       AttorneyBarNo: record.attorneyBarNo ?? "",
       AttorneyEmail: record.attorneyEmail ?? "",
       FilerBusinessName: record.filerBusinessName ?? "",
       EvictionAffiantIs: record.evictionAffiantIs ?? "",
       EvictionFilerPhone: record.filerPhone ?? "",
       EvictionFilerEMail: record.filerEmail ?? "",
       ProcessServer: "",
       ProcessServerEmail: "",
       Expedited: record.expedited ? "Expedited" : "",
       StateCourt: record.stateCourt ?? "",
       ClientReferenceId: record.clientReferenceId,
       ProcessServerCompany: record.processServerCompany,
       ClientId: record.clientId
    };
    setBulkEARecords(prevItems => {
       const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
       uniqueItems.add(JSON.stringify(checkItem)); // Add the new item
       return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
    });
 };

 const formattedTenantValue = (data: IFileEvictionsItems, index: number) => {
    if (data.tenantNames && data.tenantNames.length >= 0)
       return data.tenantNames[index];
    else return null;
 };


 const handleFrontButton = () => {
    if (evictionAutomationApprovalsQueue.currentPage < evictionAutomationApprovalsQueue.totalPages) {
       const updatedCurrentPage = evictionAutomationApprovalsQueue.currentPage + 1;
       // Update current page and enable/disable 'Back' button
       setCanPaginateBack(updatedCurrentPage > 1);
       // back button get late notices
       getEvictionAutomationApprovalsQueue(updatedCurrentPage,
          evictionAutomationApprovalsQueue.pageSize, false, false);
    }
 };

 const handleBackButton = () => {
    if (
       evictionAutomationApprovalsQueue.currentPage > 1 &&
       evictionAutomationApprovalsQueue.currentPage <= evictionAutomationApprovalsQueue.totalPages
    ) {
       const updatedCurrentPage = evictionAutomationApprovalsQueue.currentPage - 1;
       // Update current page and enable/disable 'Back' button
       setCanPaginateBack(evictionAutomationApprovalsQueue.currentPage > 1);
       // back button get late notices
       getEvictionAutomationApprovalsQueue(updatedCurrentPage,
          evictionAutomationApprovalsQueue.pageSize, false, false);
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
      const allIds: string[] = evictionAutomationApprovalsQueue.items
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         // emailQueues.items
         // .map((item) => setBulkRecords((prev) => [...prev, item]));
         evictionAutomationApprovalsQueue.items
            .map((item) => settingData(item));
         setSelectedEvictionApprovalId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         evictionAutomationApprovalsQueue.items.forEach((item) => {
            // setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setBulkEARecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedEvictionApprovalId(prevIds => prevIds.filter(id => id !== item.id));
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
            {selectedEvictionApprovalId.length} of {evictionAutomationApprovalsQueue.totalCount} records selected
         </div>
               {showSpinner && <Spinner />}
               <div className="relative flex flex-wrap items-center mb-1.5 mt-2.5 justify-end">
                  {/* {localStorage.getItem("casesList") && userRole.includes(UserRole.PropertyManager) && <ToggleSwitch
                     value={showAllAutomation}
                     label={"View All"}
                     handleChange={(event: ChangeEvent<HTMLInputElement>) => {
                        
                        setShowAllAutomation(event.target.checked);
                        getEvictionAutomationApprovalsQueue(1, 100, false, event.target.checked, evictionAutomationApprovalsQueue.searchParam);
                        setSelectedEvictionApprovalId([]);
                     }}
                  ></ToggleSwitch>} */}
               </div>
            </div>
         </div>
         {/* <Grid
            columnHeading={visibleColumns.map(column => column.label)}
            rows={evictionAutomationApprovalsQueue.items}
            cellRenderer={(data: IFileEvictionsItems, rowIndex: number, cellIndex: number) =>
               
               handleCellRendered(cellIndex, data, rowIndex)
            }
         /> */}
            {showSpinner ? (
               <Spinner />
            ) : (
               <>
                    <Grid
            columnHeading={visibleColumns}
            rows={evictionAutomationApprovalsQueue.items}
            handleSelectAllChange={handleSelectAllChange}
            selectAll={checkIfAllIdsExist(evictionAutomationApprovalsQueue.items, selectedEvictionApprovalId)}
            cellRenderer={(data: IFileEvictionsItems, rowIndex: number, cellIndex: number) => {
               return handleCellRendered(cellIndex, data, rowIndex);
            }}
         // handleSorting={handleSorting}
         />
         <Pagination
            numberOfItemsPerPage={evictionAutomationApprovalsQueue.pageSize}
            currentPage={evictionAutomationApprovalsQueue.currentPage}
            totalPages={evictionAutomationApprovalsQueue.totalPages}
            totalRecords={evictionAutomationApprovalsQueue.totalCount}
            handleFrontButton={handleFrontButton}
            handleBackButton={handleBackButton}
            canPaginateBack={canPaginateBack}
            canPaginateFront={canPaginateFront}
         />
               </>
            )}
      </div>
   );
}
export default EA_EvictionGrid;