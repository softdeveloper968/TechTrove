import React, { useEffect, useRef, useState } from "react";
import { FaEye } from "react-icons/fa";
import Grid from "components/common/grid/GridWithToolTip";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import GridCheckbox from "components/formik/GridCheckBox";
import IconButton from "components/common/button/IconButton";
import { useServiceTrackerContext } from "../ServiceTrackerContext";
import { useAuth } from "context/AuthContext";
import { IServiceTrackerItems, IUnservedQueueItems } from "interfaces/service-tracker.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { ITenant } from "interfaces/all-cases.interface";
import { convertUtcToEst, formattedDate, toCssClassName } from "utils/helper";
import { UserRole } from "utils/enum";
import HelperViewPdfService from "services/helperViewPdfService";
import ServiceTrackerDetails from "./ServiceTrackerDetails";

// Define the props interface with a  type 'IServiceTracker'
type UnservedQueueGridProps = {};



// React functional component 'ServiceTrackerGrid' with a generic type 'IServiceTracker'
const UnservedQueueGrid = (props: UnservedQueueGridProps) => {
   //  integrated File Evictions here
   const { unservedQueue, getUnservedQueue,
     showSpinner, setSelectedServiceTrackerId, 
     setUnservedQueueBulkRecords, selectedServiceTrackerId } =
      useServiceTrackerContext();
   const { userRole } = useAuth();
   const isMounted = useRef(true);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(unservedQueue.items?.length).fill(false)
   );
   // State variables for pagination for next and previous button
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    unservedQueue.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    unservedQueue.totalPages > 1
   );
   const [serviceTrackerRecords, setServiceTrackerRecords] = useState<
   IUnservedQueueItems[]
   >([]);
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [currentCaseId, setCurrentCaseId] = useState<string>("");
   const initialColumnMapping: IGridHeader[] = [
      { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
      { columnName: "action", label: "Action", className: "action" },
      { columnName: "processServerEmail", label: "ProcessServerEmail" },
      { columnName: "county", label: "County" },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "caseNo", label: "CaseNo", toolTipInfo: "The unique number or code associated with your case, as assigned by the court." },
      { columnName: "serverIssuesRemarks", label: "ServerIssuesRemarks" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "serverReceived", label: "ServerReceived" }, // need to confirm this field
      { columnName: "tenantOne", label: "TenantOne" },
      // { columnName: "street", label: "Tenant StreetNo" },
      { columnName: "address", label: "TenantAddress" },
      { columnName: "unit", label: "TenantUnit" },
      { columnName: "city", label: "TenantCity" },
      { columnName: "state", label: "TenantState" },
      { columnName: "zip", label: "TenantZip" },
      { columnName: "personalService", label: "PersonalService" },
      { columnName: "serverServiceInfo", label: "ServerServiceInfo" },
      { columnName: "propertyPhone", label: "PropertyPhone" },
      { columnName: "filerEmail", label: "EvictionFilerEmail" },
      ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)
         ? [{
            columnName: "companyName",
            label: "CompanyName"
         }]
         : []
      ),
   ];

   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
      initialColumnMapping
   );

   useEffect(() => {
      if (isMounted.current) {
        setSelectedServiceTrackerId([]);
        getUnservedQueue(1, 100,'');
         isMounted.current = false;
      }
   }, []);

   useEffect(() => {
      if ((userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin))&& !visibleColumns.some(x => x.columnName === "companyName")) {
         setVisibleColumns((prev) => (
            [
               ...prev,
               {
                  columnName: "companyName",
                  label: "CompanyName"
               }
            ]
         )
         )
      }
   }, [userRole]);

   // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
   useEffect(() => {
      const ServiceTrackerRecords = unservedQueue.items.map((item: any) => {
         return {
            isChecked: false, // Add the new property
            ...item, // Spread existing properties
         };
      });
      setServiceTrackerRecords(ServiceTrackerRecords);
      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(unservedQueue.currentPage > 1);
      setCanPaginateFront(unservedQueue.totalPages > 1);
      setSelectedRows(Array(unservedQueue.items?.length).fill(false));
   }, [unservedQueue]);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   useEffect(() => {
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
   }, [unservedQueue.searchParam]);

   // Event handler for the 'Back' button
   const handleBackButton = () => {
      if (
        unservedQueue.currentPage > 1 &&
        unservedQueue.currentPage <= unservedQueue.totalPages
      ) {
         const updatedCurrentPage = unservedQueue.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(unservedQueue.currentPage > 1);
         // back button get late notices
         getUnservedQueue(
            updatedCurrentPage,
            unservedQueue.pageSize,
            unservedQueue.searchParam
         );
      }
   };

   // // Event handler for the 'Next' button
   const handleFrontButton = () => {
      if (unservedQueue.currentPage < unservedQueue.totalPages) {
         const updatedCurrentPage = unservedQueue.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getUnservedQueue(
            updatedCurrentPage,
            unservedQueue.pageSize,
            unservedQueue.searchParam
         );
      }
   };

   const openPdf = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   }

   const [newSelectedRows] = useState<boolean[]>([]);


   // const handleCheckBoxChange = (index: number, checked: boolean) => {

   //   if (shiftKeyPressed && lastClickedRowIndex !== -1 && serviceTracker.items) {
   //     const start = Math.min(index, lastClickedRowIndex);
   //     const end = Math.max(index, lastClickedRowIndex);
   //     setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
   //       i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
   //     ));
   //     setSelectedRows(selectedRows);
   //     const selectedIds = (serviceTracker.items || [])
   //       .filter((_, rowIndex) => selectedRows[rowIndex])
   //       .map((item) => item.id)
   //       .filter((id): id is string => typeof id === "string");
   //     setSelectedServiceTrackerId(selectedIds);
   //   }
   //   else {
   //     const updatedSelectedRows = [...selectedRows];
   //     updatedSelectedRows[index] = checked;
   //     setSelectedRows(updatedSelectedRows);

   //     if (serviceTracker.items.length === updatedSelectedRows.filter(item => item).length) {
   //       setSelectAll(true);
   //     } else {
   //       setSelectAll(false);
   //     }

   //     const selectedIds = (serviceTracker.items || [])
   //       .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
   //       .map((item) => item.id)
   //       .filter((id): id is string => typeof id === "string");

   //       setSelectedServiceTrackerId(selectedIds);
   //   }

   //   setLastClickedRowIndex(index);
   // };


   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {

      if (shiftKeyPressed && lastClickedRowIndex !== -1 && serviceTrackerRecords) {
         const start = Math.min(index, lastClickedRowIndex);
         const end = Math.max(index, lastClickedRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (serviceTrackerRecords || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         serviceTrackerRecords.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            setUnservedQueueBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(item)); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //  setBulkRecords((prev)=>[...prev,item]);
         })
         setSelectedServiceTrackerId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (serviceTrackerRecords.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = serviceTrackerRecords.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         // const selectedIds = (fileEvictions.items || [])
         //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
         //   .map((item) => item.id)
         //   .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked        
            setUnservedQueueBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedServiceTrackerId(prevIds => prevIds.filter(item => item !== id));
         } else {

            setUnservedQueueBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(serviceTrackerRecords.filter(x => x.id === id)[0])); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedServiceTrackerId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }

      }

      setLastClickedRowIndex(index);
   };

   const handleShowDetails = (id: string) => {
      setCurrentCaseId(id);
      setShowDetails(true);
   };

   const handleCellRendered = (
      cellIndex: number,
      data: IUnservedQueueItems,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      // const propertyName = (initialColumnMapping as any)[columnName];
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               // checked={selectedRows[rowIndex]}
               checked={selectedServiceTrackerId.includes(data.id as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id as string, checked)
               }
               label=""
            />
         ),
         action: () => renderActionsCell(data.id ?? ""),
         processServerEmail: () => <HighlightedText text={data.processServerEmail ?? ""} query={unservedQueue.searchParam ?? ''} />,
    county: () => formattedCell(cellValue),
    expedited: () => cellValue != null && cellValue !="" ? formattedCell("Expedited"): formattedCell(""),
    caseNo: () => renderHighlightedCell(cellValue),
    serverIssuesRemarks: () => formattedCell(cellValue),
    propertyName: () => renderHighlightedCell(cellValue),
    serverReceived: () => formattedDateCell(cellValue),
    tenantOne: () => formattedTenantFullName(data?.tenantNames[0]),
    street: () => formattedCell(cellValue),
   //  address: () => formattedAddressCell(data),
    address: () => formattedCell(cellValue),
    unit: () => formattedCell(cellValue),
    city: () => formattedCell(cellValue),
    state: () => formattedCell(cellValue),
    zip: () => formattedCell(cellValue),
    personalService: () => formattedCell(cellValue),
    serverServiceInfo: () => formattedCell(cellValue),
    propertyPhone: () => formattedCell(cellValue),
    filerEmail: () => formattedCell(cellValue),
    companyName: () => formattedCell(cellValue),
      };

      const renderer =
         renderers[propertyName] || (() => formattedCell(cellValue));

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


   // const formattedDateCell = (value: any) => (
   //    <span>{value !== null ? formattedDate(value) : ""}</span>
   // );
   const formattedDateCell = (value: any) => (
      <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
   //   <span>{value !== null ? formattedDate(value) : ""}</span>
   );
   const formattedAddressCell = (data: IUnservedQueueItems) => {
      return (
        <span> {`${data.address ?? ''} ${data.unit ?? ''} ${data.city ?? ''} ${data.state ?? ''} ${data.zip ?? ''}`}</span>
        //  <HighlightedText text={`${data.address ?? ''}  ${data.city ?? ''} ${data.zip ?? ''}`} query={unservedQueue.searchParam ?? ''} />
      );
   };


   const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
      <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={unservedQueue.searchParam ?? ''} />
   );

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );
   

   const renderHighlightedCell = (value: any) => (
      <HighlightedText text={value as string ?? ''} query={unservedQueue.searchParam ?? ''} />
   );


   const renderActionsCell = (id: string) => (
      <div className="flex justify-center gap-1.5">
         <IconButton
            type={"button"}
            className="cursor-pointer text-[#2472db]"
            disabled={!id?.length}
            icon={<FaEye className="h-4 w-4" />}
            handleClick={() => handleShowDetails(id)}
         />
      </div>
   );

   // const handleSelectAllChange = (checked: boolean) => {
   //   const newSelectAll = !selectAll;
   //   const allIds: string[] = serviceTracker.items
   //     .map((item) => item.id)
   //     .filter((id): id is string => typeof id === "string");

   //   if (checked) {
   //     setSelectedServiceTrackerId(allIds);
   //   } else {
   //     setSelectedServiceTrackerId([]);
   //   }

   //   setSelectAll((prevSelectAll) => {
   //     // Update selectedRows state
   //     setSelectedRows(Array(allIds.length).fill(newSelectAll));
   //     return newSelectAll;
   //   });
   // };

   const handleSelectAllChange = (checked: boolean) => {

      const newSelectAll = !selectAll;
      const allIds: string[] = serviceTrackerRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         serviceTrackerRecords
            .map((item) => setUnservedQueueBulkRecords((prev) => [...prev, item]));
         setSelectedServiceTrackerId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         serviceTrackerRecords.forEach((item) => {
            setUnservedQueueBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedServiceTrackerId(prevIds => prevIds.filter(id => id !== item.id));
         });
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

//    const checkIfAllIdsExist = (
//       serviceTrackerRecords: IUnservedQueueItems[],
//       selectedServiceTrackerId: string[]
//    ): boolean | undefined => {
//       return serviceTrackerRecords.every(record =>
//          selectedServiceTrackerId.includes(record.id as string)
//       );
//    };

const checkIfAllIdsExist = (
    serviceTrackerRecords: IUnservedQueueItems[],
    selectedServiceTrackerId: string[]
 ): boolean | undefined => {
    if (selectedServiceTrackerId.length === 0) {
       return false;
    }
    return serviceTrackerRecords.every(record =>
                 selectedServiceTrackerId.includes(record.id as string)
              );
 };

   
   // JSX structure for rendering the component
   return (
      <div className="mt-3">
         <div className="relative -mr-0.5">
         <div className="mb-2 text-sm text-gray-600">
            {selectedServiceTrackerId.length} of {unservedQueue.totalCount} records selected
         </div>
            {/* Render the Grid component with column headings and grid data */}
            {showSpinner === true ? (
               <Spinner />
            ) : (
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={serviceTrackerRecords}
                     handleSelectAllChange={handleSelectAllChange}
                     selectAll={checkIfAllIdsExist(serviceTrackerRecords, selectedServiceTrackerId)}
                     cellRenderer={(
                        data: IUnservedQueueItems,
                        rowIndex: number,
                        cellIndex: number
                     ) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                     selectedIds={selectedServiceTrackerId}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={unservedQueue.pageSize}
                     currentPage={unservedQueue.currentPage}
                     totalPages={unservedQueue.totalPages}
                     totalRecords={unservedQueue.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               </>
            )}
         </div>
         {showDetails && (
            <ServiceTrackerDetails
               caseId={currentCaseId}
               showDetails={showDetails}
               setShowDetails={(show: boolean) => setShowDetails(show)}
            />
         )}
      </div>
   );
};

// Export the component as the default export
export default UnservedQueueGrid;
