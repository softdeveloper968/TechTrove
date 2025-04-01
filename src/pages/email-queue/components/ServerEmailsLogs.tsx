import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FaCopy } from "react-icons/fa";
import { useAuth } from "context/AuthContext";
import { useEmailQueueContext } from "../EmailQueueContext";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import GridCheckbox from "components/formik/GridCheckBox";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import { IGridHeader } from "interfaces/grid-interface";
import { IEditEmailQueueItem, IServerEmailLogItem } from "interfaces/email-queue.interface";
import { formattedDate, formatCurrency, convertUtcToEst, toCssClassName } from "utils/helper";
import HelperViewPdfService from "services/helperViewPdfService";

const initialColumnMapping: IGridHeader[] = [
   { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
   { columnName: "createdDate", label: "CreatedDate" },
   { columnName: "county", label: "County" },
   { columnName: "serverEmail", label: "ServerEmail" },
   { columnName: "documentUrl", label: "Document" },
   { columnName: "verificationCheck", label: "VerificationCheck" },
   { columnName: "checkedBy", label: "CheckedBy" },
   { columnName: "mailDate", label: "MailDate" },
   { columnName: "mailTotal", label: "MailTotal", className: "text-right" },
   { columnName: "mailWeight", label: "MailWeight", className: "text-right" },
   { columnName: "mailTracking", label: "MailTracking#", className: "text-right" },
   { columnName: "mailManager", label: "MailManager" },
   { columnName: "notes", label: "Notes" },
   { columnName: "c2CCheck", label: "C2CCheck#" },
   { columnName: "c2CCheckTotal", label: "C2CCheckTotal", className: "text-right" },
   { columnName: "serviceTotal", label: "ServiceTotal", className: "text-right" }
];

const ServerEmailLogsGrid = () => {
   const {
      showSpinner,
      getServerEmailLogs,
      serverEmailLogs,
      selectedServerLogIds,
      setselectedServerLogIdsIds,
      setBulkServerLogRecords
   } = useEmailQueueContext();

   const { userRole } = useAuth();
   const isMounted = useRef(true);
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(serverEmailLogs.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(serverEmailLogs.totalPages > 1);
   //const [selectedEmailQueueIds, setselectedEmailQueueIds] = useState<string[]>([]);
   const [selectAll, setSelectAll] = useState<boolean>(false)
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(serverEmailLogs.items.length).fill(false)
   );
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [newRowsSelected] = useState<boolean[]>([]);
   const [selectedData, setSelectedData] = useState<IEditEmailQueueItem | null>(null);
   const [isUpload, setIsUpload] = useState<boolean>(false);

   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [currentCaseId, setCurrentCaseId] = useState<string>("");
   const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);

   useEffect(() => {
      if (isMounted.current) {
         setselectedServerLogIdsIds([]);
         getServerEmailLogs(1, 100, "");
         isMounted.current = false;
      }

      // setselectedServerLogIdsIds([]);
      // getServerEmailLogs(1,100,"");
      setSelectedRows(Array(serverEmailLogs.items?.length).fill(false));
      setSelectAll(false);
      setCanPaginateBack(serverEmailLogs.currentPage > 1);
      setCanPaginateFront(serverEmailLogs.totalPages > 1);
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
   }, [getServerEmailLogs, userRole]);

   const handleFrontButton = () => {
      if (serverEmailLogs.currentPage < serverEmailLogs.totalPages) {
         const updatedCurrentPage = serverEmailLogs.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         getServerEmailLogs(updatedCurrentPage, 100, serverEmailLogs.searchParam);
      }
   };

   // const handleSelectAllChange = (checked: boolean) => {
   //    const newSelectAll = !selectAll;
   //    const allIds: string[] = serverEmailLogs.items
   //       .map((item) => item.id)
   //       .filter((id): id is string => typeof id === "string");
   //       if (checked) {
   //           serverEmailLogs.items
   //             .map((item) => setBulkServerLogRecords((prev) => [...prev, item]));
   //          setselectedServerLogIdsIds(prevIds => [...new Set([...prevIds, ...allIds])]);
   //       } else {
   //          serverEmailLogs.items.forEach((item) => {
   //              setBulkServerLogRecords(prevItems => prevItems.filter(record => record.id !== item.id));
   //             setselectedServerLogIdsIds(prevIds => prevIds.filter(id => id !== item.id));
   //          });
   //       }

   //    setSelectAll((prevSelectAll) => {
   //       // Update selectedRows state
   //       setSelectedRows(Array(allIds.length).fill(newSelectAll));
   //       return newSelectAll;
   //    });
   // };

   const handleSelectAllChange = (checked: boolean) => {
      const allIds: string[] = serverEmailLogs.items
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");

      if (checked) {
         // Update bulkServerLogRecords with unique items
         setBulkServerLogRecords(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const newItems = serverEmailLogs.items.filter(item => !existingIds.has(item.id));
            return [...prev, ...newItems];
         });

         // Update selectedServerLogIdsIds with unique ids
         setselectedServerLogIdsIds(prevIds => {
            const updatedIds = new Set([...prevIds, ...allIds]);
            return Array.from(updatedIds);
         });
      } else {
         // Remove items based on id from bulkServerLogRecords
         setBulkServerLogRecords(prevItems => prevItems.filter(record => !serverEmailLogs.items.some(item => item.id === record.id)));

         // Remove ids based on id from selectedServerLogIdsIds
         setselectedServerLogIdsIds(prevIds => prevIds.filter(id => !allIds.includes(id)));
      }

      // Update selectAll state and selectedRows
      setSelectAll(checked);
      setSelectedRows(Array(allIds.length).fill(checked));
   };

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
      if (shiftKeyPressed && lastClickedFilteredRowIndex !== -1 && serverEmailLogs.items) {
         const start = Math.min(index, lastClickedFilteredRowIndex);
         const end = Math.max(index, lastClickedFilteredRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newRowsSelected[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (serverEmailLogs.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         serverEmailLogs.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            setBulkServerLogRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(item)); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
         })
         setselectedServerLogIdsIds(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (serverEmailLogs.items.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = serverEmailLogs.items.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         if (!checked) {
            setBulkServerLogRecords(prevItems => prevItems.filter(item => item.id !== id));
            setselectedServerLogIdsIds(prevIds => prevIds.filter(item => item !== id));
         } else {

            setBulkServerLogRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(serverEmailLogs.items.filter(x => x.id === id)[0])); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            setselectedServerLogIdsIds(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }

      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleBackButton = () => {
      if (
         serverEmailLogs.currentPage > 1 &&
         serverEmailLogs.currentPage <= serverEmailLogs.totalPages
      ) {
         const updatedCurrentPage = serverEmailLogs.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(serverEmailLogs.currentPage > 1);
         getServerEmailLogs(updatedCurrentPage, 100, serverEmailLogs.searchParam);
      }
   };

   const openPdf = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   };

   const handleCellRendered = (cellIndex: number, data: IServerEmailLogItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               checked={selectedServerLogIds.includes(data.id as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id, checked)}
               label=""
            />
         ),
         county: () => <HighlightedText text={cellValue ?? ""} query={serverEmailLogs.searchParam ?? ''} />,
         serverEmail: () => <HighlightedText text={cellValue ?? ""} query={serverEmailLogs.searchParam ?? ''} />,
         // documentUrl: () => {            
         //    return (
         //       <>
         //          <h1
         //             key={data.id}
         //             onClick={() => openPdf(cellValue)}
         //             className="underline text-[#2472db]"
         //             style={{ cursor: 'pointer' }}
         //          >
         //             {cellValue && "dispo.pdf"}
         //          </h1>

         //       </>
         //    );
         // },
         documentUrl: () => {
            const handleCopyClick = (url: string | undefined) => {
               if (url) {
                  navigator.clipboard.writeText(url);
                  toast.success("Document URL copied to clipboard!");
               }
            };

            if (!cellValue) {
               return <></> as JSX.Element; // Return an empty fragment if cellValue is undefined
            }

            return (
               <div
                  key={data.id}
                  className="relative inline-flex items-center pr-4"
                  onMouseEnter={() => setHoveredDocumentId(data.id)}
                  onMouseLeave={() => setHoveredDocumentId(null)}
               >
                  <h1
                     key={data.id}
                     onClick={() => openPdf(cellValue)}
                     className="underline text-[#2472db] mr-1" // Adjust width here
                     style={{ cursor: 'pointer' }}
                  >
                     {cellValue && "evictions.pdf"}
                  </h1>
                  {hoveredDocumentId === data.id && (
                     <FaCopy
                        className="w-4 h-4 text-gray-500 cursor-pointer absolute right-0.5" // Adjust icon width here
                        onClick={() => handleCopyClick(cellValue)}
                     />
                  )}
               </div>
            );
         },
         verificationCheck: () => formattedDateCell(cellValue),
         // createdDate: () => <span>{cellValue ? new Date(cellValue).toLocaleString() : ""}</span>,
         createdDate: () => formattedDateTimeCell(cellValue),
         mailDate: () => formattedDateCell(cellValue),
         c2CCheckTotal: () => formatCurrencyCell(cellValue),
         serviceTotal: () => formatCurrencyCell(cellValue),
         mailTotal: () => formatCurrencyCell(cellValue),
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

   const formatCurrencyCell = (value: number) => (
      <span>{value !== null ? formatCurrency(value) : ""}</span>
   );

   // const formattedDateCell = (value: any) => (
   //    <span>{value !== null ? formattedDate(value) : ""}</span>
   // );
   const formattedDateCell = (value: any) => (
      <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
   );

   const formattedDateTimeCell = (value: any) => (
      <span>{value !== null ? `${convertUtcToEst(value).date}, ${convertUtcToEst(value).time}` : ""}</span>
   );
   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   const checkIfAllIdsExist = (
      emailQueueUsers: IServerEmailLogItem[],
      selectedEmailQueueIds: string[]
   ): boolean | undefined => {
      if (emailQueueUsers.length === 0) {
         return false;
      }
      return emailQueueUsers.every(record =>
         selectedEmailQueueIds.includes(record.id as string)
      );
   };

   return (
      <div className="pt-3.5">
         <div className="relative -mr-0.5">
         <div className="mb-2 text-sm text-gray-600">
            {selectedServerLogIds.length} of {serverEmailLogs.totalCount} records selected
         </div>
            {showSpinner ? <Spinner /> : (
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={serverEmailLogs.items}
                     handleSelectAllChange={handleSelectAllChange}
                     selectAll={checkIfAllIdsExist(serverEmailLogs.items, selectedServerLogIds)}
                     cellRenderer={(data: IServerEmailLogItem, rowIndex: number, cellIndex: number) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                  // handleSorting={handleSorting}
                      selectedIds={selectedServerLogIds}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={serverEmailLogs.pageSize}
                     currentPage={serverEmailLogs.currentPage}
                     totalPages={serverEmailLogs.totalPages}
                     totalRecords={serverEmailLogs.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               </>
            )}
         </div>
      </div>
   );
};

export default ServerEmailLogsGrid;
