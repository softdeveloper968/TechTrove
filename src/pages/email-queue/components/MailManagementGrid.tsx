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
import { IMailManagementItem } from "interfaces/email-queue.interface";
import { formattedDate, formatCurrency, getDocumentNameByFilingType, convertUtcToEst } from "utils/helper";
import HelperViewPdfService from "services/helperViewPdfService";
import { toCssClassName } from "utils/helper";

const initialColumnMapping: IGridHeader[] = [
   { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
   { columnName: "county", label: "County" },
   { columnName: "documentUrl", label: "DocumentType" },
   { columnName: "batchSignDate", label: "BatchSignDate" },
   { columnName: "mailDate", label: "MailDate" },
   { columnName: "mailTotal", label: "MailTotal", className: "text-right" },
   { columnName: "mailWeight", label: "MailWeight", className: "text-right" },
   { columnName: "mailTracking", label: "MailTracking#", className: "text-right" },
   { columnName: "mailNotes", label: "MailNotes" },
   { columnName: "mailManager", label: "MailManager" },
];

const MailManagementGrid = () => {
   const isMounted = useRef(true);
   const { userRole } = useAuth();
   const {
      showSpinner,
      mailManagementQueue,
      getMailManagementQueue,
      selectedEmailQueueIds,
      setSelectedEmailQueueIds,
      setBulkMailManagementQueue
   } = useEmailQueueContext();

   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(mailManagementQueue.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(mailManagementQueue.totalPages > 1);

   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(mailManagementQueue.items.length).fill(false)
   );

   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [newRowsSelected] = useState<boolean[]>([]);

   const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);

   useEffect(() => {
      if (isMounted.current) {
         setSelectedEmailQueueIds([]);
         getMailManagementQueue(1, 100, "");
         isMounted.current = false;
      }

      setSelectAll(false);
      setSelectedRows(Array(mailManagementQueue.items?.length).fill(false));

      setCanPaginateBack(mailManagementQueue.currentPage > 1);
      setCanPaginateFront(mailManagementQueue.totalPages > 1);

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

   }, [getMailManagementQueue, userRole]);

   const handleFrontButton = () => {
      if (mailManagementQueue.currentPage < mailManagementQueue.totalPages) {
         const updatedCurrentPage = mailManagementQueue.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         getMailManagementQueue(updatedCurrentPage, 100, mailManagementQueue.searchParam);
      }
   };

   const handleSelectAllChange = (checked: boolean) => {
      const allIds: string[] = mailManagementQueue.items
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");

      if (checked) {
         // Update bulkServerLogRecords with unique items
         setBulkMailManagementQueue(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const newItems = mailManagementQueue.items.filter(item => !existingIds.has(item.id));
            return [...prev, ...newItems];
         });

         // Update selectedServerLogIdsIds with unique ids
         setSelectedEmailQueueIds(prevIds => {
            const updatedIds = new Set([...prevIds, ...allIds]);
            return Array.from(updatedIds);
         });
      } else {
         // Remove items based on id from bulkServerLogRecords
         setBulkMailManagementQueue(prevItems => prevItems.filter(record => !mailManagementQueue.items.some(item => item.id === record.id)));

         // Remove ids based on id from selectedServerLogIdsIds
         setSelectedEmailQueueIds(prevIds => prevIds.filter(id => !allIds.includes(id)));
      }

      // Update selectAll state and selectedRows
      setSelectAll(checked);
      setSelectedRows(Array(allIds.length).fill(checked));
   };

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
      if (shiftKeyPressed && lastClickedFilteredRowIndex !== -1 && mailManagementQueue.items) {
         const start = Math.min(index, lastClickedFilteredRowIndex);
         const end = Math.max(index, lastClickedFilteredRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newRowsSelected[i]
         ));

         setSelectedRows(selectedRows);
         const selectedIds = (mailManagementQueue.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         mailManagementQueue.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            setBulkMailManagementQueue(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(item)); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
         });

         setSelectedEmailQueueIds(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (mailManagementQueue.items.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = mailManagementQueue.items.filter(item => item.id === id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         if (!checked) {
            setBulkMailManagementQueue(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedEmailQueueIds(prevIds => prevIds.filter(item => item !== id));
         } else {
            setBulkMailManagementQueue(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(mailManagementQueue.items.filter(x => x.id === id)[0])); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });

            setSelectedEmailQueueIds(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }
      }

      setLastClickedFilteredRowIndex(index);
   };

   const handleBackButton = () => {
      if (
         mailManagementQueue.currentPage > 1 &&
         mailManagementQueue.currentPage <= mailManagementQueue.totalPages
      ) {
         const updatedCurrentPage = mailManagementQueue.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(mailManagementQueue.currentPage > 1);
         getMailManagementQueue(updatedCurrentPage, 100, mailManagementQueue.searchParam);
      }
   };

   const openPdf = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   };

   const handleCellRendered = (cellIndex: number, data: IMailManagementItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               checked={selectedEmailQueueIds.includes(data.id as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id, checked)}
               label=""
            />
         ),
         county: () => <HighlightedText text={cellValue ?? ""} query={mailManagementQueue.searchParam ?? ''} />,
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
         
            // Fetch the document name based on the filing type
            const documentName = getDocumentNameByFilingType(data.filingType);
         
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
                     className="underline text-[#2472db] mr-1"
                     style={{ cursor: 'pointer' }}
                  >
                     {documentName} {/* Display the dynamic document name */}
                  </h1>
                  {hoveredDocumentId === data.id && (
                     <FaCopy
                        className="w-4 h-4 text-gray-500 cursor-pointer absolute right-0.5"
                        onClick={() => handleCopyClick(cellValue)}
                     />
                  )}
               </div>
            );
         },
         mailDate: () => formattedDateCell(cellValue),
         mailTotal: () => formatCurrencyCell(cellValue),
         batchSignDate: () => formattedDateCell(cellValue)
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

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   const checkIfAllIdsExist = (emailQueueUsers: IMailManagementItem[], selectedEmailQueueIds: string[]): boolean | undefined => {
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
            {selectedEmailQueueIds.length} of {mailManagementQueue.totalCount} records selected
         </div>
            {showSpinner ? <Spinner /> : (
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={mailManagementQueue.items}
                     handleSelectAllChange={handleSelectAllChange}
                     selectAll={checkIfAllIdsExist(mailManagementQueue.items, selectedEmailQueueIds)}
                     cellRenderer={(data: IMailManagementItem, rowIndex: number, cellIndex: number) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                  // handleSorting={handleSorting}
                      selectedIds={selectedEmailQueueIds}
                  />
                  <Pagination
                     numberOfItemsPerPage={mailManagementQueue.pageSize}
                     currentPage={mailManagementQueue.currentPage}
                     totalPages={mailManagementQueue.totalPages}
                     totalRecords={mailManagementQueue.totalCount}
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

export default MailManagementGrid;
