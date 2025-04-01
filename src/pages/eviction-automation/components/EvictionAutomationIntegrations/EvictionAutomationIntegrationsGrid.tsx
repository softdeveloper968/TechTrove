import React, { useEffect, useRef, useState } from "react";
import { IEvictionAutomationIntegrationsGridItem } from "interfaces/eviction-automation.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { useEvictionAutomationContext } from "pages/eviction-automation/EvictionAutomationContext";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import { toCssClassName } from "utils/helper";


type EvictionAutomationIntegrationsGridProps = {};
const EvictionAutomationIntegrationsGrid = (props: EvictionAutomationIntegrationsGridProps) => {

    const initialColumnMapping: IGridHeader[] = [
        {columnName:"pmsName",label:"PMS"},
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
        evictionAutomationIntegrationsQueue,
        getEvictionAutomationIntegrationsQueue,
     } = useEvictionAutomationContext();
  
     const isMounted = useRef(true);
     const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
     const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionAutomationIntegrationsQueue.currentPage > 1);
     const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionAutomationIntegrationsQueue.totalPages > 1);
  
     useEffect(() => {
        if (evictionAutomationIntegrationsQueue.totalCount <= 1) {
           if (isMounted.current) {
            getEvictionAutomationIntegrationsQueue(1, 100,'');
              isMounted.current = false;
           }
        }
     }, []);
     useEffect(() => {
        // Enable/disable pagination buttons based on the number of total pages
        setCanPaginateBack(evictionAutomationIntegrationsQueue.currentPage > 1);
        setCanPaginateFront(evictionAutomationIntegrationsQueue.totalPages > 1);
     }, [evictionAutomationIntegrationsQueue]);
  
     const handleFrontButton = () => {
        if (evictionAutomationIntegrationsQueue.currentPage < evictionAutomationIntegrationsQueue.totalPages) {
           const updatedCurrentPage = evictionAutomationIntegrationsQueue.currentPage + 1;
           // Update current page and enable/disable 'Back' button
           setCanPaginateBack(updatedCurrentPage > 1);
           // back button get late notices
           getEvictionAutomationIntegrationsQueue(
              updatedCurrentPage,
              evictionAutomationIntegrationsQueue.pageSize,
              ''
           );
        }
     };
  
     const handleBackButton = () => {
        if (
            evictionAutomationIntegrationsQueue.currentPage > 1 &&
            evictionAutomationIntegrationsQueue.currentPage <= evictionAutomationIntegrationsQueue.totalPages
        ) {
           const updatedCurrentPage = evictionAutomationIntegrationsQueue.currentPage - 1;
           // Update current page and enable/disable 'Back' button
           setCanPaginateBack(evictionAutomationIntegrationsQueue.currentPage > 1);
           // back button get late notices
           getEvictionAutomationIntegrationsQueue(
              updatedCurrentPage,
              evictionAutomationIntegrationsQueue.pageSize,
              ''
           );
        }
     };
  
     const handleCellRendered = (cellIndex: number, data: IEvictionAutomationIntegrationsGridItem, rowIndex: number) => {
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
     return (
        <div>
           <div className="relative -mr-0.5">
              <div className="relative -mr-0.5">
                 {showSpinner && <Spinner />}
                 <Grid
                    columnHeading={visibleColumns}
                    rows={evictionAutomationIntegrationsQueue.items}
                    cellRenderer={(data: IEvictionAutomationIntegrationsGridItem, rowIndex: number, cellIndex: number) =>
                       handleCellRendered(cellIndex, data, rowIndex)
                    }
                 />
                 <Pagination
                    numberOfItemsPerPage={evictionAutomationIntegrationsQueue.pageSize}
                    currentPage={evictionAutomationIntegrationsQueue.currentPage}
                    totalPages={evictionAutomationIntegrationsQueue.totalPages}
                    totalRecords={evictionAutomationIntegrationsQueue.totalCount}
                    handleFrontButton={handleFrontButton}
                    handleBackButton={handleBackButton}
                    canPaginateBack={canPaginateBack}
                    canPaginateFront={canPaginateFront}
                 />
              </div>
           </div>
        </div>
     );
}
export default EvictionAutomationIntegrationsGrid;