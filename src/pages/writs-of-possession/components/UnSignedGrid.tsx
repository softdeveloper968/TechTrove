import React, { useEffect, useRef, useState } from "react";
import { FaEye } from "react-icons/fa";
import { useWritsOfPossessionContext } from "../WritsOfPossessionContext";
import { useAuth } from "context/AuthContext";
import { IWritsOfPossessionItems } from "interfaces/writs-of-possession.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { ITenant } from "interfaces/all-cases.interface";
import Grid from "components/common/grid/GridWithToolTip";
import GridCheckbox from "components/formik/GridCheckBox";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import IconButton from "components/common/button/IconButton";
import AllCasesDetails from "pages/all-cases/components/AllCasesDetails";
import { formattedDate, toCssClassName } from "utils/helper";
import { UserRole } from "utils/enum";

type UnSignedGridProps = {};

const UnSignedWritsGrid = (props: UnSignedGridProps) => {
   const { userRole } = useAuth();
   const {
      unsignedWrits,
      getAllWritsOfPossession,
      showSpinner,
      setSelectedWritsOfPossessionId,
      unsignedWritsCount,
      // setBulkRecords,
      selectedWritsOfPossessionId
   } = useWritsOfPossessionContext();
   const isMounted = useRef(true);
   // State variables for pagination for next and previous button
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      unsignedWrits.currentPage > 1
   );

   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      unsignedWrits.totalPages > 1
   );
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
   const [newSelectedRows] = useState<boolean[]>([]);
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(unsignedWrits.items?.length).fill(false)
   );
   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [currentCaseId, setCurrentCaseId] = useState<string>("");
   const [writsRecords, setWritsRecords] = useState<
      IWritsOfPossessionItems[]
   >([]);
   const initialColumnMapping: IGridHeader[] = [
      ...((userRole.includes(UserRole.Viewer) ? [] : [{ columnName: "isChecked", label: "isChecked", controlType: "checkbox" }])),
      { columnName: "action", label: "Action", className: "action" },
      { columnName: "county", label: "County" },
      { columnName: "caseNo", label: "CaseNo", toolTipInfo: "The unique number or code associated with your case, as assigned by the court. " },
      { columnName: "propertyVsTenants", label: "PropertyName Vs. Tenants" },
      //  { columnName: "tenantOne", label: "TenantOne" },
      //  { columnName: "tenantTwo", label: "TenantTwo" },
      //  { columnName: "tenantThree", label: "TenantThree" },
      //  { columnName: "tenantFour", label: "TenantFour" },
      //  { columnName: "tenantFive", label: "TenantFive" },
      { columnName: "address", label: "TenantAddressCombined", toolTipInfo: "TenantAddressCombined" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "writLaborName", label: "WritLaborName", toolTipInfo: "The name of the company or individual who will assist with the eviction set-out." },
      //  ...(userRole.includes(UserRole.C2CAdmin)
      //    ? [{
      //      columnName: "companyName",
      //      label: "CompanyName"
      //    }]
      //    : []
      //  ),
   ];

   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
      initialColumnMapping
   );
   //   useEffect(() => {
   //     if (userRole.includes(UserRole.C2CAdmin) && !visibleColumns.some(x => x.columnName === "companyName")) {
   //       setVisibleColumns((prev) => (
   //         [
   //           ...prev,
   //           {
   //             columnName: "companyName",
   //             label: "CompanyName"
   //           }
   //         ]
   //       )
   //       )
   //     }
   //   }, [userRole]);

   // useEffect(() => {
   //   ;
   //   if(unsignedWrits.totalCount === 1){
   //     if (isMounted.current) {
   //       getAllWritsOfPossession(1, 100, false, unsignedWrits.searchParam);
   //       isMounted.current = false;
   //     };
   //   };

   // }, []);

   useEffect(() => {
      if (isMounted.current) {
         setSelectedWritsOfPossessionId([]);
         getAllWritsOfPossession(1, 100, false, [], '');
         isMounted.current = false;
      };

   }, []);

   // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
   useEffect(() => {
      setSelectAll(false);
      const writsRecords = unsignedWrits.items.map((item: any) => {
         return {
            isChecked: false, // Add the new property
            ...item, // Spread existing properties
         };
      });
      setWritsRecords(writsRecords);

      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(unsignedWrits.currentPage > 1);
      setCanPaginateFront(unsignedWrits.totalPages > 1);
      setSelectedRows(Array(unsignedWrits.items?.length).fill(false));

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
   }, [unsignedWrits]);

   // Event handler for the 'Back' button
   const handleBackButton = () => {
      if (
         unsignedWrits.currentPage > 1 &&
         unsignedWrits.currentPage <= unsignedWrits.totalPages
      ) {
         const updatedCurrentPage = unsignedWrits.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(unsignedWrits.currentPage > 1);
         // back button get dismissals
         getAllWritsOfPossession(updatedCurrentPage, unsignedWrits.pageSize, false, [], '');
      }
   };

   // Event handler for the 'Next' button
   const handleFrontButton = () => {
      if (unsignedWrits.currentPage < unsignedWrits.totalPages) {
         const updatedCurrentPage = unsignedWrits.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get dismissals
         getAllWritsOfPossession(updatedCurrentPage, unsignedWrits.pageSize, false, [], '');
      }
   };

   // const handleCheckBoxChange = (index: number, checked: boolean) => {
   //   const updatedSelectedRows = [...selectedRows];
   //   updatedSelectedRows[index] = checked;
   //   setSelectedRows(updatedSelectedRows);
   //   const selectedIds = (unsignedWrits.items || [])
   //     .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
   //     .map((item) => item.id)
   //     .filter((id): id is string => typeof id === "string");
   //   if (unsignedWrits.items.length === updatedSelectedRows.filter(item => item).length) {
   //     setSelectAll(true);
   //   } else {
   //     setSelectAll(false);
   //   }
   //   setSelectedWritsOfPossessionId(selectedIds);
   // };

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
      if (shiftKeyPressed && lastClickedRowIndex !== -1 && writsRecords) {
         const start = Math.min(index, lastClickedRowIndex);
         const end = Math.max(index, lastClickedRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (writsRecords || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         // writsRecords.filter((_, rowIndex) => selectedRows[rowIndex]).map((item)=>{  
         //   setBulkRecords(prevItems => {
         //     const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
         //     uniqueItems.add(JSON.stringify(item)); // Add the new item
         //     return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
         //   });      
         //   //  setBulkRecords((prev)=>[...prev,item]);
         // }) 
         setSelectedWritsOfPossessionId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (writsRecords.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = writsRecords.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         // const selectedIds = (fileEvictions.items || [])
         //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
         //   .map((item) => item.id)
         //   .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked        
            // setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedWritsOfPossessionId(prevIds => prevIds.filter(item => item !== id));
         } else {

            // setBulkRecords(prevItems => {
            //   const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
            //   uniqueItems.add(JSON.stringify(writsRecords.filter(x=>x.id===id)[0])); // Add the new item
            //   return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            // });   
            //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedWritsOfPossessionId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }

      }

      setLastClickedRowIndex(index);
   };

   // const handleSelectAllChange = (checked: boolean) => {
   //   const newSelectAll = !selectAll;
   //   const allIds: string[] = unsignedWrits.items
   //     .map((item) => item.id)
   //     .filter((id): id is string => typeof id === "string");
   //   if (checked) {
   //     setSelectedWritsOfPossessionId(allIds);
   //   } else {
   //     setSelectedWritsOfPossessionId([]);
   //   }

   //   setSelectAll((prevSelectAll) => {
   //     // Update selectedRows state
   //     setSelectedRows(Array(allIds.length).fill(newSelectAll));
   //     return newSelectAll;
   //   });
   // };

   const handleSelectAllChange = (checked: boolean) => {

      const newSelectAll = !selectAll;
      const allIds: string[] = writsRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         // writsRecords
         // .map((item) =>  setBulkRecords((prev)=>[...prev,item]));
         setSelectedWritsOfPossessionId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         writsRecords.forEach((item) => {
            // setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedWritsOfPossessionId(prevIds => prevIds.filter(id => id !== item.id));
         });
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

   const handleShowDetails = (id: string) => {
      setCurrentCaseId(id);
      setShowDetails(true);
   };

   const handleCellRendered = (
      cellIndex: number,
      data: IWritsOfPossessionItems,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      // const propertyName = (initialColumnMapping as any)[columnName];
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               checked={selectedWritsOfPossessionId.includes(data.id as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id as string, checked)
               }
               label=""
            />
         ),
         action: () => renderActionsCell(data.id ?? ""),
         caseNo: () => renderHighlightedCell(cellValue),
         propertyName: () => renderHighlightedCell(cellValue),
         propertyVsTenants: () => renderPropertyVsTenants(data),
         county: () => renderHighlightedCell(cellValue),
         writDateFiled: () => formattedDateCell(data.writDateFiled),
         writLaborName: () => formattedCell(cellValue),
         address: () => formattedAddressCell(data),
         // tenantOne: () => formattedTenantFullName(data?.tenantNames[0]),
         // tenantTwo: () => formattedTenantFullName(data?.tenantNames[1]),
         // tenantThree: () => formattedTenantFullName(data?.tenantNames[2]),
         // tenantFour: () => formattedTenantFullName(data?.tenantNames[3]),
         // tenantFive: () => formattedTenantFullName(data?.tenantNames[4]),
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

   //   const renderPropertyVsTenants = (data: IWritsOfPossessionItems) => (
   //    <>
   //      {data.propertyName ?? ''}
   //      <strong className="font-semibold text-gray-900">
   //         {data.propertyName && data.tenantNames?.length ? " Vs. " : ""}
   //      </strong>
   //      <br />
   //      {data.tenantNames.map((tenant, index) => (
   //         <span key={index}>
   //         {`${tenant.firstName} ${tenant.middleName ? tenant.middleName + ' ' : ''}${tenant.lastName}${index !== data.tenantNames.length - 1 ? ',' : data.andAllOtherOccupants?.length ? ',' : ''}`}
   //         <br />
   //         </span>
   //      ))}
   //      {`${data.andAllOtherOccupants?.length ? "and " : ""}${data.andAllOtherOccupants ?? ""}`}
   //    </>
   //  );

   const renderPropertyVsTenants = (data: IWritsOfPossessionItems) => (
      <>
         <HighlightedText text={data.propertyName ?? ''} query={unsignedWrits.searchParam ?? ''} />
         <strong className="font-semibold text-gray-900">
            {data.propertyName && data.tenantNames?.length ? " Vs. " : ""}
         </strong>
         <br />
         {data.tenantNames.map((tenant, index) => (
            <span key={index}>
               <HighlightedText
                  text={`${tenant.firstName} ${tenant.middleName ? tenant.middleName + ' ' : ''}${tenant.lastName}`}
                  query={unsignedWrits.searchParam ?? ''}
               />
               {index !== data.tenantNames.length - 1 ? ',' : data.andAllOtherOccupants?.length ? ',' : ''}
               <br />
            </span>
         ))}
         <HighlightedText
            text={`${data.andAllOtherOccupants?.length ? "and " : ""}${data.andAllOtherOccupants ?? ""}`}
            query={unsignedWrits.searchParam ?? ''}
         />
      </>
   );

   const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
      <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={unsignedWrits.searchParam ?? ''} />
   );

   const formattedDateCell = (value: any) => (
      <span>{value !== null ? formattedDate(value) : ""}</span>
   );
   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );


   const renderHighlightedCell = (value: any) => (
      <HighlightedText text={value as string ?? ''} query={unsignedWrits.searchParam ?? ''} />
   );
   // const formattedCell = (value: any) => (
   //   <span><HighlightedText text={value !== null ? value : ""} query={unsignedWrits.searchParam ?? ''} /></span>
   // );

   const formattedFullNameCell = (firstName: string, lastName: string) => (
      <span><HighlightedText text={`${firstName == null ? "" : firstName} ${lastName == null ? "" : lastName
         }`} query={unsignedWrits.searchParam ?? ''} /></span>
   );

   const formattedAddressCell = (value: any) => (
      <span>
         <HighlightedText text={value !== null ? `${value.tenantAddress ?? ''} ${value.tenantUnit ?? ''} ${value.tenantCity ?? ''} ${value.tenantState ?? ''} ${value.tenantZip ?? ''}` : ''} query={unsignedWrits.searchParam ?? ''} />
      </span>
   );
   <span>
   </span>

   const checkIfAllIdsExist = (
      writsRecords: IWritsOfPossessionItems[],
      selectedWritsOfPossessionId: string[]
   ): boolean | undefined => {
      if (writsRecords.length === 0) {
         return false;
      }
      return writsRecords.every(record =>
         selectedWritsOfPossessionId.includes(record.id as string)
      );
   };
   // const checkIfAllIdsExist = (
   //   writsRecords: IWritsOfPossessionItems[],
   //   selectedWritsOfPossessionId: string[]
   // ): boolean|undefined => {
   //   return writsRecords.every(record =>
   //     selectedWritsOfPossessionId.includes(record.id as string)
   //   );
   // };

   const renderActionsCell = (id: string) => {
      return (
         <>
            <IconButton
               type={"button"}
               className="cursor-pointer text-[#2472db]"
               disabled={!id.length}
               icon={<FaEye className="h-4 w-4" />}
               handleClick={() => handleShowDetails(id)}
            />
         </>
      );
   };

   // JSX structure for rendering the component
   return (
      <div className="mt-3">
         <div className="relative -mr-0.5">
         <div className="mb-2 text-sm text-gray-600">
            {selectedWritsOfPossessionId.length} of {unsignedWrits.totalCount} records selected
         </div>
            {/* Render the Grid component with column headings and grid data */}
            {showSpinner === true ? (
               <Spinner />
            ) : (
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={writsRecords}
                     handleSelectAllChange={handleSelectAllChange}
                     // selectAll={selectAll}
                     selectAll={checkIfAllIdsExist(writsRecords, selectedWritsOfPossessionId)}
                     cellRenderer={(
                        data: IWritsOfPossessionItems,
                        rowIndex: number,
                        cellIndex: number
                     ) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                     activeSortingMap={unsignedWrits.sortings}
                     selectedIds={selectedWritsOfPossessionId}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={unsignedWrits.pageSize}
                     currentPage={unsignedWrits.currentPage}
                     totalPages={unsignedWrits.totalPages}
                     totalRecords={unsignedWrits.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               </>
            )}
         </div>
         {showDetails && (
            <AllCasesDetails
               title="Writs Case Details"
               caseId={currentCaseId}
               showDetails={showDetails}
               setShowDetails={(show: boolean) => setShowDetails(show)}
            />
         )}
      </div>
   );
};

export default UnSignedWritsGrid;
