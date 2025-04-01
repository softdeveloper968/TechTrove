import React, { useEffect, useRef, useState } from 'react';
import Grid from 'components/common/grid/GridWithToolTip';
import Pagination from 'components/common/pagination/Pagination';
import HighlightedText from 'components/common/highlightedText/HighlightedText';
import GridCheckbox from 'components/formik/GridCheckBox';
import Spinner from 'components/common/spinner/Spinner';
import { IGridHeader } from 'interfaces/grid-interface';
import { IEvictionAutomationButton, IEvictionAutomationQueueItem, IEvictionAutomationStatus } from 'interfaces/eviction-automation.interface';
import { useEvictionAutomationContext } from '../EvictionAutomationContext';
import { convertUtcToEst, toCssClassName } from 'utils/helper';

const EvictionAutomationStatusGrid: React.FC = () => {
   const {
      showSpinner,
      evictionAutomationStatusQueue,
      selectedEvictionAutomationStatusIds,
      setSelectedEvictionStatusId,
      getEvictionAutomationStatusQueue,
   } = useEvictionAutomationContext();
   const initialColumnMapping: IGridHeader[] = [
      { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
      { columnName: "name", label: "Name"},
      { columnName: "ownerId", label: "OwnerId"},
      { columnName: "propertyId", label: "PropertyId" },
      { columnName: "pullDate", label: "PullDate" },
      { columnName: "status", label: "Status" },
      { columnName: "batchId", label: "BatchId" },     
   ];
   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
      initialColumnMapping
   );
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionAutomationStatusQueue.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionAutomationStatusQueue.totalPages > 1);
   const [evictionAutomationRecords, setEvictionAutomationRecords] = useState<IEvictionAutomationQueueItem[]>([]);
   const [importCsvPopUp, setImportCsvPopUp] = useState<boolean>(false);
   const [selectedButtons, setselectedButtons] = useState<IEvictionAutomationButton[]>([]);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(Array(evictionAutomationStatusQueue.items?.length).fill(false));
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   const [newSelectedRows] = useState<boolean[]>([]);
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const isMounted = useRef(true);


   useEffect(() => {
      if (isMounted.current) {
         getEvictionAutomationStatusQueue(1,100);
      setSelectedEvictionStatusId([]);
         isMounted.current = false;
      }
      // getEvictionAutomationStatusQueue(1,100);
      // setSelectedEvictionStatusId([]);
      setSelectAll(false);
      // const evictionAutomationRecords: IEvictionAutomationQueueItem[] = evictionAutomationStatusQueue.items.map((item: any) => {
      //    return {
      //       // isChecked: false, // Add the new property
      //       ...item, // Spread existing properties
      //    };
      // });

   //  setEvictionAutomationRecords(evictionAutomationRecords);
   //    const selectedButtons = EvictionAutomationButtonList.filter(button => button.title === "Import Data");
   //    setselectedButtons(selectedButtons);
   const evictionAutomationRecords: IEvictionAutomationQueueItem[] = evictionAutomationStatusQueue.items.map((item: any) => {
      return {
         //   isChecked: false, // Add the new property
         ...item, // Spread existing properties
      };
   });

   setEvictionAutomationRecords(evictionAutomationRecords);


   const updatedSelectedRows = (evictionAutomationStatusQueue.items || []).map((item: any) =>
      selectedEvictionAutomationStatusIds.includes(item.id)
   );

   // Enable/disable pagination buttons based on the number of total pages
   setCanPaginateBack(evictionAutomationStatusQueue.currentPage > 1);
   setCanPaginateFront(evictionAutomationStatusQueue.totalPages > 1);

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
   }, [getEvictionAutomationStatusQueue]);
   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {

      if (shiftKeyPressed && lastClickedRowIndex !== -1 && evictionAutomationStatusQueue.items) {
         const start = Math.min(index, lastClickedRowIndex);
         const end = Math.max(index, lastClickedRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (evictionAutomationStatusQueue.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.name)
            .filter((id): id is string => typeof id === "string");

            evictionAutomationStatusQueue.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
         })
         setSelectedEvictionStatusId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);
         if (evictionAutomationStatusQueue.items.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }
         var selectedIds = evictionAutomationStatusQueue.items.filter(item => item.name == id).map((item) => item.name)
            .filter((id): id is string => typeof id === "string");

         if (!checked) {
            setSelectedEvictionStatusId(prevIds => prevIds.filter(item => item !== id));
         } else {
            setSelectedEvictionStatusId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }
      }
      setLastClickedRowIndex(index);
   };
   const handleCellRendered = (cellIndex: number, data: IEvictionAutomationStatus, rowIndex: number) => {
      ;
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               // checked={selectedRows.some(row => row.id === data.id && row.selected)}
               checked={selectedEvictionAutomationStatusIds.includes(data.name as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.name as string, checked)
               }
               label=""
            />
         ),
         // pullDate:()=> <span>{cellValue ? new Date(cellValue).toLocaleString() : ""}</span>,
         pullDate:()=> formattedDateTimeCell(cellValue),
         name:()=><span><a href={data.docUrl}  target="_blank" className="text-[#2472db]">{cellValue}</a></span>,
         status:()=>cellValue != "New"?<span><a href={data.logUrl}  target="_blank" className="text-[#2472db]">{cellValue}</a></span>:formattedCell(cellValue)
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
      // <span>{value !== null ? value : ""}</span>
      <HighlightedText text={value??""} query={evictionAutomationStatusQueue.searchParam ?? ''} />
   );

   const formattedDateTimeCell = (value: any) => (
      <span>{value !== null ? `${convertUtcToEst(value).date}, ${convertUtcToEst(value).time}` : ""}</span>
   );
   const handleFrontButton = () => {
      if (evictionAutomationStatusQueue.currentPage < evictionAutomationStatusQueue.totalPages) {
         const updatedCurrentPage = evictionAutomationStatusQueue.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getEvictionAutomationStatusQueue(updatedCurrentPage,
            evictionAutomationStatusQueue.pageSize);
      }
   };

   const handleBackButton = () => {
      if (
         evictionAutomationStatusQueue.currentPage > 1 &&
         evictionAutomationStatusQueue.currentPage <= evictionAutomationStatusQueue.totalPages
      ) {
         const updatedCurrentPage = evictionAutomationStatusQueue.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(evictionAutomationStatusQueue.currentPage > 1);
         // back button get late notices
         getEvictionAutomationStatusQueue(updatedCurrentPage,
            evictionAutomationStatusQueue.pageSize);
      }
   };

   const checkIfAllIdsExist = (
           evictionAutomationRecords: IEvictionAutomationStatus[],
      selectedEvictionAutomationQueueIds: string[]
   ): boolean | undefined => {
      if (evictionAutomationRecords.length === 0) {
          return false;
      }
         return evictionAutomationRecords.every(record =>
         selectedEvictionAutomationQueueIds.includes(record.name as string)
      );
   };
   // const checkIfAllIdsExist = (
   //    evictionAutomationRecords: IEvictionAutomationStatus[],
   //    selectedEvictionAutomationQueueIds: string[]
   // ): boolean | undefined => {

   //    return evictionAutomationRecords.every(record =>
   //       selectedEvictionAutomationQueueIds.includes(record.name as string)
   //    );
   // };
   const handleSelectAllChange = (checked: boolean) => {
      ;
      const newSelectAll = !selectAll;
      const allIds: string[] = evictionAutomationStatusQueue.items
         .map((item) => item.name)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         // emailQueues.items
         // .map((item) => setBulkRecords((prev) => [...prev, item]));
         setSelectedEvictionStatusId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         evictionAutomationStatusQueue.items.forEach((item) => {
            // setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedEvictionStatusId(prevIds => prevIds.filter(id => id !== item.name));
         });
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };
   return (
      <>
         <div className="relative flex flex-wrap items-center mb-1.5 mt-2.5 justify-end">          
         </div>
         {showSpinner ? (
               <Spinner />
            ) : (
               <>
                   <Grid
            columnHeading={visibleColumns}
            rows={evictionAutomationStatusQueue.items}
            handleSelectAllChange={handleSelectAllChange}
            selectAll={checkIfAllIdsExist(evictionAutomationStatusQueue.items, selectedEvictionAutomationStatusIds)}
            cellRenderer={(data: IEvictionAutomationStatus, rowIndex: number, cellIndex: number) =>
               handleCellRendered(cellIndex, data, rowIndex)
            }
            selectedIds={selectedEvictionAutomationStatusIds}
         />
         <Pagination
            numberOfItemsPerPage={evictionAutomationStatusQueue.pageSize}
            currentPage={evictionAutomationStatusQueue.currentPage}
            totalPages={evictionAutomationStatusQueue.totalPages}
            totalRecords={evictionAutomationStatusQueue.totalCount}
            handleFrontButton={handleFrontButton}
            handleBackButton={handleBackButton}
            canPaginateBack={canPaginateBack}
            canPaginateFront={canPaginateFront}
         />
               </>
            )}
         {/* <Grid
            columnHeading={visibleColumns}
            rows={evictionAutomationStatusQueue.items}
            cellRenderer={(data: IEvictionAutomationStatus, rowIndex: number, cellIndex: number) =>
               handleCellRendered(cellIndex, data, rowIndex)
            }
         />
         <Pagination
            numberOfItemsPerPage={evictionAutomationStatusQueue.pageSize}
            currentPage={evictionAutomationStatusQueue.currentPage}
            totalPages={evictionAutomationStatusQueue.totalPages}
            totalRecords={evictionAutomationStatusQueue.totalCount}
            handleFrontButton={handleFrontButton}
            handleBackButton={handleBackButton}
            canPaginateBack={canPaginateBack}
            canPaginateFront={canPaginateFront}
         /> */}
      </>
   );
};

export default EvictionAutomationStatusGrid;


