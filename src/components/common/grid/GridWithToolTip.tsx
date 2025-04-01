import React, { useEffect, useRef, useState, Fragment } from "react";
import { Guid } from 'guid-typescript';
import { FaInfoCircle } from "react-icons/fa";
import Tooltip from "../tooltip/Tooltip";
import GridCheckbox from "components/formik/GridCheckBox";
import { IGridHeader } from "interfaces/grid-interface";
import { SortingOption } from "interfaces/common.interface";

type Props<T> = {
   columnHeading: IGridHeader[];
   rows: T[] | undefined; // Array of data rows
   selectAll?: boolean | undefined; // Indicates whether all rows are selected
   selectedIds?: string[]; // Indicates whether each row is selected
   handleSelectAllChange?: (checked: boolean) => void; // Callback for when "Select All" checkbox changes
   showInPopUp?: boolean; // Flag indicating whether to show table in pop up
   cellRenderer?: (data: T, rowIndex: number, cellIndex: number) => any;
   onRowClick?: (rowIndex: number, scrolledRows: number) => void;
   handleSorting?: ((columnName: string, order: string) => void) | undefined;
};

const GridWithToolTip = <T extends object>({
   columnHeading,
   rows,
   selectAll = false,
   selectedIds =[],
   handleSelectAllChange,
   showInPopUp = false,
   cellRenderer,
   onRowClick,
   handleSorting,
   activeSortingMap = [],
}: Props<T> & { activeSortingMap?: SortingOption[] }) => {
   const containerRef = useRef<HTMLDivElement | null>(null);
   const [scrolledRows, setScrolledRows] = useState<number>(0);

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.shiftKey && e.key === "ArrowDown") {
            e.preventDefault();
            // Scroll down by 50 pixels
            containerRef.current?.scrollBy(0, 50);
            setScrolledRows((prevScrolledRows) => prevScrolledRows + 1);
         }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
         if (e.key === "Shift") {
            // Reset selected rows to the top (index 0)
            setScrolledRows(0);
         }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
         window.removeEventListener("keydown", handleKeyDown);
         window.removeEventListener("keyup", handleKeyUp);
      };
   }, []);

   const changeSorting = (columnName: string, order: string) => {
      handleSorting && handleSorting(columnName, order);
   };

   return (
      <>
         <div
            ref={containerRef}
            className={`${showInPopUp === true
               ? "min-h-[190px] max-h-[298px]"
               : "max-h-[420px] md:max-h-[620px]"
               } relative overflow-x-auto tableGrid`}
         >
            {/* <h1 className="text-center">{scrolledRows}</h1> */}
            <table
               className={`${showInPopUp === true
                  ? "border-collapse table-fixed text-xs"
                  : "w-full text-xs text-left rtl:text-right text-gray-500"
                  }`}
            >
               <thead
                  className={`${showInPopUp === true
                     ? "text-xs text-gray-700  bg-gray-50"
                     : "text-xs text-gray-700  bg-gray-50"
                     }`}
               >
                  <tr>
                     {columnHeading.map((column) => (
                        (column.isVisible && !column.isVisible) ? null : (
                           <th
                              key={column.columnName}
                              scope="col"
                              className={`${column?.className ? column?.className : ""} ${showInPopUp === true
                                 ? `${column.columnName} min-w-28 border-b text-left px-1.5 py-2.5 whitespace-nowrap sticky top-0 bg-gray-50 font-semibold text-[12px] md:text-[12.5px] z-10`
                                 : `${column.columnName} px-1.5 py-2.5 whitespace-nowrap sticky top-0 bg-gray-50 font-semibold text-[12px] md:text-[12.5px] z-10`
                                 }`}
                           >
                              <div className="flex items-center">
                                 {column.controlType === "checkbox" ? (
                                    <div className="flex items-center">
                                       <GridCheckbox
                                          checked={selectAll}
                                          onChange={(checked: boolean) =>
                                             handleSelectAllChange &&
                                             handleSelectAllChange(checked)
                                          }
                                          label=""
                                       />
                                       {column.toolTipInfo && <span className="ml-1.5">{column.label}</span>}
                                    </div>
                                 ) : (
                                    <div className="flex items-center">
                                       {column.label}
                                    </div>
                                 )}
                                 {column.isSort && (
                                    <span className="ml-1.5 flex flex-col">
                                       <i
                                          onClick={(event) => {
                                             event.stopPropagation();
                                             changeSorting(column.columnName, "asc")
                                          }}
                                          className={`fas fa-caret-up overflow-hidden text-[12px] h-[6px] flex items-center cursor-pointer ${activeSortingMap.some(sortOption => sortOption.sortColumn === column.columnName && sortOption.isAscending)
                                             ? "text-[#1659b3]"
                                             : ""
                                             }`}
                                       >
                                       </i>
                                       <i
                                          onClick={(event) => {
                                             event.stopPropagation();
                                             changeSorting(column.columnName, "desc")
                                          }}
                                          className={`fas fa-caret-down overflow-hidden text-[12px] h-[6px] flex items-center cursor-pointer ${activeSortingMap.some(sortOption => sortOption.sortColumn === column.columnName && !sortOption.isAscending)
                                             ? "text-[#1659b3]"
                                             : ""
                                             }`}
                                       >
                                       </i>
                                    </span>
                                 )}
                                 {column.toolTipInfo && (
                                    <Tooltip
                                       id={"tooltip_" + Guid.create().toString()}
                                       content={column.toolTipInfo}
                                       children={<FaInfoCircle className="text-blue-600 ml-0.5" />}
                                    />
                                 )}
                              </div>
                           </th>
                        )
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {rows && rows.length > 0 ? (
                     rows.map((item, rowIndex) => (
                        <tr
                           key={(item as any)['id'] || rowIndex}
                           className={`border-b ${
                               selectedIds.includes((item as any).id || (item as any).name)
                                   ? "bg-blue-100" // Apply highlight class
                                   : "bg-white"
                           }`}
                           onClick={() => {
                              onRowClick && onRowClick(rowIndex, scrolledRows);
                           }}
                        >
                           {columnHeading.map((column, cellIndex) => {
                              const columnName = column.columnName;
                              return (
                                 <Fragment key={columnName}>
                                    {cellRenderer
                                       ? cellRenderer(item as T, rowIndex, cellIndex)
                                       : (item as any)[columnName]}
                                 </Fragment>
                              );
                           })}
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan={columnHeading.length}>
                           <h1 className="text-center mt-3.5">No records found</h1>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </>
   );
};

export default GridWithToolTip;
