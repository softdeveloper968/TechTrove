import React, { useEffect, useRef, useState } from "react";
import GridCheckbox from "components/formik/GridCheckBox";
import {
  FaInfoCircle,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortDown,
  FaSortUp,
} from "react-icons/fa";
import Tooltip from "../tooltip/Tooltip";

// Define the Props type for the Grid component
type Props<T> = {
  columnHeading: string[]; // Array of column headings
  rows: T[] | undefined; // Array of data rows
  selectAll?: boolean | undefined; // Indicates whether all rows are selected
  handleSelectAllChange?: (checked: boolean) => void; // Callback for when "Select All" checkbox changes
  showInPopUp?: boolean; // Flag indicating whether to show table in pop up
  cellRenderer?: (data: T, rowIndex: number, cellIndex: number) => any;
  onRowClick?: (rowIndex: number, scrolledRows: number) => void;
  // sorting?:ISort[];
  sorting?: string[];
  handleSorting?: ((columnName: string, order: string) => void) | undefined;
};

// Grid component receives various props for rendering
const Grid = <T extends object>({
  columnHeading,
  rows,
  selectAll = false,
  handleSelectAllChange,
  showInPopUp = false,
  cellRenderer,
  onRowClick,
  // sorting = [{ column: 'Property', order: 'asc' }]
  sorting,
  handleSorting,
}: Props<T>) => {
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

  const [activeSorting, setActiveSorting] = useState<{
    column: string;
    order: string;
  } | null>(null);
  const changeSorting = (columnName: string, order: string) => {

    setActiveSorting({ column: columnName, order: order });
    handleSorting && handleSorting(columnName, order);
  }
  // Render the Grid component
  return (
    <>
      {rows && rows.length === 0 ? (
        <h1 className="text-center">No records found</h1>
      ) : (
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
                {columnHeading.map((item: string, index: number) =>
                  item === "validAddress" ? null : (
                    <th
                      key={index}
                      scope="col"
                      className={`${showInPopUp === true
                        ? `${item} min-w-28 border-b text-left px-1.5 py-2.5 whitespace-nowrap sticky top-0 bg-gray-50 font-semibold text-[12px] md:text-[12.5px] z-10`
                        : `${item} px-1.5 py-2.5 whitespace-nowrap sticky top-0 bg-gray-50 font-semibold text-[12px] md:text-[12.5px] z-10`
                        }`}
                    >
                      {item === "isChecked" ? (
                        <GridCheckbox
                          checked={selectAll}
                          onChange={(checked: boolean) =>
                            handleSelectAllChange &&
                            handleSelectAllChange(checked)
                          }
                          label=""
                        />
                      ) : item === "id" ? null : (
                        <>
                          <div className="flex items-center">
                            {item}
                            {/* {sorting && sorting.some(sortItem => sortItem.column === item) && (
                         sorting.some(sortItem => sortItem.order === 'asc' )?<span> <FaSortAlphaDown className="fa-solid fa-plus  mr-1 text-xs" /></span>:<span> <FaSortAlphaUp className="fa-solid fa-plus  mr-1 text-xs" /></span>
                          
                        )} */}
                            {
                              sorting && sorting.includes(item) && (<><span className="ml-1.5 flex flex-col">
                                <i onClick={() => { changeSorting(item, "asc") }} className={`fas fa-caret-up text-[12px] h-[6px] flex items-center cursor-pointer ${activeSorting?.column === item &&
                                  activeSorting?.order === "asc"
                                  ? "text-[#1659b3]"
                                  : ""
                                  }`}></i><i onClick={() => { changeSorting(item, "desc") }} className={`fas fa-caret-down text-[12px] h-[6px] flex items-center cursor-pointer ${activeSorting?.column === item &&
                                    activeSorting?.order === "desc"
                                    ? "text-[#1659b3]"
                                    : ""
                                    }`} ></i></span></>)
                            }
                            {item === "Is Corporation?" &&
                              <Tooltip
                               id="test"
                                content={"The Defendant is a corporation. SS# and Military Status Report is not applicable"}
                                children={<FaInfoCircle className="text-blue-600 ml-0.5" />}
                              />}

                              {item === " " && 
                               <Tooltip
                               id="test2"
                               content={"This checkbox represents bulk update only"}
                               children={<FaInfoCircle className="text-blue-600 ml-0.5" />}
                             />
                              }

                          </div>
                        </>
                      )}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows &&
                rows.map((item, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`bg-white border-b h-50`}
                    onClick={() => {
                      onRowClick && onRowClick(rowIndex, scrolledRows);
                    }}
                  >
                    {Object.keys(item).map((key: string, cellIndex: number) => {
                      {
                        return cellRenderer
                          ? cellRenderer(item as T, rowIndex, cellIndex)
                          : (item as any)[columnHeading[cellIndex]];
                      }
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default Grid;
