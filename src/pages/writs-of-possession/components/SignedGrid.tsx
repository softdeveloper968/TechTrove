import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FaCopy, FaEye } from "react-icons/fa";
import Grid from "components/common/grid/GridWithToolTip";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import GridCheckbox from "components/formik/GridCheckBox";
import IconButton from "components/common/button/IconButton";
import AllCasesDetails from "pages/all-cases/components/AllCasesDetails";
import { useWritsOfPossessionContext } from "../WritsOfPossessionContext";
import { useAuth } from "context/AuthContext";
import { IWritCaseDocument, IWritsOfPossessionItems } from "interfaces/writs-of-possession.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { ITenant } from "interfaces/all-cases.interface";
import { convertUtcToEst, toCssClassName, getFileNameFromWritsDocURL } from "utils/helper";
import { UserRole } from "utils/enum";
import HelperViewPdfService from "services/helperViewPdfService";

type SignedWritsGridProps = {};

const SignedDismissalsGrid = (props: SignedWritsGridProps) => {
   const { userRole } = useAuth();
   const isMounted = useRef(true);
   const {
      showSpinner,
      signedWrits,
      setAllSignedWrits,
      getAllWritsOfPossession,
      setSelectedWritsOfPossessionId,
      setBulkRecords,
      selectedWritsOfPossessionId
   } = useWritsOfPossessionContext();
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(signedWrits.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(signedWrits.totalPages > 1);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(Array(signedWrits.items?.length).fill(false));
   const [writsRecords, setWritsRecords] = useState<IWritsOfPossessionItems[]>([]);
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [currentCaseId, setCurrentCaseId] = useState<string>("");
   const initialColumnMapping: IGridHeader[] = [
      ...(userRole.includes(UserRole.WritLabor)
         ? [{
            columnName: "isChecked",
            label: "isChecked",
            controlType: "checkbox"
         }]
         : []
      ),
      ...(userRole.includes(UserRole.WritLabor)
         ? []
         : [{ columnName: "action", label: "Action", className: "action" }]
      ),
      // { columnName: "action", label: "Action", className: "action" },
      { columnName: "county", label: "County", isSort: true },
      { columnName: "caseNo", label: "CaseNo", toolTipInfo: "The unique number or code associated with your case, as assigned by the court. " },
      // { columnName: "writPDFs", label: "AllPDFs" },
      { columnName: "documentsPdf", label: "AllPDFs" },
      { columnName: "propertyVsTenants", label: "PropertyName Vs. Tenants" },
      //  { columnName: "tenantOne", label: "TenantOne" },
      //  { columnName: "tenantTwo", label: "TenantTwo" },
      //  { columnName: "tenantThree", label: "TenantThree" },
      //  { columnName: "tenantFour", label: "TenantFour" },
      //  { columnName: "tenantFive", label: "TenantFive" },
      { columnName: "address", label: "TenantAddressCombined" },
      { columnName: "propertyName", label: "PropertyName", isSort: true },
      { columnName: "writLaborName", label: "WritLaborName", toolTipInfo: "The name of the company or individual who will assist with the eviction set-out. " },
      //  { columnName: "tenantZip", label: "TenantZip", isSort: true },
      { columnName: "writDateFiled", label: "WritFiledDate", toolTipInfo: "The date the writ application was accepted by the court.", isSort: true },
      { columnName: "writAffiantSignature", label: "WritAffiantSignature", toolTipInfo: "The name that was used to sign the Writ of Possession application. " },
      //  { columnName: "setOutCompleted", label: "SetOutCompleted" },
      //  { columnName: "setOutCompletedDate", label: "SetOutCompletedDate" },
      //  { columnName: "setOutNotes", label: "SetOutNotes" },
      //  { columnName: "setOutScheduled", label: "SetOutScheduled" },
      //  { columnName: "writCancelled", label: "WritCancelled" },
      //  ...(userRole.includes(UserRole.C2CAdmin)
      //    ? [{
      //      columnName: "companyName",
      //      label: "CompanyName"
      //    }]
      //    : []
      //  ),
   ];
   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
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

   useEffect(() => {
      if (isMounted.current) {
         setSelectedWritsOfPossessionId([]);
         getAllWritsOfPossession(1, 100, true, [], '');
         isMounted.current = false;
      };

   }, []);


   // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
   useEffect(() => {
      const writsRecords = signedWrits.items.map((item: any) => {
         return {
            isChecked: false, // Add the new property
            ...item, // Spread existing properties
         };
      });

      setWritsRecords(writsRecords);
      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(signedWrits.currentPage > 1);
      setCanPaginateFront(signedWrits.totalPages > 1);
      setSelectedRows(Array(signedWrits.items?.length).fill(false));
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

   }, [signedWrits]);

   // Event handler for the 'Back' button
   const handleBackButton = () => {
      if (
         signedWrits.currentPage > 1 &&
         signedWrits.currentPage <= signedWrits.totalPages
      ) {
         const updatedCurrentPage = signedWrits.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(signedWrits.currentPage > 1);
         // back button get dismissals
         getAllWritsOfPossession(
            updatedCurrentPage,
            signedWrits.pageSize,
            false,
            signedWrits.sortings,
            signedWrits.searchParam
         );
      }
   };

   // // Event handler for the 'Next' button
   const handleFrontButton = () => {
      if (signedWrits.currentPage < signedWrits.totalPages) {
         const updatedCurrentPage = signedWrits.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get dismissals
         getAllWritsOfPossession(
            updatedCurrentPage,
            signedWrits.pageSize,
            true,
            signedWrits.sortings,
            signedWrits.searchParam
         );
      }
   };

   const openPdf = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   };
   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [newSelectedRows, setNewSelectedRows] = useState<boolean[]>([]);

   // const handleCheckBoxChange = (index: number, checked: boolean) => {

   //   if (shiftKeyPressed && lastClickedFilteredRowIndex !== -1 && writsRecords) {
   //     const start = Math.min(index, lastClickedFilteredRowIndex);
   //     const end = Math.max(index, lastClickedFilteredRowIndex);
   //     setSelectedRows(Array.from({ length: end + 1 }, (_, i) =>
   //       i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
   //     ));
   //     setSelectedRows(selectedRows);
   //     const selectedIds = (signedWrits.items || [])
   //       .filter((_, rowIndex) => selectedRows[rowIndex])
   //       .map((item) => item.id)
   //       .filter((id): id is string => typeof id === "string");
   //     setSelectedWritsOfPossessionId(selectedIds);
   //   }
   //   else {
   //     const updatedSelectedRows = [...selectedRows];
   //     updatedSelectedRows[index] = checked;
   //     setSelectedRows(updatedSelectedRows);
   //     if (signedWrits.items.length === updatedSelectedRows.filter(item => item).length) {
   //       setSelectAll(true);
   //     } else {
   //       setSelectAll(false);
   //     }
   //     const selectedIds = (signedWrits.items || [])
   //       .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
   //       .map((item) => item.id)
   //       .filter((id): id is string => typeof id === "string");

   //     setSelectedWritsOfPossessionId(selectedIds);
   //   }
   //   setLastClickedFilteredRowIndex(index);
   // };

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {

      if (shiftKeyPressed && lastClickedFilteredRowIndex !== -1 && writsRecords) {
         const start = Math.min(index, lastClickedFilteredRowIndex);
         const end = Math.max(index, lastClickedFilteredRowIndex);
         setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (writsRecords || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         writsRecords.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            setBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(item)); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //  setBulkRecords((prev)=>[...prev,item]);
         })
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
            setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedWritsOfPossessionId(prevIds => prevIds.filter(item => item !== id));
         } else {

            setBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(writsRecords.filter(x => x.id === id)[0])); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedWritsOfPossessionId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }

      }

      setLastClickedFilteredRowIndex(index);
   };

   // const handleCheckBoxChange = (index: number, checked: boolean) => {
   //   const updatedSelectedRows = [...selectedRows];
   //   updatedSelectedRows[index] = checked;
   //   setSelectedRows(updatedSelectedRows);
   //   const selectedIds = (signedWrits.items || [])
   //     .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
   //     .map((item) => item.id)
   //     .filter((id): id is string => typeof id === "string");

   //   setSelectedWritsOfPossessionId(selectedIds);
   // };
   // const handleSelectAllChange = (checked: boolean) => {
   //   const newSelectAll = !selectAll;
   //   const allIds: string[] = signedWrits.items
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
         writsRecords
            .map((item) => setBulkRecords((prev) => [...prev, item]));
         setSelectedWritsOfPossessionId(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         writsRecords.forEach((item) => {
            setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedWritsOfPossessionId(prevIds => prevIds.filter(id => id !== item.id));
         });
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };
   const handleDocumentClick = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   };

   // const renderDocumentsCell = (cellValue: IWritCaseDocument[], versionNumber: number) => {

   //    // Map the documents and apply special naming logic for "AOS" types
   //    const processedDocuments = cellValue.map((item, index) => {
   //       let displayName = 'Writs';  // Start the name as "Writs"

   //       // For multiple documents, add a suffix based on the index + 1
   //       if (index > 0) {
   //          displayName += `_${index + 1}`;
   //       }

   //       // Add ".pdf" at the end
   //       displayName += ".pdf";

   //       return {
   //          id: item.id,
   //          url: item.url,
   //          displayName,
   //       };
   //    });

   const renderDocumentsCell = (cellValue: IWritCaseDocument[], versionNumber: number) => {
      // Map the documents and apply special naming logic for "AOS" types
      const processedDocuments = cellValue.map((item, index) => {

         let displayName = getFileNameFromWritsDocURL(item.url)
         return {
            id: item.id,
            url: item.url,
            displayName,
         };
      });

      return (
         <div className="flex flex-wrap">
            {processedDocuments.map((item) => (
               <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setHoveredDocumentId(item.id)}
                  onMouseLeave={() => setHoveredDocumentId(null)}
               >
                  <h1
                     onClick={() => handleDocumentClick(item.url)}
                     className="underline text-[#2472db] mr-5"
                     style={{ cursor: 'pointer' }}
                     hidden={item.displayName == ""}
                  >
                     {item.displayName}
                  </h1>
               </div>
            ))}
         </div>
      );
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
      //const propertyName = (initialColumnMapping as any)[columnName];
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         action: () => renderActionsCell(data.id ?? ""),
         caseNo: () => renderHighlightedCell(cellValue),
         setOutNotes: () => formattedCell(cellValue),
         setOutScheduled: () => formattedCellBool(cellValue),
         setOutCompleted: () => formattedCellBool(cellValue),
         setOutCompletedDate: () => formattedDateCell(data.setOutCompletedDate),
         writCancelled: () => formattedCellBool(cellValue),
         writPDFs: () => renderPDFsCell(cellValue, data.id ?? "", data.versionNumber),
         documentsPdf: () => renderDocumentsCell(cellValue, data.versionNumber),
         //  {
         //   return cellValue ? (
         //     <h2 onClick={() => {
         //       openPdf(cellValue)
         //     }} className="underline text-[#2472db]" style={{ cursor: 'pointer' }}>
         //       Writs.pdf
         //     </h2>
         //   ) : (
         //     <></>
         //   );
         // },
         propertyName: () => renderHighlightedCell(cellValue),
         propertyVsTenants: () => renderPropertyVsTenants(data),
         county: () => renderHighlightedCell(cellValue),
         // tenantOne: () => formattedTenantFullName(data?.tenantNames[0]),
         // tenantTwo: () => formattedTenantFullName(data?.tenantNames[1]),
         // tenantThree: () => formattedTenantFullName(data?.tenantNames[2]),
         // tenantFour: () => formattedTenantFullName(data?.tenantNames[3]),
         // tenantFive: () => formattedTenantFullName(data?.tenantNames[4]),
         address: () => formattedAddressCell(data),
         tenantZip: () => <span>{cellValue !== null ? cellValue : ""}</span>,
         writDateFiled: () => formattedDateCell(data.writDateFiled),
         writAffiantSignature: () => formattedCell(cellValue),
         isChecked: () => (
            <GridCheckbox
               // checked={selectedRows[rowIndex]}
               checked={selectedWritsOfPossessionId.includes(data.id as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id as string, checked)
               }
               label=""
            />
         ),
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
      // const columnNames = Object.keys(data);
      // const columnName = columnNames[cellIndex];
      // const propertyName =
      //   (initialColumnMapping as Record<string, keyof IDismissalsItems>)[
      //     columnName
      //   ] || (columnName as keyof IDismissalsItems);
      // const cellValue = data[propertyName];
      // if (columnName === "isChecked") {
      //   return (
      //     <GridCheckbox
      //       checked={selectedRows[rowIndex]}
      //       onChange={(checked: boolean) =>
      //         handleCheckBoxChange(rowIndex, checked)
      //       }
      //       label={""}
      //     />
      //   );
      // } else if (columnName === "dismissalFileDate") {
      //   return (
      //     <span>
      //       {cellValue !== null ? formattedDate(cellValue as string) : ""}
      //     </span>
      //   );
      // } else {
      //   return cellValue;
      // }
   };
   const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);
   const renderPDFsCell = (cellValue: string | undefined, id: string, versionNumber: number) => {
      const handleCopyClick = (url: string) => {
         navigator.clipboard.writeText(url);
         toast.success("Document URL copied to clipboard!");
      };

      return cellValue ? (
         <div
            className="relative flex items-center"
            onMouseEnter={() => setHoveredDocumentId(id)}
            onMouseLeave={() => setHoveredDocumentId(null)}
         >
            <h2
               onClick={() => openPdf(cellValue)}
               className="underline text-[#2472db] mr-1"
               style={{ cursor: 'pointer' }}
            >
               {versionNumber === 0 ? 'Writs.pdf' : `Writs${versionNumber}.pdf`}
            </h2>
            {hoveredDocumentId === id && (
               <FaCopy
                  className="w-4 h-4 text-gray-500 cursor-pointer"
                  onClick={() => handleCopyClick(cellValue)}
               />
            )}
         </div>
      ) : (
         <></>
      );
   };
   const renderPropertyVsTenants = (data: IWritsOfPossessionItems) => (
      <>
         {data.propertyName ?? ''}
         <strong className="font-semibold text-gray-900">
            {data.propertyName && data.tenantNames?.length ? " Vs. " : ""}
         </strong>
         <br />
         {data.tenantNames.map((tenant, index) => (
            <span key={index}>
               {`${tenant.firstName} ${tenant.middleName ? tenant.middleName + ' ' : ''}${tenant.lastName}${index !== data.tenantNames.length - 1 ? ',' : data.andAllOtherOccupants?.length ? ',' : ''}`}
               <br />
            </span>
         ))}
         <HighlightedText
            text={`${data.andAllOtherOccupants?.length ? "and " : ""}${data.andAllOtherOccupants ?? ""}`}
            query={signedWrits.searchParam ?? ''}
         />
      </>
   );

   const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
      <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={signedWrits.searchParam ?? ''} />
   );

   // const formattedDateCell = (value: any) => (
   //   <span>{value !== null ? formattedDate(value) : ""}</span>
   // );
   const formattedDateCell = (value: any) => (
      <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
      //   <span>{value !== null ? formattedDate(value) : ""}</span>
   );

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );


   const renderHighlightedCell = (value: any) => (
      <HighlightedText text={value as string ?? ''} query={signedWrits.searchParam ?? ''} />
   );
   // const formattedCell = (value: any) => (
   //   <span><HighlightedText text={value !== null ? value : ""} query={signedWrits.searchParam ?? ''} /></span>
   // );
   const formattedCellBool = (value: any) => (
      <span>{value ? "yes" : ""}</span>
   );
   const formattedFullNameCell = (firstName: string, lastName: string) => (
      <span><HighlightedText text={`${firstName == null ? "" : firstName} ${lastName == null ? "" : lastName}`} query={signedWrits.searchParam ?? ''} /></span>
   );

   const formattedAddressCell = (value: any) => (
      <span>
         <HighlightedText text={value !== null ? `${value.tenantAddress ?? ''} ${value.tenantUnit ?? ''} ${value.tenantCity ?? ''} ${value.tenantState ?? ''} ${value.tenantZip ?? ''}` : ''} query={signedWrits.searchParam ?? ''} />
      </span>
   );

   //   const handleSorting = (columnName: string, order: string) => {

   //     // Copy the current fileEvictionRecords array to avoid mutating the state directly
   //     const sortedRecords = [...writsRecords];

   //     // Define a compare function based on the column name and order
   //     const compare = (a: any, b: any) => {
   //       // Extract values for comparison
   //       const aValue1 = a[columnName];
   //       const bValue1 = b[columnName];

   //       // Implement sorting logic based on the order (ascending or descending)
   //       if (order === 'asc') {
   //         if (aValue1 < bValue1) return -1;
   //         if (aValue1 > bValue1) return 1;
   //         return 0;
   //       } else {
   //         if (aValue1 > bValue1) return -1;
   //         if (aValue1 < bValue1) return 1;
   //         return 0;
   //       }
   //     };

   //     // Sort the records array using the compare function
   //     sortedRecords.sort(compare);

   //     // Update the state with sorted recordss
   //     setWritsRecords(sortedRecords);
   //   };


   const handleSorting = (columnName: string, order: string) => {
      // Update the sortings state with the new sorting option, ensuring no duplicates
      setAllSignedWrits(prev => {
         const existingSort = prev.sortings.find(sort => sort.sortColumn === columnName);

         const updatedSortings = existingSort
            ? prev.sortings.map(sort =>
               sort.sortColumn === columnName
                  ? { ...sort, isAscending: order === "asc" } // Update existing sort
                  : sort
            )
            : [...prev.sortings, { sortColumn: columnName, isAscending: order === "asc" }]; // Add new sort

         // Fetch the data with the updated sortings
         getAllWritsOfPossession(
            prev.currentPage,
            prev.pageSize,
            true, // signed writs
            updatedSortings,
            prev.searchParam
         );

         // Return the updated state
         return {
            ...prev,
            sortings: updatedSortings
         };
      });
   };

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


   return (
      <div className="mt-3">
         <div className="relative -mr-0.5">
            {/* Render the Grid component with column headings and grid data */}
            {showSpinner === true ? (
               <Spinner />
            ) : (
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={writsRecords}
                     handleSelectAllChange={handleSelectAllChange}
                     selectAll={checkIfAllIdsExist(writsRecords, selectedWritsOfPossessionId)}
                     cellRenderer={(
                        data: IWritsOfPossessionItems,
                        rowIndex: number,
                        cellIndex: number
                     ) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                     handleSorting={handleSorting}
                     activeSortingMap={signedWrits.sortings}
                     selectedIds={selectedWritsOfPossessionId}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={signedWrits.pageSize}
                     currentPage={signedWrits.currentPage}
                     totalPages={signedWrits.totalPages}
                     totalRecords={signedWrits.totalCount}
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

export default SignedDismissalsGrid;
