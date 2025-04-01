import React, { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { FaEye } from "react-icons/fa";
import Grid from "components/common/grid/GridWithToolTip";
import GridCheckbox from "components/formik/GridCheckBox";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import IconButton from "components/common/button/IconButton";
import { useFileEvictionsContext } from "../FileEvictionsContext";
import { useAuth } from "context/AuthContext";
import {
   IFileEvictionsItems,
} from "interfaces/file-evictions.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { formatCurrency, toCssClassName } from "utils/helper";
import { UserRole } from "utils/enum";
import FileEvictionDetails from "./FileEvictionDetails";
import { useLocation } from "react-router-dom";
import ToggleSwitch from "components/common/toggle/ToggleSwitch";
import { formattedCell, formatAttorneyCell, formatPropertyNameAddressCell, formatTenantUnitCell, formatTenantNamesCell, formatTenantAddressCell, formatFilerBusinessInfoCell } from "utils/gridFormatHelpers";

type FileEvictionsGridProps = {};

const FileEvictionsGrid = (props: FileEvictionsGridProps) => {
   const {
      showSpinner,
      fileEvictions,
      getFileEvictions,
      selectedFileEvictionId,
      setSelectedFileEvictionId,
      setBulkRecords,
      getCounties,
      getAllCompanies,
      setSelectedEvictionApprovalId,
   } = useFileEvictionsContext();
   const isMounted = useRef(true);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(fileEvictions.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(fileEvictions.totalPages > 1);
   const [fileEvictionRecords, setFileEvictionsRecords] = useState<IFileEvictionsItems[]>([]);
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(Array(fileEvictions.items?.length).fill(false));
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   const [newSelectedRows] = useState<boolean[]>([]);
   const [showViewDetails, setShowViewDetails] = useState<boolean>(false);
   const [currentFileEvictionId, setCurrentFileEvictionId] = useState<string>("");
   const { userRole } = useAuth();
   const location = useLocation();
   const queryParams = new URLSearchParams(location.search);
   const casesList = queryParams.get("cases");
   const isApproved=queryParams.get("isApproved")=="true";
   useEffect(()=>{
      setSelectedEvictionApprovalId([]);
      if (casesList && !localStorage.getItem("casesList")) {
         localStorage.setItem("casesList", casesList ?? "");
      }
   },[])
   const [showAllEvictions, setShowAllEvictions] = useState<boolean>(
      false
   );
   const clientVisibleColumnMapping: IGridHeader[] = [
      // ...(!userRole.includes(UserRole.PropertyManager)
      //    ? [{ columnName: "isChecked", label: "isChecked", controlType: "checkbox" }]
      //    : []
      // ),
      ...(!userRole.includes(UserRole.PropertyManager)
      ?[{ columnName: "isChecked", label: "isChecked", controlType: "checkbox" }]
      : []
    ),  
      { columnName: "propertyName", label: "Property Name" },
      { columnName: "tenantUnit", label: "Tenant Unit", className:'text-right' },
      { columnName: "tenantNames", label: "Tenants" },
      { columnName: "fullTenantAddress", label: "Tenant Address", className:"fullTenantAddress" },
      { columnName: "allMonths", label: "Months" },
      { columnName: "evictionTotalRentDue", label: "Total Due", className:'text-right' },
      { columnName: "monthlyRent", label: "Monthly Rent", className:'text-right' },
      { columnName: "evictionOtherFees", label: "Other Fees" },
      { columnName: "reason", label: "Eviction Reason", className: "EvictionReason", },
      { columnName: "fullPropertyNameAddress", label: "Owner/Property" },
      { columnName: "fullAttorneyInfo", label: "Attorney" },
      { columnName: "filerBusinessInfo", label: "Filer Info" },
      { columnName: "evictionAffiantIs", label: "AffiantIs" },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "stateCourt", label: "StateCourt" },
      { columnName: "clientReferenceId", label: "Client Reference Id" },
      { columnName: "processServerCompany", label: "Process Server Company" },
   ];
   const c2cAdminColumnMapping: IGridHeader[] = [
      ...(!userRole.includes(UserRole.PropertyManager)
      ?[{ columnName: "isChecked", label: "isChecked", controlType: "checkbox" }]
      : []
    ),    
      ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)
      ?[ { columnName: "companyName", label: "CompanyName" }]
      : []
    ),
      { columnName: "county", label: "County" },
      { columnName: "propertyName", label: "Property Name" },
      { columnName: "tenantUnit", label: "Tenant Unit" },
      { columnName: "tenantNames", label: "Tenants" },
      { columnName: "fullTenantAddress", label: "Tenant Address", className:"fullTenantAddress" },
      { columnName: "reason", label: "Eviction Reason", className: "EvictionReason", },
      { columnName: "fullPropertyNameAddress", label: "Owner/Property" },
      { columnName: "fullAttorneyInfo", label: "Attorney" },
      { columnName: "evictionTotalRentDue", label: "Total Due", className:'text-right' },
      { columnName: "monthlyRent", label: "Monthly Rent", className:'text-right' },
      { columnName: "allMonths", label: "Months" },
      { columnName: "evictionOtherFees", label: "Other Fees" },
      { columnName: "filerBusinessInfo", label: "Filer Info" },
      { columnName: "evictionAffiantIs", label: "AffiantIs" },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "stateCourt", label: "State Court" },
      { columnName: "clientReferenceId", label: "Client Reference Id" },
      { columnName: "processServerCompany", label: "Process Server Company" },
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

   // Filter columns based on user role
   const filteredColumns = userRole.includes(UserRole.Viewer)
   ? initialColumnMapping.filter(col => col.columnName !== "isChecked") 
   : initialColumnMapping;

   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(filteredColumns);

   useEffect(() => {
      if (!fileEvictions.totalCount && isMounted.current) {         
         getCounties();
         if (userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)) {
            getAllCompanies();
         }
         isMounted.current = false;
      }
      if (localStorage.getItem("casesList") && isApproved) {        
         getFileEvictions(1, 100,false, fileEvictions.searchParam);
      }
      else
      getFileEvictions(1, 100,true, fileEvictions.searchParam);
   }, []);

   useEffect(() => {
      const fileEvictionRecords: IFileEvictionsItems[] = fileEvictions.items.map((item: any) => {
         return {
            isChecked: selectedFileEvictionId.includes(item.id) ? true : false, // Add the new property
            ...item, // Spread existing properties
         };
      });
      setFileEvictionsRecords(fileEvictionRecords);

      const updatedSelectedRows = (fileEvictions.items || []).map((item: any) =>
         selectedFileEvictionId.includes(item.id)
      );

      // const updatedSelectedRows = (fileEvictions.items || []).map((item: any) => ({
      //   id: item.id,
      //   selected: selectedFileEvictionId.includes(item.id)
      // }));

      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(fileEvictions.currentPage > 1);
      setCanPaginateFront(fileEvictions.totalPages > 1);
      // Update the state with the new selectedRows array
      setSelectedRows(updatedSelectedRows);
      // setSelectedRows(Array(fileEvictions.items?.length).fill(false));    
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

   }, [fileEvictions, selectedFileEvictionId]);

   const handleSorting = (columnName: string, order: string) => {
      // Copy the current fileEvictionRecords array to avoid mutating the state directly
      const sortedRecords = [...fileEvictionRecords];
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
      setFileEvictionsRecords(sortedRecords);
   };

   // Event handler for the 'Back' button
   const handleBackButton = () => {
      if (
         fileEvictions.currentPage > 1 &&
         fileEvictions.currentPage <= fileEvictions.totalPages
      ) {
         const updatedCurrentPage = fileEvictions.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(fileEvictions.currentPage > 1);
         // back button get late notices
         getFileEvictions(
            updatedCurrentPage,
            fileEvictions.pageSize,
            fileEvictions.isViewAll??true,
            fileEvictions.searchParam
            ,fileEvictions.companyId
         );
      }
   };

   // Event handler for the 'Next' button
   const handleFrontButton = () => {
      if (fileEvictions.currentPage < fileEvictions.totalPages) {
         const updatedCurrentPage = fileEvictions.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getFileEvictions(
            updatedCurrentPage,
            fileEvictions.pageSize,
            fileEvictions.isViewAll??true,
            fileEvictions.searchParam
            ,fileEvictions.companyId
         );
      }
   };

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
      if (shiftKeyPressed && lastClickedRowIndex !== -1 && fileEvictionRecords) {
         const start = Math.min(index, lastClickedRowIndex);
         const end = Math.max(index, lastClickedRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (fileEvictionRecords || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         fileEvictionRecords.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            settingData(item);
         })
         setSelectedFileEvictionId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (fileEvictionRecords.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = fileEvictionRecords.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         // const selectedIds = (fileEvictions.items || [])
         //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
         //   .map((item) => item.id)
         //   .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked
            setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedFileEvictionId(prevIds => prevIds.filter(item => item !== id));
         } else {
            // If checked, add the selected item to filteredRecords
            // const selectedItemIndex = selectedIds.findIndex(itemId => itemId === id);
            // const selectedItem = (fileEvictions.items || [])[selectedItemIndex]; // Get the selected item by index
            settingData(fileEvictionRecords.filter(x => x.id === id)[0])
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedFileEvictionId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }

      }

      setLastClickedRowIndex(index);
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = fileEvictionRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         fileEvictionRecords
            .map((item) => settingData(item));
         setSelectedFileEvictionId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         fileEvictionRecords.forEach((item) => {
            setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedFileEvictionId(prevIds => prevIds.filter(id => id !== item.id));
         });
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
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

      setBulkRecords(prevItems => {
         const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
         uniqueItems.add(JSON.stringify(checkItem)); // Add the new item
         return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
      });
   };

   const checkIfAllIdsExist = (
		      fileEvictionRecords: IFileEvictionsItems[],
      selectedFileEvictionId: string[]
): boolean | undefined => {
   if (fileEvictionRecords.length === 0) {
	   return false;
   }
	       return fileEvictionRecords.every(record =>
         selectedFileEvictionId.includes(record.id as string)
      );
};
   // const checkIfAllIdsExist = (
   //    fileEvictionRecords: IFileEvictionsItems[],
   //    selectedFileEvictionId: string[]
   // ): boolean | undefined => {

   //    return fileEvictionRecords.every(record =>
   //       selectedFileEvictionId.includes(record.id as string)
   //    );
   // };

   const handleShowViewDetails = (id: string) => {
      setCurrentFileEvictionId(id);
      setShowViewDetails(true);
   };

   const handleCellRendered = (
      cellIndex: number,
      data: IFileEvictionsItems,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];

      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               // checked={selectedRows.some(row => row.id === data.id && row.selected)}
               checked={selectedFileEvictionId.includes(data.id as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id as string, checked)
               }
               label=""
            />
         ),
         action: () => renderActionsCell(data.id ?? ""),
         monthlyRent: () => formatCurrencyCell(cellValue),
         evictionTotalRentDue: () => {
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
         // evictionTotalRentDue: () => formattedCell(cellValue),
         evictionOtherFees: () => formattedCell(cellValue),
         propertyName: () => renderHighlightedCell(cellValue),
         attorneyBarNo: () => renderHighlightedCell(cellValue),
         attorneyName: () => renderHighlightedCell(data.attorneyName),
         tenantNames: () => formatTenantNamesCell(data?.tenantNames, data?.andAllOtherTenants),
         fullTenantAddress: () => formatTenantAddressCell(data),
         fullPropertyNameAddress: () => formatPropertyNameAddressCell(data),
         fullAttorneyInfo: () => formatAttorneyCell(data),
         tenantUnit: () => formatTenantUnitCell(data.tenantUnit),
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
         // tenantOne: () => formattedTenantFullName(data?.tenantNames[0]),
         // tenantTwo: () => formattedTenantFullName(data?.tenantNames[1]),
         // tenantThree: () => formattedTenantFullName(data?.tenantNames[2]),
         // tenantFour: () => formattedTenantFullName(data?.tenantNames[3]),
         // tenantFive: () => formattedTenantFullName(data?.tenantNames[4]),
         tenantAddress: () => (
            <span>
               <HighlightedText
                  text={`${data.tenantAddress ?? ""} ${data.tenantUnit ?? ""} ${data.tenantCity ?? ""
                     } ${data.tenantState ?? ""} ${data.tenantZip ?? ""}`}
                  query={fileEvictions.searchParam ?? ""}
               />
            </span>
         ),
         evictionAffiantIs: () => formattedCell(cellValue),
         stateCourt: () => formattedCell(cellValue),
         county: () => renderHighlightedCell(cellValue),
         //tenantUnit: () => renderHighlightedCell(cellValue),
         tenantCity: () => renderHighlightedCell(cellValue),
         expedited: () => <span>{cellValue != "" && cellValue != null ? "Expedited" : ""}</span>,
         tenantState: () => renderHighlightedCell(cellValue),
         tenantZip: () => renderHighlightedCell(cellValue),
         filerEmail: () => renderHighlightedCell(cellValue),
         filerBusinessInfo: () => formatFilerBusinessInfoCell(data),
         clientReferenceId: () => formattedCell(cellValue),
      };

      const renderer = renderers[propertyName ?? ""] || (() => formattedCell(cellValue));

      if (visibleColumns.find((x) => x.label === columnName)) {
         return (
            <td
               key={cellIndex}
               className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929] ${toCssClassName(columnName)}`}
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

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );
   

   const renderHighlightedCell = (value: any) => (
      <HighlightedText text={value as string ?? ''} query={fileEvictions.searchParam ?? ''} />
   );

   // const formattedCell = (value: any) => (
   //    <span>
   //       <HighlightedText
   //          text={value !== null ? value : ""}
   //          query={fileEvictions.searchParam ?? ""}
   //       />
   //    </span>
   // );

   const renderActionsCell = (id: string) => {
      return (
         <>
            <IconButton
               type={"button"}
               className="cursor-pointer text-[#2472db]"
               disabled={!id.length}
               icon={<FaEye className="h-4 w-4" />}
               handleClick={() => handleShowViewDetails(id)}
            />
         </>
      );
   };

   const formattedTenantValue = (data: IFileEvictionsItems, index: number) => {
      if (data.tenantNames && data.tenantNames.length >= 0)
         return data.tenantNames[index];
      else return null;
   };

   return (
      <div className="mt-3">
         <div className="relative -mr-0.5">
         <div className="mb-2 text-sm text-gray-600">
            {selectedFileEvictionId.length} of {fileEvictions.totalCount} records selected
         </div>
            {/* Render the Grid component with column headings and grid data */}
            {showSpinner ? (
                 <Spinner /> 
            ) : (
               <>
               <div className="relative flex flex-wrap items-center mb-1.5 mt-2.5 justify-end">
                  {localStorage.getItem("casesList") && userRole.includes(UserRole.Signer) && isApproved && <ToggleSwitch
                     value={showAllEvictions}
                     label={"View All"}
                     handleChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setShowAllEvictions(event.target.checked);
                        getFileEvictions(1, 100, event.target.checked, fileEvictions.searchParam,fileEvictions.companyId);
                        setSelectedFileEvictionId([]);
                     }}
                  ></ToggleSwitch>}
               </div>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={fileEvictions.items}
                     handleSelectAllChange={handleSelectAllChange}
                     selectAll={checkIfAllIdsExist(fileEvictionRecords, selectedFileEvictionId)}
                     cellRenderer={(
                        data: IFileEvictionsItems,
                        rowIndex: number,
                        cellIndex: number,
                     ) => handleCellRendered(cellIndex, data, rowIndex)}
                     handleSorting={handleSorting}
                     selectedIds={selectedFileEvictionId}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={fileEvictions.pageSize}
                     currentPage={fileEvictions.currentPage}
                     totalPages={fileEvictions.totalPages}
                     totalRecords={fileEvictions.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               </>
            )}
         </div>
         {showViewDetails && (
            <FileEvictionDetails
               evictionId={currentFileEvictionId}
               showViewDetails={showViewDetails}
               setShowViewDetails={(show: boolean) => setShowViewDetails(show)}
            />
         )}
      </div>
   );
};

export default FileEvictionsGrid;
