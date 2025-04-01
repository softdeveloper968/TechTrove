import React, { useState, useEffect, useRef } from "react";
import { FaEdit, FaEye } from "react-icons/fa";
import { useAuth } from "context/AuthContext";
import { useProcessServerContext } from "../ProcessServerContext";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import GridCheckbox from "components/formik/GridCheckBox";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import IconButton from "components/common/button/IconButton";
import { IGridHeader } from "interfaces/grid-interface";
import { IProcessServerCaseInfo, IProcessServerCaseInfoItem } from "interfaces/process-server.interface";
import { convertUtcToEst, formattedDate, getAOSStatusDescription, toCssClassName } from "utils/helper";
import { AOSStatusEnum, UserRole } from "utils/enum";
import ProcessServerEditCaseInfo from "./ProcessServerActions/ProcessServer_EditCaseInfo";
import ProcessServerCasesDetails from "./ProcessServerCaseDetails";
import HelperViewPdfService from "services/helperViewPdfService";
import ProcessServer from "../ProcessServer";

type ProcessServerGridProps = {};

const initialColumnMapping: IGridHeader[] = [
   { columnName: "isChecked", controlType: "checkbox", label: "Bulk Edit", toolTipInfo: "This checkbox represents bulk update only" },
   { columnName: "action", label: "Action", className: "action" },
   { columnName: "status", label: "Status" },
   { columnName: "caseNumber", label: "CaseNo", isSort: true },
   { columnName: "serverEmail", label: "ProcessServerEmail" },
   { columnName: "serviceType", label: "EvictionServiceMethod", isSort: true },
   { columnName: "personServed", label: "PersonServed", isSort: true },
   { columnName: "height", label: "Height", isSort: true },
   { columnName: "weight", label: "Weight", isSort: true },
   { columnName: "age", label: "Age", isSort: true },
   { columnName: "serverName", label: "ServerName", isSort: true },
   { columnName: "serviceNotes", label: "ServiceNotes", isSort: true },
   { columnName: "serviceDate", label: "EvictionServiceDate", isSort: true },
   { columnName: "dateScanned", label: "DateScanned" },
   { columnName: "locationCoord", label: "LocationCoord" },
   { columnName: "comments", label: "ServiceComments" },
   { columnName: "companyName", label: "CompanyName" },
   { columnName: "filingType", label: "FilingType" },
];

const ProcessServerGrid = (props: ProcessServerGridProps) => {
   const { userRole } = useAuth();
   const {
      showSpinner,
      processServerCases,
      getProcessServerCases,
      setProcessServerCases,
      filteredRecords,
      setFilteredRecords,
      selectedProcessServerId,
      setSelectedProcessServerId,
      setBulkRecords,
      getAllProcessServerUsers,
      isBackClick,
      setIsBackClick
   } = useProcessServerContext();
   const isMounted = useRef(true);

   const filteredColumns = userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)
      ? initialColumnMapping
      : initialColumnMapping.filter(col =>
         col.columnName !== "isChecked" &&
         col.columnName !== "companyName" &&
         col.columnName !== "status" &&
         col.columnName !== "action"
      );

   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(filteredColumns);
   const [processServerCaseList, setProcessServerCaseList] = useState<IProcessServerCaseInfo>(processServerCases);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(processServerCaseList.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(processServerCaseList.totalPages > 1);
   const [openCaseInfoModal, setOpenCaseInfoModal] = useState<boolean>(false);
   const [selectedCaseInfo, setSelectedCaseInfo] = useState<IProcessServerCaseInfoItem | null>(null);
   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [currentCaseId, setCurrentCaseId] = useState<string>("");
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(Array(processServerCases.items?.length).fill(false));
   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [newSelectedRows, setNewSelectedRows] = useState<boolean[]>([]);
   const [selectAll, setSelectAll] = useState<boolean>();

   useEffect(() => {
      if (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin))
         getAllProcessServerUsers();

      if (isMounted.current) {
         if(!isBackClick)
         {
            setProcessServerCases((prev) => ({
               ...prev,
               searchParam: "",
               serverName: "",
               serviceMethod: "",
               dateRange: ""
            }));
         getProcessServerCases(1, 100,"");
         isMounted.current = false;
         }
         setIsBackClick(false);
      };

      // if (userRole.includes(UserRole.C2CAdmin)) {
      //    const hasCompanyNameColumn = visibleColumns.some(x => x.columnName === "companyName");

      //    if (!hasCompanyNameColumn) {
      //       setVisibleColumns(prev => [
      //          ...prev,
      //          { columnName: "companyName", label: "CompanyName" }
      //       ]);
      //    }
      // }

   }, [userRole]);

   useEffect(() => {
      setCanPaginateBack(processServerCases.currentPage > 1);
      setCanPaginateFront(processServerCases.totalPages > 1);
      setSelectedRows(Array(processServerCases.items?.length).fill(false));

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
   }, [processServerCases]);

   useEffect(() => {
      if (!filteredRecords.length)
         setSelectAll(false);

   }, [filteredRecords]);

   // const handleSorting = (columnName: string, order: string) => {
   //    // Copy the current process server cases array to avoid mutating the state directly
   //    const sortedCases = [...processServerCases.items];

   //    // Define a compare function based on the column name and order
   //    const compare = (a: any, b: any) => {
   //       // Extract values for comparison based on the column name
   //       let valueA: any = a[columnName];
   //       let valueB: any = b[columnName];

   //       // If the column name is 'serviceDate', convert values to Date objects for sorting
   //       if (columnName === 'serviceDate') {
   //          valueA = new Date(valueA).getTime();
   //          valueB = new Date(valueB).getTime();
   //       } else if (columnName === 'serviceType') {
   //          valueA = a['serviceMethod'];
   //          valueB = b['serviceMethod'];
   //       }

   //       // Implement sorting logic based on the order (ascending or descending)
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

   //    // Sort the cases array using the compare function
   //    sortedCases.sort(compare);

   //    // Update the state with sorted cases
   //    setProcessServerCases((prev) => ({
   //       ...prev,
   //       items: sortedCases
   //    }));
   // };
   const handleSorting = (columnName: string, order: string) => {
      // Update the sortings state with the new sorting option, ensuring no duplicates
      setProcessServerCases(prev => {
          const existingSort = prev.sortings.find(sort => sort.sortColumn === columnName);
  
          const updatedSortings = existingSort
              ? prev.sortings.map(sort =>
                  sort.sortColumn === columnName
                      ? { ...sort, isAscending: order === "asc" } // Update existing sort
                      : sort
              )
              : [...prev.sortings, { sortColumn: columnName, isAscending: order === "asc" }]; // Add new sort
  
         // Fetch the data with the updated sortings
         getProcessServerCases(
            prev.currentPage,
            prev.pageSize,
            prev.searchParam,
            prev.serverName,
            prev.serviceMethod,
            prev.dateRange,
            updatedSortings
         );
         return {
            ...prev,
            sortings: updatedSortings
         };
      });
  };

   const handleShowDetails = (id: string) => {
      setCurrentCaseId(id);
      setShowDetails(true);
   };

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
      if (shiftKeyPressed && lastClickedFilteredRowIndex !== -1 && processServerCaseList) {
         const start = Math.min(index, lastClickedFilteredRowIndex);
         const end = Math.max(index, lastClickedFilteredRowIndex);
         setSelectedRows(Array.from({ length: end + 1 }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (processServerCases.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         processServerCases.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            setBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(item)); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //  setBulkRecords((prev)=>[...prev,item]);
         })
         setSelectedProcessServerId(prevIds => [...new Set([...prevIds, ...selectedIds])]);

         // setSelectedProcessServerId(selectedIds);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (processServerCases.items.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = processServerCases.items.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         // const selectedIds = (fileEvictions.items || [])
         //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
         //   .map((item) => item.id)
         //   .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked        
            setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedProcessServerId(prevIds => prevIds.filter(item => item !== id));
         } else {

            setBulkRecords(prevItems => {
               
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(processServerCases.items.filter(x => x.id === id)[0])); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedProcessServerId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }

      }
      setLastClickedFilteredRowIndex(index);
   };

   // const handleSelectAllChange = (checked: boolean) => {      
   //    const newSelectAll = !selectAll;
   //    const allIds: string[] = processServerCases.items
   //       .map((item) => item.id)
   //       .filter((id): id is string => typeof id === "string");
   //    if (checked) {
   //       processServerCases.items
   //          .map((item) => setBulkRecords((prev) => [...prev, item]));
   //       setSelectedProcessServerId(prevIds => [...new Set([...prevIds, ...allIds])]);
   //    } else {
   //       processServerCases.items.forEach((item) => {
   //          setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
   //          setSelectedProcessServerId(prevIds => prevIds.filter(id => id !== item.id));
   //       });
   //    }

   //    setSelectAll((prevSelectAll) => {
   //       // Update selectedRows state
   //       setSelectedRows(Array(allIds.length).fill(newSelectAll));
   //       return newSelectAll;
   //    });
   // };
   const handleSelectAllChange = (checked: boolean) => {
      const allIds: string[] = processServerCases.items
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
   
      if (checked) {
         // Add unique items based on id to bulkRecords
         setBulkRecords(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const newItems = processServerCases.items.filter(item => !existingIds.has(item.id));
            return [...prev, ...newItems];
         });
   
         // Update selectedProcessServerId with unique ids
         setSelectedProcessServerId(prevIds => {
            const updatedIds = new Set([...prevIds, ...allIds]);
            return Array.from(updatedIds);
         });
      } else {
         // Remove items based on id from bulkRecords and selectedProcessServerId
         setBulkRecords(prevItems => prevItems.filter(record => !processServerCases.items.some(item => item.id === record.id)));
         setSelectedProcessServerId(prevIds => prevIds.filter(id => !allIds.includes(id)));
      }
   
      // Update selectAll state and selectedRows
      setSelectAll(checked);
      setSelectedRows(Array(allIds.length).fill(checked));
   };
   
   const checkIfAllIdsExist = (
      processServerItems: IProcessServerCaseInfoItem[],
      selectedProcessServerId: string[]
   ): boolean | undefined => {
      if (!processServerItems.length) return false;
      return processServerItems.every(record =>
         selectedProcessServerId.includes(record.id as string)
      );
   };

   const getCellClassName = (property: string, cellValue: any): string => {
      let cellClass = "";

      if (property === "status") {
         switch (cellValue) {
            case AOSStatusEnum.NeedToSend:
               cellClass = "NeedToSend";
               break;
            case AOSStatusEnum.EmailSent:
               cellClass = "EmailSent";
               break;
            case AOSStatusEnum.EmailResent:
               cellClass = "EmailSent";
               break;
            case AOSStatusEnum.Modified:
               cellClass = "NotSet";
               break;
            default:
               cellClass = "";
               break;
         }
      }
      return cellClass;
   };

   const handleDocumentClick = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   };

   const handleFrontButton = () => {
      if (processServerCases.currentPage < processServerCases.totalPages) {
         const updatedCurrentPage = processServerCases.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         // getTylerUsers(
         // 	updatedCurrentPage,
         // 	processServerCaseList.pageSize
         // );
         getProcessServerCases(
            updatedCurrentPage,
            processServerCases.pageSize,
            processServerCases.searchParam,
            processServerCases.serverName,
            processServerCases.serviceMethod,
            processServerCases.dateRange,
            processServerCases.sortings
         );
      }
   };

   const handleBackButton = () => {
      if (
         processServerCases.currentPage > 1 &&
         processServerCases.currentPage <= processServerCases.totalPages
      ) {
         const updatedCurrentPage = processServerCases.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(processServerCases.currentPage > 1);
         getProcessServerCases(
            updatedCurrentPage,
            processServerCases.pageSize,
            processServerCases.searchParam,
            processServerCases.serverName,
            processServerCases.serviceMethod,
            processServerCases.dateRange,
            processServerCases.sortings
         );
      }
   };


   const handleCellRendered = (cellIndex: number, data: IProcessServerCaseInfoItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const cellClass = getCellClassName(propertyName, cellValue);
      if(propertyName === "serviceDate" || propertyName === "dateScanned")
      {
         const value = convertUtcToEst(cellValue);
      }

      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               // checked={selectedRows[rowIndex]}
               checked={selectedProcessServerId.includes(data.id as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id, checked)
               }
               label=""
            />
         ),
         action: () => renderActionsCell(data),
         status: () => renderStatusCell(data.status),
         caseNumber: () => renderHighlightedCell(cellValue),
         serviceDate: () => formattedDateCell(cellValue),
         dateScanned: () => formattedDateCell(cellValue),
         serviceType: () => formattedCell(data.serviceMethod ?? ""),
         serviceNotes: () => renderHighlightedCell(cellValue),
         personServed: () => renderHighlightedCell(cellValue),
         serverEmail: () => renderServerEmailCell(data)
      };

      const renderer = renderers[propertyName] || (() => formattedCell(cellValue));

      if (visibleColumns.find(x => x.label === columnName)) {

         return (
            <td
               key={cellIndex}
               className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929]  ${toCssClassName(columnName)} ${cellClass}`}
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
      <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
   //   <span>{value !== null ? formattedDate(value) : ""}</span>
   );

   const renderServerEmailCell = (data: IProcessServerCaseInfoItem) => (
      <span className={`border ${!data.serverExists ? 'border-[#E61818]' : 'border-transparent'} p-1 min-h-[20px] rounded-sm block`}>
         {data.serverEmail || ' '} {/* Render spaces if serverEmail is null */}
      </span>
   );

   const renderActionsCell = (data: IProcessServerCaseInfoItem) => {
      return (
         <div className="flex justify-center gap-1.5">
            <IconButton
               type={"button"}
               className="cursor-pointer text-[#2472db]"
               disabled={!data?.id?.length}
               icon={<FaEye className="h-4 w-4" />}
               handleClick={() => handleShowDetails(data?.id)}
            />
            <IconButton
               type={"button"}
               className="cursor-pointer text-[#2472db]"
               disabled={!data?.id?.length}
               icon={<FaEdit className="h-[14px] w-[14px]" />}
               handleClick={() => {
                  setSelectedCaseInfo(data);
                  setOpenCaseInfoModal(true);
               }}
            />
         </div>
      );
   };

   const renderStatusCell = (status: AOSStatusEnum) => {
      return <span>{getAOSStatusDescription(status)}</span>
   }

   const renderHighlightedCell = (cellValue: any) => (
      <HighlightedText text={cellValue || ""} query={processServerCases.searchParam ?? ''} />
   );

   return (
      <>
         <div className="my-1.5 bg-white p-3 md:p-3.5 pb-3.5 md:pb-4 rounded-md shadow-md shadow-slate-300">
            <div className="relative">
               <div className="relative -mr-0.5">
               <div className="mb-2 text-sm text-gray-600">
            {selectedProcessServerId.length} of {processServerCases.totalCount} records selected
         </div>
                  {showSpinner ? <Spinner /> : (
                     <>
                        <Grid
                           columnHeading={visibleColumns}
                           rows={processServerCases.items}
                           handleSelectAllChange={handleSelectAllChange}
                           // selectAll={selectAll}
                           selectAll={checkIfAllIdsExist(processServerCases.items, selectedProcessServerId)}
                           cellRenderer={(data: IProcessServerCaseInfoItem, rowIndex: number, cellIndex: number) => {
                              return handleCellRendered(cellIndex, data, rowIndex);
                           }}
                           handleSorting={handleSorting}
                           selectedIds={selectedProcessServerId}
                           activeSortingMap={processServerCases.sortings}
                        />
                        {/* Render the Pagination component with relevant props */}
                        <Pagination
                           numberOfItemsPerPage={processServerCases.pageSize}
                           currentPage={processServerCases.currentPage}
                           totalPages={processServerCases.totalPages}
                           totalRecords={processServerCases.totalCount}
                           handleFrontButton={handleFrontButton}
                           handleBackButton={handleBackButton}
                           canPaginateBack={canPaginateBack}
                           canPaginateFront={canPaginateFront}
                        />
                     </>
                  )}
               </div>
               {openCaseInfoModal && (
                  <ProcessServerEditCaseInfo
                     open={openCaseInfoModal}
                     setOpen={(open: boolean) => setOpenCaseInfoModal(open)}
                     selectedCaseInfo={selectedCaseInfo}
                     setSelectedCaseInfo={(caseInfo: IProcessServerCaseInfoItem | null) => setSelectedCaseInfo(caseInfo)}
                  />
               )}
            </div>
            {showDetails && (
               <ProcessServerCasesDetails
                  id={currentCaseId}
                  showDetails={showDetails}
                  setShowDetails={(show: boolean) => setShowDetails(show)}
               />
            )}
         </div>
      </>
   );
};

export default ProcessServerGrid;
