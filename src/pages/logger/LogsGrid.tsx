import React, { useState, useEffect, useRef } from "react";
import { useLogsContext } from "./LogsContext";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import { IGridHeader } from "interfaces/grid-interface";
import { ILogs } from "interfaces/log.interface";
import { convertUtcToEst, formattedDate, toCssClassName } from "utils/helper";

type LogsGridProps = {};

const initialColumnMapping: IGridHeader[] = [
   { columnName: "event", label: "Event" },
   { columnName: "message", label: "Message" },
   { columnName: "type", label: "Type" },
   { columnName: "logDate", label: "Log Date" },
   { columnName: "logTime", label: "Log Time" },
];

const LogsGrid = (props: LogsGridProps) => {
   const { showSpinner, setShowSpinner, logs, getLogs, setLogs, setUsers, getAllCompanies, getUsers } = useLogsContext();
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   //const [logList, setLogList] = useState<IAllLogs>(logs);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(logs.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(logs.totalPages > 1);
   const [confirmation, setConfirmation] = useState<boolean>(false);
   const isMounted = useRef(true);
   //const [openTylerModal, setOpenTylerModal] = useState<boolean>(false);
   //const [formMode, setFormMode] = useState<TylerFormMode>('create');
   //const [selectedUser, setSelectedUser] = useState<ITylerUserItems | null>(null);

   useEffect(() => {
      if (isMounted.current) {         
         getLogs(1, 100);
      getUsers("", "");
      getAllCompanies();
         isMounted.current = false;
      }
   }, []);

   useEffect(() => {
      setCanPaginateBack(logs.currentPage > 1);
      setCanPaginateFront(logs.totalPages > 1);
   }, [logs]);

   const handleFrontButton = () => {

      if (logs.currentPage < logs.totalPages) {
         const updatedCurrentPage = logs.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         // getLogs(updatedCurrentPage, logs.pageSize, logs.searchParam);
         getLogs(updatedCurrentPage, logs.pageSize, logs.searchParam, logs.event, logs.type, logs.fromDate, logs.toDate, logs.userId ?? "", logs.companyId ?? "");
      }
   };

   const handleBackButton = () => {
      if (
         logs.currentPage > 1 &&
         logs.currentPage <= logs.totalPages
      ) {
         const updatedCurrentPage = logs.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(logs.currentPage > 1);
         // back button get late notices
         // getLogs(updatedCurrentPage, logs.pageSize, logs.searchParam);
         getLogs(updatedCurrentPage, logs.pageSize, logs.searchParam, logs.event, logs.type, logs.fromDate, logs.toDate, logs.userId ?? "", logs.companyId ?? "");
      }
   };

   const handleCellRendered = (cellIndex: number, data: ILogs, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      var cellValue = (data as any)[propertyName];
      if(propertyName == "logDate")
      {
         cellValue = convertUtcToEst(cellValue).date;
      }
      if(propertyName == "logTime")
      {
         cellValue = convertUtcToEst(data.logDate.toString()).time;
      }

      const renderers: Record<string, () => JSX.Element> = {
         message: () => <HighlightedText text={cellValue ?? ''} query={logs.searchParam ?? ''} />,
         // logDate: () => formattedDateCell(cellValue),
         logDate: () => <span>{cellValue}</span>,
         logTime: () => <span>{cellValue}</span>
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
   const formattedDateCell = (value: any) => (
      <span>{value !== null ? formattedDate(value) : ""}</span>
   );
   const formattedTimeCell = (value: any) => (

      <span>{value !== null ? formattedDate(value) : ""}</span>
   );
   return (
      <>
         <div className="my-1.5 bg-white p-3 md:p-3.5 pb-3.5 md:pb-4 rounded-md shadow-md shadow-slate-300">
            <div className="relative -mr-0.5">
               {showSpinner ? <Spinner /> : (
                  <>
                     <Grid
                        columnHeading={visibleColumns}
                        rows={logs.items}
                        // handleSelectAllChange={handleSelectAllChange}
                        // selectAll={selectAll}
                        cellRenderer={(data: ILogs, rowIndex: number, cellIndex: number) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                     />
                     {/* Render the Pagination component with relevant props */}
                     <Pagination
                        numberOfItemsPerPage={logs.pageSize}
                        currentPage={logs.currentPage}
                        totalPages={logs.totalPages}
                        totalRecords={logs.totalCount}
                        handleFrontButton={handleFrontButton}
                        handleBackButton={handleBackButton}
                        canPaginateBack={canPaginateBack}
                        canPaginateFront={canPaginateFront}
                     />
                  </>
               )}
            </div>
         </div>
      </>
   );
};

export default LogsGrid;

