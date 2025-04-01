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
import { IServiceTrackerItems } from "interfaces/service-tracker.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { ITenant } from "interfaces/all-cases.interface";
import { convertUtcToEst, formattedDate, toCssClassName } from "utils/helper";
import { UserRole } from "utils/enum";
import HelperViewPdfService from "services/helperViewPdfService";
import ServiceTrackerDetails from "./ServiceTrackerDetails";

// Define the props interface with a  type 'IServiceTracker'
type ServiceTrackerGridProps = {};



// React functional component 'ServiceTrackerGrid' with a generic type 'IServiceTracker'
const ServiceTrackeerGrid = (props: ServiceTrackerGridProps) => {
   //  integrated File Evictions here
   const { serviceTracker, getServiceTracker, showSpinner, setSelectedServiceTrackerId, setBulkRecords, selectedServiceTrackerId } =
      useServiceTrackerContext();
   const { userRole } = useAuth();
   const isMounted = useRef(true);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(serviceTracker.items?.length).fill(false)
   );
   // State variables for pagination for next and previous button
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      serviceTracker.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      serviceTracker.totalPages > 1
   );
   const [serviceTrackerRecords, setServiceTrackerRecords] = useState<
      IServiceTrackerItems[]
   >([]);
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [currentCaseId, setCurrentCaseId] = useState<string>("");
   const initialColumnMapping: IGridHeader[] = [
      { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
      { columnName: "action", label: "Action", className: "action" },
      //  { columnName: "status", label: "Status" },
      { columnName: "caseNo", label: "CaseNo", toolTipInfo: "The unique number or code associated with your case, as assigned by the court." },
      { columnName: "expedited", label: "Expedited" },
      { columnName: "propertyVsTenants", label: "PropertyName Vs. Tenants" },
      // { columnName: "address", label: "TenantAddressCombined" },
      // { columnName: "documents", label: "Documents" },
      // { columnName: "county", label: "County" },
      // { columnName: "courtDate", label: "CourtDate" },
      // { columnName: "answerDate", label: "AnswerDate" },
      // { columnName: "answerDefendantName", label: "AnswerDefendantName" },
      // { columnName: "answerDefendantEmail", label: "AnswerDefendantEmail" },
      // { columnName: "evictionCourtDate", label: "EvictionCourtDate" },
      // { columnName: "evictionCourtTime", label: "EvictionCourtTime" },
      // { columnName: "evictionCourtRoom", label: "EvictionCourtRoom" },
      // { columnName: "attorneyName", label: "AttorneyName" },
      { columnName: "evictionDateFiled", label: "EvictionDateFiled", toolTipInfo: "The day the eviction case was accepted by the court." },
      { columnName: "serverReceived", label: "ServerReceived" }, // need to confirm this field
      { columnName: "evictionServiceDate", label: "EvictionServiceDate", toolTipInfo: "The date the case documents were delivered to the tenant by sheriff or private process server. " },
      { columnName: "lastDayToAnswer", label: "EvictionLastDayToAnswer", toolTipInfo: "The last day that the tenant is allowed to answer with the court before it is considered 'Late'." },
      { columnName: "evictionServiceMethod", label: "EvictionServiceMethod" },
      { columnName: "serverNote", label: "ServerNotes" },
      { columnName: "serviceDayCal", label: "ServiceDayCal", className:'text-right' }, // need to confirm this field
      { columnName: "processServerEmail", label: "ProcessServerEmail" },
      { columnName: "expeditedLate", label: "ExpeditedLate" }, // need to confirm this field
      { columnName: "tenantOne", label: "TenantOne" },
      { columnName: "propertyName", label: "PropertyName" },
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
         getServiceTracker(1, 100);
         isMounted.current = false;
      }
   }, []);

   useEffect(() => {
      if ((userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) && !visibleColumns.some(x => x.columnName === "companyName")) {
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
      const ServiceTrackerRecords = serviceTracker.items.map((item: any) => {
         return {
            isChecked: false, // Add the new property
            ...item, // Spread existing properties
         };
      });
      setServiceTrackerRecords(ServiceTrackerRecords);
      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(serviceTracker.currentPage > 1);
      setCanPaginateFront(serviceTracker.totalPages > 1);
      setSelectedRows(Array(serviceTracker.items?.length).fill(false));
   }, [serviceTracker]);
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
   }, [serviceTracker.searchParam]);

   // Event handler for the 'Back' button
   const handleBackButton = () => {
      if (
         serviceTracker.currentPage > 1 &&
         serviceTracker.currentPage <= serviceTracker.totalPages
      ) {
         const updatedCurrentPage = serviceTracker.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(serviceTracker.currentPage > 1);
         // back button get late notices
         getServiceTracker(
            updatedCurrentPage,
            serviceTracker.pageSize,
            serviceTracker.searchParam
         );
      }
   };

   // // Event handler for the 'Next' button
   const handleFrontButton = () => {
      if (serviceTracker.currentPage < serviceTracker.totalPages) {
         const updatedCurrentPage = serviceTracker.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getServiceTracker(
            updatedCurrentPage,
            serviceTracker.pageSize,
            serviceTracker.searchParam
         );
      }
   };

   const renderStatusCell = (status: string) => {
      let colorClass = "";

      switch (status) {
         case "Filed":
            colorClass = "bg-sky-200 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Amended":
            colorClass = "bg-[#FF914D] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Amendment Ready":
            colorClass = "bg-blue-400 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Writ Ready":
            colorClass = "bg-[#fd4545] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Dismissal Applied for":
            colorClass = "bg-[#4DB452] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Set-Out":
            colorClass = "bg-yellow-300 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Submitted":
            colorClass = "bg-[#54C1FF] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Writ Applied for":
            colorClass = "bg-[#E61818] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Answered":
            colorClass = "bg-[#6D37BB] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Check for Writ":
            colorClass = "bg-[#F86565] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Served":
            colorClass = "bg-[#427AC7] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Submission In Progress":
            colorClass = "bg-yellow-300 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Dismissal Submission In Progress":
            colorClass = "bg-yellow-300 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         case "Court Rejected":
            colorClass = "bg-[#E61818] w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;
         default:
            colorClass = "bg-black-500 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
      }

      return <div className={colorClass}>{status}</div>;
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
            setBulkRecords(prevItems => {
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
            setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedServiceTrackerId(prevIds => prevIds.filter(item => item !== id));
         } else {

            setBulkRecords(prevItems => {
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
      data: IServiceTrackerItems,
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
         status: () => renderStatusCell(cellValue),
         caseNo: () => renderHighlightedCell(cellValue),
         documents: () => {
            if (cellValue?.length > 0) {
               return (
                  <>
                     {cellValue.map((item: any, index: any) => (
                        <h1
                           key={index}
                           onClick={() => openPdf(item.url)}
                           className="underline text-[#2472db]"
                           style={{ cursor: 'pointer' }}
                        >
                           {item.type} {cellValue.length > index + 1 ? '|' : ''}
                        </h1>
                     ))}
                  </>
               );
            } else {
               return <></>;
            }
         },
         propertyName: () => renderHighlightedCell(cellValue),
         propertyVsTenants: () => renderPropertyVsTenants(data),
         county: () => formattedCell(cellValue),
         tenantOne: () => formattedTenantFullName(data?.tenantNames[0]),
         address: () => formattedAddressCell(data),
         evictionDateFiled: () => formattedDateCell(cellValue),
         evictionServiceDate: () => formattedDateCell(cellValue),
         lastDayToAnswer: () => formattedDateCell(cellValue),
         expedited: () => <span>{cellValue != "" && cellValue != null ? "Expedited" : ""}</span>,
         courtDate: () => formattedDateCell(cellValue),
         answerDate: () => formattedDateCell(cellValue),
         evictionCourtDate: () => formattedDateCell(cellValue),
         serverReceived: () => formattedDateCell(cellValue),
         processServerEmail: () => renderHighlightedCell(cellValue),
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

   // const renderPropertyVsTenants = (data: IServiceTrackerItems) => (
   //    <>
   //       {data.propertyName ?? ''}
   //       <strong className="font-semibold text-gray-900">
   //          {data.propertyName && data.tenantNames?.length ? " Vs. " : ""}
   //       </strong>
   //       <br />
   //       {data.tenantNames.map((tenant, index) => (
   //          <span key={index}>
   //             {`${tenant.firstName} ${tenant.middleName ? tenant.middleName + ' ' : ''}${tenant.lastName}${index !== data.tenantNames.length - 1 ? ',' : data.andAllOtherOccupants?.length ? ',' : ''}`}
   //             <br />
   //          </span>
   //       ))}
   //       {`${data.andAllOtherOccupants?.length ? "and " : ""}${data.andAllOtherOccupants ?? ""}`}
   //    </>
   // );
   const renderPropertyVsTenants = (data: IServiceTrackerItems) => (
      <>
        <HighlightedText text={data.propertyName ?? ''} query={serviceTracker.searchParam ?? ''} />
        <strong className="font-semibold text-gray-900">
          {data.propertyName && data.tenantNames?.length ? " Vs. " : ""}
        </strong>
        <br />
        {data.tenantNames.map((tenant, index) => (
          <span key={index}>
            <HighlightedText
              text={`${tenant.firstName} ${tenant.middleName ? tenant.middleName + ' ' : ''}${tenant.lastName}`}
              query={serviceTracker.searchParam ?? ''}
            />
            {index !== data.tenantNames.length - 1 ? ',' : data.andAllOtherOccupants?.length ? ',' : ''}
            <br />
          </span>
        ))}
        <HighlightedText
          text={`${data.andAllOtherOccupants?.length ? "and " : ""}${data.andAllOtherOccupants ?? ""}`}
          query={serviceTracker.searchParam ?? ''}
        />
      </>
    );

   // const formattedDateCell = (value: any) => (
   //    <span>{value !== null ? formattedDate(value) : ""}</span>
   // );
   const formattedDateCell = (value: any) => (
      <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
   //   <span>{value !== null ? formattedDate(value) : ""}</span>
   );
   const formattedAddressCell = (data: IServiceTrackerItems) => {
      return (
         <HighlightedText text={`${data.address ?? ''}  ${data.city ?? ''} ${data.zip ?? ''}`} query={serviceTracker.searchParam ?? ''} />
      );
   };

   const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
      <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={serviceTracker.searchParam ?? ''} />
   );

   // const formattedCell = (value: any) => (
   //    <span><HighlightedText text={value ?? ''} query={serviceTracker.searchParam ?? ''} /></span>
   // );

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );
   

   const renderHighlightedCell = (value: any) => (
      <HighlightedText text={value as string ?? ''} query={serviceTracker.searchParam ?? ''} />
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
            .map((item) => setBulkRecords((prev) => [...prev, item]));
         setSelectedServiceTrackerId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         serviceTrackerRecords.forEach((item) => {
            setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedServiceTrackerId(prevIds => prevIds.filter(id => id !== item.id));
         });
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

   // const checkIfAllIdsExist = (
   //    serviceTrackerRecords: IServiceTrackerItems[],
   //    selectedServiceTrackerId: string[]
   // ): boolean | undefined => {
   //    return serviceTrackerRecords.every(record =>
   //       selectedServiceTrackerId.includes(record.id as string)
   //    );
   // };

   const checkIfAllIdsExist = (
      serviceTrackerRecords: IServiceTrackerItems[],
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
            {selectedServiceTrackerId.length} of {serviceTracker.totalCount} records selected
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
                        data: IServiceTrackerItems,
                        rowIndex: number,
                        cellIndex: number
                     ) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                     selectedIds={selectedServiceTrackerId}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={serviceTracker.pageSize}
                     currentPage={serviceTracker.currentPage}
                     totalPages={serviceTracker.totalPages}
                     totalRecords={serviceTracker.totalCount}
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
export default ServiceTrackeerGrid;
