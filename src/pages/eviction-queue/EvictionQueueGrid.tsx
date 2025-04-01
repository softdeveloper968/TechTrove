import React, { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "context/AuthContext";
import { useEvictionQueueContext } from "./EvictionQueueContext";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import ToggleSwitch from "components/common/toggle/ToggleSwitch";
import { IGridHeader } from "interfaces/grid-interface";
import { IEvictionQueuesItem } from "interfaces/eviction-queue.intreface";
import { UserRole } from "utils/enum";
import { toCssClassName } from "utils/helper";

type EvictionQueueGridProps = {
   handleShowTask: () => void;
};

const EvictionQueueGrid = (props: EvictionQueueGridProps) => {
   const { userRole } = useAuth();
   const {
      showSpinner,
      setShowSpinner,
      evictionQueuesData,
      getEvictionQueuesData,
      setEvictionQueuesData,
      updateStatus,
      setSelectedEvictionQueueId
   } = useEvictionQueueContext();
   const initialColumnMapping: IGridHeader[] = [
      { columnName: "name", label: "Queue Name", isSort: true },
      { columnName: "status", label: "Status" },
      { columnName: "lastModified", label: "Last Updated" },
      { columnName: "task", label: "" },

   ];

   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   useEffect(() => {
      getEvictionQueuesData(1, 100);
      if ((userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)) && !visibleColumns.some(x => x.columnName === "companyName")) {
         setVisibleColumns((prev) => (
            [
               ...prev,

            ]
         )
         )
      }
   }, [userRole]);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionQueuesData.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionQueuesData.totalPages > 1);
   const handleFrontButton = () => {
      if (evictionQueuesData.currentPage < evictionQueuesData.totalPages) {
         const updatedCurrentPage = evictionQueuesData.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         // getTylerUsers(
         // 	updatedCurrentPage,
         // 	processServerCaseList.pageSize
         // );
      }
   };
   const handleBackButton = () => {
      if (
         evictionQueuesData.currentPage > 1 &&
         evictionQueuesData.currentPage <= evictionQueuesData.totalPages
      ) {
         const updatedCurrentPage = evictionQueuesData.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(evictionQueuesData.currentPage > 1);
         // back button get late notices
         // getTylerUsers(
         // 	updatedCurrentPage,
         // 	processServerCaseList.pageSize
         // );
      }
   };
   const handleSorting = (columnName: string, order: string) => {
      // Copy the current process server cases array to avoid mutating the state directly
      const sortedQueues = [...evictionQueuesData.items];

      // Define a compare function based on the column name and order
      const compare = (a: any, b: any) => {
         // Extract values for comparison based on the column name
         let valueA: any = a[columnName];
         let valueB: any = b[columnName];

         // Implement sorting logic based on the order (ascending or descending)
         if (order === 'asc') {
            if (valueA < valueB) return -1;
            if (valueA > valueB) return 1;
            return 0;
         } else {
            if (valueA > valueB) return -1;
            if (valueA < valueB) return 1;
            return 0;
         }
      };

      // Sort the cases array using the compare function
      sortedQueues.sort(compare);

      // Update the state with sorted cases
      setEvictionQueuesData((prev) => ({
         ...prev,
         items: sortedQueues
      }));
   };

   const handleStatusChange = async (
      evictionQueueId: number | undefined,
      status: boolean,
      selectedRowIndex: number,
   ) => {
      updateStatus(evictionQueueId || 0, status);
      setEvictionQueuesData((y) => ({
         ...y,
         items: y.items.map((i, index) => {

            if (selectedRowIndex === index) {
               i.status = status;

            }
            return {
               ...i
            }

         })
      }));
   };

   const handleButtonClicked = async (
      evictionQueueId: number | undefined
   ) => {
      setSelectedEvictionQueueId(evictionQueueId || 0)
      props.handleShowTask();
   }

   const handleCellRendered = (cellIndex: number, data: IEvictionQueuesItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];

      const renderers: Record<string, () => JSX.Element> = {
         name: () => <HighlightedText text={cellValue ?? ''} query={evictionQueuesData.searchParam ?? ''} />,
         status: () => <> {data.name === "C2C Automated Scripts" ?

            <ToggleSwitch
               value={cellValue}
               label={cellValue ? "Running" : "Stopped"}
               handleChange={(event: ChangeEvent<HTMLInputElement>) => {
                  handleStatusChange(data.id, event.target.checked, rowIndex);
               }}
            ></ToggleSwitch>
            :
            <></>} </>,
         task: () => <>
            <h1
               onClick={() => handleButtonClicked(data.id)}
               className="underline text-[#2472db]"
               style={{ cursor: 'pointer' }}>
               View Tasks
            </h1>

         </>,

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

   return (<><div className="my-1.5 bg-white p-3 md:p-3.5 pb-3.5 md:pb-4 rounded-md shadow-md shadow-slate-300">
      <div className="relative -mr-0.5">
         {showSpinner ? (
            <Spinner />
         ) : (
            <>
               <Grid
                  columnHeading={visibleColumns}
                  rows={evictionQueuesData.items}
                  cellRenderer={(data: IEvictionQueuesItem, rowIndex: number, cellIndex: number) => {
                     return handleCellRendered(cellIndex, data, rowIndex);
                  }}
                  handleSorting={handleSorting}
               />
               {/* Render the Pagination component with relevant props */}
               <Pagination
                  numberOfItemsPerPage={evictionQueuesData.pageSize}
                  currentPage={evictionQueuesData.currentPage}
                  totalPages={evictionQueuesData.totalPages}
                  totalRecords={evictionQueuesData.totalCount}
                  handleFrontButton={handleFrontButton}
                  handleBackButton={handleBackButton}
                  canPaginateBack={canPaginateBack}
                  canPaginateFront={canPaginateFront}
               />
            </>
         )}
      </div>
   </div></>);

}
export default EvictionQueueGrid;