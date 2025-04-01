import React, { useEffect, useState, useRef } from "react";
import { useEvictionAutomationContext } from "../EvictionAutomationContext";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import { IGridHeader } from "interfaces/grid-interface";
import {
   IEvictionAutomationButton, IEvictionAutomationPropexoGridItem, IEvictionAutomationQueueItem
} from "interfaces/eviction-automation.interface";
import EvictionAutomationDetails from "./EvictionAutomationDetails";
import { toCssClassName } from "utils/helper";

type EvictionAutomationPropexoGridProps = {};

const EvictionAutomationPropexoGrid = (props: EvictionAutomationPropexoGridProps) => {
   const initialColumnMapping: IGridHeader[] = [
    {columnName:"pmsName",label:"Integration"},
   // { columnName: "ownerId", label: "OwnerId" },
    { columnName: "propertyId", label: "Property Id" },
    { columnName: "propertyName", label: "Property Name" },
    { columnName: "ownerName", label: "Owner Name" },
    { columnName: "streetAddress1", label: "Address 1" },
    { columnName: "streetAddress2", label: "Address 2" },
    { columnName: "city", label: "City" },
    { columnName: "state", label: "State" },
    { columnName: "zip", label: "Zip"},
    { columnName: "country", label: "Country" },
    { columnName: "county", label: "County" },
    {columnName : "isActive", label:"Is Active"}
 ];
   const {
      showSpinner,
      evictionAutomationPropexoQueue,
      getEvictionAutomationPropexoQueue,
   } = useEvictionAutomationContext();

   const isMounted = useRef(true);
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionAutomationPropexoQueue.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionAutomationPropexoQueue.totalPages > 1);

   useEffect(() => {
      if (evictionAutomationPropexoQueue.totalCount <= 1) {
         if (isMounted.current) {
             getEvictionAutomationPropexoQueue(1, 100);
            isMounted.current = false;
         }
      }
   }, []);
   useEffect(() => {
      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(evictionAutomationPropexoQueue.currentPage > 1);
      setCanPaginateFront(evictionAutomationPropexoQueue.totalPages > 1);
   }, [evictionAutomationPropexoQueue]);

   const handleFrontButton = () => {
      if (evictionAutomationPropexoQueue.currentPage < evictionAutomationPropexoQueue.totalPages) {
         const updatedCurrentPage = evictionAutomationPropexoQueue.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getEvictionAutomationPropexoQueue(
            updatedCurrentPage,
            evictionAutomationPropexoQueue.pageSize
         );
      }
   };

   const handleBackButton = () => {
      if (
        evictionAutomationPropexoQueue.currentPage > 1 &&
        evictionAutomationPropexoQueue.currentPage <= evictionAutomationPropexoQueue.totalPages
      ) {
         const updatedCurrentPage = evictionAutomationPropexoQueue.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(evictionAutomationPropexoQueue.currentPage > 1);
         // back button get late notices
         getEvictionAutomationPropexoQueue(
            updatedCurrentPage,
            evictionAutomationPropexoQueue.pageSize
         );
      }
   };

   const handleCellRendered = (cellIndex: number, data: IEvictionAutomationPropexoGridItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const baseUrl = process.env.REACT_APP_API_URL;
      const renderers: Record<string, () => JSX.Element> = {

        crmName:()=>formattedCell(cellValue),
        county:()=>formattedCell(cellValue),
        ownerName:()=>formattedCell(cellValue),
        country:()=>formattedCell(cellValue),

        zip:()=>formattedCell(cellValue),

        state:()=>formattedCell(cellValue),

        city:()=>formattedCell(cellValue),

        streetAddress2:()=>formattedCell(cellValue),

        streetAddress1:()=>formattedCell(cellValue),
        propertyName:()=>cellValue != "New"?<span><a href={`${baseUrl}/api/Propexo/PropertyDetails?integrationId=${data.integrationId}&propertyId=${data.propertyId}`}  target="_blank" className="text-[#2472db]">{cellValue}</a></span>:formattedCell(cellValue),

        propertyId:()=>formattedCell(cellValue),
        isActive:()=> <span>{cellValue?"True" : "False"}</span>
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
   console.log(evictionAutomationPropexoQueue.items)
   return (
      <div>
         <div className="relative -mr-0.5">
            <div className="relative -mr-0.5">
               {showSpinner && <Spinner />}
               <Grid
                  columnHeading={visibleColumns}
                  rows={evictionAutomationPropexoQueue.items}
                  cellRenderer={(data: IEvictionAutomationPropexoGridItem, rowIndex: number, cellIndex: number) =>
                     handleCellRendered(cellIndex, data, rowIndex)
                  }
               />
               <Pagination
                  numberOfItemsPerPage={evictionAutomationPropexoQueue.pageSize}
                  currentPage={evictionAutomationPropexoQueue.currentPage}
                  totalPages={evictionAutomationPropexoQueue.totalPages}
                  totalRecords={evictionAutomationPropexoQueue.totalCount}
                  handleFrontButton={handleFrontButton}
                  handleBackButton={handleBackButton}
                  canPaginateBack={canPaginateBack}
                  canPaginateFront={canPaginateFront}
               />
            </div>
         </div>
      </div>
   );
};

export default EvictionAutomationPropexoGrid;