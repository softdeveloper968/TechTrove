import React, { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { FaEye } from "react-icons/fa";
import Grid from "components/common/grid/GridWithToolTip";
import GridCheckbox from "components/formik/GridCheckBox";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import IconButton from "components/common/button/IconButton";
import { useAuth } from "context/AuthContext";
import { IGridHeader } from "interfaces/grid-interface";
import { formatCurrency, toCssClassName } from "utils/helper";
import { UserRole } from "utils/enum";
import { useLocation } from "react-router-dom";
import ToggleSwitch from "components/common/toggle/ToggleSwitch";
import { useFileEvictionsTXContext } from "../FileEvictionsTXContext";
import { IFileEvictionsTXItems, UploadedDocuments } from "interfaces/file-evictions-tx.interface";
import FileEvictionDetails from "../../file-evictions/components/FileEvictionDetails";
import HelperViewPdfService from "services/helperViewPdfService";
import { attachParent } from "rsuite/esm/internals/utils";

type FileEvictionsTXGridProps = {};

const FileEvictionsTXGrid = (props: FileEvictionsTXGridProps) => {
   const {
      showSpinner,
      fileEvictions,
      getFileEvictions,
      selectedFileEvictionId,
      setSelectedFileEvictionId,
      setBulkRecords,
      getCounties,
      getCourts,
      getAllCompanies,
   } = useFileEvictionsTXContext();
   const isMounted = useRef(true);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(fileEvictions.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(fileEvictions.totalPages > 1);
   const [fileEvictionRecords, setFileEvictionsRecords] = useState<IFileEvictionsTXItems[]>([]);
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
   const isApproved=queryParams.get("isApproved")==="true";
   useEffect(()=>{
      if (casesList && !localStorage.getItem("casesList")) {
         localStorage.setItem("casesList", casesList ?? "");
      }
   },[])
   const [showAllEvictions, setShowAllEvictions] = useState<boolean>(
      false
   );
   const initialColumnMapping: IGridHeader[] = [
      ...(!userRole.includes(UserRole.PropertyManager)
      ? [{ columnName: "isChecked", label: "isChecked", controlType: "checkbox" },{ columnName: "action", label: "Action", className: "action" }]
      : []
      ),
      { columnName: "county", label: "County" },
      {columnName:"stateCourt",label:"Court"},
      { columnName: "tenant1Last", label: "Tenant1Last" },
      { columnName: "tenant1First", label: "Tenant1First" },
      { columnName: "tenant1MI", label: "Tenant1MI" },
      { columnName: "tenant1Phone", label: "Tenant1Phone" },
      { columnName: "tenant1Email", label: "Tenant1Email" },
      { columnName: "andAllOtherTenants", label: "AndAllOtherOccupants" },
      { columnName: "tenantAddress", label: "TenantAddress", className: "TenantAddress", },
      { columnName: "tenantUnit", label: "TenantUnit" },
      { columnName: "tenantCity", label: "TenantCity" },
      { columnName: "tenantState", label: "TenantState" },
      { columnName: "tenantZip", label: "TenantZip" , className:'text-right'},
      { columnName: "tenant2Last", label: "Tenant2Last" },
      { columnName: "tenant2First", label: "Tenant2First" },
      { columnName: "tenant2MI", label: "Tenant2MI" },
      { columnName: "tenant2Phone", label: "Tenant2Phone" },
      { columnName: "tenant2Email", label: "Tenant2Email" },
      { columnName: "tenant3Last", label: "Tenant3Last" },
      { columnName: "tenant3First", label: "Tenant3First" },
      { columnName: "tenant3MI", label: "Tenant3MI" },
      { columnName: "tenant3Phone", label: "Tenant3Phone" },
      { columnName: "tenant3Email", label: "Tenant3Email" },
      { columnName: "tenant4Last", label: "Tenant4Last" },
      { columnName: "tenant4First", label: "Tenant4First" },
      { columnName: "tenant4MI", label: "Tenant4MI" },
      { columnName: "tenant4Phone", label: "Tenant4Phone" },
      { columnName: "tenant4Email", label: "Tenant4Email" },
      { columnName: "tenant5Last", label: "Tenant5Last" },
      { columnName: "tenant5First", label: "Tenant5First" },
      { columnName: "tenant5MI", label: "Tenant5MI" },
      { columnName: "tenant5Phone", label: "Tenant5Phone" },
      { columnName: "tenant5Email", label: "Tenant5Email" },     
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "propertyPhone", label: "PropertyPhone" },
      { columnName: "propertyEmail", label: "PropertyEmail", className: "PropertyEmail", },
      { columnName: "propertyAddress", label: "PropertyAddress", className: "PropertyAddress", },
      { columnName: "propertyCity", label: "PropertyCity" },
      { columnName: "propertyState", label: "PropertyState" },
      { columnName: "propertyZip", label: "PropertyZip" , className:'text-right'},
      { columnName: "attorneyName", label: "AttorneyName" },
      { columnName: "attorneyBarNo", label: "AttorneyBarNo" },
      { columnName: "filerBusinessName", label: "FilerBusinessName" },
      { columnName: "filerEmail", label: "EvictionFilerEmail" },
      { columnName: "clientReferenceId", label: "ClientReferenceId" },
      { columnName: "courtesyCopies", label: "CourtesyCopies" },      
      { columnName: "filingDescription", label: "FilingDescription" },
      { columnName: "BatchUpload", label: "BatchUpload" },
      { columnName: "Petition", label: "Petition" },
      { columnName: "Notice", label: "Notice" },
      { columnName: "SCRAReport", label: "SCRAReport" },
      { columnName: "SCRAAffidavit", label: "SCRAAffidavit" },
      { columnName: "Lease", label: "Lease" },
      { columnName: "SupplementalDocuments1", label: "SupplementalDocuments1" },
      { columnName: "SupplementalDocuments2", label: "SupplementalDocuments2" },
      //{ columnName: "Documents", label: "Documents" },
   ];

   // Filter columns based on user role
   const filteredColumns = userRole.includes(UserRole.Viewer)
   ? initialColumnMapping.filter(col => col.columnName !== "isChecked") 
   : initialColumnMapping;

   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(filteredColumns);

   useEffect(() => {
      setSelectedFileEvictionId([]);
      setBulkRecords([]);
      if (!fileEvictions.totalCount && isMounted.current) {         
         getCounties();
         if (!userRole.includes(UserRole.Viewer) &&  !userRole.includes(UserRole.ProcessServer)&& !userRole.includes(UserRole.PropertyManager) && !userRole.includes(UserRole.WritLabor)) 
            getCourts();
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
      const fileEvictionRecords: IFileEvictionsTXItems[] = fileEvictions.items.map((item: any) => {
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

   const settingData = async (record: IFileEvictionsTXItems) => {
      
      const checkItem = {
         id: record.id,
         county: record.county,
         tenant1Last:
            formattedTenantValue(record, 0) != null
               ? formattedTenantValue(record, 0)?.lastName || ""
               : "",
         tenant1First:
            formattedTenantValue(record, 0) != null
               ? formattedTenantValue(record, 0)?.firstName || ""
               : "",
         tenant1MI:
            formattedTenantValue(record, 0) != null
               ? formattedTenantValue(record, 0)?.middleName || ""
               : "",
         tenant1Phone:formattedTenantValue(record, 0) != null
         ? formattedTenantValue(record, 0)?.phone || ""
         : "",
         tenant1Email:formattedTenantValue(record, 0) != null
         ? formattedTenantValue(record, 0)?.email || ""
         : "",
         tenant2Last:
            formattedTenantValue(record, 1) != null
               ? formattedTenantValue(record, 1)?.lastName || ""
               : "",
         tenant2First:
            formattedTenantValue(record, 1) != null
               ? formattedTenantValue(record, 1)?.firstName || ""
               : "",
         tenant2MI:
            formattedTenantValue(record, 1) != null
               ? formattedTenantValue(record, 1)?.middleName || ""
               : "",
         tenant2Phone:formattedTenantValue(record, 1) != null
               ? formattedTenantValue(record, 1)?.phone || ""
               : "",
         tenant2Email:formattedTenantValue(record, 1) != null
               ? formattedTenantValue(record, 1)?.email || ""
               : "",
         tenant3Last:
            formattedTenantValue(record, 2) != null
               ? formattedTenantValue(record, 2)?.lastName || ""
               : "",
         tenant3First:
            formattedTenantValue(record, 2) != null
               ? formattedTenantValue(record, 2)?.firstName || ""
               : "",
         tenant3MI:
            formattedTenantValue(record, 2) != null
               ? formattedTenantValue(record, 2)?.middleName || ""
               : "",
            tenant3Phone:formattedTenantValue(record, 2) != null
               ? formattedTenantValue(record, 2)?.phone || ""
               : "",
            tenant3Email:formattedTenantValue(record, 2) != null
               ? formattedTenantValue(record, 2)?.email || ""
               : "",
         tenant4Last:
            formattedTenantValue(record, 3) != null
               ? formattedTenantValue(record, 3)?.lastName || ""
               : "",
         tenant4First:
            formattedTenantValue(record, 3) != null
               ? formattedTenantValue(record, 3)?.firstName || ""
               : "",
         tenant4MI:
            formattedTenantValue(record, 3) != null
               ? formattedTenantValue(record, 3)?.middleName || ""
               : "",
         tenant4Phone:formattedTenantValue(record, 3) != null
               ? formattedTenantValue(record, 3)?.phone || ""
               : "",
         tenant4Email:formattedTenantValue(record, 3) != null
               ? formattedTenantValue(record, 3)?.email || ""
               : "",
         tenant5Last:
            formattedTenantValue(record, 3) != null
               ? formattedTenantValue(record, 3)?.lastName || ""
               : "",
         tenant5First:
            formattedTenantValue(record, 4) != null
               ? formattedTenantValue(record, 4)?.firstName || ""
               : "",
         tenant5MI:
            formattedTenantValue(record, 4) != null
               ? formattedTenantValue(record, 4)?.middleName || ""
               : "", 
         tenant5Phone:formattedTenantValue(record, 4) != null
               ? formattedTenantValue(record, 4)?.phone || ""
               : "",
         tenant5Email:formattedTenantValue(record, 4) != null
               ? formattedTenantValue(record, 4)?.email || ""
               : "",        
         andAllOtherOccupants: record.andAllOtherTenants ?? "",
         tenantAddress: record.tenantAddress ?? "",
         tenantUnit: record.tenantUnit ?? "",
         tenantCity: record.tenantCity ?? "",
         tenantZip: record.tenantZip ?? "",
         tenantState: record.tenantState ?? "",         
         propertyName: record.propertyName ?? "",
         propertyPhone: record.propertyPhone ?? "",
         propertyEmail: record.propertyEmail ?? "",
         propertyAddress: record.propertyAddress ?? "",
         propertyCity: record.propertyCity ?? "",
         propertyState: record.propertyState ?? "",
         propertyZip: record.propertyZip ?? "",
         attorneyName: record.attorneyName ?? "",     
         attorneyBarNo: record.attorneyBarNo ?? "",     
         filerBusinessName: record.filerBusinessName ?? "",
         evictionFilerEMail: record.filerEmail ?? "",
         processServer: "",
         processServerEmail: "",
         clientReferenceId: record.clientReferenceId,
         court:record.stateCourt,
         clientId: record.clientId,
         courtesyCopies:record.courtesyCopies,
         attachments:record.attachments
      };

      

      setBulkRecords(prevItems => {
         const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
         uniqueItems.add(JSON.stringify(checkItem)); // Add the new item
         return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
      });
   };

   const checkIfAllIdsExist = (
		      fileEvictionRecords: IFileEvictionsTXItems[],
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
      data: IFileEvictionsTXItems,
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
         propertyName: () => renderHighlightedCell(cellValue),
         attorneyBarNo: () => renderHighlightedCell(data.attorneyBarNo),
         attorneyName: () => renderHighlightedCell(data.attorneyName),
         tenant1Last: () => renderHighlightedCell(data?.tenantNames[0]?.lastName),
         tenant1First: () => renderHighlightedCell(data?.tenantNames[0]?.firstName),
         tenant1MI: () => renderHighlightedCell(data?.tenantNames[0]?.middleName),
         tenant1Phone:()=><span>{data?.tenantNames[0]?.phone}</span>,
         tenant1Email:()=><span>{data?.tenantNames[0]?.email}</span>,
         tenant2Last: () => renderHighlightedCell(data?.tenantNames[1]?.lastName),
         tenant2First: () => renderHighlightedCell(data?.tenantNames[1]?.firstName),
         tenant2MI: () => renderHighlightedCell(data?.tenantNames[1]?.middleName),
         tenant2Phone:()=><span>{data?.tenantNames[1]?.phone}</span>,
         tenant2Email:()=><span>{data?.tenantNames[1]?.email}</span>,
         tenant3Last: () => renderHighlightedCell(data?.tenantNames[2]?.lastName),
         tenant3First: () => renderHighlightedCell(data?.tenantNames[2]?.firstName),
         tenant3MI: () => renderHighlightedCell(data?.tenantNames[2]?.middleName),
         tenant3Phone:()=><span>{data?.tenantNames[2]?.phone}</span>,
         tenant3Email:()=><span>{data?.tenantNames[2]?.email}</span>,
         tenant4Last: () => renderHighlightedCell(data?.tenantNames[3]?.lastName),
         tenant4First: () => renderHighlightedCell(data?.tenantNames[3]?.firstName),
         tenant4MI: () => renderHighlightedCell(data?.tenantNames[3]?.middleName),
         tenant4Phone:()=><span>{data?.tenantNames[3]?.phone}</span>,
         tenant4Email:()=><span>{data?.tenantNames[3]?.email}</span>,
         tenant5Last: () => renderHighlightedCell(data?.tenantNames[4]?.lastName),
         tenant5First: () => renderHighlightedCell(data?.tenantNames[4]?.firstName),
         tenant5MI: () => renderHighlightedCell(data?.tenantNames[4]?.middleName),
         tenant5Phone:()=><span>{data?.tenantNames[4]?.phone}</span>,
         tenant5Email:()=><span>{data?.tenantNames[4]?.email}</span>,
         tenantAddress: () => (
            <span>
               <HighlightedText
                  text={`${data.tenantAddress ?? ""}`}
                  query={fileEvictions.searchParam ?? ""}
               />
            </span>
         ),
         stateCourt: () => formattedCell(cellValue),
         county: () => renderHighlightedCell(cellValue),
         tenantUnit: () => renderHighlightedCell(cellValue),
         tenantCity: () => renderHighlightedCell(cellValue),
         tenantState: () => renderHighlightedCell(cellValue),
         tenantZip: () => renderHighlightedCell(cellValue),
         filerEmail: () => renderHighlightedCell(cellValue),
         clientReferenceId: () => formattedCell(cellValue),
         BatchUpload:()=>renderSingnleDocument(data.attachments.find(x => x.type === "BatchUpload")??null),
         Petition:()=>renderSingnleDocument(data.attachments.find(x => x.type === "Petition")??null),
         Notice:()=>renderSingnleDocument(data.attachments.find(x => x.type === "Notice")??null),
         SCRAReport:()=>renderSingnleDocument(data.attachments.find(x => x.type === "SCRAReport")??null),
         SCRAAffidavit:()=>renderSingnleDocument(data.attachments.find(x => x.type === "SCRAAffidavit")??null),
         Lease:()=>renderSingnleDocument(data.attachments.find(x => x.type === "Lease")??null),
         SupplementalDocuments1:()=>renderSingnleDocument(data.attachments.find(x => x.type === "SupplementalDocuments1")??null),
         SupplementalDocuments2:()=>renderSingnleDocument(data.attachments.find(x => x.type === "SupplementalDocuments2")??null),
         filingDescription:()=><span>{data.propertyName.toUpperCase()+" vs. "+data.tenantNames[0].firstName+" "+data.tenantNames[0].lastName}</span>,
        // Documents:()=> renderDocuments(data.attachments ??null),
      };

      const renderSingnleDocument=(data:UploadedDocuments|null)=>
         {
           if(data)
           {
            return(
               <div className="flex flex-wrap">
               <div
                     key={data.id}
                     className="relative"
                  >
                     <h1
                        onClick={() => handleDocumentClick(data.uri??'')}
                        className="underline text-[#2472db] mr-5"
                        style={{ cursor: 'pointer' }}
                     >
                        {data.fileName}
                     </h1>
                  </div>
            </div>
            )
           }
           return<></>
         }
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
   const handleDocumentClick = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   };
const renderDocuments=(data:UploadedDocuments[]|null)=>
{
  if(data)
  {
   return(
      <div className="flex flex-wrap">
      {data.map((item) => (
         <div
            key={item.id}
            className="relative"
         >
            <h1
               onClick={() => handleDocumentClick(item.uri??'')}
               className="underline text-[#2472db] mr-5"
               style={{ cursor: 'pointer' }}
            >
               {item.type}
            </h1>
         </div>
      ))}
   </div>
   )
  }
  return<></>
}



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

   const formattedTenantValue = (data: IFileEvictionsTXItems, index: number) => {
      if (data.tenantNames && data.tenantNames.length >= 0)
         return data.tenantNames[index];
      else return null;
   };

   return (
      <div className="my-1.5 bg-white p-3 md:p-3.5 pb-3.5 md:pb-4 rounded-md shadow-md shadow-slate-300">
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
                        getFileEvictions(1, 100, event.target.checked, fileEvictions.searchParam);
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
                        data: IFileEvictionsTXItems,
                        rowIndex: number,
                        cellIndex: number,
                     ) => handleCellRendered(cellIndex, data, rowIndex)}
                     handleSorting={handleSorting}
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

export default FileEvictionsTXGrid;
